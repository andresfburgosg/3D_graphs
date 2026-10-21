import { useTopologyGraphContext } from "@/context/topology/TopologyGraphContext";
import { TOPOLOGY_MAIN_NODE } from "@/lib/constants";
import {
  TopologyGraphData,
  TopologyGraphDataProps,
  TopologyGraphLink,
  TopologyGraphNode,
} from "@/types/topology";
import { useEffect, useMemo } from "react";

const useTopologyGraphData = ({
  data,
  isLoading,
  error,
  isSuccess,
}: TopologyGraphDataProps) => {
  const { dispatch } = useTopologyGraphContext();

  const processedData = useMemo((): TopologyGraphData => {
    if (!isLoading && !error && isSuccess) {
      const dataToProcess = data.data;
      if (Array.isArray(dataToProcess)) {
        const nodes: TopologyGraphNode[] = [];
        const links: TopologyGraphLink[] = [];
        for (let i = 0; i < dataToProcess.length; i++) {
          nodes.push({
            id: String(dataToProcess[i]?.nodeId ?? ""),
            source: String(dataToProcess[i]?.parentId ?? ""),
            timestamp: String(dataToProcess[i]?.timestamp ?? ""),
            metric: Number(dataToProcess[i]?.metricOne ?? 0),
            subId: String(dataToProcess[i]?.secondId ?? ""),
            level: Number(dataToProcess[i]?.level ?? 0),
          });

          links.push({
            source: String(dataToProcess[i]?.parentId ?? ""),
            target: String(dataToProcess[i]?.nodeId ?? ""),
          });
        }

        if (nodes.length > 0) {
          nodes.push({
            id: TOPOLOGY_MAIN_NODE,
            source: "",
            timestamp: "",
            metric: 0,
            subId: "",
            level: 0,
          });
        }

        return { nodes, links };
      }
    }
    return { nodes: [], links: [] };
  }, [data.data, error, isLoading, isSuccess]);

  useEffect(() => {
    dispatch({ type: "SET_GRAPH_DATA", payload: processedData });
    dispatch({ type: "SET_FIRST_TIME_ZOOM", payload: true });
  }, [dispatch, processedData]);

  return {
    processedData,
  };
};

export default useTopologyGraphData;
