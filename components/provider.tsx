"use client";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";

export default function AppProvider({ children }: { children: ReactNode }) {
  // Create a client inside the component to avoid sharing state between requests
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 5,
        retryDelay: 1000,
        // Disable queries during SSR
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <>
      <QueryClientProvider client={queryClient}>
        {/* <HydrationBoundary state={pageProps.dehydratedState}> */}
        {children}
        {/* </HydrationBoundary> */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      <ToastContainer />
    </>
  );
}
