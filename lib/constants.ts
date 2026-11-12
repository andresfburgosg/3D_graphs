export const TOPOLOGY_MAIN_NODE = "CDN";
export const GLOBE_MAIN_NODE = "CDN";
export const TOPOLOGY_JSON_SOURCE_FILE = "topology.json";
export const GLOBE_JSON_SOURCE_FILE = "globe.json";
export const topologyProps = Object.freeze({
  graphKey: "topology-graph",
  title: "Topology Graph",
  description: "",
});
export const globeProps = Object.freeze({
  graphKey: "globe-graph",
  title: "Globe Graph",
  description: "",
});
export const topologyMetricOneIndexes = [20, 40, 60, 80, 100];
export const topologyMetricOneColors = [
  "ff0000",
  "8b0000",
  "f0e68c",
  "90ee90",
  "#008080",
];
export const topologyNodeColorsDefault = Object.freeze({
  error: "ffffff",
  main: "6495ed",
  selected: "fb7185",
  hovered: "ffffff",
});
export const topologyThemeBackground = Object.freeze({
  light: "#fafafa",
  dark: "#000000",
});

export const topologyThemeLinkColor = Object.freeze({
  light: "#1e1e1e",
  dark: "#ffffff",
});

export const ARC_COLOR_OPACITY = 0.5;
export const GLOBE_MIN_SCALING = 0.01;
export const GLOBE_MAX_SCALING = 0.2;

export const globeMetricOneIndexes = [30, 60, 90];
export const globeMetricOneColors = ["8b0000", "90ee90", "008080"];
