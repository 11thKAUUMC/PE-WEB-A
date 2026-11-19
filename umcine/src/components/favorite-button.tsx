import { useNavigate } from "@tanstack/react-router";
import { useFavoriteStatusQuery, useToggleFavoriteMutation } from "@/hooks/use-favorites";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/utils/cn";

interface FavoriteButtonProps {
  movieId: number;
}

// 영화 상세 화면의 즐겨찾기(북마크) 버튼
export function FavoriteButton({ movieId }: FavoriteButtonProps) {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const favoriteStatusQuery = useFavoriteStatusQuery(movieId);
  const toggleFavoriteMutation = useToggleFavoriteMutation();

  const isFavorite = favoriteStatusQuery.data?.isFavorite ?? false;

  const handleClick = () => {
    // 로그인하지 않았으면 API를 부르지 않고 로그인 화면으로
    if (!accessToken) {
      navigate({ to: "/login" });
      return;
    }
    if (toggleFavoriteMutation.isPending) return;
    toggleFavoriteMutation.mutate({ movieId, nextIsFavorite: !isFavorite });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={favoriteStatusQuery.isLoading || toggleFavoriteMutation.isPending}
      aria-pressed={isFavorite}
      className={cn(
        "flex h-10 w-fit items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        isFavorite
          ? "bg-primary text-white hover:bg-primary-hover"
          : "border border-white/40 bg-white/10 text-white hover:bg-white/20",
      )}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        {isFavorite ? (
          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
        ) : (
          <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z" />
        )}
      </svg>
      {isFavorite ? "즐겨찾기됨" : "즐겨찾기"}
    </button>
  );
}
