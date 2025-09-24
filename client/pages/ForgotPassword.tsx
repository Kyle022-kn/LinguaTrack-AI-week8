import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem(`ltai_reset_${email.toLowerCase()}`, code);
    toast.success("Reset link sent", { description: `Demo code: ${code}` });
    window.location.href = `/reset?email=${encodeURIComponent(email)}&code=${code}`;
  };
  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader><CardTitle className="text-base">Forgot password</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <form onSubmit={onSubmit} className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button type="submit">Send reset link</Button>
          </form>
          <div className="text-xs text-muted-foreground">For demo, a code is generated and auto-filled.</div>
        </CardContent>
      </Card>
    </div>
  );
}
