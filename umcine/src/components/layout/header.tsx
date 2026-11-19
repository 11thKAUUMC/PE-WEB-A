import { Link } from "@tanstack/react-router";
import { useMeQuery } from "@/hooks/use-me-query";
import { useAuthStore } from "@/stores/auth-store";

const navClass =
  "border-b-2 border-transparent py-1 text-sm text-gray-500 transition-colors hover:text-gray-900";
const activeNavClass = "border-gray-900 font-semibold text-gray-900";
export const Header = () => {
  // Hook은 컴포넌트 안에서만 호출할 수 있음
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useMeQuery();

  return (
    <header className="sticky top-0 z-50 h-16 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-10">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md border-2 border-gray-900">
              <img src="/icon/movie-icons/movie.svg" alt="" className="size-5" />
            </span>
            <span className="text-lg font-bold">UMCine</span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className={navClass}
              activeProps={{ className: activeNavClass }}
            >
              영화
            </Link>
            <Link to="/search" className={navClass} activeProps={{ className: activeNavClass }}>
              검색
            </Link>
            <Link to="/me" className={navClass} activeProps={{ className: activeNavClass }}>
              내 정보
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/search"
            aria-label="검색"
            className="flex size-9 items-center justify-center rounded-md border border-gray-300 bg-white transition-colors hover:bg-gray-100"
          >
            <img src="/icon/movie-icons/search.svg" alt="" className="size-5" />
          </Link>
          {!accessToken ? (
            <Link
              to="/login"
              className="flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              로그인
            </Link>
          ) : meQuery.isLoading ? (
            <span className="h-9 w-24 animate-pulse rounded-md bg-gray-200" />
          ) : (
            <Link
              to="/me"
              className="flex h-9 items-center rounded-md border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              마이페이지
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
