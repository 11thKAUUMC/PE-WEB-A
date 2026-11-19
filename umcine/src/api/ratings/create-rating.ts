import { authApi } from "../auth-api";
import type { ApiResponse } from "../api-response";
import type { CreateRatingRequest, RatingResponse } from "./models";

export async function createRating(body: CreateRatingRequest) {
  const response = await authApi
    .post("ratings", { json: body })
    .json<ApiResponse<RatingResponse>>();
  return response.result;
}
