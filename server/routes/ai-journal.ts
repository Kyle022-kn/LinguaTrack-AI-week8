import { RequestHandler } from "express";
import OpenAI from "openai";

// Lazy initialization to ensure environment variables are loaded
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
      baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    });
  }
  return openai;
}

export const handleAnalyzeJournal: RequestHandler = async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const language = targetLanguage || "English";
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-5-mini", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a language learning assistant. Analyze the user's text for grammar, spelling, vocabulary, and language learning insights. Provide:
1. Corrected version of the text
2. List of specific corrections with explanations
3. Vocabulary suggestions for language learners
4. Overall feedback on their ${language} writing

Format your response as JSON with this structure:
{
  "corrected": "corrected text here",
  "corrections": [{"from": "original", "to": "corrected", "reason": "explanation"}],
  "vocabulary": [{"word": "word", "meaning": "definition", "example": "example sentence"}],
  "feedback": "overall encouraging feedback"
}`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
      max_completion_tokens: 8192,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    res.json(result);
  } catch (error) {
    console.error("AI analysis error:", error);
    res.status(500).json({ error: "Analysis failed" });
  }
};

export const handleGeneratePrompts: RequestHandler = async (req, res) => {
  try {
    const { language, level } = req.body;
    
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-5-mini", // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `Generate 5 creative journaling prompts for ${level || "beginner"} ${language || "English"} language learners. Make them engaging and appropriate for their level.`
        },
        {
          role: "user",
          content: "Generate journaling prompts"
        }
      ],
      max_completion_tokens: 8192,
    });

    const prompts = completion.choices[0].message.content?.split('\n').filter(p => p.trim().length > 0) || [];
    res.json({ prompts });
  } catch (error) {
    console.error("Prompt generation error:", error);
    res.status(500).json({ error: "Prompt generation failed" });
  }
};
