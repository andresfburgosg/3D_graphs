export interface Globe {
  timestamp: string;
  targetId: string;
  sourceId: string;
  metricOne: number;
  targetLatitude: number | null;
  targetLongitude: number | null;
  sourceLatitude: number | null;
  sourceLongitude: number | null;
  color?: string;
}
