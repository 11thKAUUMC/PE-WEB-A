import { authApi } from "../auth-api";
import { unwrapResult, type ApiResponse } from "../api-response";
import type { FavoriteStatus } from "./models";

// 즐겨찾기하지 않은 영화도 404가 아니라 { isFavorite: false }로 옴
export async function getFavoriteStatus(movieId: number) {
  const data = await authApi
    .get(`favorites/${movieId}`)
    .json<ApiResponse<FavoriteStatus> | FavoriteStatus>();
  return unwrapResult(data);
}
