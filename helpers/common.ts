export function asHexColor(color: string): string {
  return color.startsWith("#") ? color : `#${color}`;
}
