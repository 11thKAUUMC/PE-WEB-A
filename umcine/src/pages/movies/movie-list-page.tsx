import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { MovieGrid } from "../../components/movie-grid";
import { useFavoritesQuery, useToggleFavoriteMutation } from "../../hooks/use-favorites";
import { useAuthStore } from "../../stores/auth-store";
import { getMovies } from "../../api/movies/get-movies";
import type { TmdbMovieListItem } from "../../api/movies/models";
import type { Movie } from "../../types/movie";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// TMDB 응답(snake_case)을 화면용 Movie 타입(camelCase)으로 변환
function toMovie(item: TmdbMovieListItem, isBookmarked: boolean): Movie {
  return {
    id: item.id,
    title: item.title,
    originalTitle: item.original_title,
    releaseDate: item.release_date.replaceAll("-", "."),
    posterPath: item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : "",
    backdropPath: item.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${item.backdrop_path}` : "",
    genres: [],
    runtime: "",
    tagline: "",
    overview: item.overview,
    isBookmarked,
  };
}

export function MovieListPage() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  // 1. 북마크는 서버 즐겨찾기(GET /favorites)를 사용해 상세·마이페이지와 같은 값을 보여줌
  const favoritesQuery = useFavoritesQuery();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const bookmarkIds = favoritesQuery.data?.map((favorite) => favorite.movieId) ?? [];

  // 2. 북마크 클릭: 로그인하지 않았으면 로그인 화면으로
  const toggleBookmark = (id: number) => {
    if (!accessToken) {
      navigate({ to: "/login" });
      return;
    }
    toggleFavoriteMutation.mutate({ movieId: id, nextIsFavorite: !bookmarkIds.includes(id) });
  };

  // 3. TMDB에서 영화 목록 불러오기
  const [page, setPage] = useState(1);

  const moviesQuery = useQuery({
    queryKey: ["movies", "list", { page }],
    queryFn: () => getMovies({ page }),
  });

  const movies = moviesQuery.data?.results ?? [];
  const totalPages = moviesQuery.data?.total_pages ?? 0;

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const movieList = movies.map((item) => toMovie(item, bookmarkIds.includes(item.id)));

  // 현재 페이지 주변으로 최대 5개의 페이지 번호를 보여줘요.
  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <main className="mx-auto w-full max-w-[1280px] px-10 pb-20 pt-10">
      <h1 className="mb-6 text-3xl font-bold">영화 목록</h1>

      {/* 기존 화면의 다른 UI는 그대로 유지해요. */}
      {/* 데이터를 가져오는 중인지, 오류가 발생했는지 순서대로 확인해요. */}
      {moviesQuery.isPending ? (
        <p>영화를 불러오는 중이에요.</p> // 기존 로딩 UI가 있다면 재사용해요.
      ) : moviesQuery.isError ? (
        <p>{moviesQuery.error.message}</p> // 기존 오류 UI가 있다면 재사용해요.
      ) : movies.length === 0 ? (
        <p>표시할 영화가 없어요.</p> // 기존 빈 목록 UI가 있다면 재사용해요.
      ) : (
        <>
          {/* 여기에 기존 영화 목록 UI를 넣어요. */}
          {/* movies로 영화 목록을 표시해요. */}
          <MovieGrid movies={movieList} onToggleBookmark={toggleBookmark} />

          {/* totalPages로 전체 페이지 수를 확인해요. */}
          {/* 페이지 번호를 클릭하면 handlePageChange(다음 페이지 번호)를 호출해요. */}
          <nav className="mt-10 flex items-center justify-center gap-1">
            <button
              type="button"
              aria-label="이전 페이지"
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="flex size-8 items-center justify-center rounded-md text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              &lt;
            </button>
            {pageNumbers.map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                aria-current={pageNumber === page ? "page" : undefined}
                onClick={() => handlePageChange(pageNumber)}
                className={
                  pageNumber === page
                    ? "flex size-8 items-center justify-center rounded-md bg-gray-900 text-sm font-semibold text-white"
                    : "flex size-8 items-center justify-center rounded-md text-sm text-gray-600 hover:bg-gray-100"
                }
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              aria-label="다음 페이지"
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex size-8 items-center justify-center rounded-md text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
            >
              &gt;
            </button>
          </nav>
        </>
      )}
    </main>
  );
}
