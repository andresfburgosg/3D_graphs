import { Globe } from "@/domain/entities/Globe";
import { GlobeMethods } from "react-globe.gl";

export interface GlobeDateLimits {
  minDate: string;
  maxDate: string;
}

export type GlobeArcData = {
  endLat: number;
  endLng: number;
  startLat: number;
  startLng: number;
  color?: string;
};

export type GlobeRefinedData = {
  nodes: Globe[];
  arcs: GlobeArcData[];
};

export type GlobeGraphProps = {
  graphKey: string;
};

export interface GlobeFilterFields {
  minDate: string;
  maxDate: string;
}

export type FilterAction =
  | { type: "SET_MIN_DATE"; payload: string }
  | { type: "SET_MAX_DATE"; payload: string };

export type GlobeGraphDataProps = {
  data: Record<string, unknown>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
};

export type GlobeGraphReference = React.MutableRefObject<
  GlobeMethods | undefined
>;

export type GlobeGraphCanvasType = "points" | "arcs" | "heatmaps";

export interface GlobeGraphContextState {
  globeType: GlobeGraphCanvasType;
  globeImageUrl: string;
  globeLoading: boolean;
  pointsData: Globe[];
  arcsData: GlobeArcData[];
  heatmapsData: Globe[];
  arcColor: string[] | string;
  arcDashLength: number;
  arcDashGap: number;
  arcDashInitialGap: number;
  arcDashAnimateTime: number;
  pointColor: string;
  pointResolution: number;
  pointRadius: number;
  heatmapPointLat: string;
  heatmapPointLng: string;
  heatmapPointWeight: string;
  heatmapsTransitionDuration: number;
  enablePointerInteraction: boolean;
  width: number;
  height: number;
  minMetric: number;
  maxMetric: number;
}

export type GlobeGraphContextAction =
  | {
      type: "SET_GLOBE_TYPE";
      payload: GlobeGraphCanvasType;
    }
  | {
      type: "SET_GLOBE_IMAGE_URL";
      payload: string;
    }
  | {
      type: "SET_GLOBE_LOADING";
      payload: boolean;
    }
  | {
      type: "SET_POINTS_DATA";
      payload: Globe[];
    }
  | {
      type: "SET_ARCS_DATA";
      payload: GlobeArcData[];
    }
  | {
      type: "SET_HEATMAPS_DATA";
      payload: Globe[];
    }
  | {
      type: "SET_ARC_COLOR";
      payload: string[] | string;
    }
  | {
      type: "SET_ARC_DASH_LENGTH";
      payload: number;
    }
  | {
      type: "SET_ARC_DASH_GAP";
      payload: number;
    }
  | {
      type: "SET_ARC_DASH_INITIAL_GAP";
      payload: number;
    }
  | {
      type: "SET_ARC_DASH_ANIMATE_TIME";
      payload: number;
    }
  | {
      type: "SET_POINT_COLOR";
      payload: string;
    }
  | {
      type: "SET_POINT_RESOLUTION";
      payload: number;
    }
  | {
      type: "SET_POINT_RADIUS";
      payload: number;
    }
  | {
      type: "SET_HEATMAP_POINT_LAT";
      payload: string;
    }
  | {
      type: "SET_HEATMAP_POINT_LNG";
      payload: string;
    }
  | {
      type: "SET_HEATMAP_POINT_WEIGHT";
      payload: string;
    }
  | {
      type: "SET_HEATMAPS_TRANSITION_DURATION";
      payload: number;
    }
  | {
      type: "SET_ENABLE_POINTER_INTERACTION";
      payload: boolean;
    }
  | {
      type: "SET_WIDTH";
      payload: number;
    }
  | {
      type: "SET_HEIGHT";
      payload: number;
    }
  | {
      type: "SET_MIN_METRIC";
      payload: number;
    }
  | {
      type: "SET_MAX_METRIC";
      payload: number;
    };

export type GlobeGraphContextValue = {
  state: GlobeGraphContextState;
  dispatch: React.Dispatch<GlobeGraphContextAction>;
  graphRef: GlobeGraphReference;
  onGlobeReady: () => void;
  pointAltitudeFn: (node: Globe) => number;
  showGlobeAtmosphereFn: () => boolean;
  pointColorFn: (node: Globe) => string;
};
