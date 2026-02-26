import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/api/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth-user"] });

      queryClient.clear();
      
      // Navigate to login
      window.location.href = "/login";
    },
    onError: () => {
      // Even if logout fails, clear cache and redirect
      queryClient.removeQueries({ queryKey: ["auth-user"] });
      queryClient.clear();
      window.location.href = "/login";
    }
  });
}