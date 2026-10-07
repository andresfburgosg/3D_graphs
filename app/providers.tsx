"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./getQueryClient";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: import("@tanstack/query-core").QueryClient;
  }
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  if (typeof window !== "undefined") {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
