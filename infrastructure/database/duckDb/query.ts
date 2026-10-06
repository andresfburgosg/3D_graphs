import { DataFilter } from "@/types/datasource";
import { getDuckDBInstance } from "./connection";
import path from "node:path";

interface AllowedFields {
  [key: string]: string;
}

export interface DuckDBQueryParams {
  [key: string]: string | number;
}

const ALLOWED_OPERATORS = {
  eq: "=",
  neq: "!=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
} as const;

export function getDatabaseFilePath(databaseFile: string): string {
  return path.join(process.cwd(), "data", databaseFile);
}

export async function executeDuckDBQuery(
  sql: string,
  params?: DuckDBQueryParams
) {
  const instance = await getDuckDBInstance();

  const connection = await instance.connect();

  try {
    const reader = await connection.runAndReadAll(sql, params);

    return reader.getRowObjects();
  } finally {
    connection.disconnectSync();
  }
}

export function buildWhereClause(
  filters: DataFilter[],
  allowedFields: AllowedFields
) {
  const conditions: string[] = [];

  const params: Record<string, string | number> = {};

  filters.forEach((filter, index) => {
    const field = allowedFields[filter.field as keyof typeof allowedFields];

    if (!field) {
      throw new Error(`Invalid field: ${filter.field}`);
    }

    if (filter.operator === "in") {
      if (!Array.isArray(filter.value) || filter.value.length === 0) {
        throw new Error("IN operator requires a non-empty array");
      }

      const placeholders = filter.value.map((value, valueIndex) => {
        const parameter = `p${index}_${valueIndex}`;

        params[parameter] = value;

        return `$${parameter}`;
      });

      conditions.push(`${field} IN (${placeholders.join(", ")})`);

      return;
    }

    const operator =
      ALLOWED_OPERATORS[filter.operator as keyof typeof ALLOWED_OPERATORS];

    if (!operator) {
      throw new Error(`Invalid operator: ${filter.operator}`);
    }

    const parameter = `p${index}`;

    params[parameter] = filter.value as string | number;

    conditions.push(`${field} ${operator} $${parameter}`);
  });

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}
