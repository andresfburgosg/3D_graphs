"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import CalendarInput from "@/components/ui/CalendarInput";
import { topologyQueryOptions } from "@/helpers/topology.query";
import useTopologyGraphFilters from "@/hooks/useTopologyGraphFilters";
import { useQuery } from "@tanstack/react-query";
import ClientPortal from "@/components/features/common/ClientPortal";
import { TopologyGraphProps } from "@/types/topology";
import useTopologyGraphData from "@/hooks/useTopologyGraphData";
import TopologyGraphCanvas from "./TopologyGraphCanvas";
import { useTopologyGraphContext } from "@/context/topology/TopologyGraphContext";
import { GraphTabButtonProps } from "@/types/ui";
import GraphTabButtons from "@/components/ui/GraphTabButtons";
import GraphLoader from "@/components/ui/GraphLoader";
import GraphPopup from "@/components/ui/GraphPopup";
import { noDataMessageDefault } from "@/lib/constants";

const topologyGraphLayoutTabs: GraphTabButtonProps[] = [
  { title: "Top Down", value: "td" },
  { title: "Radial", value: "radialout" },
];

export default function TopologyGraph({ graphKey }: TopologyGraphProps) {
  const graphContainer = useRef<HTMLDivElement | null>(null);
  const { state, dispatch } = useTopologyGraphContext();

  const { filters, queryFilter, setMaxDate, setMinDate } =
    useTopologyGraphFilters();
  const { data, isLoading, error, isSuccess } = useQuery(
    topologyQueryOptions(queryFilter),
  );
  useTopologyGraphData({
    data,
    isLoading,
    error,
    isSuccess,
  });

  const handleGraphLayoutChange = useCallback(
    (value: string) => {
      const valueFormatted = value as
        | "td"
        | "radialout"
        | "bu"
        | "lr"
        | "rl"
        | "zout"
        | "zin"
        | "radialin";

      dispatch({ type: "SET_LAYOUT", payload: valueFormatted });
    },
    [dispatch],
  );

  useLayoutEffect(() => {
    if (!graphContainer.current || isLoading) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        dispatch({ type: "SET_WIDTH", payload: width });
        dispatch({ type: "SET_HEIGHT", payload: height });
      }
    });

    resizeObserver.observe(graphContainer.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [dispatch, isLoading]);

  useEffect(() => {
    if (filters.minDate === "" && data.dateLimits.minDate !== "") {
      setMinDate(data.dateLimits.minDate);
    }

    if (filters.maxDate === "" && data.dateLimits.maxDate !== "") {
      setMaxDate(data.dateLimits.maxDate);
    }
  }, [data, filters.maxDate, filters.minDate, setMaxDate, setMinDate]);

  if (isLoading) return <GraphLoader className="w-full h-full min-h-112.5" />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div ref={graphContainer} className="w-full h-full min-h-112.5 relative">
      {state.noData ? <GraphPopup message={noDataMessageDefault} /> : <></>}
      <TopologyGraphCanvas />
      <ClientPortal selector={`#${graphKey}-controls`}>
        <GraphTabButtons
          buttons={topologyGraphLayoutTabs}
          activeTabValue={state.layout}
          onTabChange={handleGraphLayoutChange}
        />
        <CalendarInput
          minDate={filters.minDate}
          maxDate={filters.maxDate}
          setMinDate={setMinDate}
          setMaxDate={setMaxDate}
        />
      </ClientPortal>
    </div>
  );
}
