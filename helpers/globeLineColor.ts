import { Globe } from "@/domain/entities/Globe";
import { globeMetricOneColors, globeMetricOneIndexes } from "@/lib/constants";
import { asHexColor } from "./common";

interface GlobeColorStrategy {
  getColor(node: Globe): string;
}

export class GlobeColorSelector {
  private colorStrategy: GlobeColorStrategy;

  constructor(strategy: GlobeColorStrategy) {
    this.colorStrategy = strategy;
  }

  colorFunction(node: Globe) {
    return this.colorStrategy.getColor(node);
  }
}

export class MetricOneStrategy implements GlobeColorStrategy {
  getColor(node: Globe): string {
    for (const index in globeMetricOneIndexes) {
      if (node.metricOne < globeMetricOneIndexes[index]) {
        return asHexColor(globeMetricOneColors[index]);
      }
    }
    return asHexColor(globeMetricOneColors[globeMetricOneColors.length - 1]);
  }
}
