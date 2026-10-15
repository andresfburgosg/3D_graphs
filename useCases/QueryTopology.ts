import type { Topology } from "@/domain/entities/Topology";
import type { TopologyRepository } from "@/domain/repositories/TopologyRepository";
import type { DataQuery } from "@/types/datasource";
import type { TopologyDateLimits } from "@/types/topology";

type QueryTopologyExecuteReturn = {
  data: Topology[];
  dateLimits: TopologyDateLimits;
};

export class QueryTopology {
  constructor(private readonly repository: TopologyRepository) {}

  async execute(query: DataQuery): Promise<QueryTopologyExecuteReturn> {
    const rawResults = await this.repository.find(query);
    const refinedResults = this.repository.refine(rawResults);

    const dateLimits = await this.repository.getDateLimits({});

    return { data: refinedResults, dateLimits };
  }
}
