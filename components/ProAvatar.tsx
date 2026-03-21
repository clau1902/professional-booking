import Image from "next/image";
import { getCategoryMeta, getInitials } from "@/lib/category";

interface ProAvatarProps {
  name: string;
  category: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: { outer: "w-10 h-10", text: "text-sm" },
  md: { outer: "w-14 h-14", text: "text-lg" },
  lg: { outer: "w-20 h-20", text: "text-2xl" },
};

export function ProAvatar({ name, category, avatarUrl, size = "md", className = "" }: ProAvatarProps) {
  const meta = getCategoryMeta(category);
  const initials = getInitials(name);
  const { outer, text } = SIZES[size];

  if (avatarUrl) {
    return (
      <div className={`${outer} rounded-2xl overflow-hidden shrink-0 ${className}`}>
        <Image src={avatarUrl} alt={name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
      </div>
    );
  }

  return (
    <div
      className={`${outer} rounded-2xl flex items-center justify-center font-semibold ${text} shrink-0 ${className}`}
      style={{ background: meta.gradient, color: meta.text }}
    >
      {initials}
    </div>
  );
}

interface ProCoverProps {
  category: string;
  className?: string;
  children?: React.ReactNode;
}

export function ProCover({ category, className = "", children }: ProCoverProps) {
  const meta = getCategoryMeta(category);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ background: meta.gradient }}
    >
      <span className="text-7xl opacity-20 select-none">{meta.emoji}</span>
      {children}
    </div>
  );
}
