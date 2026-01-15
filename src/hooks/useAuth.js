import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export function useAuth() {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: () => api.get("/api/me").then(res => res.data),
    retry: false,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}