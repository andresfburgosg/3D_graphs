import { Globe } from "@/domain/entities/Globe";
import { GlobeRepository } from "@/domain/repositories/GlobeRepository";
import { DataQuery } from "@/types/datasource";
import {
  buildWhereClause,
  executeDuckDBQuery,
  getDatabaseFilePath,
} from "@/infrastructure/database/duckDb/query";
import { GLOBE_MAIN_NODE, GLOBE_JSON_SOURCE_FILE } from "@/lib/constants";
import { GlobeArcData, GlobeDateLimits, GlobeRefinedData } from "@/types/globe";
import { diffInDays } from "@/helpers/common";

const ALLOWED_FIELDS = {
  timestamp: "timestamp",
  targetId: "targetId",
  sourceId: "sourceId",
  metricOne: "metricOne",
  targetLatitude: "targetLatitude",
  targetLongitude: "targetLongitude",
  sourceLatitude: "sourceLatitude",
  sourceLongitude: "sourceLongitude",
} as const;

export class GlobeDuckDbRepository implements GlobeRepository {
  #targetIdSourceIdMap = new Map<string, string>();
  #finalGlobeData: Globe[] = [];
  #finalArcsData: GlobeArcData[] = [];
  #rowsByTargetId = new Map<string, Globe>();
  #latitudeData: number[] = [];
  #longitudeData: number[] = [];
  #latitudMapCenter: number = 0;
  #longitudeMapCenter: number = 0;

  async find(query: DataQuery): Promise<Globe[]> {
    const filePath = getDatabaseFilePath(GLOBE_JSON_SOURCE_FILE);

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

    console.log("GlobeDuckDbRepository - Executing SQL:", sql);

    const rows = await executeDuckDBQuery(sql, {
      filePath,
      ...params,
    });
    console.log("GlobeDuckDbRepository - Retrieved rows:", rows);

    return rows.map(this.mapRowToGlobe);
  }

  refine(data: Globe[]): GlobeRefinedData {
    this.#targetIdSourceIdMap.clear();
    this.#finalGlobeData = [];
    this.#finalArcsData = [];
    this.#rowsByTargetId.clear();
    this.#latitudeData = [];
    this.#longitudeData = [];
    this.#latitudMapCenter = 0;
    this.#longitudeMapCenter = 0;

    this.deduplicateRows(data);
    this.getMapCenter();
    this.homologateCreateFinalData();

    return {
      nodes: this.#finalGlobeData.length > 0 ? this.#finalGlobeData : [],
      arcs: this.#finalArcsData.length > 0 ? this.#finalArcsData : [],
    };
  }

  async getDateLimits(query: DataQuery): Promise<GlobeDateLimits> {
    const filePath = getDatabaseFilePath(GLOBE_JSON_SOURCE_FILE);

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

    let minDate = "";
    let maxDate = "";
    if (rows && rows.length > 0) {
      minDate = rows[0]["min_date"]?.toString() ?? "";
      maxDate = rows[0]["max_date"]?.toString() ?? "";

      const diffDays = diffInDays(minDate, maxDate);

      if (diffDays <= 1) {
        const maxDatePlusOne = new Date(maxDate);
        maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);
        maxDate = maxDatePlusOne.toISOString().split("T")[0];
      }
    }

