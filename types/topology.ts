import * as THREE from "three";
import { ForceGraphMethods, NodeObject } from "react-force-graph-3d";
import type { TopologyInstanceRenderer } from "@/lib/rendering/topologyInstanceRenderer";

export interface TopologyDateLimits {
  minDate: string;
  maxDate: string;
}

export type TopologyGraphProps = {
  graphKey: string;
};

export interface TopologyFilterFields {
  minDate: string;
  maxDate: string;
}

export type FilterAction =
  | { type: "SET_MIN_DATE"; payload: string }
  | { type: "SET_MAX_DATE"; payload: string };

export type TopologyGraphDataProps = {
  data: Record<string, unknown>;
  isLoading: boolean;
  error: Error | null;
  isSuccess: boolean;
};

export type TopologyGraphNode = {
  id: string;
  source: string;
  timestamp: string;
  metric: number;
  subId?: string;
  level?: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
};

export type TopologyGraphLink = {
  source: string | TopologyGraphNode;
  target: string | TopologyGraphNode;
};

export type TopologyGraphData = {
  nodes: TopologyGraphNode[];
  links: TopologyGraphLink[];
};

export type TopologyGraphReference = React.MutableRefObject<
  ForceGraphMethods<NodeObject<TopologyGraphNode>> | undefined
>;

export interface TopologyGraphContextState {
  graphData: TopologyGraphData;
  layout: "td" | "radialout" | "bu" | "lr" | "rl" | "zout" | "zin" | "radialin";
  dagLevelDistance: number | undefined;
  nodeVal: number | string;
  controlType: "orbit" | "trackball";
  height: number;
  width: number;
  nodeId: string;
  d3VelocityDecay: number;
  cooldownTime: number;
  warmupTicks: number;
  cooldownTicks: number;
  showNavInfo: boolean;
  linkWidth: number;
  linkVisibility: boolean;
  nodeOpacity: number;
  linkOpacity: number;
  nodeResolution: number;
  enableNavigationControls: boolean;
  enableNodeDrag: boolean;
  firstTimeZoom: boolean;
}

export type TopologyGraphContextAction =
  | {
      type: "SET_GRAPH_DATA";
      payload: TopologyGraphData;
    }
  | {
      type: "SET_LAYOUT";
      payload:
        | "td"
        | "radialout"
        | "bu"
        | "lr"
        | "rl"
        | "zout"
        | "zin"
        | "radialin";
    }
  | {
      type: "SET_DAG_LEVEL_DS";
      payload: number | undefined;
    }
  | {
      type: "SET_NODE_VAL";
      payload: number | string;
    }
  | {
      type: "SET_CONTROL";
      payload: "orbit" | "trackball";
    }
  | {
      type: "SET_HEIGHT";
      payload: number;
    }
  | {
      type: "SET_WIDTH";
      payload: number;
    }
  | {
      type: "SET_NODE_ID";
      payload: string;
    }
  | {
      type: "SET_VEL_DECAY";
      payload: number;
    }
  | {
      type: "SET_COOLDOWN_TIME";
      payload: number;
    }
  | {
      type: "SET_WARMUP_TICKS";
      payload: number;
    }
  | {
      type: "SET_COOLDOWN_TICKS";
      payload: number;
    }
  | {
      type: "SET_NAV_INFO";
      payload: boolean;
    }
  | {
      type: "SET_LINK_WIDTH";
      payload: number;
    }
  | {
      type: "SET_LINK_VISIBILITY";
      payload: boolean;
    }
  | {
      type: "SET_NODE_OPACITY";
      payload: number;
    }
  | {
      type: "SET_LINK_OPACITY";
      payload: number;
    }
  | {
      type: "SET_NODE_RESOLUTION";
      payload: number;
    }
  | {
      type: "SET_NAV_CONTROLS";
      payload: boolean;
    }
  | {
      type: "SET_NODE_DRAG";
      payload: boolean;
    }
  | {
      type: "SET_FIRST_TIME_ZOOM";
      payload: boolean;
    };

export type TopologyGraphContextValue = {
  state: TopologyGraphContextState;
  dispatch: React.Dispatch<TopologyGraphContextAction>;
  graphRef: TopologyGraphReference;
  setNodeRelSize: () => number;
  onEngineStop: (fitFn?: () => boolean) => void;
  nodeColorFn: (node: TopologyGraphNode) => string;
  onNodeDragEnd: (node: TopologyGraphNode) => void;
  onEngineTick: () => void;
  themeBackground: () => string;
  linkColorFn: () => string;
};

export type TopologyInstanceRendererOptions = {
  nodeColor: (node: TopologyGraphNode) => string;
  linkColor: () => string;
  nodeOpacity: number;
  linkOpacity: number;
  linkWidth: number;
  baseNodeRadius: number;
};

export interface UseTopologyInstanceInteractions {
  graphRef: TopologyGraphReference;
  rendererRef: React.MutableRefObject<TopologyInstanceRenderer | null>;
  onNodeDragEnd: (node: TopologyGraphNode) => void;
}

export type TopologyGraphControlsWithEvents = {
  enabled: boolean;
  addEventListener(type: "change" | "end", listener: () => void): void;
  removeEventListener(type: "change" | "end", listener: () => void): void;
};

export type TopologyTooltipData = {
  id: string;
  metric: number;
  source: string;
  timestamp: string;
  x: number;
  y: number;
};

export type TopologyDragGestureProps = {
  pointerId: number;
  nodeIndex: number;
  node: TopologyGraphNode;
  startX: number;
  startY: number;
  moved: boolean;
  previousControlsEnabled: boolean;
  plane: THREE.Plane;
  pointerOffset: THREE.Vector3;
};

export interface UseTopologyInstanceRenderer {
  graphRef: TopologyGraphReference;
  graphData: TopologyGraphData;
  options: TopologyInstanceRendererOptions;
}
