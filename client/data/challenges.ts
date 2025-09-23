import { LanguageKey } from "@/data/languages";

export type ChallengeType = "vocab" | "translation" | "phrase" | "kanji";

export type ChallengeItem = {
  id: string;
  lang: LanguageKey;
  type: ChallengeType;
  question: string;
  options?: string[]; // when present, multiple choice
  answer: string | string[]; // accept array of valid answers
  explain?: string;
};

const base: Record<ChallengeType, ChallengeItem[]> = {
  vocab: [
    { id: "v1", lang: "english", type: "vocab", question: "Translate to English: casa", options: ["house", "car", "cat", "homework"], answer: ["house", "home"], explain: "Spanish 'casa' = house/home." },
    { id: "v2", lang: "spanish", type: "vocab", question: "Means 'thank you' in Japanese", options: ["Sumimasen", "Arigatou", "Konnichiwa", "Sayonara"], answer: "Arigatou" },
    { id: "v3", lang: "french", type: "vocab", question: "French for 'apple'", options: ["pomme", "poire", "pain", "poulet"], answer: "pomme" },
  ],
  translation: [
    { id: "t1", lang: "english", type: "translation", question: "Translate: 我爱学习 (Mandarin → English)", answer: ["I love studying", "I love to study"] },
    { id: "t2", lang: "spanish", type: "translation", question: "Translate: Where is the station? (→ Spanish)", answer: ["¿Dónde está la estación?", "Donde esta la estacion?"] },
  ],
  phrase: [
    { id: "p1", lang: "chinese", type: "phrase", question: "Choose polite greeting (Japanese)", options: ["ありがとう", "こんにちは", "さようなら", "いいえ"], answer: "こんにちは", explain: "Konnichiwa = Hello/Good day." },
    { id: "p2", lang: "french", type: "phrase", question: "Complete: Je m'_____ Kyle.", answer: ["appelle", "apelle"], explain: "Je m'appelle = My name is." },
  ],
  kanji: [
    { id: "k1", lang: "japanese", type: "kanji", question: "Meaning of 日", options: ["sun/day", "water", "tree", "mountain"], answer: ["sun", "day", "sun/day"] },
    { id: "k2", lang: "japanese", type: "kanji", question: "Reading of 山 (romaji)", answer: ["yama"] },
  ],
};

export function generateChallenges(type: ChallengeType, lang?: LanguageKey, count = 6): ChallengeItem[] {
  const pool = base[type].filter((c) => (lang ? c.lang === lang : true));
  const arr = [...pool, ...base[type]]; // ensure enough variety
  const picked: ChallengeItem[] = [];
  for (let i = 0; i < count; i++) {
    const item = arr[(i * 7 + 3) % arr.length];
    picked.push({ ...item, id: `${item.id}_${i}` });
  }
  return picked;
}
