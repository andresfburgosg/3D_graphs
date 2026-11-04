import * as THREE from "three";
import type {
  TopologyGraphData,
  TopologyGraphLink,
  TopologyGraphNode,
  TopologyInstanceRendererOptions,
} from "@/types/topology";
import { getLodScale } from "@/lib/rendering/topologyLOD";
import { asHexColor } from "@/helpers/common";
import { topologyNodeColorsDefault } from "../constants";

type DynamicMaterial = THREE.Material & Record<string, unknown>;

export class TopologyInstanceRenderer {
  readonly nodesMesh: THREE.InstancedMesh;
  readonly linksMesh: THREE.InstancedMesh;

  private readonly transform = new THREE.Object3D();
  private readonly cameraPosition = new THREE.Vector3();
  private readonly start = new THREE.Vector3();
  private readonly end = new THREE.Vector3();
  private readonly direction = new THREE.Vector3();
  private readonly midpoint = new THREE.Vector3();
  private readonly up = new THREE.Vector3(0, 1, 0);
  private readonly color = new THREE.Color();

  private readonly nodeIndex = new Map<string, number>();
  private readonly linkIndicesByNode = new Map<number, number[]>();
  private readonly baseColors: THREE.Color[] = [];
  private hoveredIndex = -1;
  private selectedIndex = -1;
  private disposed = false;

