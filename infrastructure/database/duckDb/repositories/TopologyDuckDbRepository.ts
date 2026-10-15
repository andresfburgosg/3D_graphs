import { Topology } from "@/domain/entities/Topology";
import { TopologyRepository } from "@/domain/repositories/TopologyRepository";
import { DataQuery } from "@/types/datasource";
import {
  buildWhereClause,
  executeDuckDBQuery,
  getDatabaseFilePath,
} from "@/infrastructure/database/duckDb/query";
import { TOPOLOGY_MAIN_NODE, TOPOLOGY_JSON_SOURCE_FILE } from "@/lib/constants";
import { TopologyDateLimits } from "@/types/topology";

const ALLOWED_FIELDS = {
  timestamp: "timestamp",
  nodeId: "nodeId",
  metricOne: "metricOne",
  secondId: "secondId",
  parentId: "parentId",
  level: "level",
} as const;

export class TopologyDuckDbRepository implements TopologyRepository {
  #nodeIdParentIdMap = new Map<string, string>();
  #finalTopologyData: Topology[] = [];
  #rowsByNodeId = new Map<string, Topology>();
  #levelByNodeId = new Map<string, number>();

  async find(query: DataQuery): Promise<Topology[]> {
    const filePath = getDatabaseFilePath(TOPOLOGY_JSON_SOURCE_FILE);

    const { clause, params } = buildWhereClause(
      query.filters ?? [],
      ALLOWED_FIELDS,
    );

    let limit = "";

    if (query.limit !== undefined) {
      limit = `LIMIT ${Math.min(Math.max(query.limit ?? 1000, 1), 10_000)}`;
    }

    const sql = `
      SELECT
        *
      FROM read_json_auto($filePath)
      ${clause} 
      ${limit}
    `;

    const rows = await executeDuckDBQuery(sql, {
      filePath,
      ...params,
    });

    return rows.map(this.mapRowToTopology);
  }

  refine(data: Topology[]): Topology[] {
    this.#nodeIdParentIdMap.clear();
    this.#finalTopologyData = [];
    this.#rowsByNodeId.clear();
    this.#levelByNodeId.clear();

    this.deduplicateRows(data);
    this.homologateParentId();
    this.removeCycles();
    this.homologateLevels();
    this.updateHomologedData();

    return this.#finalTopologyData.length > 0 ? this.#finalTopologyData : data;
  }

  async getDateLimits(query: DataQuery): Promise<TopologyDateLimits> {
    const filePath = getDatabaseFilePath(TOPOLOGY_JSON_SOURCE_FILE);

    const { clause, params } = buildWhereClause(
      query.filters ?? [],
      ALLOWED_FIELDS,
    );

    const sql = `
      SELECT
        strftime(MIN(${ALLOWED_FIELDS.timestamp}), '%Y-%m-%d') as min_date,
        strftime(MAX(${ALLOWED_FIELDS.timestamp}), '%Y-%m-%d') as max_date
      FROM read_json_auto($filePath)
      ${clause}
    `;

    const rows = await executeDuckDBQuery(sql, {
      filePath,
      ...params,
    });

    return rows.length > 0
      ? {
          minDate: rows[0]["min_date"]?.toString() ?? "",
          maxDate: rows[0]["max_date"]?.toString() ?? "",
        }
      : { minDate: "", maxDate: "" };
  }

  private deduplicateRows(data: Topology[]): void {
    for (const row of data) {
      if (
        !row?.nodeId ||
        !row?.parentId ||
        this.#rowsByNodeId.has(row.nodeId)
      ) {
        continue;
      }

      this.#rowsByNodeId.set(row.nodeId, row);
      this.#nodeIdParentIdMap.set(row.nodeId, row.parentId);
    }
  }

  private homologateParentId(): void {
    for (const [nodeId, parentId] of this.#nodeIdParentIdMap) {
      if (
        parentId !== TOPOLOGY_MAIN_NODE &&
        !this.#nodeIdParentIdMap.has(parentId)
      ) {
        this.#nodeIdParentIdMap.set(nodeId, TOPOLOGY_MAIN_NODE);
      }
    }
  }

  private removeCycles(): void {
    const finished = new Set<string>();

    for (const startNodeId of this.#nodeIdParentIdMap.keys()) {
      if (finished.has(startNodeId)) continue;

      const path: string[] = [];
      const pathIndex = new Map<string, number>();
      let currentNodeId: string | undefined = startNodeId;

      while (
        currentNodeId !== undefined &&
        currentNodeId !== TOPOLOGY_MAIN_NODE &&
        this.#nodeIdParentIdMap.has(currentNodeId) &&
        !finished.has(currentNodeId) &&
        !pathIndex.has(currentNodeId)
      ) {
        pathIndex.set(currentNodeId, path.length);
        path.push(currentNodeId);
        currentNodeId = this.#nodeIdParentIdMap.get(currentNodeId);
      }

      if (currentNodeId !== undefined && pathIndex.has(currentNodeId)) {
        const cycle = path.slice(pathIndex.get(currentNodeId)!);
        const nodeToReparent = cycle.reduce((smallest, nodeId) =>
          nodeId < smallest ? nodeId : smallest,
        );

        this.#nodeIdParentIdMap.set(nodeToReparent, TOPOLOGY_MAIN_NODE);
      }

      for (const nodeId of path) {
        finished.add(nodeId);
      }
    }
  }

  private homologateLevels(): void {
    for (const startNodeId of this.#nodeIdParentIdMap.keys()) {
      if (this.#levelByNodeId.has(startNodeId)) continue;

      const path: string[] = [];
      let currentNodeId = startNodeId;

      while (
        currentNodeId !== TOPOLOGY_MAIN_NODE &&
        this.#nodeIdParentIdMap.has(currentNodeId) &&
        !this.#levelByNodeId.has(currentNodeId)
      ) {
        path.push(currentNodeId);
        currentNodeId = this.#nodeIdParentIdMap.get(currentNodeId)!;
      }

      let level =
        currentNodeId === TOPOLOGY_MAIN_NODE ||
        !this.#nodeIdParentIdMap.has(currentNodeId)
          ? 0
          : this.#levelByNodeId.get(currentNodeId)!;

      for (let i = path.length - 1; i >= 0; i--) {
        level += 1;
        this.#levelByNodeId.set(path[i], level);
      }
    }
  }

  private updateHomologedData() {
    this.#finalTopologyData = [...this.#rowsByNodeId.values()].map((row) => ({
      ...row,
      parentId: this.#nodeIdParentIdMap.get(row.nodeId) ?? row.parentId,
      level: this.#levelByNodeId.get(row.nodeId)!,
    }));
  }

  private mapRowToTopology(row: Record<string, unknown>): Topology {
    return {
      timestamp:
        row.timestamp !== undefined && row.timestamp !== null
          ? row.timestamp.toString()
          : "",
      nodeId:
        row.nodeId !== undefined && row.nodeId !== null
          ? row.nodeId.toString()
          : "",
      metricOne:
        row.metricOne !== undefined && row.metricOne !== null
          ? Number(row.metricOne)
          : 0,
      secondId:
        row.secondId !== undefined && row.secondId !== null
          ? row.secondId.toString()
          : "",
      parentId:
        row.parentId !== undefined && row.parentId !== null
          ? row.parentId.toString()
          : "",
      level:
        row.level !== undefined && row.level !== null ? Number(row.level) : 0,
    };
  }
}
