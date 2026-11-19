import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "../pages/movies/search-page";

type SearchParams = { query?: string; page?: number };

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    query: typeof search.query === "string" ? search.query : undefined,
    page: Number(search.page) > 0 ? Number(search.page) : undefined,
  }),
  component: SearchPage,
});
