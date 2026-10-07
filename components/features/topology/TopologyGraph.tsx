"use client";

import { topologyQueryOptions } from "@/helpers/topology.query";
import { useQuery } from "@tanstack/react-query";

export default function TopologyGraph() {
  const { data, isLoading, error } = useQuery(topologyQueryOptions({}));
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  console.log("Topology data (useQuery):", data);
  return (
    <div className="w-full h-full">
      <h1>Topology Graph</h1>
    </div>
  );
}
