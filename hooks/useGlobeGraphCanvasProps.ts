import { useGlobeGraphContext } from "@/context/globe/GlobeGraphContext";
import type { Globe } from "@/domain/entities/Globe";
import { useMemo } from "react";

const useGlobeGraphCanvasProps = () => {
  const { state, pointAltitudeFn, pointColorFn } = useGlobeGraphContext();

  const globeCanvasProps = useMemo(() => {
    switch (state.globeType) {
      case "points":
        return {
          pointsData: state.pointsData,
          arcsData: [],
          heatmapsData: [],
          pointLat: "targetLatitude",
          pointLng: "targetLongitude",
          pointAltitude: (point: object) => pointAltitudeFn(point as Globe),
          pointColor: (point: object) => pointColorFn(point as Globe),
          pointResolution: state.pointResolution,
          pointRadius: state.pointRadius,
        };
      case "arcs":
        return {
          pointsData: [],
          arcsData: state.arcsData,
          heatmapsData: [],
          arcColor: state.arcColor,
          arcDashLength: state.arcDashLength,
          arcDashGap: state.arcDashGap,
          arcDashInitialGap: state.arcDashInitialGap,
          arcDashAnimateTime: state.arcDashAnimateTime,
        };
      case "heatmaps":
        return {
          pointsData: [],
          arcsData: [],
          heatmapsData: state.heatmapsData,
          heatmapPointLat: state.heatmapPointLat,
          heatmapPointLng: state.heatmapPointLng,
          heatmapPointWeight: state.heatmapPointWeight,
          heatmapsTransitionDuration: state.heatmapsTransitionDuration,
        };
      default:
        return {};
    }
  }, [
    pointAltitudeFn,
    pointColorFn,
    state.arcColor,
    state.arcDashAnimateTime,
    state.arcDashGap,
    state.arcDashInitialGap,
    state.arcDashLength,
    state.arcsData,
    state.globeType,
    state.heatmapPointLat,
    state.heatmapPointLng,
    state.heatmapPointWeight,
    state.heatmapsData,
    state.heatmapsTransitionDuration,
    state.pointRadius,
    state.pointResolution,
    state.pointsData,
  ]);

  return { globeCanvasProps };
};

export default useGlobeGraphCanvasProps;
