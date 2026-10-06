import { Topology } from "@/domain/entities/Topology";
import { TopologyRepository } from "@/domain/repositories/TopologyRepository";
import { DataQuery } from "@/types/datasource";
import {
  buildWhereClause,
  executeDuckDBQuery,
  getDatabaseFilePath,
} from "@/infrastructure/database/duckDb/query";

const ALLOWED_FIELDS = {
  timestamp: "timestamp",
  nodeId: "nodeId",
  metricOne: "metricOne",
  secondId: "secondId",
  parentId: "parentId",
  level: "level",
} as const;

export class TopologyDuckDbRepository implements TopologyRepository {
  async find(query: DataQuery): Promise<Topology[]> {
    const filePath = getDatabaseFilePath("topology.json");

    const { clause, params } = buildWhereClause(
      query.filters ?? [],
      ALLOWED_FIELDS
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
