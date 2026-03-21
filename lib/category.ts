export const CATEGORY_META: Record<
  string,
  { emoji: string; gradient: string; light: string; text: string }
> = {
  // Sky blue
  Cleaning: {
    emoji: "🧹",
    gradient: "linear-gradient(135deg, #cffafe 0%, #67e8f9 100%)",
    light: "#cffafe",
    text: "#155e75",
  },
  // Warm amber/honey
  Tutoring: {
    emoji: "📚",
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)",
    light: "#fef3c7",
    text: "#78350f",
  },
  // Deep rose/magenta
  Photography: {
    emoji: "📷",
    gradient: "linear-gradient(135deg, #fce7f3 0%, #f9a8d4 100%)",
    light: "#fce7f3",
    text: "#831843",
  },
  // Teal/emerald
  "Personal Training": {
    emoji: "💪",
    gradient: "linear-gradient(135deg, #ccfbf1 0%, #5eead4 100%)",
    light: "#ccfbf1",
    text: "#134e4a",
  },
  // Deep indigo/violet — clearly different from sky blue
  Plumbing: {
    emoji: "🔧",
    gradient: "linear-gradient(135deg, #ede9fe 0%, #c4b5fd 100%)",
    light: "#ede9fe",
    text: "#4c1d95",
  },
  // Vivid lime/citrus — clearly different from amber
  Electrical: {
    emoji: "⚡",
    gradient: "linear-gradient(135deg, #ecfccb 0%, #bef264 100%)",
    light: "#ecfccb",
    text: "#3f6212",
  },
  // Olive/sage — clearly different from teal
  Gardening: {
    emoji: "🌿",
    gradient: "linear-gradient(135deg, #d9f99d 0%, #86efac 100%)",
    light: "#d9f99d",
    text: "#14532d",
  },
  // Warm coral/terracotta
  "Pet Care": {
    emoji: "🐾",
    gradient: "linear-gradient(135deg, #fee2e2 0%, #fca5a5 100%)",
    light: "#fee2e2",
    text: "#7f1d1d",
  },
};

export function getCategoryMeta(category: string) {
  return (
    CATEGORY_META[category] ?? {
      emoji: "👤",
      gradient: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
      light: "#f1f5f9",
      text: "#334155",
    }
  );
}

/** Initials from a full name */
export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
