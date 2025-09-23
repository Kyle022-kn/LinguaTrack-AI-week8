import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LANGUAGES } from "@/data/languages";
import { ChallengeType, ChallengeItem, generateChallenges } from "@/data/challenges";
import { Check, ChevronRight, RefreshCw } from "lucide-react";
import { toast } from "sonner";

function normalize(a: string) {
  return a.trim().toLowerCase().replaceAll("á", "a").replaceAll("é", "e").replaceAll("í", "i").replaceAll("ó", "o").replaceAll("ú", "u");
}

export default function Challenge() {
  const [type, setType] = useState<ChallengeType>("vocab");
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [langKey, setLangKey] = useState(LANGUAGES[0].key);

  const questions = useMemo(() => generateChallenges(type, langKey), [type, langKey]);
  const q = questions[index];
  const percent = Math.round(((index) / questions.length) * 100);

  useEffect(() => {
    setIndex(0); setScore(0); setSelected(null); setInput("");
  }, [type, langKey]);

  const submit = () => {
    if (!q) return;
    const correctAns = Array.isArray(q.answer) ? q.answer.map((a) => normalize(a)) : [normalize(q.answer)];
    const user = q.options ? (selected ? normalize(selected) : "") : normalize(input);
    const ok = correctAns.includes(user);

    if (ok) {
      setScore((s) => s + 1);
      toast.success("Correct!", { description: q.explain || "Great job!" });
    } else {
      toast.error("Not quite", { description: `Answer: ${Array.isArray(q.answer) ? q.answer[0] : q.answer}` });
    }

    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setInput("");
    } else {
      const streakKey = "ltai_streak";
      const prev = Number(localStorage.getItem(streakKey) || 7);
      localStorage.setItem(streakKey, String(prev + 1));
      toast("Challenge complete", { description: `Score ${score + (ok ? 1 : 0)} / ${questions.length}` });
    }
  };

  const reset = () => {
    setIndex(0); setScore(0); setSelected(null); setInput("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Daily Challenge</div>
        <button onClick={reset} className="text-sm text-primary inline-flex items-center gap-1"><RefreshCw className="size-4" /> Reset</button>
      </div>

      <div className="rounded-xl border p-4">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span>Progress</span>
          <span>{index} / {questions.length}</span>
        </div>
        <Progress value={percent} />
      </div>

      <Tabs value={type} onValueChange={(v) => setType(v as ChallengeType)}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="vocab">Vocab</TabsTrigger>
          <TabsTrigger value="translation">Translate</TabsTrigger>
          <TabsTrigger value="phrase">Phrase</TabsTrigger>
          <TabsTrigger value="kanji">Kanji</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-5 gap-2">
        {LANGUAGES.map((l) => (
          <button
            key={l.key}
            onClick={() => setLangKey(l.key)}
            className={`rounded-xl px-2 py-2 text-sm border ${langKey === l.key ? "ring-2 ring-primary" : "hover:bg-accent"}`}
          >
            <span className="text-lg" aria-hidden>{l.emoji}</span> {l.name.slice(0,2)}
          </button>
        ))}
      </div>

      {q && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">Question {index + 1}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-lg font-medium">{q.question}</div>

            {q.options ? (
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSelected(opt)}
                    className={`rounded-xl border px-3 py-2 text-left ${selected === opt ? "border-primary bg-primary/10" : "hover:bg-accent"}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="answer">Your answer</Label>
                <Input id="answer" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type here" />
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">Score: {score}</div>
              <Button onClick={submit} className="inline-flex items-center gap-2">
                <Check className="size-4" /> Check <ChevronRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
