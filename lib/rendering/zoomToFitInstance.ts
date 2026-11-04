import * as THREE from "three";
import { TopologyGraphNode, TopologyGraphReference } from "@/types/topology";

export function zoomToFitInstance(
  graphRef: TopologyGraphReference,
  nodes: TopologyGraphNode[],
  maxNodeRadius: number,
  durationMs = 500,
) {
  if (nodes.length === 0) return false;

  const bounds = new THREE.Box3();

  for (const node of nodes) {
    bounds.expandByPoint(
      new THREE.Vector3(node.x ?? 0, node.y ?? 0, node.z ?? 0),
    );
  }

  if (bounds.isEmpty()) return false;

  // Include the instance sphere around each node position.
  bounds.expandByScalar(maxNodeRadius);

  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  const center = sphere.center;
  const camera = graphRef.current?.camera();
  const perspectiveCamera = camera as THREE.PerspectiveCamera | undefined;

  if (!perspectiveCamera?.isPerspectiveCamera) return false;

  const verticalHalfFov = THREE.MathUtils.degToRad(perspectiveCamera.fov / 2);
  const horizontalHalfFov = Math.atan(
    Math.tan(verticalHalfFov) * perspectiveCamera.aspect,
  );
  const limitingHalfFov = Math.min(verticalHalfFov, horizontalHalfFov);

  // Leave some room around the graph.
  const distance = (sphere.radius / Math.sin(limitingHalfFov)) * 1.2;

  // Keep the current viewing direction and move the camera farther from
  // the fitted center.
  const awayFromGraph = perspectiveCamera
    .getWorldDirection(new THREE.Vector3())
    .negate();

  const position = center.clone().addScaledVector(awayFromGraph, distance);

  graphRef.current?.cameraPosition(position, center, durationMs);
  return true;
}
