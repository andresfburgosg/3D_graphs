import type { Topology } from "@/domain/entities/Topology";
import type { TopologyRepository } from "@/domain/repositories/TopologyRepository";
import type { DataQuery } from "@/types/datasource";

export class QueryTopology {
  constructor(private readonly repository: TopologyRepository) {}

  execute(query: DataQuery): Promise<Topology[]> {
    return this.repository.find(query);
  }
}
