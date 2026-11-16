"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { GlobeGraphProps } from "@/types/globe";
import useGlobeGraphFilters from "@/hooks/useGlobeGraphFilters";
import { globeQueryOptions } from "@/helpers/globe.query";
import { useQuery } from "@tanstack/react-query";
import ClientPortal from "../common/ClientPortal";
import CalendarInput from "@/components/ui/CalendarInput";
import { useGlobeGraphContext } from "@/context/globe/GlobeGraphContext";
import useGlobeGraphData from "@/hooks/useGlobeGraphData";
import GlobeGraphCanvas from "./GlobeGraphCanvas";
import { GraphTabButtonProps } from "@/types/ui";
import GraphTabButtons from "@/components/ui/GraphTabButtons";
import GraphLoader from "@/components/ui/GraphLoader";
import GraphPopup from "@/components/ui/GraphPopup";
import { noDataMessageDefault } from "@/lib/constants";

const globeGraphTypeTabs: GraphTabButtonProps[] = [
  { title: "Points", value: "points" },
  { title: "Arcs", value: "arcs" },
  { title: "Heatmap", value: "heatmaps" },
];

export default function GlobeGraph({ graphKey }: GlobeGraphProps) {
  const graphContainer = useRef<HTMLDivElement | null>(null);
  const { state, dispatch } = useGlobeGraphContext();

  const { filters, queryFilter, setMaxDate, setMinDate } =
    useGlobeGraphFilters();
  const { data, isLoading, error, isSuccess } = useQuery(
    globeQueryOptions(queryFilter),
  );

  useGlobeGraphData({
    data,
    isLoading,
    error,
    isSuccess,
  });

  const handleGraphTypeChange = useCallback(
    (value: string) => {
      const valueFormatted = value as "points" | "arcs" | "heatmaps";

      dispatch({ type: "SET_GLOBE_TYPE", payload: valueFormatted });
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
      <GlobeGraphCanvas />
      <ClientPortal selector={`#${graphKey}-controls`}>
        <GraphTabButtons
          buttons={globeGraphTypeTabs}
          activeTabValue={state.globeType}
          onTabChange={handleGraphTypeChange}
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
