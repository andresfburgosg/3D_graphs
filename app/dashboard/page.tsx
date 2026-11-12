import { getQueryClient } from "@/app/getQueryClient";
import TopologyGraph from "@/components/features/topology/TopologyGraph";
import GraphContainer from "@/components/ui/GraphContainer";
import { topologyQueryOptions } from "@/helpers/topology.query";
import { globeQueryOptions } from "@/helpers/globe.query";
import { dehydrate, HydrationBoundary, noop } from "@tanstack/react-query";
import { globeProps, topologyProps } from "@/lib/constants";
import { TopologyGraphContextProvider } from "@/context/topology/TopologyGraphContext";
import GlobeGraph from "@/components/features/globe/GlobeGraph";
import { GlobeGraphContextProvider } from "@/context/globe/GlobeGraphContext";

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient.query(topologyQueryOptions({})).catch(noop),
    queryClient.query(globeQueryOptions({})).catch(noop),
  ]);

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
      <div className="col-span-12">
        <GlobeGraphContextProvider>
          <GraphContainer
            graphKey={globeProps.graphKey}
            title={globeProps.title}
            description={globeProps.description}
          >
            <GlobeGraph graphKey={globeProps.graphKey} />
          </GraphContainer>
        </GlobeGraphContextProvider>
      </div>
    </HydrationBoundary>
  );
}
