import { useAuthStore } from "../stores/auth-store";
import { getMemberIdFromToken } from "../utils/auth/get-member-id";

// 로그인하지 않았으면 null
export function useMemberId() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return getMemberIdFromToken(accessToken);
}
