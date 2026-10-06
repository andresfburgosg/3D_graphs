import z from "zod";

const dataFieldsList = [
  "timestamp",
  "nodeId",
  "metricOne",
  "secondId",
  "parentId",
  "level",
] as const;
const dataFilterField = z.enum(dataFieldsList);

const dataFilterSchema = z.object({
  field: dataFilterField,
  operator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte", "in"]),
  value: z.union([
    z.string(),
    z.number(),
    z.array(z.union([z.string(), z.number()])),
  ]),
});

const dataFilterArraySchema = z.array(dataFilterSchema);

export const dataQuerySchema = z.object({
  filters: dataFilterArraySchema.optional(),
  limit: z.number().int().min(1).optional(),
});
