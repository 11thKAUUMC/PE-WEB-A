interface ProfileAvatarProps {
  imageUrl: string | null;
}

export const ProfileAvatar = ({ imageUrl }: ProfileAvatarProps) => {
  return imageUrl ? (
    <img src={imageUrl} alt="프로필 이미지" className="size-24 rounded-full object-cover" />
  ) : (
    <span className="flex size-24 items-center justify-center rounded-full bg-gray-200">
      <img src="/icon/movie-icons/person.svg" alt="" className="size-10" />
    </span>
  );
};
