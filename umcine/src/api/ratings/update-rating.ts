import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";
import type { RatingResponse, UpdateRatingRequest } from "./models";

export async function updateRating(ratingId: number, body: UpdateRatingRequest) {
  const response = await authApi
    .patch(`ratings/${ratingId}`, { json: body })
    .json<ApiResponse<RatingResponse>>();
  return response.result;
}
