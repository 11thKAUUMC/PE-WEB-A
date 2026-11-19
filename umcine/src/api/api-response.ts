// 서버 공통 응답 형식
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// 명세상 즐겨찾기 응답이 공통 형식으로 감싸지는지 확실하지 않아서 두 경우 모두 처리
export function unwrapResult<T>(data: ApiResponse<T> | T): T {
  if (data !== null && typeof data === "object" && "isSuccess" in data && "result" in data) {
    return data.result;
  }
  return data as T;
}