  constructor(
    private readonly scene: THREE.Scene,
    private readonly data: TopologyGraphData,
    private options: TopologyInstanceRendererOptions,
  ) {
    this.nodesMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 8, 6),
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: options.nodeOpacity,
      }),
      data.nodes.length,
    );

    this.nodesMesh.name = "topology-node-instances";
    this.nodesMesh.count = data.nodes.length;
    this.nodesMesh.frustumCulled = false;
    this.nodesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    data.nodes.forEach((node, index) => {
      this.nodeIndex.set(node.id, index);
      this.baseColors[index] = new THREE.Color(
        asHexColor(options.nodeColor(node)),
      );
      this.nodesMesh.setColorAt(index, this.baseColors[index]);
    });

    data.links.forEach((link, linkIndex) => {
      const sourceIndex = this.getNodeIndex(link, "source");
      const targetIndex = this.getNodeIndex(link, "target");

      if (sourceIndex !== undefined) {
        this.addIncidentLink(sourceIndex, linkIndex);
      }
      if (targetIndex !== undefined && targetIndex !== sourceIndex) {
        this.addIncidentLink(targetIndex, linkIndex);
      }
    });

    this.linksMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(1, 1, 1, 6, 1, true),
      new THREE.MeshBasicMaterial({
        color: asHexColor(options.linkColor()),
        transparent: true,
        opacity: options.linkOpacity,
        depthWrite: false,
      }),
      data.links.length,
    );

    this.linksMesh.name = "topology-link-instances";
    this.linksMesh.count = data.links.length;
    this.linksMesh.frustumCulled = false;
    this.linksMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.scene.add(this.linksMesh);
    this.scene.add(this.nodesMesh);
  }

  update(camera: THREE.Camera): void {
    if (this.disposed) return;

    camera.getWorldPosition(this.cameraPosition);

    for (let i = 0; i < this.data.nodes.length; i++) {
      this.updateNodeMatrix(i);
    }

    this.nodesMesh.instanceMatrix.needsUpdate = true;

    const linkRadius = Math.max(0.05, this.options.linkWidth * 0.15);

    for (let i = 0; i < this.data.links.length; i++) {
      this.updateLinkMatrix(i, linkRadius);
    }

    this.linksMesh.instanceMatrix.needsUpdate = true;
  }

  refreshColors(options: TopologyInstanceRendererOptions): void {
    this.options = options;

    this.handleMaterial(this.nodesMesh, "opacity", options.nodeOpacity);
    this.handleMaterial(this.linksMesh, "opacity", options.linkOpacity);

    const linkMaterial = this.linksMesh.material as THREE.MeshBasicMaterial;
    linkMaterial.color.set(asHexColor(options.linkColor()));

    this.data.nodes.forEach((node, index) => {
      this.baseColors[index].set(asHexColor(options.nodeColor(node)));
      this.updateNodeColor(index);
    });

    if (this.nodesMesh.instanceColor) {
      this.nodesMesh.instanceColor.needsUpdate = true;
    }
  }

  setHovered(index: number): void {
    if (this.hoveredIndex === index) return;

    const previous = this.hoveredIndex;
    this.hoveredIndex = index;

    if (previous >= 0) this.updateNodeColor(previous);
    if (index >= 0) this.updateNodeColor(index);
  }

  setSelected(index: number): void {
    if (this.selectedIndex === index) return;

    const previous = this.selectedIndex;
    this.selectedIndex = index;

    if (previous >= 0) this.updateNodeColor(previous);
    if (index >= 0) this.updateNodeColor(index);
  }

  getNode(index: number): TopologyGraphNode | undefined {
    return this.data.nodes[index];
  }

  /** Move only the picked node and its incident links during pointer dragging. */
  moveNode(index: number, position: THREE.Vector3, camera: THREE.Camera): void {
    const node = this.getNode(index);
    if (!node || this.disposed) return;

    node.x = node.fx = position.x;
    node.y = node.fy = position.y;
    node.z = node.fz = position.z;
    node.vx = node.vy = node.vz = 0;

    camera.getWorldPosition(this.cameraPosition);
    this.updateNodeMatrix(index);
    this.nodesMesh.instanceMatrix.needsUpdate = true;

    const linkRadius = Math.max(0.05, this.options.linkWidth * 0.15);
    for (const linkIndex of this.linkIndicesByNode.get(index) ?? []) {
      this.updateLinkMatrix(linkIndex, linkRadius);
    }
    this.linksMesh.instanceMatrix.needsUpdate = true;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;

    this.scene.remove(this.nodesMesh, this.linksMesh);
    this.nodesMesh.geometry.dispose();
    this.linksMesh.geometry.dispose();
    this.handleMaterial(this.nodesMesh, "dispose");
    this.handleMaterial(this.linksMesh, "dispose");
    this.nodeIndex.clear();
    this.linkIndicesByNode.clear();
    this.baseColors.length = 0;
  }

  private resolveNode(
    link: TopologyGraphLink,
    endpoint: "source" | "target",
  ): TopologyGraphNode | undefined {
    const value = link[endpoint];

    if (typeof value !== "string") return value;

    const index = this.nodeIndex.get(value);
    return index === undefined ? undefined : this.data.nodes[index];
  }

  private getNodeIndex(
    link: TopologyGraphLink,
    endpoint: "source" | "target",
  ): number | undefined {
    const value = link[endpoint];
    if (typeof value === "string") return this.nodeIndex.get(value);

    const directIndex = this.data.nodes.indexOf(value);
    return directIndex >= 0 ? directIndex : this.nodeIndex.get(value.id);
  }

  private addIncidentLink(nodeIndex: number, linkIndex: number): void {
    const incident = this.linkIndicesByNode.get(nodeIndex);
    if (incident) incident.push(linkIndex);
    else this.linkIndicesByNode.set(nodeIndex, [linkIndex]);
  }

  private updateNodeMatrix(index: number): void {
    const node = this.data.nodes[index];
    if (!node) return;

    const position = this.start.set(node.x ?? 0, node.y ?? 0, node.z ?? 0);
    const distance = this.cameraPosition.distanceTo(position);

    this.transform.position.copy(position);
    this.transform.quaternion.identity();
    this.transform.scale.setScalar(
      this.options.baseNodeRadius * getLodScale(distance),
    );
    this.transform.updateMatrix();
    this.nodesMesh.setMatrixAt(index, this.transform.matrix);
  }

  private updateLinkMatrix(index: number, linkRadius: number): void {
    const link = this.data.links[index];
    if (!link) return;

    const source = this.resolveNode(link, "source");
    const target = this.resolveNode(link, "target");

    if (!source || !target) {
      this.hideLink(index);
      return;
    }

    this.start.set(source.x ?? 0, source.y ?? 0, source.z ?? 0);
    this.end.set(target.x ?? 0, target.y ?? 0, target.z ?? 0);
    this.direction.subVectors(this.end, this.start);

    const length = this.direction.length();
    if (length < 0.001) {
      this.hideLink(index);
      return;
    }

    this.midpoint.addVectors(this.start, this.end).multiplyScalar(0.5);
    this.transform.position.copy(this.midpoint);
    this.transform.quaternion.setFromUnitVectors(
      this.up,
      this.direction.normalize(),
    );
    this.transform.scale.set(linkRadius, length, linkRadius);
    this.transform.updateMatrix();
    this.linksMesh.setMatrixAt(index, this.transform.matrix);
  }

  private hideLink(index: number): void {
    this.transform.position.set(0, 0, 0);
    this.transform.quaternion.identity();
    this.transform.scale.setScalar(0);
    this.transform.updateMatrix();
    this.linksMesh.setMatrixAt(index, this.transform.matrix);
  }

  private updateNodeColor(index: number): void {
    if (index < 0 || index >= this.data.nodes.length) return;

    if (index === this.selectedIndex) {
      this.color.set(asHexColor(topologyNodeColorsDefault.selected));
    } else if (index === this.hoveredIndex) {
      this.color.set(asHexColor(topologyNodeColorsDefault.hovered));
    } else {
      this.color.copy(this.baseColors[index]);
    }

    this.nodesMesh.setColorAt(index, this.color);

    if (this.nodesMesh.instanceColor) {
      this.nodesMesh.instanceColor.needsUpdate = true;
    }
  }

  private handleMaterial(mesh: THREE.Mesh, prop: string, value?: unknown) {
    const material = mesh.material;

    const process = (individualMat: THREE.Material) => {
      const mat = individualMat as DynamicMaterial;
      if (typeof mat[prop] === "function") {
        const method = mat[prop] as (...args: unknown[]) => unknown;
        method.call(mat);
      } else {
        mat[prop] = value;

        if (prop === "opacity") {
          mat.transparent = true;
        }
      }
    };

    if (!Array.isArray(material)) {
      process(material);
    } else {
      material.forEach(process);
    }
  }
}
