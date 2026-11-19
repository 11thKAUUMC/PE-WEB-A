import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { createRating } from "../api/ratings/create-rating";
import { deleteRating } from "../api/ratings/delete-rating";
import { getMemberRatings } from "../api/ratings/get-member-ratings";
import type { RatingResponse, UpdateRatingRequest } from "../api/ratings/models";
import { updateRating } from "../api/ratings/update-rating";
import { getErrorStatus } from "../utils/api-error";

const getRatingsKey = (memberId: number | null) => ["members", memberId, "ratings"];

// 내가 남긴 평점 목록 (상세 화면에서 movieId가 같은 평점을 찾아 씀)
export function useMemberRatingsQuery(memberId: number | null) {
  return useQuery({
    queryKey: getRatingsKey(memberId),
    queryFn: () => getMemberRatings(memberId as number),
    enabled: memberId !== null,
  });
}

// 401, 403, 404는 등록·수정·삭제 모두 같은 방식으로 처리
function useHandleRatingError(memberId: number | null) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (error: Error) => {
    const status = getErrorStatus(error);

    if (status === 401) {
      alert("로그인이 만료됐어요. 다시 로그인해 주세요.");
      navigate({ to: "/login" });
    } else if (status === 403) {
      alert("이 평점을 바꿀 권한이 없어요.");
    } else if (status === 404 || status === 409) {
      // 없는 평점 / 이미 평점이 있음 → 내 평점을 다시 받아 화면을 맞춤
      queryClient.invalidateQueries({ queryKey: getRatingsKey(memberId) });
    } else if (status !== 400) {
      // 400(별점 범위)은 입력칸 아래에 따로 안내
      alert("평점 저장에 실패했어요. 다시 시도해 주세요.");
    }
  };
}

// 등록·수정은 결과를 돌려주므로 다시 조회하지 않고 캐시를 바로 바꿈
export function useCreateRatingMutation(memberId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRating,
    onSuccess: (rating) => {
      queryClient.setQueryData<RatingResponse[]>(getRatingsKey(memberId), (prev = []) => [
        rating,
        ...prev,
      ]);
    },
    onError: useHandleRatingError(memberId),
  });
}

export function useUpdateRatingMutation(memberId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, body }: { ratingId: number; body: UpdateRatingRequest }) =>
      updateRating(ratingId, body),
    onSuccess: (rating) => {
      queryClient.setQueryData<RatingResponse[]>(getRatingsKey(memberId), (prev = []) =>
        prev.map((item) => (item.ratingId === rating.ratingId ? rating : item)),
      );
    },
    onError: useHandleRatingError(memberId),
  });
}

export function useDeleteRatingMutation(memberId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRating,
    onSuccess: (_, ratingId) => {
      queryClient.setQueryData<RatingResponse[]>(getRatingsKey(memberId), (prev = []) =>
        prev.filter((item) => item.ratingId !== ratingId),
      );
    },
    onError: useHandleRatingError(memberId),
  });
}
