import defaultUserAvatar from "../../assets/default-user-avatar.png";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeMap = {
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
};

export const resolveAvatarSrc = (src?: string) =>
  src && !src.includes("via.placeholder.com") ? src : defaultUserAvatar;

export const Avatar = ({ name, src, size = "md" }: AvatarProps) => (
  <div
    className={`inline-flex items-center justify-center overflow-hidden rounded-full bg-[#f3f4f6] shadow-sm ${sizeMap[size]}`}
  >
    <img src={resolveAvatarSrc(src)} alt={name} className="h-full w-full object-cover" />
  </div>
);
