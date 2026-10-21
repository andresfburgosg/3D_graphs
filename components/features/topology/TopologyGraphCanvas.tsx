import { useTopologyGraphContext } from "@/context/topology/TopologyGraphContext";
import ForceGraph3d from "react-force-graph-3d";

export default function TopologyGraphCanvas() {
  const {
    state,
    graphRef,
    setNodeRelSize,
    onEngineStop,
    onEngineTick,
    nodeColorFn,
    onNodeDragEnd,
    themeBackground,
    linkColorFn,
  } = useTopologyGraphContext();
  return (
    <ForceGraph3d
      ref={graphRef}
      graphData={state.graphData}
      backgroundColor={themeBackground()}
      dagMode={state.layout}
      dagLevelDistance={state.dagLevelDistance}
      nodeVal={state.nodeVal}
      controlType={state.controlType}
      height={state.height}
      width={state.width}
      nodeId={state.nodeId}
      nodeRelSize={setNodeRelSize()}
      d3VelocityDecay={state.d3VelocityDecay}
      cooldownTime={state.cooldownTime}
      warmupTicks={state.warmupTicks}
      cooldownTicks={state.cooldownTicks}
      onEngineStop={onEngineStop}
      showNavInfo={state.showNavInfo}
      linkWidth={state.linkWidth}
      linkColor={linkColorFn}
      onEngineTick={onEngineTick}
      linkVisibility={state.linkVisibility}
      nodeColor={nodeColorFn}
      nodeOpacity={state.nodeOpacity}
      linkOpacity={state.linkOpacity}
      nodeResolution={state.nodeResolution}
      onNodeDragEnd={onNodeDragEnd}
      enableNavigationControls={state.enableNavigationControls}
      enableNodeDrag={state.enableNodeDrag}
    />
  );
}
