// 토큰 payload의 sub(memberId)를 꺼냄
// 화면에서 "내 평점"을 찾는 용도라 디코딩만 하고, 서명 검증은 서버가 함
export function getMemberIdFromToken(accessToken: string | null) {
  if (!accessToken) return null;

  try {
    const payload = accessToken.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const { sub } = JSON.parse(atob(base64)) as { sub?: string };
    const memberId = Number(sub);
    return Number.isInteger(memberId) && memberId > 0 ? memberId : null;
  } catch {
    return null;
  }
}
