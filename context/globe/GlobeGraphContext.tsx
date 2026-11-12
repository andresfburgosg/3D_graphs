"use client";

import { Globe } from "@/domain/entities/Globe";
import { scaleValue } from "@/helpers/common";
import {
  GlobeColorSelector,
  MetricOneStrategy,
} from "@/helpers/globeLineColor";
import {
  ARC_COLOR_OPACITY,
  GLOBE_MAX_SCALING,
  GLOBE_MIN_SCALING,
} from "@/lib/constants";
import {
  GlobeGraphContextState,
  GlobeGraphContextAction,
  GlobeGraphContextValue,
} from "@/types/globe";
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from "react";
import { GlobeMethods } from "react-globe.gl";

const INITIAL_PROPS_CONTEXT: GlobeGraphContextState = {
  globeType: "points",
  globeImageUrl: "/globe_map.jpg",
  globeLoading: true,
  pointsData: [],
  arcsData: [],
  heatmapsData: [],
  arcColor: (() => [
    `rgba(0, 100, 255, ${ARC_COLOR_OPACITY})`,
    `rgba(0, 255, 0, ${ARC_COLOR_OPACITY})`,
  ])(),
  arcDashLength: 0.25,
  arcDashGap: 1,
  arcDashInitialGap: (() => Math.random())(),
  arcDashAnimateTime: 4000,
  pointColor: "color",
  pointResolution: 6,
  pointRadius: 0.1,
  heatmapPointLat: "targetLatitude",
  heatmapPointLng: "targetLongitude",
  heatmapPointWeight: "metricOne",
  heatmapsTransitionDuration: 3000,
  enablePointerInteraction: false,
  width: 0,
  height: 0,
  minMetric: 0,
  maxMetric: 0,
};

function globeGraphContextReducer(
  state: GlobeGraphContextState,
  action: GlobeGraphContextAction,
) {
  switch (action.type) {
    case "SET_GLOBE_TYPE":
      return { ...state, globeType: action.payload };
    case "SET_GLOBE_IMAGE_URL":
      return { ...state, globeImageUrl: action.payload };
    case "SET_GLOBE_LOADING":
      return { ...state, globeLoading: action.payload };
    case "SET_POINTS_DATA":
      return { ...state, pointsData: action.payload };
    case "SET_ARCS_DATA":
      return { ...state, arcsData: action.payload };
    case "SET_HEATMAPS_DATA":
      return { ...state, heatmapsData: action.payload };
    case "SET_ARC_COLOR":
      return { ...state, arcColor: action.payload };
    case "SET_ARC_DASH_LENGTH":
      return { ...state, arcDashLength: action.payload };
    case "SET_ARC_DASH_GAP":
      return { ...state, arcDashGap: action.payload };
    case "SET_ARC_DASH_INITIAL_GAP":
      return { ...state, arcDashInitialGap: action.payload };
    case "SET_ARC_DASH_ANIMATE_TIME":
      return { ...state, arcDashAnimateTime: action.payload };
    case "SET_POINT_COLOR":
      return { ...state, pointColor: action.payload };
    case "SET_POINT_RESOLUTION":
      return { ...state, pointResolution: action.payload };
    case "SET_POINT_RADIUS":
      return { ...state, pointRadius: action.payload };
    case "SET_HEATMAP_POINT_LAT":
      return { ...state, heatmapPointLat: action.payload };
    case "SET_HEATMAP_POINT_LNG":
      return { ...state, heatmapPointLng: action.payload };
    case "SET_HEATMAP_POINT_WEIGHT":
      return { ...state, heatmapPointWeight: action.payload };
    case "SET_HEATMAPS_TRANSITION_DURATION":
      return { ...state, heatmapsTransitionDuration: action.payload };
    case "SET_ENABLE_POINTER_INTERACTION":
      return { ...state, enablePointerInteraction: action.payload };
    case "SET_WIDTH":
      return { ...state, width: action.payload };
    case "SET_HEIGHT":
      return { ...state, height: action.payload };
    case "SET_MIN_METRIC":
      return { ...state, minMetric: action.payload };
    case "SET_MAX_METRIC":
      return { ...state, maxMetric: action.payload };
  }
}

const GlobeGraphContext = createContext<GlobeGraphContextValue | null>(null);

export function GlobeGraphContextProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(
    globeGraphContextReducer,
    INITIAL_PROPS_CONTEXT,
  );
  const graphRef = useRef<GlobeMethods | undefined>(undefined);

  const globeColorSelector = useMemo(
    () => new GlobeColorSelector(new MetricOneStrategy()),
    [],
  );

  const actions = useMemo(
    () => ({
      onGlobeReady: () => {
        dispatch({ type: "SET_GLOBE_LOADING", payload: false });
      },
      pointAltitudeFn: (node: Globe) =>
        scaleValue(
          node.metricOne,
          state.minMetric,
          state.maxMetric,
          GLOBE_MIN_SCALING,
          GLOBE_MAX_SCALING,
        ),
      showGlobeAtmosphereFn: () =>
        state.globeLoading === false && state.pointsData.length > 0,
      pointColorFn: (node: Globe) => {
        if (state.pointColor === "color" && node?.color) {
          return node.color;
        }
        return globeColorSelector.colorFunction(node);
      },
    }),
    [
      state.minMetric,
      state.maxMetric,
      state.globeLoading,
      state.pointsData.length,
      state.pointColor,
      globeColorSelector,
    ],
  );

  const providerValue = useMemo(
    () => ({ state, dispatch, graphRef, ...actions }),
    [state, dispatch, graphRef, actions],
  );

  return (
    <GlobeGraphContext.Provider value={providerValue}>
      {children}
    </GlobeGraphContext.Provider>
  );
}

export function useGlobeGraphContext(): GlobeGraphContextValue {
  const context = useContext(GlobeGraphContext);

  if (context === null) {
    throw new Error(
      "useGlobeGraphContext must be used within GlobeGraphContextProvider",
    );
  }

  return context;
}
