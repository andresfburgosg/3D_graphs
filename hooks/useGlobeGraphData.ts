import { useGlobeGraphContext } from "@/context/globe/GlobeGraphContext";
import { Globe } from "@/domain/entities/Globe";
import { getMinMaxFromNumberArr } from "@/helpers/common";
import { GlobeArcData, GlobeGraphDataProps } from "@/types/globe";
import { useEffect, useMemo } from "react";

const useGlobeGraphData = ({
  data,
  isLoading,
  error,
  isSuccess,
}: GlobeGraphDataProps) => {
  const { dispatch } = useGlobeGraphContext();

  const pointsDataMemo = useMemo((): Globe[] => {
    let pointsData: Globe[] = [];
    if (!isLoading && !error && isSuccess) {
      pointsData = data.nodes as Globe[];
    }
    return pointsData;
  }, [data.nodes, error, isLoading, isSuccess]);

  const arcsDataMemo = useMemo((): GlobeArcData[] => {
    let arcsData: GlobeArcData[] = [];
    if (!isLoading && !error && isSuccess) {
      arcsData = data.arcs as GlobeArcData[];
    }
    return arcsData;
  }, [data.arcs, error, isLoading, isSuccess]);

  const heatmapsDataMemo = useMemo((): Globe[] => {
    let heatmapsData: Globe[] = [];
    if (!isLoading && !error && isSuccess) {
      heatmapsData = data.nodes as Globe[];
    }
    return heatmapsData;
  }, [data.nodes, error, isLoading, isSuccess]);

  const metricList = useMemo(() => {
    if (!isLoading && !error && isSuccess) {
      return pointsDataMemo.map((point) => point.metricOne);
    }
    return [];
  }, [pointsDataMemo, error, isLoading, isSuccess]);

  const minMetric = useMemo(() => {
    if (metricList.length > 0) {
      return getMinMaxFromNumberArr(metricList, "min");
    }
    return 0;
  }, [metricList]);

  const maxMetric = useMemo(() => {
    if (metricList.length > 0) {
      return getMinMaxFromNumberArr(metricList, "max");
    }
    return 0;
  }, [metricList]);

  useEffect(() => {
    dispatch({ type: "SET_POINTS_DATA", payload: pointsDataMemo });
    dispatch({ type: "SET_ARCS_DATA", payload: arcsDataMemo });
    dispatch({ type: "SET_HEATMAPS_DATA", payload: heatmapsDataMemo });
    dispatch({ type: "SET_MIN_METRIC", payload: minMetric });
    dispatch({ type: "SET_MAX_METRIC", payload: maxMetric });
  }, [
    arcsDataMemo,
    dispatch,
    heatmapsDataMemo,
    maxMetric,
    minMetric,
    pointsDataMemo,
  ]);

  return {
    pointsData: pointsDataMemo,
    arcsData: arcsDataMemo,
    heatmapsData: heatmapsDataMemo,
    minMetric,
    maxMetric,
  };
};

export default useGlobeGraphData;
