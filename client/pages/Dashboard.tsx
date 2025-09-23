import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LANGUAGES } from "@/data/languages";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Award, BarChart3, BookOpenCheck, Flame, LayoutGrid, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome{user?.name ? `, ${user.name}` : ""}</p>
            <h2 className="text-2xl font-extrabold tracking-tight">Your daily boost</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-600">
            <Flame className="size-4" />
            <span className="text-sm font-semibold">7 day streak</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link to="/challenge" className="block">
            <Button className="w-full h-12 text-base font-semibold">
              <Sparkles className="mr-2 size-5" /> Daily Challenge
            </Button>
          </Link>
          <Link to="/progress" className="block">
            <Button variant="secondary" className="w-full h-12 text-base font-semibold">
              <BarChart3 className="mr-2 size-5" /> View Progress
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Your Languages</h3>
          <Link to="/lessons" className="text-sm text-primary">See all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((l) => (
            <Link key={l.key} to={l.path} className="group">
              <Card className="rounded-2xl overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-xl grid place-items-center text-white font-semibold"
                      style={{ backgroundColor: `hsl(var(${l.colorVar}))` }}
                    >
                      <span className="text-lg" aria-hidden>{l.emoji}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{l.name}</div>
                      <Progress value={l.progress} className="h-2 mt-2" style={{ ["--progress-color"]: `hsl(var(${l.colorVar}))` } as React.CSSProperties} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link to="/lessons" className="block">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><BookOpenCheck className="size-4" /> Lessons</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">Practice & Quiz</CardContent>
          </Card>
        </Link>
        <Link to="/community" className="block">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><LayoutGrid className="size-4" /> Community</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">Coming soon</CardContent>
          </Card>
        </Link>
        <Link to="/profile" className="block">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Award className="size-4" /> Profile</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">Badges & Streak</CardContent>
          </Card>
        </Link>
        <Link to="/support" className="block">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="size-4" /> Support</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-muted-foreground">Help center</CardContent>
          </Card>
        </Link>
        {user?.role === "admin" && (
          <Link to="/admin" className="block col-span-2">
            <Card className={cn("rounded-2xl border-primary/20 bg-primary/5") }>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                Manage Lessons, Challenges, Community, Users
              </CardContent>
            </Card>
          </Link>
        )}
      </section>
    </div>
  );
}