    return { minDate, maxDate };
  }

  private deduplicateRows(data: Globe[]): void {
    console.log(
      "GlobeDuckDbRepository - Deduplicating rows:",
      data.length,
      data[0],
    );
    let skippedCount = 0;
    let added = 0;
    let rows = 0;
    for (const row of data) {
      if (rows < 10) {
        console.log(
          "GlobeDuckDbRepository - Processing row:",
          row,
          !row?.targetId,
          !row?.sourceId,
          this.#rowsByTargetId.has(row.targetId),
        );
      }
      rows++;
      if (
        !row?.targetId ||
        !row?.sourceId ||
        this.#rowsByTargetId.has(row.targetId)
      ) {
        skippedCount++;
        continue;
      }

      added++;
      this.#rowsByTargetId.set(row.targetId, row);
      this.#targetIdSourceIdMap.set(row.targetId, row.sourceId);
      this.#latitudeData.push(row.targetLatitude ?? 0);
      this.#longitudeData.push(row.targetLongitude ?? 0);
    }

    console.log(
      "GlobeDuckDbRepository - Deduplicated rows count:",
      this.#rowsByTargetId.size,
      this.#targetIdSourceIdMap.size,
    );
    console.log("GlobeDuckDbRepository - Latitude data:", this.#latitudeData);
    console.log("GlobeDuckDbRepository - Longitude data:", this.#longitudeData);
    console.log(
      "GlobeDuckDbRepository - Skipped rows count:",
      skippedCount,
      "Added rows count:",
      added,
    );
  }

  private getMapCenter(): void {
    if (this.#latitudeData.length > 0) {
      const sumLatitude = this.#latitudeData.reduce((sum, lat) => sum + lat, 0);
      this.#latitudMapCenter = sumLatitude / this.#latitudeData.length;
    }

    if (this.#longitudeData.length > 0) {
      const sumLongitude = this.#longitudeData.reduce(
        (sum, lon) => sum + lon,
        0,
      );
      this.#longitudeMapCenter = sumLongitude / this.#longitudeData.length;
    }
  }

  private homologateCreateFinalData(): void {
    const cdnLat = this.#latitudMapCenter + 20;
    const cdnLng = this.#longitudeMapCenter;

    const rowsByTargetIdCopy = new Map<string, Globe>([
      ...this.#rowsByTargetId,
    ]);

    for (const [targetId, row] of rowsByTargetIdCopy.entries()) {
      if (row.sourceId === GLOBE_MAIN_NODE) {
        this.#rowsByTargetId.set(targetId, {
          ...row,
          sourceLatitude: cdnLat,
          sourceLongitude: cdnLng,
        });
      }
      const finalData = this.#rowsByTargetId.get(targetId);
      this.#finalGlobeData.push(finalData!);
      this.#finalArcsData.push({
        startLat: finalData!.sourceLatitude ?? cdnLat,
        startLng: finalData!.sourceLongitude ?? cdnLng,
        endLat: finalData!.targetLatitude ?? 0,
        endLng: finalData!.targetLongitude ?? 0,
      });
    }

    this.#finalGlobeData.push({
      timestamp: "",
      targetId: GLOBE_MAIN_NODE,
      sourceId: GLOBE_MAIN_NODE,
      metricOne: 0,
      targetLatitude: cdnLat,
      targetLongitude: cdnLng,
      sourceLatitude: cdnLat,
      sourceLongitude: cdnLng,
    });
  }

  private mapRowToGlobe(row: Record<string, unknown>): Globe {
    return {
      timestamp:
        row.timestamp !== undefined && row.timestamp !== null
          ? row.timestamp.toString()
          : "",
      targetId:
        row.targetId !== undefined && row.targetId !== null
          ? row.targetId.toString()
          : "",
      sourceId:
        row.sourceId !== undefined && row.sourceId !== null
          ? row.sourceId.toString()
          : "",
      metricOne:
        row.metricOne !== undefined && row.metricOne !== null
          ? Number(row.metricOne)
          : 0,
      targetLatitude:
        row.targetLatitude !== undefined && row.targetLatitude !== null
          ? Number(row.targetLatitude)
          : null,
      targetLongitude:
        row.targetLongitude !== undefined && row.targetLongitude !== null
          ? Number(row.targetLongitude)
          : null,
      sourceLatitude:
        row.sourceLatitude !== undefined && row.sourceLatitude !== null
          ? Number(row.sourceLatitude)
          : null,
      sourceLongitude:
        row.sourceLongitude !== undefined && row.sourceLongitude !== null
          ? Number(row.sourceLongitude)
          : null,
    };
  }
}
