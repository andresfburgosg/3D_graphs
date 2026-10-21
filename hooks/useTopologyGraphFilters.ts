import { DataQuery } from "@/types/datasource";
import { TopologyFilterFields, FilterAction } from "@/types/topology";
import { useCallback, useMemo, useReducer } from "react";

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

const useTopologyGraphFilters = () => {
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

  const setMinDate = useCallback((value: string) => {
    dispatch({ type: "SET_MIN_DATE", payload: value });
  }, []);

  const setMaxDate = useCallback((value: string) => {
    dispatch({ type: "SET_MAX_DATE", payload: value });
  }, []);

  return {
    filters,
    queryFilter,
    setMinDate,
    setMaxDate,
  };
};

export default useTopologyGraphFilters;
