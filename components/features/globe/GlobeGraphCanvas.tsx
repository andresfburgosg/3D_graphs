import { useGlobeGraphContext } from "@/context/globe/GlobeGraphContext";
import useGlobeGraphCanvasProps from "@/hooks/useGlobeGraphCanvasProps";
import Globe from "react-globe.gl";

export default function GlobeGraphCanvas() {
  const { state, graphRef, onGlobeReady, showGlobeAtmosphereFn } =
    useGlobeGraphContext();

  const { globeCanvasProps } = useGlobeGraphCanvasProps();

  return (
    <div className="relative h-full w-full">
      <Globe
        ref={graphRef}
        globeImageUrl={state.globeImageUrl}
        onGlobeReady={onGlobeReady}
        width={state.width}
        height={state.height}
        showGlobe={showGlobeAtmosphereFn()}
        showAtmosphere={showGlobeAtmosphereFn()}
        {...globeCanvasProps}
      />
    </div>
  );
}
