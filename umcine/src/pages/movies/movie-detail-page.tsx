import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";
import { getMovieDetail } from "../../api/movies/get-movie-detail";
import type { TmdbMovieDetail } from "../../api/movies/models";
import { getMovieDetailErrorMessage } from "../../utils/movies/get-movie-detail-error-message";
import { getTmdbBackdropUrl, getTmdbPosterUrl } from "../../utils/movies/tmdb-image";
import { FavoriteButton } from "../../components/favorite-button";
import { MyRatingSection } from "../../components/my-rating-section";

// 145 → "2시간 25분", 45 → "45분", 120 → "2시간"
function formatRuntime(runtime: number | null) {
  if (runtime === null) return "상영 시간 정보가 없어요.";

  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;

  if (hours === 0) return `${minutes}분`;
  if (minutes === 0) return `${hours}시간`;
  return `${hours}시간 ${minutes}분`;
}

export function MovieDetailPage() {
  const { movieId: movieIdParam } = useParams({ from: "/movies/$movieId" });
  const movieId = Number(movieIdParam);
  const isValidMovieId = Number.isInteger(movieId) && movieId > 0;

  const movieDetailQuery = useQuery({
    queryKey: ["movies", "detail", movieId],
    queryFn: () => getMovieDetail(movieId),
    enabled: isValidMovieId,
    staleTime: 30 * 1000,
  });

  return (
    <>
      {/* 기존 화면의 다른 UI는 그대로 유지해요. */}
      {!isValidMovieId ? (
        <p>올바르지 않은 영화 번호예요.</p>
      ) : movieDetailQuery.isPending ? (
        <p>영화 상세 정보를 불러오는 중이에요.</p> // 기존 로딩 UI가 있다면 재사용해요.
      ) : movieDetailQuery.isError ? (
        <p>{getMovieDetailErrorMessage(movieDetailQuery.error)}</p> // 기존 오류 UI가 있다면 재사용해요.
      ) : (
        <>
          {/* 여기에 기존 영화 상세 UI를 넣어요. */}
          {/* movieDetailQuery.data로 영화 정보를 표시해요. */}
          <MovieDetailContent movie={movieDetailQuery.data} />
        </>
      )}
    </>
  );
}

// 기존 영화 상세 UI
function MovieDetailContent({ movie }: { movie: TmdbMovieDetail }) {
  const posterUrl = getTmdbPosterUrl(movie.poster_path);
  const backdropUrl = getTmdbBackdropUrl(movie.backdrop_path);
  const genreText = movie.genres.map((genre) => genre.name).join(", ");

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#141414] text-white">
      {/* ① 배경 이미지 */}
      {backdropUrl && (
        <img
          src={backdropUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {/* ② 그라데이션: 왼쪽은 진하게, 오른쪽은 투명하게 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/85 to-[#141414]/30"
      />

      {/* ③ 내용 */}
      <div className="relative mx-auto flex max-w-[1200px] flex-col gap-10 px-6 py-12 md:flex-row">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} 포스터`}
            className="aspect-[2/3] w-60 shrink-0 self-center rounded-xl object-cover shadow-2xl md:w-72 md:self-start"
          />
        ) : (
          <div className="aspect-[2/3] w-60 shrink-0 self-center rounded-xl bg-[#333] md:w-72 md:self-start" />
        )}

        <div className="flex flex-col gap-3">
          <Link
            to="/"
            className="flex w-fit items-center gap-1 text-sm text-[#a0a0a0] transition-colors hover:text-white"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M15.41 16.59 10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z" />
            </svg>
            영화 목록
          </Link>

          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-lg text-[#a0a0a0]">{movie.original_title}</p>

          <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#ddd]">
            <li>{movie.release_date}</li>
            <li aria-hidden="true" className="text-[#666]">|</li>
            <li>{genreText}</li>
            <li aria-hidden="true" className="text-[#666]">|</li>
            <li>{formatRuntime(movie.runtime)}</li>
          </ul>

          <ul className="mt-1 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <li key={genre.id} className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#ccc]">
                {genre.name}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            <FavoriteButton movieId={movie.id} />
          </div>

          {movie.tagline && (
            <h2 className="mt-8 text-xl font-semibold italic text-white">{movie.tagline}</h2>
          )}
          <p className="max-w-2xl leading-relaxed text-[#ddd]">{movie.overview}</p>

          <MyRatingSection movieId={movie.id} />
        </div>
      </div>
    </main>
  );
}
