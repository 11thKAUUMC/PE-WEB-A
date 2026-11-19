import { useQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getMovieDetail } from "@/api/movies/get-movie-detail";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useFavoritesQuery } from "@/hooks/use-favorites";
import { useMeQuery } from "@/hooks/use-me-query";
import { getTmdbPosterUrl } from "@/utils/movies/tmdb-image";
import { useProfileStore } from "@/stores/profile-store";

const valueBoxClass =
  "flex h-12 w-full items-center rounded-lg bg-white px-4 text-sm text-gray-900";

export function MyPage() {
  const meQuery = useMeQuery();
  const profileImageUrl = useProfileStore((state) => state.profileImageUrl);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-10 pb-20 pt-10">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 정보</h1>
          <p className="mt-2 text-sm text-gray-500">가입한 회원 정보를 확인할 수 있어요.</p>
        </div>
        <Link
          to="/me/edit"
          className="flex h-10 shrink-0 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          정보 수정
        </Link>
      </div>

      {meQuery.isPending ? (
        <p className="py-20 text-center text-gray-500">내 정보를 불러오는 중이에요...</p>
      ) : meQuery.isError ? (
        <p className="py-20 text-center text-red-500">내 정보를 불러오지 못했어요.</p>
      ) : (
        <div className="grid gap-10 md:grid-cols-2">
          <div className="flex flex-col items-center gap-2 py-4">
            <ProfileAvatar imageUrl={profileImageUrl} />
            <p className="text-sm font-semibold text-gray-900">프로필 이미지</p>
          </div>

          <dl className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <dt className="text-sm font-semibold text-gray-900">닉네임</dt>
              <dd className={valueBoxClass}>{meQuery.data.nickname}</dd>
            </div>
            <div className="flex flex-col gap-2">
              <dt className="text-sm font-semibold text-gray-900">이메일</dt>
              <dd className={valueBoxClass}>{meQuery.data.email}</dd>
            </div>
          </dl>
        </div>
      )}

      <FavoriteMoviesSection />
    </main>
  );
}

// 즐겨찾기한 영화 목록: 서버는 movieId만 주므로 제목과 포스터는 TMDB에서 불러옴
function FavoriteMoviesSection() {
  const favoritesQuery = useFavoritesQuery();
  const movieIds = favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];

  // 상세 화면과 같은 query key라서 이미 본 영화는 캐시를 재사용
  const movieQueries = useQueries({
    queries: movieIds.map((movieId) => ({
      queryKey: ["movies", "detail", movieId],
      queryFn: () => getMovieDetail(movieId),
      staleTime: 30 * 1000,
    })),
  });

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-bold text-gray-900">즐겨찾기한 영화</h2>

      {favoritesQuery.isPending ? (
        <p className="py-10 text-center text-gray-500">즐겨찾기를 불러오는 중이에요...</p>
      ) : favoritesQuery.isError ? (
        <p className="py-10 text-center text-red-500">즐겨찾기를 불러오지 못했어요.</p>
      ) : movieIds.length === 0 ? (
        <p className="py-10 text-center text-gray-500">즐겨찾기한 영화가 없어요</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movieIds.map((movieId, index) => {
            const movie = movieQueries[index]?.data;
            const posterUrl = movie ? getTmdbPosterUrl(movie.poster_path) : null;

            return (
              <li key={movieId}>
                <Link
                  to="/movies/$movieId"
                  params={{ movieId: String(movieId) }}
                  className="group flex flex-col gap-2"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden rounded-md bg-gray-200">
                    {posterUrl && (
                      <img
                        src={posterUrl}
                        alt={`${movie?.title} 포스터`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {movie?.title ?? "불러오는 중..."}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
