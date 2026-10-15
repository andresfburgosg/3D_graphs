import type { Topology } from "@/domain/entities/Topology";
import type { DataQuery } from "@/types/datasource";
import type { TopologyDateLimits } from "@/types/topology";

export interface TopologyRepository {
  find(query: DataQuery): Promise<Topology[]>;
  refine(data: Topology[]): Topology[];
  getDateLimits(query: DataQuery): Promise<TopologyDateLimits>;
}
