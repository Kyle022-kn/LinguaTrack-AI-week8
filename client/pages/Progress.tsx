import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as Bar } from "@/components/ui/progress";
import { LANGUAGES } from "@/data/languages";
import { Award, CalendarClock } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { getSupabase } from "@/lib/supabase";

function Radial({ value = 0, colorVar }: { value: number; colorVar: `--lang-${string}` }) {
  const r = 36; const c = 2 * Math.PI * r; const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;
  return (
    <svg viewBox="0 0 80 80" className="w-20 h-20">
      <circle cx="40" cy="40" r={r} fill="none" stroke="hsl(var(--muted-foreground))" strokeOpacity="0.2" strokeWidth="8" />
      <circle cx="40" cy="40" r={r} fill="none" stroke={`hsl(var(${colorVar}))`} strokeWidth="8" strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform="rotate(-90 40 40)" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-sm font-semibold fill-current">{pct}%</text>
    </svg>
  );
}

export default function Progress() {
  const data = useMemo(() => Array.from({ length: 8 }).map((_, i) => ({ day: `D${i+1}`, xp: Math.round(20 + Math.sin(i) * 10 + i * 3) })), []);
  const [prog, setProg] = useState<Record<string, number>>({});

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data, error } = await supabase.from("progress").select("lang,value");
      if (error) return;
      const map: Record<string, number> = {};
      for (const r of data || []) map[r.lang] = r.value;
      setProg(map);
    })();
  }, []);
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Weekly Activity</h3>
          <div className="text-sm text-muted-foreground flex items-center gap-2"><CalendarClock className="size-4" /> Last 8 days</div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
              <XAxis dataKey="day" hide tickLine={false} axisLine={false} />
              <YAxis hide domain={[0, "dataMax + 10"]} />
              <Tooltip contentStyle={{ borderRadius: 12 }} />
              <Line type="monotone" dataKey="xp" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Fluency by Language</h3>
        <div className="grid grid-cols-5 gap-3">
          {LANGUAGES.map((l) => {
            const val = prog[l.key] ?? l.progress;
            return (
              <Card key={l.key} className="rounded-2xl">
                <CardContent className="p-3 text-center space-y-2">
                  <div className="text-2xl" aria-hidden>{l.emoji}</div>
                  <Radial value={val} colorVar={l.colorVar} />
                  <div className="text-xs font-medium">{l.name}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Milestones & Badges</h3>
        <div className="grid grid-cols-3 gap-3">
          {["7-day Streak", "100 XP", "First Quiz"].map((b) => (
            <Card key={b} className="rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 grid place-items-center text-primary"><Award className="size-5" /></div>
                <div>
                  <div className="text-sm font-medium">{b}</div>
                  <div className="text-xs text-muted-foreground">Unlocked</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-semibold mb-2">Estimated Fluency Timeline</h3>
        <p className="text-sm text-muted-foreground">Reach B1 in 5 months with 10–15 min daily.</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {LANGUAGES.slice(0,3).map((l) => {
            const val = prog[l.key] ?? l.progress;
            return (
              <div key={l.key} className="rounded-xl border p-3">
                <div className="text-xs text-muted-foreground">{l.name}</div>
                <Bar value={val} className="h-2 mt-2" style={{ ["--progress-color"]: `hsl(var(${l.colorVar}))` } as React.CSSProperties} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
