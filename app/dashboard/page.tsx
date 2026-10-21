import { getQueryClient } from "@/app/getQueryClient";
import TopologyGraph from "@/components/features/topology/TopologyGraph";
import GraphContainer from "@/components/ui/GraphContainer";
import { topologyQueryOptions } from "@/helpers/topology.query";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { topologyProps } from "@/lib/constants";
import { TopologyGraphContextProvider } from "@/context/topology/TopologyGraphContext";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  await queryClient.query(topologyQueryOptions({})).catch(noop);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="col-span-12">
        <TopologyGraphContextProvider>
          <GraphContainer
            graphKey={topologyProps.graphKey}
            title={topologyProps.title}
            description={topologyProps.description}
          >
            <TopologyGraph graphKey={topologyProps.graphKey} />
          </GraphContainer>
        </TopologyGraphContextProvider>
      </div>
    </HydrationBoundary>
  );
}
