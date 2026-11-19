import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { login } from "../api/auth/login";
import { useAuthStore } from "../stores/auth-store";
import { getErrorStatus } from "../utils/api-error";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      setAccessToken(response.result.accessToken);
      alert("로그인에 성공했어요.");
      queryClient.invalidateQueries({ queryKey: ["members", "me"] });
      navigate({ to: "/" });
    },
    onError: (error) => {
      // 원인을 찾을 수 있게 개발자 도구 Console에도 남김
      console.error("로그인 실패", error);
      const status = getErrorStatus(error);

      if (status === 401) {
        alert("이메일 또는 비밀번호를 확인해 주세요.");
        return;
      }
      alert(`로그인에 실패했어요. 다시 시도해 주세요. (${status ?? error.message})`);
    },
  });
}