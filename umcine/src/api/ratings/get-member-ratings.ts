import { apiClient } from "../api-client";
import type { RatingResponse } from "./models";

// 토큰이 필요 없고, 공통 응답으로 감싸지 않은 배열이 최신순으로 옴
export function getMemberRatings(memberId: number) {
  return apiClient.get(`members/${memberId}/ratings`).json<RatingResponse[]>();
}
