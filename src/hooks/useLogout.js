import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post("/api/logout");
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["auth-user"] });

      queryClient.clear();
      
      // Navigate to login
      navigate("/login", { replace: true });
    },
    onError: () => {
      // Even if logout fails, clear cache and redirect
      queryClient.removeQueries({ queryKey: ["auth-user"] });
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  });
}