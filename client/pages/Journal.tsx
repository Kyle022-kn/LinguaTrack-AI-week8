import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase";
import { Sparkles, Book, Lightbulb, Save, Wand2 } from "lucide-react";

type Entry = { id: string; text: string; corrected?: string; ts: number };
type AIAnalysis = {
  corrected: string;
  corrections: { from: string; to: string; reason: string }[];
  vocabulary: { word: string; meaning: string; example: string }[];
  feedback: string;
};

const STORE_KEY = "ltai_journal";

export default function Journal() {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [targetLang, setTargetLang] = useState("English");

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch {}
      return;
    }
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data, error } = await supabase
        .from("journal_entries")
        .select("id,text,ts")
        .order("ts", { ascending: false })
        .limit(50);
      if (error) {
        toast.error("Failed to load journal");
        return;
      }
      const mapped = (data || []).map((d: any) => ({
        id: String(d.id),
        text: d.text,
        ts: new Date(d.ts).getTime(),
      })) as Entry[];
      setHistory(mapped);
    })();
  }, []);

  const analyzeWithAI = async () => {
    if (!text.trim()) {
      toast.error("Please write something first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/ai/analyze-journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLanguage: targetLang }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      setAnalysis(result);
      toast.success("AI analysis complete!");
    } catch (error) {
      toast.error("AI analysis failed. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPrompts = async () => {
    try {
      const response = await fetch("/api/ai/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: targetLang, level: "beginner" }),
      });

      if (!response.ok) throw new Error("Failed to get prompts");

      const result = await response.json();
      setPrompts(result.prompts || []);
      toast.success("New prompts generated!");
    } catch (error) {
      toast.error("Failed to generate prompts");
    }
  };

  const applyCorrected = () => {
    if (analysis?.corrected) {
      setText(analysis.corrected);
      toast.success("Applied corrections");
    }
  };

  const onSave = async () => {
    const supabase = getSupabase();
    if (supabase) {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        toast.error("Please sign in");
        return;
      }
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ user_id: auth.user.id, text })
        .select("id,ts")
        .single();
      if (error) {
        toast.error("Save failed");
        return;
      }
      const e: Entry = {
        id: String(data.id),
        text,
        ts: new Date(data.ts).getTime(),
      };
      const next = [e, ...history].slice(0, 50);
      setHistory(next);
      toast.success("Saved entry");
      setText("");
      setAnalysis(null);
      return;
    }
    const e: Entry = { id: String(Date.now()), text, ts: Date.now() };
    const next = [e, ...history].slice(0, 20);
    setHistory(next);
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    toast.success("Saved entry");
    setText("");
    setAnalysis(null);
  };

  const load = (e: Entry) => {
    setText(e.text);
    setAnalysis(null);
  };

  return (
    <div className="space-y-5 pb-20 md:pb-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            AI Journaling
          </h1>
          <p className="text-sm text-muted-foreground">
            Practice writing with AI-powered feedback
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="h-9 rounded-md border px-3 text-sm"
          >
            <option>English</option>
            <option>Spanish</option>
            <option>French</option>
            <option>Japanese</option>
            <option>Chinese</option>
          </select>
          <Button size="sm" variant="outline" onClick={getPrompts}>
            <Lightbulb className="size-4 mr-1" />
            Get Prompts
          </Button>
        </div>
      </div>

      {prompts.length > 0 && (
        <Card className="rounded-2xl border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Writing Prompts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {prompts.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => setText(prompt.replace(/^\d+\.\s*/, ""))}
                  className="block w-full text-left text-sm p-2 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl">
        <CardContent className="pt-6 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setAnalysis(null);
            }}
            placeholder="Write your thoughts or practice sentences here... Try describing your day, writing a story, or answering a prompt!"
            className="min-h-40 resize-none"
          />
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={analyzeWithAI} 
              disabled={isAnalyzing || !text.trim()}
              className="gap-2"
            >
              <Wand2 className="size-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
            </Button>
            <Button 
              onClick={onSave}
              disabled={!text.trim()}
              variant="secondary"
              className="gap-2"
            >
              <Save className="size-4" />
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <Tabs defaultValue="corrections" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="corrections">Corrections</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="corrections" className="space-y-3">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Corrected Version</span>
                  <Button size="sm" onClick={applyCorrected}>
                    Apply
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm bg-muted/50 p-3 rounded-lg">
                  {analysis.corrected}
                </p>
              </CardContent>
            </Card>

            {analysis.corrections.length > 0 && (
              <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Detailed Corrections</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {analysis.corrections.map((c, i) => (
                    <div key={i} className="p-3 rounded-lg border text-sm">
                      <div className="flex gap-2 items-center mb-1">
                        <Badge variant="destructive" className="text-xs">
                          {c.from}
                        </Badge>
                        <span>→</span>
                        <Badge variant="default" className="text-xs">
                          {c.to}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.reason}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="vocabulary">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Book className="size-4" />
                  Vocabulary Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {analysis.vocabulary.map((v, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <div className="font-medium text-sm mb-1">{v.word}</div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {v.meaning}
                    </div>
                    <div className="text-xs bg-muted/50 p-2 rounded italic">
                      "{v.example}"
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <Card className="rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Overall Feedback</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm leading-relaxed">{analysis.feedback}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Previous Entries</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid gap-2">
          {history.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No entries saved yet. Start writing above!
            </div>
          )}
          {history.slice(0, 10).map((e) => (
            <button
              key={e.id}
              onClick={() => load(e)}
              className="rounded-xl border p-3 text-left hover:bg-accent transition-colors"
            >
              <div className="text-xs text-muted-foreground mb-1">
                {new Date(e.ts).toLocaleString()}
              </div>
              <div className="line-clamp-2 text-sm">{e.text}</div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
