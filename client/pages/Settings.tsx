import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const PREF_KEY = "ltai_prefs";

type Prefs = {
  appLanguage: string;
  dailyReminders: boolean;
  marketingEmails: boolean;
  theme: "light" | "dark";
};

export default function Settings() {
  const [prefs, setPrefs] = useState<Prefs>({ appLanguage: "English", dailyReminders: true, marketingEmails: false, theme: "light" });

  useEffect(() => {
    try { const raw = localStorage.getItem(PREF_KEY); if (raw) setPrefs(JSON.parse(raw)); } catch {}
  }, []);

  const save = () => { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); toast.success("Settings saved"); };

  const exportData = () => {
    const data = JSON.stringify(localStorage, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "linguatrack-backup.json"; a.click(); URL.revokeObjectURL(url);
  };

  const deleteAccount = () => {
    if (!confirm("This will clear local data for this prototype. Continue?")) return;
    localStorage.clear();
    toast("Account data cleared");
  };

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Preferences</CardTitle></CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="lang">App language</Label>
            <Input id="lang" value={prefs.appLanguage} onChange={(e) => setPrefs({ ...prefs, appLanguage: e.target.value })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Daily reminders</div>
              <div className="text-xs text-muted-foreground">Push/email reminders to study</div>
            </div>
            <Switch checked={prefs.dailyReminders} onCheckedChange={(v) => setPrefs({ ...prefs, dailyReminders: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Marketing emails</div>
              <div className="text-xs text-muted-foreground">News, tips and offers</div>
            </div>
            <Switch checked={prefs.marketingEmails} onCheckedChange={(v) => setPrefs({ ...prefs, marketingEmails: v })} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Theme</div>
              <div className="text-xs text-muted-foreground">Light or dark</div>
            </div>
            <div className="flex gap-2">
              <Button variant={prefs.theme === "light" ? "default" : "secondary"} size="sm" onClick={() => setPrefs({ ...prefs, theme: "light" })}>Light</Button>
              <Button variant={prefs.theme === "dark" ? "default" : "secondary"} size="sm" onClick={() => setPrefs({ ...prefs, theme: "dark" })}>Dark</Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={save}>Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Security</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-2 text-sm text-muted-foreground">
          <div>Two-factor auth can be enabled in your Profile → Security & Privacy.</div>
          <div>Sessions and device management will appear here when connected to a backend.</div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Data Controls</CardTitle></CardHeader>
        <CardContent className="pt-0 grid gap-3">
          <Button onClick={exportData}>Export data</Button>
          <Button variant="secondary" onClick={deleteAccount}>Delete account (local)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
