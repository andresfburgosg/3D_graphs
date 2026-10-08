import type { Topology } from "@/domain/entities/Topology";
import type { TopologyRepository } from "@/domain/repositories/TopologyRepository";
import type { DataQuery } from "@/types/datasource";

export class QueryTopology {
  constructor(private readonly repository: TopologyRepository) {}

  async execute(query: DataQuery): Promise<Topology[]> {
    const rawResults = await this.repository.find(query);
    const refinedResults = this.repository.refine(rawResults);

    return refinedResults;
  }
}
