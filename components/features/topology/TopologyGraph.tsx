"use client";

import CalendarInput from "@/components/ui/CalendarInput";
import { topologyQueryOptions } from "@/helpers/topology.query";
import { useQuery } from "@tanstack/react-query";
import ClientPortal from "../common/ClientPortal";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import { DataQuery } from "@/types/datasource";
import {
  TopologyGraphProps,
  TopologyFilterFields,
  FilterAction,
} from "@/types/topology";

const INITIAL_FILTER_FIELDS: TopologyFilterFields = {
  minDate: "",
  maxDate: "",
};

function filterFieldsReducer(
  state: TopologyFilterFields,
  action: FilterAction,
) {
  switch (action.type) {
    case "SET_MIN_DATE":
      return { ...state, minDate: action.payload };
    case "SET_MAX_DATE":
      return { ...state, maxDate: action.payload };
    default:
      return state;
  }
}

export default function TopologyGraph({ graphKey }: TopologyGraphProps) {
  const [filters, dispatch] = useReducer(
    filterFieldsReducer,
    INITIAL_FILTER_FIELDS,
  );

  const queryFilter = useMemo(() => {
    const queryFilterVal: DataQuery = { filters: [] };

    if (filters.minDate !== "") {
      queryFilterVal?.filters?.push({
        field: "timestamp",
        operator: "gte",
        value: filters.minDate,
      });
    }

    if (filters.maxDate !== "") {
      queryFilterVal?.filters?.push({
        field: "timestamp",
        operator: "lte",
        value: filters.maxDate,
      });
    }

    return queryFilterVal?.filters !== undefined &&
      queryFilterVal?.filters?.length > 0
      ? queryFilterVal
      : {};
  }, [filters.maxDate, filters.minDate]);
  const { data, isLoading, error } = useQuery(
    topologyQueryOptions(queryFilter),
  );

  const setMinDate = useCallback((value: string) => {
    dispatch({ type: "SET_MIN_DATE", payload: value });
  }, []);

  const setMaxDate = useCallback((value: string) => {
    dispatch({ type: "SET_MAX_DATE", payload: value });
  }, []);

  useEffect(() => {
    if (filters.minDate === "" && data.dateLimits.minDate !== "") {
      setMinDate(data.dateLimits.minDate);
    }

    if (filters.maxDate === "" && data.dateLimits.maxDate !== "") {
      setMaxDate(data.dateLimits.maxDate);
    }
  }, [data, filters.maxDate, filters.minDate, setMaxDate, setMinDate]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log("Topology data (useQuery):", data);
  return (
    <div className="w-full h-full">
      <h1>Topology Graph</h1>
      <p>
        Reducer values: {filters.minDate} - {filters.maxDate}
      </p>
      <p>
        data query values: {data.dateLimits.minDate} - {data.dateLimits.maxDate}
      </p>
      <p>total rows: {data.data.length}</p>
      <ClientPortal selector={`#${graphKey}-controls`}>
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
