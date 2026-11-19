import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { addFavorite } from "../api/favorites/add-favorite";
import { getFavoriteStatus } from "../api/favorites/get-favorite-status";
import { getFavorites } from "../api/favorites/get-favorites";
import type { FavoriteResponse, FavoriteStatus } from "../api/favorites/models";
import { removeFavorite } from "../api/favorites/remove-favorite";
import { useAuthStore } from "../stores/auth-store";
import { getErrorStatus } from "../utils/api-error";

// 마이페이지: 내 즐겨찾기 목록
export function useFavoritesQuery() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: Boolean(accessToken),
  });
}

// 영화 상세: 이 영화를 즐겨찾기 했는지
export function useFavoriteStatusQuery(movieId: number) {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["favorites", movieId],
    queryFn: () => getFavoriteStatus(movieId),
    enabled: Boolean(accessToken),
  });
}

interface ToggleFavoriteVariables {
  movieId: number;
  nextIsFavorite: boolean;
}

// 영화 목록·상세: 즐겨찾기 등록/해제
// 아이콘을 먼저 바꾸고(낙관적 업데이트), 실패하면 되돌림
// 목록(["favorites"])과 영화별 상태(["favorites", movieId])를 함께 바꿔 두 화면이 같은 값을 보여줌
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const setIsFavorite = (movieId: number, isFavorite: boolean) => {
    queryClient.setQueryData<FavoriteStatus>(["favorites", movieId], { isFavorite });
    queryClient.setQueryData<FavoriteResponse[]>(["favorites"], (prev) => {
      if (!prev) return prev;
      const others = prev.filter((favorite) => favorite.movieId !== movieId);
      // favoriteId는 서버 응답으로 다시 받기 전까지 임시값
      return isFavorite ? [{ favoriteId: -movieId, movieId }, ...others] : others;
    });
  };

  return useMutation({
    mutationFn: ({ movieId, nextIsFavorite }: ToggleFavoriteVariables) =>
      nextIsFavorite ? addFavorite(movieId) : removeFavorite(movieId),
    onMutate: async ({ movieId, nextIsFavorite }) => {
      await queryClient.cancelQueries({ queryKey: ["favorites"] });
      const previousList = queryClient.getQueryData<FavoriteResponse[]>(["favorites"]);
      const previousStatus = queryClient.getQueryData<FavoriteStatus>(["favorites", movieId]);
      setIsFavorite(movieId, nextIsFavorite);
      return { previousList, previousStatus };
    },
    onError: (error, { movieId, nextIsFavorite }, context) => {
      const status = getErrorStatus(error);

      // 이미 즐겨찾기됨 / 이미 해제됨 → 서버 상태에 맞추고 오류는 표시하지 않음
      if (nextIsFavorite && status === 409) return setIsFavorite(movieId, true);
      if (!nextIsFavorite && status === 404) return setIsFavorite(movieId, false);

      queryClient.setQueryData(["favorites"], context?.previousList);
      queryClient.setQueryData(["favorites", movieId], context?.previousStatus);
      if (status === 401) {
        alert("로그인이 만료됐어요. 다시 로그인해 주세요.");
        navigate({ to: "/login" });
        return;
      }
      alert("즐겨찾기 변경에 실패했어요. 다시 시도해 주세요.");
    },
    onSettled: () => {
      // 목록은 서버 값(favoriteId 등)으로 다시 받음 (영화별 상태는 이미 맞춰 둠)
      queryClient.invalidateQueries({ queryKey: ["favorites"], exact: true });
    },
  });
}
