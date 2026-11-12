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
    //console.log("QueryGlobe - Executing with query:", query);
    const rawResults = await this.repository.find(query);
    console.log("QueryGlobe - rawResults:", rawResults);
    const refinedResults = this.repository.refine(rawResults);
    console.log("QueryGlobe - refinedResults:", refinedResults);

    const dateLimits = await this.repository.getDateLimits({});

    return {
      nodes: refinedResults.nodes,
      arcs: refinedResults.arcs,
      dateLimits,
    };
  }
}
