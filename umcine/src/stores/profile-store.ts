import { create } from "zustand";

interface ProfileStore {
  // 프로필 이미지는 아직 API가 없어서 선택한 이미지의 미리보기 URL만 보관
  // (새로고침하면 사라짐)
  profileImageUrl: string | null;
  setProfileImageUrl: (profileImageUrl: string | null) => void;
}

export const useProfileStore = create<ProfileStore>()((set) => ({
  profileImageUrl: null,
  setProfileImageUrl: (profileImageUrl) => set({ profileImageUrl }),
}));
