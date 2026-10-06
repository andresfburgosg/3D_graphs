import { DuckDBInstance } from "@duckdb/node-api";

let instancePromise: ReturnType<typeof DuckDBInstance.create> | null = null;

export function getDuckDBInstance() {
  if (!instancePromise) {
    instancePromise = DuckDBInstance.create();
  }

  return instancePromise;
}
