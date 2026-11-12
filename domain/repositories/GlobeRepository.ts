import type { Globe } from "@/domain/entities/Globe";
import type { DataQuery } from "@/types/datasource";
import type { GlobeDateLimits, GlobeRefinedData } from "@/types/globe";

export interface GlobeRepository {
  find(query: DataQuery): Promise<Globe[]>;
  refine(data: Globe[]): GlobeRefinedData;
  getDateLimits(query: DataQuery): Promise<GlobeDateLimits>;
}
