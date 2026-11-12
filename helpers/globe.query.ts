import { DataQuery } from "@/types/datasource";
import { queryOptions } from "@tanstack/react-query";

async function fetchGlobeData(data: DataQuery) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const response = await fetch(`${baseUrl}/api/globe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`Error fetching globe data: ${response.statusText}`);
    }
    const dataResponse = await response.json();
    return dataResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function globeQueryOptions(data: DataQuery) {
  return queryOptions({
    queryKey: ["globe", data],
    queryFn: () => fetchGlobeData(data),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}
