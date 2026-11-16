import { Globe } from "@/domain/entities/Globe";
import { GlobeRepository } from "@/domain/repositories/GlobeRepository";
import type { DataQuery } from "@/types/datasource";
import { GlobeArcData, GlobeDateLimits } from "@/types/globe";

type QueryGlobeExecuteReturn = {
  nodes: Globe[];
  arcs: GlobeArcData[];
  dateLimits: GlobeDateLimits;
};

export class QueryGlobe {
  constructor(private readonly repository: GlobeRepository) {}

  async execute(query: DataQuery): Promise<QueryGlobeExecuteReturn> {
    const rawResults = await this.repository.find(query);
    const refinedResults = this.repository.refine(rawResults);

    const dateLimits = await this.repository.getDateLimits({});

    return {
      nodes: refinedResults.nodes,
      arcs: refinedResults.arcs,
      dateLimits,
    };
  }
}
