import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckCircle2, UserPlus } from "lucide-react";
import BackButton from "@/components/BackButton";
import { toast } from "sonner";

function scorePassword(pw: string) {
  let s = 0; if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++; if (/[a-z]/.test(pw)) s++; if (/[0-9]/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++; return s;
}

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("learner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { toast.error("Please accept Terms & Privacy"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }
    if (scorePassword(password) < 4) { toast.error("Weak password", { description: "Use 8+ chars with upper/lower, number, symbol" }); return; }
    const ok = await register({ email, password, role, name: name || email.split("@")[0] });
    if (!ok) { toast.error("Account already exists"); return; }
    toast.success("Account created", { description: "Welcome to LinguaTrack AI" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="mx-auto max-w-md px-6 py-10">
        <div className="mb-4">
          <BackButton />
        </div>
        <div className="flex items-center gap-3 mb-8">
          <div className="size-10 rounded-2xl bg-primary/15 grid place-items-center">
            <UserPlus className="size-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
            <p className="text-sm text-muted-foreground">Safe and secure. You control your data.</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card shadow-sm p-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <div className="text-xs text-muted-foreground flex items-center gap-1"><CheckCircle2 className="size-3" /> Use 8+ chars, upper/lower, number, symbol</div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Select role</Label>
              <ToggleGroup type="single" value={role} onValueChange={(v) => v && setRole(v as UserRole)} className="w-full">
                <ToggleGroupItem value="learner" className="flex-1">Learner</ToggleGroupItem>
                <ToggleGroupItem value="admin" className="flex-1">Admin</ToggleGroupItem>
              </ToggleGroup>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the <a className="text-primary" href="/terms">Terms</a> and <a className="text-primary" href="/privacy">Privacy Policy</a>
            </label>
            <Button type="submit" className="w-full h-12 text-base font-semibold">
              <UserPlus className="mr-2 size-5" /> Sign up
            </Button>
            <div className="text-center text-sm">Already have an account? <a className="text-primary" href="/login">Sign in</a></div>
          </form>
        </div>
      </div>
    </div>
  );
}
