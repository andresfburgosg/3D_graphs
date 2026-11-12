import { GlobeDuckDbRepository } from "@/infrastructure/database/duckDb/repositories/GlobeDuckDbRepository";
import { dataQuerySchema } from "@/lib/schemas/globeValidation";
import { QueryGlobe } from "@/useCases/QueryGlobe";
import z from "zod";

export async function POST(request: Request) {
  try {
    //console.log("GLOBE - Received request:", request);
    const reqData = await request.json();
    //console.log("GLOBE - reqData:", reqData);
    const validation = dataQuerySchema.safeParse(reqData);
    //console.log("GLOBE - validation:", validation);

    if (!validation.success) {
      //console.log("GLOBE - validation failed:", validation.success);
      return new Response(
        JSON.stringify({ error: z.flattenError(validation.error).fieldErrors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const repository = new GlobeDuckDbRepository();
    const useCase = new QueryGlobe(repository);

    const GlobeReturn = await useCase.execute(reqData);
    console.log("GLOBE - GlobeReturn:", GlobeReturn);
    const { nodes, arcs, dateLimits } = GlobeReturn;

    return Response.json({
      nodes,
      arcs,
      count: nodes.length,
      dateLimits,
    });
  } catch (error) {
    console.log("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
