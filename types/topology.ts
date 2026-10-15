export interface TopologyDateLimits {
  minDate: string;
  maxDate: string;
}

export type TopologyGraphProps = {
  graphKey: string;
};

export interface TopologyFilterFields {
  minDate: string;
  maxDate: string;
}

export type FilterAction =
  | { type: "SET_MIN_DATE"; payload: string }
  | { type: "SET_MAX_DATE"; payload: string };
