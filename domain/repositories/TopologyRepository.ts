import type { Topology } from "@/domain/entities/Topology";
import type { DataQuery } from "@/types/datasource";

export interface TopologyRepository {
  find(query: DataQuery): Promise<Topology[]>;
  refine(data: Topology[]): Topology[];
}
