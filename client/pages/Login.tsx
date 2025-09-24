import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LogIn, SquarePen } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("learner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login({ email, password });
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="mx-auto max-w-md px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-2xl bg-primary/15 grid place-items-center">
            <SquarePen className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">LinguaTrack AI</h1>
            <p className="text-sm text-muted-foreground">Personalized Learning, Smarter & Faster</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Welcome back</h2>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Select role</Label>
              <ToggleGroup type="single" value={role} onValueChange={(v) => v && setRole(v as UserRole)} className="w-full">
                <ToggleGroupItem value="learner" className="flex-1">Learner</ToggleGroupItem>
                <ToggleGroupItem value="admin" className="flex-1">Admin</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              <LogIn className="mr-2 size-5" /> Sign in
            </Button>
            <p className="text-center text-sm text-muted-foreground">No account? Sign up free</p>
          </form>
        </div>
      </div>
    </div>
  );
}
