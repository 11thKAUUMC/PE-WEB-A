import { authApi } from "../auth-api";

// URL에는 favoriteId가 아니라 TMDB movieId를 넣음
export async function removeFavorite(movieId: number) {
  await authApi.delete(`favorites/${movieId}`);
}
