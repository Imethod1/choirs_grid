import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,           // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,          // Save bandwidth on mobile
      refetchOnReconnect: true,             // Refetch when coming back online
    },
    mutations: {
      retry: 1,
    },
  },
});
