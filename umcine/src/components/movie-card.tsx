import type { MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { Movie } from "../types/movie";
import { cn } from "../utils/cn";

interface MovieCardProps {
  movie: Movie;
  onToggleBookmark: (id: number) => void;
}

export const MovieCard = ({ movie, onToggleBookmark }: MovieCardProps) => {
  function handleBookmarkClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault(); 
    event.stopPropagation();
    onToggleBookmark(movie.id);
  }

  return (
    <Link
      to="/movies/$movieId"
      params={{ movieId: String(movie.id) }}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-[8/9] w-full overflow-hidden rounded-md bg-gray-200">
        <img
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          type="button"
          onClick={handleBookmarkClick}
          aria-label={movie.isBookmarked ? "북마크 해제" : "북마크 추가"}
          aria-pressed={movie.isBookmarked}
          className={cn(
            "absolute right-2 top-2 flex size-8 items-center justify-center rounded-md text-white transition-colors",
            movie.isBookmarked
              ? "bg-primary hover:bg-primary-hover"
              : "border border-white/60 bg-black/50 hover:bg-black/70",
          )}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {movie.isBookmarked ? (
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            ) : (
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15-5-2.18L7 18V5h10v13z" />
            )}
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-0.5">
        <h3 className="truncate text-sm font-semibold text-gray-900">{movie.title}</h3>
        <p className="text-xs text-gray-400">{movie.releaseDate}</p>
      </div>
    </Link>
  );
};
