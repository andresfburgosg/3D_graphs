import { getQueryClient } from "@/app/getQueryClient";
import TopologyGraph from "@/components/features/topology/TopologyGraph";
import { topologyQueryOptions } from "@/helpers/topology.query";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  await queryClient.query(topologyQueryOptions({})).catch(noop);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1">
        <h1>Welcome to Dashboard</h1>
        <TopologyGraph />
      </main>
    </HydrationBoundary>
  );
}
