import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { updatePassword, sha256Hex, getUser } from "@/lib/authStore";

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    setEmail(sp.get("email") || "");
    setCode(sp.get("code") || "");
  }, [sp]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) return toast.error("Passwords do not match");
    const expected = localStorage.getItem(`ltai_reset_${email.toLowerCase()}`);
    if (!expected || expected !== code) return toast.error("Invalid or expired code");
    const ok = await updatePassword(email, getUser(email)?.passwordHash ? pw : "", pw);
    if (!ok) return toast.error("Reset failed");
    localStorage.removeItem(`ltai_reset_${email.toLowerCase()}`);
    toast.success("Password reset");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="mx-auto max-w-md px-6 py-10 space-y-4">
        <div className="mb-2"><BackButton /></div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Reset password</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <form onSubmit={submit} className="grid gap-3">
            <div className="grid gap-2"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Code</Label><Input value={code} onChange={(e) => setCode(e.target.value)} /></div>
            <div className="grid gap-2"><Label>New password</Label><Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Confirm</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
            <Button type="submit">Reset</Button>
          </form>
          <div className="text-xs text-muted-foreground">Demo flow stores a temporary code in your browser only.</div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
