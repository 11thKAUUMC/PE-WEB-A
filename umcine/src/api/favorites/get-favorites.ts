import { authApi } from "../auth-api";
import { unwrapResult, type ApiResponse } from "../api-response";
import type { FavoriteResponse } from "./models";

export async function getFavorites() {
  const data = await authApi
    .get("favorites")
    .json<ApiResponse<FavoriteResponse[]> | FavoriteResponse[]>();
  return unwrapResult(data);
}
