import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LANGUAGES } from "@/data/languages";
import { ChallengeItem, ChallengeType, generateChallenges } from "@/data/challenges";
import { toast } from "sonner";

const TOPICS = [
  { name: "Basics & Alphabet", goals: ["Learn common letters/sounds", "Essential words"], minutes: 10 },
  { name: "Greetings & Introductions", goals: ["Introduce yourself", "Polite phrases"], minutes: 12 },
  { name: "Numbers & Time", goals: ["1-100", "Ask the time"], minutes: 15 },
  { name: "Food & Travel", goals: ["Order at a cafe", "Ask directions"], minutes: 15 },
  { name: "Grammar A1", goals: ["Basic tenses", "Articles & plurals"], minutes: 18 },
];

function MCQ({ q, onSelect, selected }: { q: ChallengeItem; onSelect: (v: string) => void; selected: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {q.options!.map((opt) => (
        <button key={opt} onClick={() => onSelect(opt)} className={`rounded-xl border px-3 py-2 text-left ${selected === opt ? "border-primary bg-primary/10" : "hover:bg-accent"}`}>{opt}</button>
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

  const questions = useMemo(() => generateChallenges(type, language?.key, 6), [type, language?.key]);
  const q = questions[index];
  const percent = Math.round(((index) / questions.length) * 100);

  if (!language) return <div className="text-sm text-muted-foreground">Language not found.</div>;

  const submit = () => {
    if (!q) return;
    const correctAns = Array.isArray(q.answer) ? q.answer.map((a) => a.toString().toLowerCase()) : [q.answer.toString().toLowerCase()];
    const user = q.options ? (selected || "").toLowerCase() : input.trim().toLowerCase();
    const ok = correctAns.includes(user);
    if (ok) { setScore((s) => s + 1); toast.success("Correct!"); } else { toast.error("Try again", { description: `Answer: ${Array.isArray(q.answer) ? q.answer[0] : q.answer}` }); }
    if (index + 1 < questions.length) { setIndex(index + 1); setSelected(null); setInput(""); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl grid place-items-center text-white" style={{ backgroundColor: `hsl(var(${language.colorVar}))` }}>{language.emoji}</div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{language.name} Lessons</h1>
          <p className="text-sm text-muted-foreground">Topic overview, practice and quizzes.</p>
        </div>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Topic Overview</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          {TOPICS.map((t) => (
            <div key={t.name} className="rounded-xl border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">~{t.minutes} min</div>
              </div>
              <ul className="text-sm text-muted-foreground list-disc pl-5 mt-1">
                {t.goals.map((g) => (<li key={g}>{g}</li>))}
              </ul>
            </div>
          ))}
        </CardContent>
      </Card>

      <Tabs value={type} onValueChange={(v) => setType(v as ChallengeType)}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="vocab">Practice</TabsTrigger>
          <TabsTrigger value="translation">Quiz</TabsTrigger>
          <TabsTrigger value="phrase">Phrases</TabsTrigger>
        </TabsList>
        <TabsContent value={type}>
          <Card className="rounded-2xl">
            <CardHeader className="pb-2"><CardTitle className="text-base">{type === 'vocab' ? 'Practice' : 'Quiz'}</CardTitle></CardHeader>
            <CardContent className="pt-0 space-y-4">
              <div className="rounded-xl border p-3">
                <div className="flex items-center justify-between mb-2 text-sm"><span>Progress</span><span>{index} / {questions.length}</span></div>
                <Progress value={percent} style={{ ["--progress-color"]: `hsl(var(${language.colorVar}))` } as React.CSSProperties} />
              </div>

              {q && (
                <>
                  <div className="text-lg font-medium">{q.question}</div>
                  {q.options ? (
                    <MCQ q={q} onSelect={setSelected} selected={selected} />
                  ) : (
                    <div className="grid gap-2">
                      <Label htmlFor="answer">Your answer</Label>
                      <Input id="answer" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here" />
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-muted-foreground">Score: {score}</div>
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
