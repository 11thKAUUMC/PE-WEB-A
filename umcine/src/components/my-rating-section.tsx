import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { RatingResponse } from "@/api/ratings/models";
import { StarRatingInput } from "@/components/star-rating-input";
import { useMemberId } from "@/hooks/use-member-id";
import {
  useCreateRatingMutation,
  useDeleteRatingMutation,
  useMemberRatingsQuery,
  useUpdateRatingMutation,
} from "@/hooks/use-ratings";
import { getErrorStatus } from "@/utils/api-error";

interface MyRatingSectionProps {
  movieId: number;
}

// 영화 상세 화면의 "내 평점" 영역 (다른 사람의 평점을 보는 API는 없음)
export function MyRatingSection({ movieId }: MyRatingSectionProps) {
  const memberId = useMemberId();
  const ratingsQuery = useMemberRatingsQuery(memberId);

  // 내 평점 목록에서 이 영화의 평점을 찾음 (ratingId 포함)
  const myRating = ratingsQuery.data?.find((rating) => rating.movieId === movieId) ?? null;

  return (
    <section className="mt-8 flex max-w-2xl flex-col gap-4 rounded-xl border border-white/15 bg-black/30 p-5">
      <h2 className="text-lg font-semibold">내 평점</h2>

      {memberId === null ? (
        <p className="text-sm text-[#ddd]">
          평점을 남기려면{" "}
          <Link to="/login" className="font-semibold text-white underline">
            로그인
          </Link>
          해 주세요.
        </p>
      ) : ratingsQuery.isPending ? (
        <p className="text-sm text-[#a0a0a0]">내 평점을 불러오는 중이에요...</p>
      ) : ratingsQuery.isError ? (
        <p className="text-sm text-red-400">내 평점을 불러오지 못했어요.</p>
      ) : (
        // 평점이 바뀌면 입력칸을 그 값으로 다시 채움
        <RatingForm
          key={myRating ? `${myRating.ratingId}-${myRating.updatedAt}` : "new"}
          movieId={movieId}
          memberId={memberId}
          myRating={myRating}
        />
      )}
    </section>
  );
}

interface RatingFormProps {
  movieId: number;
  memberId: number;
  myRating: RatingResponse | null;
}

function RatingForm({ movieId, memberId, myRating }: RatingFormProps) {
  const [score, setScore] = useState(myRating?.score ?? 0);
  const [comment, setComment] = useState(myRating?.comment ?? "");

  const createMutation = useCreateRatingMutation(memberId);
  const updateMutation = useUpdateRatingMutation(memberId);
  const deleteMutation = useDeleteRatingMutation(memberId);

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const isScoreValid = score >= 1 && score <= 5;
  const trimmedComment = comment.trim();
  const isChanged =
    myRating !== null &&
    (score !== myRating.score || trimmedComment !== (myRating.comment ?? ""));

  const isBadRequest =
    getErrorStatus(createMutation.error) === 400 || getErrorStatus(updateMutation.error) === 400;

  const handleCreate = () => {
    if (!isScoreValid || isPending) return;
    createMutation.mutate({ movieId, score, comment: trimmedComment || undefined });
  };

  const handleUpdate = () => {
    if (!myRating || !isScoreValid || !isChanged || isPending) return;
    updateMutation.mutate({
      ratingId: myRating.ratingId,
      body: { score, comment: trimmedComment || undefined },
    });
  };

  const handleDelete = () => {
    if (!myRating || isPending) return;
    if (!confirm("내 평점을 삭제할까요?")) return;
    deleteMutation.mutate(myRating.ratingId);
  };

  return (
    <div className="flex flex-col gap-3">
      <StarRatingInput value={score} onChange={setScore} disabled={isPending} />
      {isBadRequest && <p className="text-xs text-red-400">별점은 1~5점으로 입력해 주세요.</p>}

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isPending}
        rows={3}
        placeholder="후기를 남겨 주세요 (선택)"
        className="resize-none rounded-lg border border-white/20 bg-black/30 p-3 text-sm text-white placeholder:text-white/40 focus:border-white/60 focus:outline-none"
      />

      <div className="flex gap-2">
        {myRating === null ? (
          <button
            type="button"
            onClick={handleCreate}
            disabled={!isScoreValid || isPending}
            className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-500"
          >
            {createMutation.isPending ? "등록 중" : "등록"}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={!isScoreValid || !isChanged || isPending}
              className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              {updateMutation.isPending ? "수정 중" : "수정"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="h-10 rounded-md border border-red-400 px-5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleteMutation.isPending ? "삭제 중" : "삭제"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
