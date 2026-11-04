import { TopologyInstanceRenderer } from "@/lib/rendering/topologyInstanceRenderer";
import {
  TopologyGraphControlsWithEvents,
  UseTopologyInstanceRenderer,
} from "@/types/topology";
import { useCallback, useEffect, useRef } from "react";

const useTopologyInstanceRenderer = ({
  graphRef,
  graphData,
  options,
}: UseTopologyInstanceRenderer) => {
  const rendererRef = useRef<TopologyInstanceRenderer | null>(null);

  const syncInstances = useCallback(() => {
    const graph = graphRef.current;
    const renderer = rendererRef.current;

    if (!graph || !renderer) return;

    renderer.update(graph.camera());
  }, [graphRef]);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const renderer = new TopologyInstanceRenderer(
      graph.scene(),
      graphData,
      options,
    );

    rendererRef.current = renderer;

    const controls = graph.controls() as Omit<
      TopologyGraphControlsWithEvents,
      "enabled"
    >;
    controls.addEventListener("change", syncInstances);

    syncInstances();

    return () => {
      controls.removeEventListener("change", syncInstances);
      renderer.dispose();
      if (rendererRef.current === renderer) {
        rendererRef.current = null;
      }
    };
  }, [graphData, graphRef, options, syncInstances]);

  return { syncInstances, rendererRef };
};

export default useTopologyInstanceRenderer;
