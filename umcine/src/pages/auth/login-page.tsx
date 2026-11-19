import { useState, type SubmitEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useLoginMutation } from "@/hooks/use-login-mutation";


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  "h-12 w-full rounded-lg border border-transparent bg-white pl-11 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none";



export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const loginMutation = useLoginMutation();

  const canSubmit = EMAIL_REGEX.test(form.email.trim()) && form.password.length > 0;

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || loginMutation.isPending) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex w-full max-w-[448px] flex-col px-6 pt-40 pb-20"
    >
      <h1 className="mb-6 text-3xl font-bold text-gray-900">로그인</h1>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">이메일</span>
          <div className="relative">
            <img
              src="/icon/movie-icons/mail.svg"
              alt=""
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 opacity-60"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="name@example.com"
              className={inputClass}
            />
          </div>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold text-gray-900">비밀번호</span>
          <div className="relative">
            <img
              src="/icon/movie-icons/lock.svg"
              alt=""
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 opacity-60"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="비밀번호"
              className={inputClass}
            />
          </div>
        </label>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || loginMutation.isPending}
        className="mt-6 h-12 w-full rounded-lg bg-primary text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-gray-300 disabled:hover:bg-gray-300"
      >
        {loginMutation.isPending ? "로그인 중" : "로그인"}
      </button>

      <p className="mt-4 text-center text-sm text-gray-500">
        처음이신가요?{" "}
        <Link to="/signup" className="font-semibold text-primary hover:text-primary-hover">
          회원가입
        </Link>
      </p>
    </form>
  );
}
