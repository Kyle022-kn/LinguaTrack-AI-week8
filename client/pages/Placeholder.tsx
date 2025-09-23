import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Placeholder({ title, description }: { title: string; description?: string }) {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-sm text-center">
      <Card className="rounded-2xl">
        <CardContent className="p-6 space-y-3">
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description || "This screen will be implemented next. The layout, navigation, and styles are ready."}</p>
          <Button onClick={() => navigate(-1)} className="w-full">Back</Button>
        </CardContent>
      </Card>
    </div>
  );
}
