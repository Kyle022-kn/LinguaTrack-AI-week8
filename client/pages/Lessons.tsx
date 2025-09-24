import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LANGUAGES, Language } from "@/data/languages";
import { Link } from "react-router-dom";

const BASE_TOPICS = [
  "Basics & Alphabet",
  "Greetings & Introductions",
  "Numbers & Time",
  "Food & Travel",
  "Grammar A1",
];

function LanguageBlock({ lang }: { lang: Language }) {
  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{lang.emoji} {lang.name}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <ul className="text-sm text-muted-foreground list-disc pl-5">
          {BASE_TOPICS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="flex gap-2 pt-2">
          <Link to={`/lessons/${lang.key}`} className="flex-1">
            <Button className="w-full">Overview</Button>
          </Link>
          <Link to={`/lessons/${lang.key}`} className="flex-1">
            <Button variant="secondary" className="w-full">Practice</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Lessons() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Lessons</h1>
        <p className="text-sm text-muted-foreground">Topic overviews, practice and quizzes by language.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {LANGUAGES.map((l) => (
          <LanguageBlock key={l.key} lang={l} />
        ))}
      </div>
    </div>
  );
}
