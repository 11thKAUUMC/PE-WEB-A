import { useRef, useState, type ChangeEvent } from "react";
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";
import type { MemberInfo } from "@/api/members/me";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useMeQuery } from "@/hooks/use-me-query";
import { useUpdateMeMutation } from "@/hooks/use-update-me-mutation";
import { useProfileStore } from "@/stores/profile-store";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const inputClass =
  "h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none aria-invalid:border-red-500";

export function MyEditPage() {
  const meQuery = useMeQuery();

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1280px] flex-col px-10 pb-10 pt-10">
      {meQuery.isPending ? (
        <p className="py-20 text-center text-gray-500">내 정보를 불러오는 중이에요...</p>
      ) : meQuery.isError ? (
        <p className="py-20 text-center text-red-500">내 정보를 불러오지 못했어요.</p>
      ) : (
        // 서버에서 받은 내 정보로 입력칸의 초기값을 채움
        <MyEditForm me={meQuery.data} />
      )}

      <section className="mt-auto flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 p-5">
        <div>
          <h2 className="text-sm font-bold text-red-600">회원 탈퇴</h2>
          <p className="mt-1 text-xs text-red-500">
            탈퇴하면 작성한 평점, 후기와 즐겨찾기가 모두 삭제되며 복구할 수 없습니다.
          </p>
        </div>
        {/* 회원 탈퇴 API는 다음 단계에서 연결 */}
        <button
          type="button"
          className="h-10 shrink-0 rounded-md border border-red-500 bg-white px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          회원 탈퇴
        </button>
      </section>
    </main>
  );
}

function MyEditForm({ me }: { me: MemberInfo }) {
  const savedProfileImageUrl = useProfileStore((state) => state.profileImageUrl);
  const setSavedProfileImageUrl = useProfileStore((state) => state.setProfileImageUrl);

  const [nicknameInput, setNicknameInput] = useState(me.nickname);
  const [profileImageUrl, setProfileImageUrl] = useState(savedProfileImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 중복 확인을 통과한 닉네임 (입력값이 바뀌면 다시 확인해야 함)
  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);

  const updateMeMutation = useUpdateMeMutation();
  const nickname = nicknameInput.trim();
  const isNicknameValid = nickname.length >= 2 && nickname.length <= 12;
  // 지금 쓰는 닉네임 그대로면 중복 확인이 필요 없음
  const isNicknameChanged = nickname !== me.nickname;
  const isNicknameChecked = !isNicknameChanged || checkedNickname === nickname;
  const canSubmit = isNicknameValid && isNicknameChecked;

  const handleCheckNickname = async () => {
    if (!isNicknameValid || !isNicknameChanged || isCheckingNickname) return;

    setIsCheckingNickname(true);
    try {
      const response = await checkNicknameDuplicate(nickname);
      setCheckedNickname(response.available ? nickname : null);
      alert(response.available ? "사용할 수 있는 닉네임이에요." : "이미 사용 중인 닉네임이에요.");
    } catch {
      setCheckedNickname(null);
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setIsCheckingNickname(false);
    }
  };

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || updateMeMutation.isPending) return;

    // 프로필 이미지는 API가 없어서 화면에만 반영
    setSavedProfileImageUrl(profileImageUrl);
    updateMeMutation.mutate({ nickname });
  };

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      alert("프로필 이미지는 최대 5MB까지 올릴 수 있어요.");
      return;
    }
    setProfileImageUrl(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">내 정보 수정</h1>
          <p className="mt-2 text-sm text-gray-500">닉네임과 프로필 이미지만 변경할 수 있어요.</p>
        </div>
        <button
          type="submit"
          disabled={!canSubmit || updateMeMutation.isPending}
          className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {updateMeMutation.isPending ? "저장 중" : "저장"}
        </button>
      </div>

      <div className="grid gap-10 pb-10 md:grid-cols-2">
        <div className="flex flex-col items-center gap-1 py-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="프로필 이미지 변경"
            className="relative rounded-full"
          >
            <ProfileAvatar imageUrl={profileImageUrl} />
            <span className="absolute bottom-0 right-0 flex size-7 items-center justify-center rounded-full border-2 border-gray-900 bg-white">
              <img src="/icon/movie-icons/edit.svg" alt="" className="size-4" />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChangeImage}
            className="hidden"
          />
          <p className="mt-1 text-sm font-semibold text-gray-900">프로필 이미지</p>
          <p className="text-xs text-gray-400">선택 사항 · 최대 5MB</p>
        </div>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-900">닉네임</span>
            <div className="relative">
              <input
                type="text"
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="2~12자"
                aria-invalid={!isNicknameValid}
                className={`${inputClass} pr-20`}
              />
              <button
                type="button"
                onClick={handleCheckNickname}
                disabled={!isNicknameValid || !isNicknameChanged || isCheckingNickname}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:text-gray-400"
              >
                {isCheckingNickname ? "확인 중" : "중복 확인"}
              </button>
            </div>
            {!isNicknameValid ? (
              <p className="text-xs text-red-500">닉네임은 2자 이상 12자 이하로 입력해 주세요.</p>
            ) : isNicknameChanged && !isNicknameChecked ? (
              <p className="text-xs text-gray-500">닉네임을 바꾸면 중복 확인 후 저장할 수 있어요.</p>
            ) : null}
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-gray-900">이메일</span>
            <input
              type="email"
              value={me.email}
              readOnly
              className={`${inputClass} text-gray-500`}
            />
          </label>
        </div>
      </div>
    </form>
  );
}
