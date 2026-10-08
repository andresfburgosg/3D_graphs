import { Topology } from "@/domain/entities/Topology";
import { TopologyRepository } from "@/domain/repositories/TopologyRepository";
import { DataQuery } from "@/types/datasource";
import {
  buildWhereClause,
  executeDuckDBQuery,
  getDatabaseFilePath,
} from "@/infrastructure/database/duckDb/query";
import { TOPOLOGY_MAIN_NODE, TREE_NODE_IN_CYCLE_LEVEL } from "@/lib/constants";

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
  #nodeIdLevelMap = new Map<string, number>();

  async find(query: DataQuery): Promise<Topology[]> {
    const filePath = getDatabaseFilePath("topology.json");

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
    this.#nodeIdLevelMap.clear();

    this.deduplicateRows(data);
    this.homologateParentId();
    this.homologateLevels();
    this.updateHomologedData();

    return this.#finalTopologyData.length > 0 ? this.#finalTopologyData : data;
  }

  private deduplicateRows(data: Topology[]): void {
    for (const topologyItem of data) {
      if (topologyItem?.nodeId && topologyItem?.parentId) {
        if (!this.#nodeIdParentIdMap.has(topologyItem.nodeId)) {
          this.#nodeIdParentIdMap.set(
            topologyItem.nodeId,
            topologyItem.parentId,
          );
          this.#finalTopologyData.push(topologyItem);
        }
      }
    }
  }

  private homologateParentId(): void {
    const nodeIdParentIdMapCopy = new Map<string, string>([
      ...this.#nodeIdParentIdMap,
    ]);

    for (const [nodeId, parentId] of nodeIdParentIdMapCopy.entries()) {
      if (
        !this.#nodeIdParentIdMap.has(parentId) &&
        parentId !== TOPOLOGY_MAIN_NODE
      ) {
        this.#nodeIdParentIdMap.set(nodeId, TOPOLOGY_MAIN_NODE);
      }
    }
  }

  private homologateLevels(): void {
    const nodeIdParentIdMapCopy = new Map<string, string>([
      ...this.#nodeIdParentIdMap,
    ]);
    const nodesWithCycles = new Set<string>();

    for (const [nodeId, _] of nodeIdParentIdMapCopy.entries()) {
      const nodeLevelInfo = this.getNodeLevel(nodeId, this.#nodeIdParentIdMap);
      if (nodeLevelInfo.level === TREE_NODE_IN_CYCLE_LEVEL) {
        this.#nodeIdParentIdMap.set(nodeId, TOPOLOGY_MAIN_NODE);
        for (const nodeInCycle of nodeLevelInfo.parentsCollected) {
          nodesWithCycles.add(nodeInCycle);
        }
      } else {
        this.#nodeIdLevelMap.set(nodeId, nodeLevelInfo.level);
      }
    }

    if (nodesWithCycles.size > 0) {
      for (const nodeId of nodesWithCycles) {
        const nodeLevelInfo = this.getNodeLevel(
          nodeId,
          this.#nodeIdParentIdMap,
        );
        this.#nodeIdLevelMap.set(
          nodeId,
          nodeLevelInfo.level !== TREE_NODE_IN_CYCLE_LEVEL
            ? nodeLevelInfo.level
            : 0,
        );
      }
    }
  }

  private getNodeLevel(nodeId: string, nodeIdParentIdMap: Map<string, string>) {
    let currentLevel = 1;
    let currentNodeId = nodeId;
    let findLevel = true;
    const parentsCollected = [];

    while (findLevel) {
      const parent = nodeIdParentIdMap.get(currentNodeId);

      if (!parent || parent === TOPOLOGY_MAIN_NODE) {
        findLevel = false;
      } else if (parent === nodeId) {
        findLevel = false;
        currentLevel = TREE_NODE_IN_CYCLE_LEVEL;
        parentsCollected.push(nodeId);
      } else {
        currentLevel++;
        currentNodeId = parent;
        parentsCollected.push(currentNodeId);
      }

      if (currentLevel > 100) {
        findLevel = false;
      }
    }

    return { level: currentLevel, parentsCollected };
  }

  private updateHomologedData() {
    for (const nodeData of this.#finalTopologyData) {
      const parentId = this.#nodeIdParentIdMap.get(nodeData.nodeId);
      const level = this.#nodeIdLevelMap.get(nodeData.nodeId);

      if (parentId !== undefined) {
        nodeData.parentId = parentId;
      }

      if (level !== undefined) {
        nodeData.level = level;
      }
    }
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
