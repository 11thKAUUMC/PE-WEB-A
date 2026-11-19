import { isHTTPError } from "ky";

// 서버 오류의 HTTP 상태 코드 (네트워크 오류 등은 null)
export function getErrorStatus(error: unknown) {
  return isHTTPError(error) ? error.response.status : null;
}
