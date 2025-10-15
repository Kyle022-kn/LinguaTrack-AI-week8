import express from "express";
import OpenAI from "openai";
import { requireAuth, rateLimit } from "../middleware/auth";

const router = express.Router();

// Lazy initialization to ensure environment variables are loaded
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    // This is using Replit's AI Integrations service, which provides OpenAI-compatible API access without requiring your own OpenAI API key.
    openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
    });
  }
  return openai;
}

const exerciseLimiter = rateLimit(15, 60 * 1000);

type ExerciseType = "vocab" | "translation" | "fillblank" | "sentencebuilding" | "multiplechoice";
type LanguageKey = "english" | "spanish" | "french" | "chinese" | "japanese";

interface GeneratedExercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  answer: string | string[];
  explain?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

router.post("/generate", requireAuth, exerciseLimiter, async (req, res) => {
  try {
    const { language, type, difficulty = "beginner", count = 5 } = req.body;

    if (!language || !type) {
      return res.status(400).json({ error: "Language and type are required" });
    }

    const prompt = buildPrompt(language, type, difficulty, count);
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a language learning expert who creates engaging, educational exercises. Return only valid JSON without any markdown formatting or code blocks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const content = completion.choices[0].message.content || "[]";
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let exercises: GeneratedExercise[];
    try {
      const parsed = JSON.parse(cleanContent);
      // Handle both direct array and object with exercises array
      exercises = Array.isArray(parsed) ? parsed : (parsed.exercises || []);
    } catch (parseError) {
      console.error("Failed to parse AI response:", cleanContent);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const formattedExercises = exercises.map((ex, idx) => ({
      ...ex,
      id: `ai_${type}_${Date.now()}_${idx}`,
      lang: language as LanguageKey,
      type: type as ExerciseType,
    }));

    res.json({ exercises: formattedExercises });
  } catch (error) {
    console.error("AI exercise generation error:", error);
    res.status(500).json({ error: "Failed to generate exercises" });
  }
});

function buildPrompt(language: string, type: string, difficulty: string, count: number): string {
  const prompts: Record<ExerciseType, string> = {
    vocab: `Generate ${count} vocabulary exercises for ${language} at ${difficulty} level. 
For each exercise:
- Create a question asking for translation or meaning
- Provide 4 multiple choice options
- Include the correct answer
- Add a brief explanation

Return ONLY a JSON object with an "exercises" array:
{
  "exercises": [{
    "question": "What does 'palabra' mean in English?",
    "options": ["word", "speak", "language", "write"],
    "answer": "word",
    "explain": "Palabra is the Spanish word for 'word'",
    "difficulty": "${difficulty}"
  }]
}`,

    translation: `Generate ${count} translation exercises for ${language} at ${difficulty} level.
For each exercise:
- Provide a sentence or phrase to translate
- Accept multiple valid translations as an array
- Include explanation

Return ONLY a JSON object with an "exercises" array:
{
  "exercises": [{
    "question": "Translate to ${language}: Hello, how are you?",
    "answer": ["Hola, ¿cómo estás?", "Hola, como estas?"],
    "explain": "Common greeting in ${language}",
    "difficulty": "${difficulty}"
  }]
}`,

    fillblank: `Generate ${count} fill-in-the-blank exercises for ${language} at ${difficulty} level.
For each exercise:
- Create a sentence with a missing word (use ___ for blank)
- Provide 4 options
- Include correct answer and explanation

Return ONLY a JSON object with an "exercises" array:
{
  "exercises": [{
    "question": "Je ___ français. (I speak French)",
    "options": ["parle", "parles", "parlons", "parler"],
    "answer": "parle",
    "explain": "First person singular of parler",
    "difficulty": "${difficulty}"
  }]
}`,

    sentencebuilding: `Generate ${count} sentence building exercises for ${language} at ${difficulty} level.
For each exercise:
- Provide words to arrange into a correct sentence
- Show the English meaning
- Include the correct word order as answer

Return ONLY a JSON object with an "exercises" array:
{
  "exercises": [{
    "question": "Arrange these words: 'estoy / bien / muy' (I am very well)",
    "options": ["estoy muy bien", "muy estoy bien", "bien muy estoy", "muy bien estoy"],
    "answer": "estoy muy bien",
    "explain": "Correct word order in Spanish: subject + adverb + adjective",
    "difficulty": "${difficulty}"
  }]
}`,

    multiplechoice: `Generate ${count} multiple choice questions about ${language} grammar and culture at ${difficulty} level.
For each exercise:
- Ask about grammar rules, cultural facts, or language usage
- Provide 4 options
- Include correct answer and explanation

Return ONLY a JSON object with an "exercises" array:
{
  "exercises": [{
    "question": "Which particle is used for direct objects in Japanese?",
    "options": ["を (wo)", "は (wa)", "が (ga)", "に (ni)"],
    "answer": "を (wo)",
    "explain": "を marks the direct object of a verb",
    "difficulty": "${difficulty}"
  }]
}`,
  };

  return prompts[type as ExerciseType] || prompts.vocab;
}

export default router;
