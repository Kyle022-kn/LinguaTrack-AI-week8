export type TopicContent = {
  name: string;
  goals: string[];
  minutes: number;
  description: string;
  vocabulary?: { word: string; translation: string; example: string }[];
  grammar?: { point: string; explanation: string; examples: string[] }[];
  culturalNotes?: string[];
};

export const TOPIC_CONTENT: Record<string, TopicContent[]> = {
  spanish: [
    {
      name: "Basics & Alphabet",
      goals: ["Master Spanish pronunciation", "Learn the alphabet", "Essential greetings"],
      minutes: 15,
      description: "Start your Spanish journey with fundamental sounds and letters. The Spanish alphabet has 27 letters, including the special 'ñ'. Understanding pronunciation patterns will help you speak clearly from the beginning.",
      vocabulary: [
        { word: "hola", translation: "hello", example: "¡Hola! ¿Cómo estás?" },
        { word: "adiós", translation: "goodbye", example: "Adiós, hasta mañana" },
        { word: "gracias", translation: "thank you", example: "Muchas gracias" },
        { word: "por favor", translation: "please", example: "Un café, por favor" }
      ],
      grammar: [
        { 
          point: "Pronunciation basics", 
          explanation: "Spanish is phonetic - words are pronounced as they're written",
          examples: ["casa (kah-sah)", "perro (peh-rro)", "niño (nee-nyoh)"]
        }
      ]
    },
    {
      name: "Greetings & Introductions",
      goals: ["Introduce yourself confidently", "Use formal and informal greetings", "Ask basic questions"],
      minutes: 20,
      description: "Learn to make a great first impression in Spanish. Master the difference between 'tú' (informal you) and 'usted' (formal you), and practice common conversation starters.",
      vocabulary: [
        { word: "me llamo", translation: "my name is", example: "Me llamo María" },
        { word: "mucho gusto", translation: "nice to meet you", example: "Mucho gusto, Juan" },
        { word: "¿cómo estás?", translation: "how are you?", example: "Hola, ¿cómo estás?" },
        { word: "bien", translation: "good/well", example: "Estoy bien, gracias" }
      ],
      grammar: [
        {
          point: "Formal vs Informal",
          explanation: "Use 'tú' with friends, 'usted' with elders or formal situations",
          examples: ["¿Cómo estás tú?", "¿Cómo está usted?"]
        }
      ],
      culturalNotes: ["Spanish speakers often greet with a kiss on the cheek", "It's polite to ask '¿Cómo está?' even to strangers"]
    },
    {
      name: "Numbers & Time",
      goals: ["Count 1-100", "Tell time", "Express dates"],
      minutes: 25,
      description: "Numbers are essential for daily life. Learn to count, tell time, and discuss dates in Spanish. Practice with prices, phone numbers, and scheduling.",
      vocabulary: [
        { word: "uno", translation: "one", example: "Tengo un libro" },
        { word: "¿qué hora es?", translation: "what time is it?", example: "¿Qué hora es? - Son las tres" },
        { word: "mañana", translation: "tomorrow/morning", example: "Hasta mañana" },
        { word: "hoy", translation: "today", example: "Hoy es lunes" }
      ],
      grammar: [
        {
          point: "Time expressions",
          explanation: "Use 'es la' for 1 o'clock, 'son las' for other hours",
          examples: ["Es la una", "Son las cinco", "Son las diez y media"]
        }
      ]
    },
    {
      name: "Food & Travel",
      goals: ["Order at restaurants", "Ask for directions", "Book accommodations"],
      minutes: 30,
      description: "Essential phrases for eating out and traveling in Spanish-speaking countries. Learn menu vocabulary, how to ask for recommendations, and navigate cities.",
      vocabulary: [
        { word: "la comida", translation: "food/meal", example: "Me gusta la comida mexicana" },
        { word: "el menú", translation: "menu", example: "¿Puedo ver el menú?" },
        { word: "¿dónde está?", translation: "where is?", example: "¿Dónde está el baño?" },
        { word: "la calle", translation: "street", example: "Vivo en la calle Principal" }
      ],
      culturalNotes: ["Lunch (la comida) is the main meal, usually 2-4 PM", "Dinner (la cena) is often late, 9-11 PM"]
    }
  ],
  french: [
    {
      name: "Basics & Alphabet",
      goals: ["Perfect French pronunciation", "Learn accent marks", "Master nasal sounds"],
      minutes: 18,
      description: "French pronunciation can be challenging but rewarding. Learn the unique sounds, silent letters, and accent marks (é, è, ê, ë, ç) that give French its melodic quality.",
      vocabulary: [
        { word: "bonjour", translation: "hello", example: "Bonjour madame!" },
        { word: "merci", translation: "thank you", example: "Merci beaucoup" },
        { word: "s'il vous plaît", translation: "please", example: "Un café, s'il vous plaît" },
        { word: "au revoir", translation: "goodbye", example: "Au revoir, à bientôt" }
      ],
      grammar: [
        {
          point: "Silent letters",
          explanation: "Many final consonants are silent in French",
          examples: ["petit (puh-tee)", "beaucoup (boh-koo)", "français (frahn-seh)"]
        }
      ]
    },
    {
      name: "Greetings & Introductions",
      goals: ["Introduce yourself in French", "Use tu vs vous correctly", "Engage in small talk"],
      minutes: 22,
      description: "French etiquette is important. Learn when to use 'tu' (informal) versus 'vous' (formal), and master the art of French politeness.",
      vocabulary: [
        { word: "je m'appelle", translation: "my name is", example: "Je m'appelle Pierre" },
        { word: "enchanté(e)", translation: "nice to meet you", example: "Enchanté, madame" },
        { word: "comment allez-vous?", translation: "how are you?", example: "Bonjour! Comment allez-vous?" },
        { word: "ça va", translation: "it's going (well)", example: "Ça va bien, merci" }
      ],
      culturalNotes: ["Always say 'bonjour' when entering shops", "The 'bise' (cheek kiss) is common among friends"]
    }
  ],
  japanese: [
    {
      name: "Basics & Hiragana",
      goals: ["Learn hiragana characters", "Master basic greetings", "Understand Japanese sounds"],
      minutes: 25,
      description: "Japanese has three writing systems. Start with hiragana (ひらがな), the phonetic alphabet. Each character represents a syllable, making it perfect for beginners.",
      vocabulary: [
        { word: "こんにちは", translation: "hello", example: "こんにちは！お元気ですか？" },
        { word: "ありがとう", translation: "thank you", example: "ありがとうございます" },
        { word: "すみません", translation: "excuse me/sorry", example: "すみません、トイレはどこですか？" },
        { word: "さようなら", translation: "goodbye", example: "さようなら、また明日" }
      ],
      grammar: [
        {
          point: "Politeness levels",
          explanation: "Japanese has different speech levels: casual, polite, and honorific",
          examples: ["ありがとう (casual)", "ありがとうございます (polite)", "ありがとうございました (past polite)"]
        }
      ],
      culturalNotes: ["Bowing is important - deeper bow shows more respect", "Remove shoes when entering homes"]
    }
  ],
  chinese: [
    {
      name: "Basics & Pinyin",
      goals: ["Master pinyin pronunciation", "Learn tones", "Basic characters"],
      minutes: 20,
      description: "Mandarin Chinese has 4 tones plus a neutral tone. Each tone changes the meaning entirely. Pinyin is the romanization system that helps you learn pronunciation.",
      vocabulary: [
        { word: "你好", translation: "hello", example: "你好！你好吗？" },
        { word: "谢谢", translation: "thank you", example: "谢谢你" },
        { word: "再见", translation: "goodbye", example: "再见！明天见" },
        { word: "对不起", translation: "sorry", example: "对不起，我不知道" }
      ],
      grammar: [
        {
          point: "Four tones",
          explanation: "Mandarin uses tone to distinguish meaning",
          examples: ["mā (mother)", "má (hemp)", "mǎ (horse)", "mà (scold)"]
        }
      ],
      culturalNotes: ["Chinese names are family name first, given name last", "Red is a lucky color symbolizing good fortune"]
    }
  ],
  english: [
    {
      name: "Basics & Pronunciation",
      goals: ["Master English sounds", "Learn common phrases", "Understand stress patterns"],
      minutes: 15,
      description: "English pronunciation can be tricky because spelling doesn't always match sounds. Focus on the most common sounds and practice rhythm and stress.",
      vocabulary: [
        { word: "hello", translation: "greeting", example: "Hello! How are you?" },
        { word: "thank you", translation: "gratitude", example: "Thank you very much" },
        { word: "please", translation: "polite request", example: "Can I have coffee, please?" },
        { word: "excuse me", translation: "attention/apology", example: "Excuse me, where is the bathroom?" }
      ],
      grammar: [
        {
          point: "Word stress",
          explanation: "English uses stress on syllables to convey meaning",
          examples: ["PREsent (gift) vs preSENT (show)", "REcord (noun) vs reCORD (verb)"]
        }
      ]
    }
  ]
};
