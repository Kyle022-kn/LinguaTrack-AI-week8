export type LanguageKey = "english" | "chinese" | "spanish" | "french" | "japanese";

export type Language = {
  key: LanguageKey;
  name: string;
  emoji: string;
  colorVar: `--lang-${string}`;
  path: string;
  progress: number; // 0-100 demo progress
};

export const LANGUAGES: Language[] = [
  { key: "english", name: "English", emoji: "🇬🇧", colorVar: "--lang-english", path: "/lessons/english", progress: 62 },
  { key: "chinese", name: "Mandarin", emoji: "🇨🇳", colorVar: "--lang-chinese", path: "/lessons/chinese", progress: 28 },
  { key: "spanish", name: "Spanish", emoji: "🇪🇸", colorVar: "--lang-spanish", path: "/lessons/spanish", progress: 47 },
  { key: "french", name: "French", emoji: "🇫🇷", colorVar: "--lang-french", path: "/lessons/french", progress: 35 },
  { key: "japanese", name: "Japanese", emoji: "🇯🇵", colorVar: "--lang-japanese", path: "/lessons/japanese", progress: 12 },
];
