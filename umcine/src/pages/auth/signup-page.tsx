import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { checkEmailDuplicate } from "@/api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "@/api/members/check-nickname-duplicate";
import { useSignupMutation } from "@/hooks/use-signup-mutation";
// import { useNavigate } from "@tanstack/react-router";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;


const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

const DEFAULT_DUPLICATE_CHECK = {
  isChecking: false,
  isAvailable: false,
};

type DefaultFormKey = keyof typeof DEFAULT_FORM;
type DefaultFormValue = (typeof DEFAULT_FORM)[DefaultFormKey];
type DuplicateCheckKey = "email" | "nickname";

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);

  // 입력값의 유효성 검사
  const isEmailValid = EMAIL_REGEX.test(form.email.trim());
  const isNicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작한 필드에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값이 유효하면 제출 버튼 활성화
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  const [duplicateCheck, setDuplicateCheck] = useState({
    email: DEFAULT_DUPLICATE_CHECK,
    nickname: DEFAULT_DUPLICATE_CHECK,
  });

  // 입력 조건과 두 중복 확인을 모두 통과해야 제출 가능
  const canSubmit =
    isFormValid &&
    duplicateCheck.email.isAvailable &&
    duplicateCheck.nickname.isAvailable;

  const handleChangeField = (key: DefaultFormKey, value: DefaultFormValue) => {
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key].isChecking) return;
      // 확인한 값을 바꾸면 다시 중복 확인해야 함
      setDuplicateCheck((prev) => ({ ...prev, [key]: DEFAULT_DUPLICATE_CHECK }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key].isChecking) return;

    const label = key === "email" ? "이메일" : "닉네임";
    setDuplicateCheck((prev) => ({
      ...prev,
      [key]: { isChecking: true, isAvailable: false },
    }));

    try {
      const response =
        key === "email"
          ? await checkEmailDuplicate(form.email.trim())
          : await checkNicknameDuplicate(form.nickname.trim());
      const isAvailable = response.available;
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable },
      }));
      alert(
        isAvailable
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isAvailable: false },
      }));
      alert("중복 확인에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: { ...prev[key], isChecking: false },
      }));
    }
  };
  
  

  const signupMutation = useSignupMutation();

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit || signupMutation.isPending) return;

    signupMutation.mutate({
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      password: form.password,
    });
  };
  
  // noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 끔
  return (
	  <form onSubmit={handleSubmit} noValidate className="mx-auto flex w-full max-w-[448px] flex-col px-6 pt-16 pb-20">
      {/* UI 구현 */}
      <h1 className="mb-6 text-3xl font-bold text-gray-900">회원가입</h1>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">이메일</span>
          <div className="relative">
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChangeField("email", e.target.value)}
              placeholder="name@example.com"
              aria-invalid={showEmailError}
              className="h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none aria-invalid:border-red-500 pr-20"
            />
            <button
              type="button"
              onClick={() => handleCheckDuplicate("email")}
              disabled={!isEmailValid || duplicateCheck.email.isChecking}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {duplicateCheck.email.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {showEmailError && (
            <p className="text-xs text-red-500">올바른 이메일 형식을 입력해 주세요.</p>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">닉네임</span>
          <div className="relative">
            <input
              type="text"
              value={form.nickname}
              onChange={(e) => handleChangeField("nickname", e.target.value)}
              placeholder="2~12자"
              aria-invalid={showNicknameError}
              className="h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none aria-invalid:border-red-500 pr-20"
            />
            <button
              type="button"
              onClick={() => handleCheckDuplicate("nickname")}
              disabled={!isNicknameValid || duplicateCheck.nickname.isChecking}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:text-primary-hover disabled:cursor-not-allowed disabled:text-gray-400"
            >
              {duplicateCheck.nickname.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>
          {showNicknameError && (
            <p className="text-xs text-red-500">닉네임은 2자 이상 12자 이하로 입력해 주세요.</p>
          )}
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">비밀번호</span>
          <input
            type="password"
            value={form.password}
            onChange={(e) => handleChangeField("password", e.target.value)}
            placeholder="8자 이상"
            aria-invalid={showPasswordError}
            className="h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none aria-invalid:border-red-500"
          />
          {/* 평소에는 안내 문구, 오류일 때는 빨간색으로 표시 */}
          <p className={showPasswordError ? "text-xs text-red-500" : "text-xs text-gray-500"}>
            영문 대소문자, 숫자, 특수문자를 모두 포함해 8자 이상 입력해 주세요
          </p>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">비밀번호 확인</span>
          <input
            type="password"
            value={form.passwordConfirm}
            onChange={(e) => handleChangeField("passwordConfirm", e.target.value)}
            placeholder="다시 입력"
            aria-invalid={showPasswordConfirmError}
            className="h-12 w-full rounded-lg border border-transparent bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none aria-invalid:border-red-500"
          />
          {showPasswordConfirmError && (
            <p className="text-xs text-red-500">비밀번호가 일치하지 않아요.</p>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || signupMutation.isPending}
        className="mt-6 h-12 w-full rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300"
      >
        {signupMutation.isPending ? "가입 중" : "가입하기"}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        이미 계정이 있나요?{" "}
        <Link to="/login" className="font-semibold text-primary hover:text-primary-hover">
          로그인
        </Link>
      </p>
	  </form>
  )
}