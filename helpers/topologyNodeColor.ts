import {
  TOPOLOGY_MAIN_NODE,
  topologyMetricOneColors,
  topologyMetricOneIndexes,
  topologyNodeColorsDefault,
} from "@/lib/constants";
import { TopologyGraphNode } from "@/types/topology";

interface NodeColorStrategy {
  getColor(node: TopologyGraphNode): string;
}

export class NodeColorSelector {
  private colorStrategy: NodeColorStrategy;

  constructor(strategy: NodeColorStrategy) {
    this.colorStrategy = strategy;
  }

  colorFunction(node: TopologyGraphNode) {
    if (!node) {
      return topologyNodeColorsDefault.error;
    }

    if (node?.id === TOPOLOGY_MAIN_NODE) {
      return topologyNodeColorsDefault.main;
    }

    return this.colorStrategy.getColor(node);
  }
}

export class MetricOneStrategy implements NodeColorStrategy {
  getColor(node: TopologyGraphNode): string {
    for (const index in topologyMetricOneIndexes) {
      if (node.metric < topologyMetricOneIndexes[index]) {
        return topologyMetricOneColors[index];
      }
    }
    return topologyMetricOneColors[topologyMetricOneColors.length - 1];
  }
}
