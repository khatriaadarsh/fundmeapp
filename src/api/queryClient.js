// src/api/queryClient.js
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min → no refetch on tab switch
      gcTime:    10 * 60 * 1000,  // 10 min cache
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect:   true,
      refetchOnMount:       false,
    },
    mutations: { retry: 0 },
  },
});