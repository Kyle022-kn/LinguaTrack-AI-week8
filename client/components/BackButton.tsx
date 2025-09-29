import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BackButton({ className, label = "Back", to }: { className?: string; label?: string; to?: string | number }) {
  const navigate = useNavigate();
  const onClick = () => {
    if (typeof to === "number") return navigate(to as number);
    if (typeof to === "string") return navigate(to as string);
    if (window.history.length > 1) return navigate(-1);
    return navigate("/dashboard");
  };
  return (
    <Button variant="ghost" size="sm" onClick={onClick} className={cn("-ml-2", className)}>
      <ArrowLeft className="mr-1 h-4 w-4" /> {label}
    </Button>
  );
}
