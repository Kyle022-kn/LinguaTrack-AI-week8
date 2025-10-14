import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LANGUAGES } from "@/data/languages";
import { TOPIC_CONTENT, TopicContent } from "@shared/topic-content";
import { getSupabase } from "@/lib/supabase";
import {
  ChallengeItem,
  ChallengeType,
  generateChallenges,
} from "@/data/challenges";
import { toast } from "sonner";
import { BookOpen, Clock, Globe, Sparkles, Loader2 } from "lucide-react";

function MCQ({
  q,
  onSelect,
  selected,
}: {
  q: ChallengeItem;
  onSelect: (v: string) => void;
  selected: string | null;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {q.options!.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`rounded-xl border px-3 py-2 text-left transition-colors ${selected === opt ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function LessonDetail() {
  const { lang } = useParams();
  const language = LANGUAGES.find((l) => l.key === lang);
  const [type, setType] = useState<ChallengeType>("vocab");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const [overrideQs, setOverrideQs] = useState<ChallengeItem[] | null>(null);
  const questions = useMemo(() => {
    if (overrideQs && overrideQs.length) {
      const filtered = overrideQs.filter((q) => q.type === type);
      return (filtered.length ? filtered : overrideQs).slice(0, 6);
    }
    return generateChallenges(type, language?.key, 6);
  }, [type, language?.key, overrideQs]);
  const q = questions[index];
  const percent = Math.round((index / questions.length) * 100);

  const [topics, setTopics] = useState<TopicContent[]>(
    TOPIC_CONTENT[language?.key || ""] || []
  );
  const [aiTopic, setAiTopic] = useState("");
  const [aiLevel, setAiLevel] = useState<string>("beginner");
  const [generatingLesson, setGeneratingLesson] = useState(false);

  useEffect(() => {
    const sb = getSupabase();
    if (!sb || !language?.key) return;
    (async () => {
      const { data: lessons } = await sb
        .from("lessons")
        .select("title,content,language")
        .eq("language", language.key);
      if (lessons && lessons.length) {
        const mapped = lessons.map((l: any) => ({
          name: l.title,
          goals: Array.isArray(l.content?.goals) ? l.content.goals : [],
          minutes:
            typeof l.content?.minutes === "number" ? l.content.minutes : 10,
          description: l.content?.description || "",
          vocabulary: l.content?.vocabulary || [],
          grammar: l.content?.grammar || [],
          culturalNotes: l.content?.culturalNotes || [],
        }));
        setTopics(mapped);
      } else {
        setTopics(TOPIC_CONTENT[language.key] || []);
      }
      const { data: quizRows } = await sb
        .from("quizzes")
        .select("questions,language")
        .eq("language", language.key)
        .limit(1)
        .single();
      if (quizRows?.questions && Array.isArray(quizRows.questions)) {
        const mapped: ChallengeItem[] = quizRows.questions.map(
          (q: any, idx: number) => ({
            id: `db_${idx}`,
            lang: language.key as any,
            type:
              (q.type as ChallengeType) ||
              (q.options ? "vocab" : "translation"),
            question: String(q.question || ""),
            options: Array.isArray(q.options) ? q.options : undefined,
            answer: q.answer ?? "",
            explain: q.explain,
          }),
        );
        setOverrideQs(mapped);
      }
    })();
  }, [language?.key]);

  if (!language)
    return (
      <div className="text-sm text-muted-foreground">Language not found.</div>
    );

  const generateAILesson = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    
    if (!language?.name) {
      toast.error("Language not selected");
      return;
    }
    
    const sessionToken = localStorage.getItem("ltai_session");
    if (!sessionToken) {
      toast.error("Please log in to generate lessons");
      return;
    }
    
    setGeneratingLesson(true);
    try {
      const response = await fetch("/api/ai/lessons/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          language: language.name,
          topic: aiTopic,
          level: aiLevel,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to generate lesson" }));
        throw new Error(errorData.error || "Failed to generate lesson");
      }

      const data = await response.json();
      setTopics([data.lesson, ...topics]);
      setAiTopic("");
      toast.success("AI Lesson Generated!", { 
        description: `New lesson on "${data.lesson.name}" has been added` 
      });
    } catch (error: any) {
      toast.error("Failed to generate lesson", { 
        description: error.message || "Please try again" 
      });
    } finally {
      setGeneratingLesson(false);
    }
  };

  const submit = () => {
    if (!q) return;
    const correctAns = Array.isArray(q.answer)
      ? q.answer.map((a) => a.toString().toLowerCase())
      : [q.answer.toString().toLowerCase()];
    const user = q.options
      ? (selected || "").toLowerCase()
      : input.trim().toLowerCase();
    const ok = correctAns.includes(user);
    if (ok) {
      setScore((s) => s + 1);
      toast.success("Correct!");
    } else {
      toast.error("Try again", {
        description: `Answer: ${Array.isArray(q.answer) ? q.answer[0] : q.answer}`,
      });
    }
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setInput("");
    }
  };

  return (
    <div className="space-y-5 pb-20 md:pb-5">
      <div className="flex items-center gap-3">
        <div
          className="size-10 sm:size-12 rounded-xl grid place-items-center text-white text-xl sm:text-2xl"
          style={{ backgroundColor: `hsl(var(${language.colorVar}))` }}
        >
          {language.emoji}
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {language.name} Lessons
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive learning materials
          </p>
        </div>
      </div>

      <Card className="rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            Generate AI-Powered Lesson
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Create a custom lesson on any topic using AI. Perfect for exploring specific areas of interest! Note: AI-generated lessons are temporary and will reset on page reload.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ai-topic">Topic</Label>
              <Input
                id="ai-topic"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g., Food ordering, Weather, Business"
                disabled={generatingLesson}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-level">Level</Label>
              <select
                id="ai-level"
                value={aiLevel}
                onChange={(e) => setAiLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                disabled={generatingLesson}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={generateAILesson} 
            disabled={generatingLesson || !aiTopic.trim()}
            className="w-full sm:w-auto"
          >
            {generatingLesson ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="size-4 mr-2" />
                Generate Lesson
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {topics.map((topic, idx) => (
          <Card key={idx} className="rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-lg mb-2">
                    {topic.name}
                  </CardTitle>
                  <div className="flex gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-xs">
                      <Clock className="size-3 mr-1" />
                      {topic.minutes} min
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <BookOpen className="size-3 mr-1" />
                      {topic.goals.length} goals
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {topic.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 space-y-4">
              {topic.goals.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="size-4 text-primary" />
                    Learning Goals
                  </h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {topic.goals.map((g: string, i: number) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {topic.vocabulary && topic.vocabulary.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Key Vocabulary</h4>
                  <div className="grid gap-2">
                    {topic.vocabulary.slice(0, 4).map((v, i) => (
                      <div key={i} className="p-2 rounded-lg bg-muted/50 text-sm">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="font-medium">{v.word}</span>
                          <span className="text-xs text-muted-foreground">
                            {v.translation}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground italic">
                          "{v.example}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topic.grammar && topic.grammar.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Grammar Points</h4>
                  <div className="space-y-2">
                    {topic.grammar.map((g, i) => (
                      <div key={i} className="p-3 rounded-lg border text-sm">
                        <div className="font-medium mb-1">{g.point}</div>
                        <div className="text-xs text-muted-foreground mb-2">
                          {g.explanation}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {g.examples.map((ex, j) => (
                            <Badge key={j} variant="secondary" className="text-xs">
                              {ex}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {topic.culturalNotes && topic.culturalNotes.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Globe className="size-4 text-primary" />
                    Cultural Notes
                  </h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                    {topic.culturalNotes.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as ChallengeType)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="vocab">Practice</TabsTrigger>
          <TabsTrigger value="translation">Quiz</TabsTrigger>
          <TabsTrigger value="phrase">Phrases</TabsTrigger>
        </TabsList>
        <TabsContent value={type}>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {type === "vocab" ? "Practice" : "Quiz"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span>Progress</span>
                  <span>
                    {index} / {questions.length}
                  </span>
                </div>
                <Progress
                  value={percent}
                  style={
                    {
                      ["--progress-color"]: `hsl(var(${language.colorVar}))`,
                    } as React.CSSProperties
                  }
                />
              </div>

              {q && (
                <>
                  <div className="text-lg font-medium">{q.question}</div>
                  {q.options ? (
                    <MCQ q={q} onSelect={setSelected} selected={selected} />
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="answer">Your answer</Label>
                      <Input
                        id="answer"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type here"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">
                      Score: {score}
                    </div>
                    <Button onClick={submit}>Check</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
