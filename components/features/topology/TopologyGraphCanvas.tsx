import { useTopologyGraphContext } from "@/context/topology/TopologyGraphContext";
import { useTopologyInstanceInteractions } from "@/hooks/useTopologyInstanceInteractions";
import useTopologyInstanceRenderer from "@/hooks/useTopologyInstanceRenderer";
import { zoomToFitInstance } from "@/lib/rendering/zoomToFitInstance";
import type { TopologyInstanceRendererOptions } from "@/types/topology";
import { useCallback, useMemo } from "react";
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

  const instanceOptions = useMemo<TopologyInstanceRendererOptions>(
    () => ({
      nodeColor: nodeColorFn,
      linkColor: linkColorFn,
      nodeOpacity: state.nodeOpacity,
      linkOpacity: state.linkOpacity,
      linkWidth: state.linkWidth,
      baseNodeRadius: setNodeRelSize(),
    }),
    [
      linkColorFn,
      nodeColorFn,
      setNodeRelSize,
      state.linkOpacity,
      state.linkWidth,
      state.nodeOpacity,
    ],
  );

  const { syncInstances, rendererRef } = useTopologyInstanceRenderer({
    graphRef,
    graphData: state.graphData,
    options: instanceOptions,
  });

  const { tooltip } = useTopologyInstanceInteractions({
    graphRef,
    rendererRef,
    onNodeDragEnd,
  });

  const handleOnEngineStop = useCallback(() => {
    onEngineStop(() => {
      const graph = graphRef.current;
      if (!graph) return false;

      return zoomToFitInstance(
        graphRef,
        state.graphData.nodes,
        instanceOptions.baseNodeRadius,
      );
    });
    syncInstances();
  }, [
    graphRef,
    instanceOptions.baseNodeRadius,
    onEngineStop,
    state.graphData.nodes,
    syncInstances,
  ]);

  const handleOnEngineTick = useCallback(() => {
    onEngineTick();
    syncInstances();
  }, [onEngineTick, syncInstances]);

  return (
    <div className="relative h-full w-full">
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
        d3VelocityDecay={state.d3VelocityDecay}
        cooldownTime={state.cooldownTime}
        warmupTicks={state.warmupTicks}
        cooldownTicks={state.cooldownTicks}
        onEngineStop={handleOnEngineStop}
        showNavInfo={state.showNavInfo}
        onEngineTick={handleOnEngineTick}
        nodeVisibility={() => false}
        linkVisibility={false}
        enableNavigationControls={state.enableNavigationControls}
        // Custom instance picking and dragging replace graph node interaction.
        enableNodeDrag={false}
      />

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 rounded bg-black/85 px-3 py-2 text-xs text-white shadow"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-semibold">{tooltip.id}</div>
          <div>Metric: {tooltip.metric}</div>
          <div>Source: {tooltip.source}</div>
          <div>{tooltip.timestamp}</div>
        </div>
      )}
    </div>
  );
}
