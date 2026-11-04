"use client";

import {
  MetricOneStrategy,
  NodeColorSelector,
} from "@/helpers/topologyNodeColor";
import {
  topologyThemeBackground,
  topologyThemeLinkColor,
} from "@/lib/constants";
import {
  TopologyGraphContextAction,
  TopologyGraphContextState,
  TopologyGraphContextValue,
  TopologyGraphNode,
} from "@/types/topology";
import { useTheme } from "next-themes";
import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from "react";
import { ForceGraphMethods, NodeObject } from "react-force-graph-3d";

const INITIAL_PROPS_CONTEXT: TopologyGraphContextState = {
  graphData: { nodes: [], links: [] },
  layout: "td",
  dagLevelDistance: undefined,
  nodeVal: 2,
  controlType: "orbit",
  height: 0,
  width: 0,
  nodeId: "id",
  d3VelocityDecay: 0.15,
  cooldownTime: 3000,
  warmupTicks: 0,
  cooldownTicks: Infinity,
  showNavInfo: false,
  linkWidth: 2,
  linkVisibility: true,
  nodeOpacity: 1,
  linkOpacity: 0.2,
  nodeResolution: 16,
  enableNavigationControls: true,
  enableNodeDrag: true,
  firstTimeZoom: true,
};

function topologyGraphContextReducer(
  state: TopologyGraphContextState,
  action: TopologyGraphContextAction,
) {
  switch (action.type) {
    case "SET_GRAPH_DATA":
      return { ...state, graphData: action.payload };
    case "SET_LAYOUT":
      return { ...state, layout: action.payload };
    case "SET_DAG_LEVEL_DS":
      return { ...state, dagLevelDistance: action.payload };
    case "SET_NODE_VAL":
      return { ...state, nodeVal: action.payload };
    case "SET_CONTROL":
      return { ...state, controlType: action.payload };
    case "SET_HEIGHT":
      return { ...state, height: action.payload };
    case "SET_WIDTH":
      return { ...state, width: action.payload };
    case "SET_NODE_ID":
      return { ...state, nodeId: action.payload };
    case "SET_VEL_DECAY":
      return { ...state, d3VelocityDecay: action.payload };
    case "SET_COOLDOWN_TIME":
      return { ...state, cooldownTime: action.payload };
    case "SET_WARMUP_TICKS":
      return { ...state, warmupTicks: action.payload };
    case "SET_COOLDOWN_TICKS":
      return { ...state, cooldownTicks: action.payload };
    case "SET_NAV_INFO":
      return { ...state, showNavInfo: action.payload };
    case "SET_LINK_WIDTH":
      return { ...state, linkWidth: action.payload };
    case "SET_LINK_VISIBILITY":
      return { ...state, linkVisibility: action.payload };
    case "SET_NODE_OPACITY":
      return { ...state, nodeOpacity: action.payload };
    case "SET_LINK_OPACITY":
      return { ...state, linkOpacity: action.payload };
    case "SET_NODE_RESOLUTION":
      return { ...state, nodeResolution: action.payload };
    case "SET_NAV_CONTROLS":
      return { ...state, enableNavigationControls: action.payload };
    case "SET_NODE_DRAG":
      return { ...state, enableNodeDrag: action.payload };
    case "SET_FIRST_TIME_ZOOM":
      return { ...state, firstTimeZoom: action.payload };
  }
}

const TopologyGraphContext = createContext<TopologyGraphContextValue | null>(
  null,
);

export function TopologyGraphContextProvider({ children }: PropsWithChildren) {
  const { theme } = useTheme();
  const [state, dispatch] = useReducer(
    topologyGraphContextReducer,
    INITIAL_PROPS_CONTEXT,
  );
  const graphRef = useRef<
    ForceGraphMethods<NodeObject<TopologyGraphNode>> | undefined
  >(undefined);

  const nodeColorSelector = useMemo(
    () => new NodeColorSelector(new MetricOneStrategy()),
    [],
  );

  const actions = useMemo(
    () => ({
      setNodeRelSize: () => {
        const minRadius = 6;
        const maxRadius = 28;

        const radiusCalc = Math.cbrt(state.graphData.nodes.length ?? 4) * 1.5;

        return Math.max(minRadius, Math.min(maxRadius, radiusCalc));
      },
      onEngineStop: (fitGraphFn?: () => boolean) => {
        if (
          !state.firstTimeZoom ||
          state.graphData.nodes.length === 0 ||
          !graphRef.current
        )
          return;

        const fitted = fitGraphFn
          ? fitGraphFn()
          : (graphRef.current?.zoomToFit(500, 40), true);

        if (fitted) {
          dispatch({ type: "SET_FIRST_TIME_ZOOM", payload: false });
        }
      },
      nodeColorFn: (node: TopologyGraphNode) =>
        nodeColorSelector.colorFunction(node),
      onNodeDragEnd: (node: TopologyGraphNode) => {
        node.fx = node.x;
        node.fy = node.y;
        node.fz = node.z;
      },
      onEngineTick: () => {},
      themeBackground: () =>
        topologyThemeBackground[
          (theme ?? "light") as keyof typeof topologyThemeBackground
        ],
      linkColorFn: () =>
        topologyThemeLinkColor[
          (theme ?? "light") as keyof typeof topologyThemeLinkColor
        ],
    }),
    [
      nodeColorSelector,
      state.firstTimeZoom,
      state.graphData.nodes.length,
      theme,
    ],
  );

  const providerValue = useMemo(
    () => ({ state, dispatch, graphRef, ...actions }),
    [state, dispatch, graphRef, actions],
  );

  return (
    <TopologyGraphContext.Provider value={providerValue}>
      {children}
    </TopologyGraphContext.Provider>
  );
}

export function useTopologyGraphContext(): TopologyGraphContextValue {
  const context = useContext(TopologyGraphContext);

  if (context === null) {
    throw new Error(
      "useTopologyGraphContext must be used within TopologyGraphContextProvider",
    );
  }

  return context;
}
