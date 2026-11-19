import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

// 로그인 후에만 볼 수 있는 페이지의 공통 Layout Route
// (protected) 폴더 안의 모든 페이지가 이 검사를 거친 뒤 <Outlet />에 그려짐
export const Route = createFileRoute("/(protected)")({
  beforeLoad: () => {
    if (!useAuthStore.getState().accessToken) {
      throw redirect({ to: "/login" });
    }
  },
  // 하위 페이지(/me, /me/edit)가 그려질 자리
  component: () => <Outlet />,
});
