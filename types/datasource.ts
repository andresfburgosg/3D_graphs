export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";

export interface DataFilter {
  field: string;
  operator: FilterOperator;
  value: string | number | Array<string | number>;
}

export interface DataQuery {
  filters?: DataFilter[];
  limit?: number;
}
