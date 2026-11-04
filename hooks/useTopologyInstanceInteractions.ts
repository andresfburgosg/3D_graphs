"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";
import type {
  TopologyDragGestureProps,
  TopologyGraphControlsWithEvents,
  TopologyGraphNode,
  TopologyTooltipData,
  UseTopologyInstanceInteractions,
} from "@/types/topology";

/**
 * Performs picking only in response to pointer activity. Hover checks are
 * coalesced and capped at 20/sec; dragging does no raycasts after pointerdown.
 */
export function useTopologyInstanceInteractions({
  graphRef,
  rendererRef,
  onNodeDragEnd,
}: UseTopologyInstanceInteractions) {
  const [tooltip, setTooltip] = useState<TopologyTooltipData | null>(null);

  useEffect(() => {
    const graph = graphRef.current;
    if (!graph) return;

    const canvas = graph.renderer().domElement;
    const camera = graph.camera();
    const controls = graph.controls() as TopologyGraphControlsWithEvents;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const planeNormal = new THREE.Vector3();
    const planeHit = new THREE.Vector3();
    const nodePosition = new THREE.Vector3();
    const lastPointer = { x: 0, y: 0, available: false };

    let hoveredIndex = -1;
    let drag: TopologyDragGestureProps | null = null;
    let pendingHoverTimer: number | undefined;
    let pendingDragFrame: number | undefined;
    let pendingDragPoint: { x: number; y: number } | undefined;

    const currentRenderer = () => rendererRef.current;

    function clearHover(): void {
      if (hoveredIndex >= 0) {
        currentRenderer()?.setHovered(-1);
        hoveredIndex = -1;
      }
      setTooltip(null);
    }

    function setRayFromPointer(clientX: number, clientY: number): boolean {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;

      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      return true;
    }

    function intersectAt(clientX: number, clientY: number) {
      const renderer = currentRenderer();
      if (!renderer || !setRayFromPointer(clientX, clientY)) return undefined;

      renderer.nodesMesh.updateMatrixWorld(true);
      return raycaster.intersectObject(renderer.nodesMesh, false)[0];
    }

    function updateTooltip(
      node: TopologyGraphNode,
      clientX: number,
      clientY: number,
    ): void {
      const rect = canvas.getBoundingClientRect();
      setTooltip({
        id: node.id,
        metric: node.metric,
        source: node.source,
        timestamp: node.timestamp,
        x: clientX - rect.left + 12,
        y: clientY - rect.top + 12,
      });
    }

    function processHover(): void {
      pendingHoverTimer = undefined;
      if (!lastPointer.available || drag) return;

      const renderer = currentRenderer();
      if (!renderer) return;

      const index = intersectAt(lastPointer.x, lastPointer.y)?.instanceId ?? -1;
      // The renderer may have been recreated after graph data/options changed
      // while this hook stayed mounted. Its own setter deduplicates unchanged
      // indices, so always syncing also initializes the new renderer's state.
      hoveredIndex = index;
      renderer.setHovered(index);

      const node = index >= 0 ? renderer.getNode(index) : undefined;
      if (node) updateTooltip(node, lastPointer.x, lastPointer.y);
      else setTooltip(null);
    }

    function scheduleHover(clientX: number, clientY: number): void {
      lastPointer.x = clientX;
      lastPointer.y = clientY;
      lastPointer.available = true;

      // Coalesce pointer bursts and cap CPU raycasts to 20 per second.
      if (pendingHoverTimer === undefined) {
        pendingHoverTimer = window.setTimeout(processHover, 50);
      }
    }

    function applyDrag(clientX: number, clientY: number): void {
      if (!drag) return;

      const deltaX = clientX - drag.startX;
      const deltaY = clientY - drag.startY;
      if (!drag.moved && Math.hypot(deltaX, deltaY) < 3) return;
      drag.moved = true;

      const renderer = currentRenderer();
      if (!renderer || !setRayFromPointer(clientX, clientY)) return;
      if (!raycaster.ray.intersectPlane(drag.plane, planeHit)) return;

      planeHit.add(drag.pointerOffset);
      renderer.moveNode(drag.nodeIndex, planeHit, camera);
      updateTooltip(drag.node, clientX, clientY);
    }

    function onPointerDown(event: PointerEvent): void {
      if (event.button !== 0) return;

      const renderer = currentRenderer();
      if (!renderer) return;

      // This is the only raycast required to begin a drag.
      const hit = intersectAt(event.clientX, event.clientY);
      const index = hit?.instanceId ?? -1;
      if (index < 0) {
        clearHover();
        return;
      }

      const node = renderer.getNode(index);
      if (!node || !hit) return;

      if (pendingHoverTimer !== undefined) {
        window.clearTimeout(pendingHoverTimer);
        pendingHoverTimer = undefined;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      const previousControlsEnabled = controls.enabled;
      controls.enabled = false;
      canvas.setPointerCapture(event.pointerId);

      nodePosition.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
      camera.getWorldDirection(planeNormal);

      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
        planeNormal,
        nodePosition,
      );

      drag = {
        pointerId: event.pointerId,
        nodeIndex: index,
        node,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
        previousControlsEnabled,
        plane,
        pointerOffset: nodePosition.clone().sub(hit.point),
      };

      hoveredIndex = index;
      renderer.setHovered(index);
      updateTooltip(node, event.clientX, event.clientY);
    }

    function onPointerMove(event: PointerEvent): void {
      lastPointer.x = event.clientX;
      lastPointer.y = event.clientY;
      lastPointer.available = true;

      if (drag?.pointerId === event.pointerId) {
        // Dragging updates only the picked node and its incident links. It
        // does not raycast; multiple pointer events are merged into one RAF.
        pendingDragPoint = { x: event.clientX, y: event.clientY };
        if (pendingDragFrame === undefined) {
          pendingDragFrame = requestAnimationFrame(() => {
            pendingDragFrame = undefined;
            if (pendingDragPoint) {
              applyDrag(pendingDragPoint.x, pendingDragPoint.y);
            }
          });
        }
        return;
      }

      // Don't raycast while the user is orbiting or performing another drag.
      if (event.buttons !== 0) {
        if (pendingHoverTimer !== undefined) {
          window.clearTimeout(pendingHoverTimer);
          pendingHoverTimer = undefined;
        }
        clearHover();
        return;
      }

      scheduleHover(event.clientX, event.clientY);
    }

    function finishPointer(event: PointerEvent): void {
      if (!drag || drag.pointerId !== event.pointerId) {
        if (event.buttons === 0) scheduleHover(event.clientX, event.clientY);
        return;
      }

      if (pendingDragFrame !== undefined) {
        cancelAnimationFrame(pendingDragFrame);
        pendingDragFrame = undefined;
      }
      pendingDragPoint = undefined;
      applyDrag(event.clientX, event.clientY);

      const finished = drag;
      drag = null;
      controls.enabled = finished.previousControlsEnabled;

      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }

      if (finished.moved) {
        onNodeDragEnd(finished.node);
      }

      scheduleHover(event.clientX, event.clientY);
    }

    function onPointerLeave(): void {
      if (drag) return;

      lastPointer.available = false;
      if (pendingHoverTimer !== undefined) {
        window.clearTimeout(pendingHoverTimer);
        pendingHoverTimer = undefined;
      }
      clearHover();
    }

    function onControlsChange(): void {
      // Avoid repeatedly raycasting while the camera is moving. Hover will
      // be checked once after the controls emit "end".
      clearHover();
    }

    function onControlsEnd(): void {
      if (lastPointer.available) {
        scheduleHover(lastPointer.x, lastPointer.y);
      }
    }

    canvas.addEventListener("pointerdown", onPointerDown, true);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", finishPointer);
    canvas.addEventListener("pointercancel", finishPointer);
    canvas.addEventListener("pointerleave", onPointerLeave);
    controls.addEventListener("change", onControlsChange);
    controls.addEventListener("end", onControlsEnd);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown, true);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", finishPointer);
      canvas.removeEventListener("pointercancel", finishPointer);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      controls.removeEventListener("change", onControlsChange);
      controls.removeEventListener("end", onControlsEnd);

      if (pendingHoverTimer !== undefined) {
        window.clearTimeout(pendingHoverTimer);
      }
      if (pendingDragFrame !== undefined) {
        cancelAnimationFrame(pendingDragFrame);
      }
      if (drag) {
        controls.enabled = drag.previousControlsEnabled;
        if (canvas.hasPointerCapture(drag.pointerId)) {
          canvas.releasePointerCapture(drag.pointerId);
        }
      }

      currentRenderer()?.setHovered(-1);
    };
  }, [graphRef, onNodeDragEnd, rendererRef]);

  return { tooltip };
}
