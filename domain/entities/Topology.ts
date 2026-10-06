export interface Topology {
  timestamp: string;
  nodeId: string;
  metricOne: number;
  secondId?: string;
  parentId: string;
  level?: number;
}
