import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSupabase } from "@/lib/supabase";

type Entry = { id: string; text: string; corrected?: string; ts: number };
const STORE_KEY = "ltai_journal";

function analyze(text: string) {
  const suggestions: { from: string; to: string; reason: string }[] = [];
  // basic fixes
  if (/\si\s/g.test(text))
    suggestions.push({ from: " i ", to: " I ", reason: "Capitalize 'I'" });
  if (/\s{2,}/g.test(text))
    suggestions.push({ from: "  ", to: " ", reason: "Remove double spaces" });
  if (/definately/gi.test(text))
    suggestions.push({
      from: "definately",
      to: "definitely",
      reason: "Common misspelling",
    });
  if (/recieve/gi.test(text))
    suggestions.push({
      from: "recieve",
      to: "receive",
      reason: "Common misspelling",
    });
  // sentence case
  const sentenceStart = text.replace(
    /(^|[.!?]\s+)([a-z])/g,
    (m, p1, p2) => p1 + p2.toUpperCase(),
  );
  if (sentenceStart !== text)
    suggestions.push({
      from: "<sentence>",
      to: "<Sentence>",
      reason: "Capitalize sentence starts",
    });
  return suggestions;
}

function applyAll(text: string, suggestions: { from: string; to: string }[]) {
  let out = text;
  for (const s of suggestions) {
    if (s.from === "<sentence>") {
      out = out.replace(
        /(^|[.!?]\s+)([a-z])/g,
        (m, p1, p2) => p1 + p2.toUpperCase(),
      );
    } else {
      const re = new RegExp(s.from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
      out = out.replace(re, s.toString ? s.to : s.to);
    }
  }
  return out;
}

export default function Journal() {
  const [text, setText] = useState("");
  const [history, setHistory] = useState<Entry[]>([]);
  const suggestions = useMemo(() => analyze(text), [text]);

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

  const save = (entry: Entry[]) =>
    localStorage.setItem(STORE_KEY, JSON.stringify(entry));

  const correct = () => {
    const corrected = applyAll(text, suggestions);
    setText(corrected);
    toast.success("Applied corrections");
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
      return;
    }
    const e: Entry = { id: String(Date.now()), text, ts: Date.now() };
    const next = [e, ...history].slice(0, 20);
    setHistory(next);
    save(next);
    toast.success("Saved entry");
  };

  const load = (e: Entry) => setText(e.text);

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">AI Journaling</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your thoughts or practice sentences here..."
            className="min-h-40"
          />
          {suggestions.length > 0 ? (
            <div className="rounded-xl border p-3 text-sm">
              <div className="font-medium mb-2">Suggestions</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {suggestions.map((s, i) => (
                  <li key={i}>
                    {s.reason}: replace "{s.from}" with "{s.to}"
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={correct}>
                  Apply all
                </Button>
                <Button size="sm" variant="secondary" onClick={onSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No suggestions yet. Try writing a few sentences.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 grid gap-2">
          {history.length === 0 && (
            <div className="text-sm text-muted-foreground">
              No entries saved yet.
            </div>
          )}
          {history.map((e) => (
            <button
              key={e.id}
              onClick={() => load(e)}
              className="rounded-xl border p-3 text-left hover:bg-accent"
            >
              <div className="text-xs text-muted-foreground">
                {new Date(e.ts).toLocaleString()}
              </div>
              <div className="line-clamp-2 text-sm mt-1">{e.text}</div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
