import { TopologyDuckDbRepository } from "@/infrastructure/database/duckDb/repositories/TopologyDuckDbRepository";
import { dataQuerySchema } from "@/lib/schemas/topologyValidation";
import { QueryTopology } from "@/useCases/QueryTopology";
import z from "zod";

export async function POST(request: Request) {
  try {
    const reqData = await request.json();
    const validation = dataQuerySchema.safeParse(reqData);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: z.flattenError(validation.error).fieldErrors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const repository = new TopologyDuckDbRepository();
    const useCase = new QueryTopology(repository);

    const topologyReturn = await useCase.execute(reqData);
    const { data, dateLimits } = topologyReturn;

    return Response.json({
      data,
      count: data.length,
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
