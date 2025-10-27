import express from "express";
import OpenAI from "openai";
import { requireAuth, rateLimit } from "../middleware/auth";

const router = express.Router();

let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
    });
  }
  return openai;
}

const lessonLimiter = rateLimit(10, 60 * 1000);

interface GeneratedLesson {
  name: string;
  goals: string[];
  minutes: number;
  description: string;
  vocabulary: { word: string; translation: string; example: string }[];
  grammar: { point: string; explanation: string; examples: string[] }[];
  culturalNotes: string[];
}

router.post("/generate", requireAuth, lessonLimiter, async (req, res) => {
  try {
    const { language, topic, level = "beginner" } = req.body;

    if (!language || !topic) {
      return res.status(400).json({ error: "Language and topic are required" });
    }

    const prompt = buildLessonPrompt(language, topic, level);
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert language teacher who creates comprehensive, engaging lessons. Return only valid JSON without any markdown formatting or code blocks."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 1024,
    });

    const content = completion.choices[0].message.content || "{}";
    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let lesson: GeneratedLesson;
    try {
      const parsed = JSON.parse(cleanContent);
      lesson = parsed.lesson || parsed;
      
      // Validate that we have the required fields
      if (!lesson.name || !Array.isArray(lesson.goals) || !Array.isArray(lesson.vocabulary)) {
        console.error("Invalid lesson structure from AI:", lesson);
        return res.status(500).json({ error: "Invalid lesson structure from AI" });
      }
    } catch (parseError) {
      console.error("Failed to parse AI lesson response:", cleanContent);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    res.json({ lesson });
  } catch (error: any) {
    console.error("AI lesson generation error:", error);
    
    // Handle OpenAI-specific errors
    if (error?.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    if (error?.status === 401) {
      return res.status(502).json({ error: "AI service authentication failed" });
    }
    
    res.status(500).json({ error: "Failed to generate lesson" });
  }
});

function buildLessonPrompt(language: string, topic: string, level: string): string {
  return `Create a comprehensive ${level}-level lesson for learning ${language} on the topic "${topic}".

Generate a complete lesson with the following structure:

{
  "lesson": {
    "name": "${topic}",
    "goals": [
      "Goal 1: What students will learn",
      "Goal 2: Key skills to master",
      "Goal 3: Practical applications"
    ],
    "minutes": 20,
    "description": "A detailed 2-3 sentence overview of what this lesson covers and why it's important for ${language} learners at ${level} level.",
    "vocabulary": [
      {
        "word": "${language} word or phrase",
        "translation": "English translation",
        "example": "Example sentence using the word in ${language}"
      }
    ],
    "grammar": [
      {
        "point": "Grammar concept name",
        "explanation": "Clear explanation of the grammar rule",
        "examples": [
          "Example 1 in ${language}",
          "Example 2 in ${language}",
          "Example 3 in ${language}"
        ]
      }
    ],
    "culturalNotes": [
      "Interesting cultural insight 1",
      "Interesting cultural insight 2",
      "Practical cultural tip 3"
    ]
  }
}

Important guidelines:
- Include 8-12 vocabulary items with practical examples
- Provide 3-5 key grammar points with clear explanations
- Add 3-5 cultural notes that give context
- Make it engaging and practical for ${level} learners
- Use authentic ${language} examples
- Ensure all content is accurate and culturally appropriate`;
}

export default router;
