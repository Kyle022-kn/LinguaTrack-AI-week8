import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const FAQS = [
  { q: "How does Daily Challenge work?", a: "Short, adaptive quizzes across skills. Answer to get instant feedback and streaks." },
  { q: "Can I change my role?", a: "This prototype supports Learner/Admin via login. In production, roles are managed by your organization." },
  { q: "How to reset progress?", a: "Go to Profile → Reset local progress. In production, progress is server-tracked." },
];

export default function Support() {
  const contact = () => {
    const mail = `mailto:support@linguatrack.ai?subject=LinguaTrack%20Support&body=Describe%20your%20issue...`;
    window.location.href = mail;
  };
  return (
    <div className="space-y-5">
      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">FAQs</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          {FAQS.map((f) => (
            <div key={f.q} className="rounded-xl border p-3">
              <div className="font-medium">{f.q}</div>
              <div className="text-sm text-muted-foreground mt-1">{f.a}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-2xl">
        <CardHeader className="pb-2"><CardTitle className="text-base">Contact</CardTitle></CardHeader>
        <CardContent className="pt-0 space-y-3">
          <Button className="w-full" onClick={contact}>Email Support</Button>
          <a href="https://www.builder.io/c/docs/projects" target="_blank" rel="noreferrer" className="block">
            <Button variant="secondary" className="w-full">Open Docs</Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
