import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/members/me";
import { useAuthStore } from "../stores/auth-store";

// 헤더, 내 정보, 내 정보 수정이 같은 query key로 내 정보를 공유
export function useMeQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["members", "me"],
    queryFn: getMe,
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
