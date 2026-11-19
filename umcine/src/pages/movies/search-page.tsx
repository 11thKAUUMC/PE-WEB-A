import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchMovies } from "../../api/movies/search-movies";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

export function SearchPage() {
  const { query, page = 1 } = useSearch({ from: "/search" });
  const normalizedQuery = query?.trim() ?? "";
  const navigate = useNavigate({ from: "/search" });

  const searchQuery = useQuery({
    queryKey: ["movies", "search", { query: normalizedQuery, page }],
    queryFn: () => searchMovies({ query: normalizedQuery, page }),
    enabled: normalizedQuery.length > 0,
  });

  const searchResults = searchQuery.data?.results ?? [];
  const totalResults = searchQuery.data?.total_results ?? 0;
  const totalPages = searchQuery.data?.total_pages ?? 0;

  const handlePageChange = (nextPage: number) => {
    navigate({ search: (prev) => ({ ...prev, page: nextPage }) });
  };

  // 현재 페이지 주변으로 최대 5개의 페이지 번호를 보여줘요.
  const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
  const endPage = Math.min(totalPages, startPage + 4);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuery = String(formData.get("query") ?? "").trim();
    navigate({ search: nextQuery ? { query: nextQuery, page: 1 } : {} });
  }

  return (
    <main className="mx-auto w-full max-w-[1280px] px-10 pb-20 pt-10">
      <h1 className="mb-6 text-3xl font-bold">영화 검색</h1>

      {/* 검색창 */}
      <form key={query} onSubmit={handleSubmit} className="mb-10 flex gap-2">
        <div className="relative flex-1">
          <img
            src="/icon/movie-icons/search.svg"
            alt=""
            className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 opacity-50"
          />
          <input
            name="query"
            type="search"
            aria-label="검색어"
            placeholder="영화 제목을 입력하세요"
            defaultValue={query}
            className="h-12 w-full rounded-md border border-gray-300 bg-white pl-12 pr-4 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="h-12 rounded-md bg-primary px-6 font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          검색
        </button>
      </form>

      {/* 기존 검색 폼과 다른 UI는 그대로 유지해요. */}
      {!normalizedQuery ? (
        // 기존 검색 UI를 재사용해요.
        <p className="py-20 text-center text-gray-500">검색어를 입력해 주세요.</p>
      ) : searchQuery.isLoading ? (
        <p>검색 결과를 불러오는 중이에요.</p> // 기존 로딩 UI가 있다면 재사용해요.
      ) : searchQuery.isError ? (
        <p>{searchQuery.error.message}</p> // 기존 오류 UI가 있다면 재사용해요.
      ) : searchQuery.isSuccess && searchResults.length === 0 ? (
        <p>검색 결과가 없어요.</p> // 기존 빈 결과 UI가 있다면 재사용해요.
      ) : (
        <>
          {/* 여기에 기존 검색 결과 UI를 넣어요. */}
          {/* searchResults로 영화 목록을 표시해요. */}
          <section>
            <div className="mb-4 flex items-baseline gap-3">
              <h2 className="text-xl font-bold">‘{query}’ 검색 결과</h2>
              <p className="text-sm text-gray-500">
                영화 {totalResults}편 · {page}페이지
              </p>
            </div>

            <ul className="flex flex-col divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
              {searchResults.map((movie) => (
                <li key={movie.id}>
                  <Link
                    to="/movies/$movieId"
                    params={{ movieId: String(movie.id) }}
                    className="flex gap-5 p-4 transition-colors hover:bg-gray-50"
                  >
                    <img
                      src={movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : ""}
                      alt={`${movie.title} 포스터`}
                      className="aspect-[2/3] w-24 shrink-0 rounded-md bg-gray-200 object-cover"
                    />
                    <div className="flex min-w-0 flex-col gap-1">
                      <h3 className="text-lg font-bold text-gray-900">{movie.title}</h3>
                      <p className="text-sm text-gray-500">{movie.original_title}</p>
                      <p className="text-sm text-gray-400">{movie.release_date} 개봉</p>
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {movie.overview}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

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
          </section>
        </>
      )}
    </main>
  );
}
