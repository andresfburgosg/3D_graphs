export type LodLevel = 0 | 1 | 2;
const lodScale: Record<LodLevel, number> = { 0: 1, 1: 0.8, 2: 0.6 };

export function getLodLevel(distance: number): LodLevel {
  if (distance < 180) return 0;
  if (distance < 500) return 1;
  return 2;
}

export function getLodScale(distance: number): number {
  return lodScale[getLodLevel(distance)];
}
