import type { Movie } from "../types/movie";
import { MovieCard } from "./movie-card";

interface MovieGridProps {
  movies: Movie[];
  onToggleBookmark: (id: number) => void;
}

export const MovieGrid = ({ movies, onToggleBookmark }: MovieGridProps) => {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <li key={movie.id}>
          <MovieCard movie={movie} onToggleBookmark={onToggleBookmark} />
        </li>
      ))}
    </ul>
  );
};
