import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const to = user ? "/dashboard" : "/login";
    navigate(to, { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-primary/10 to-background">
      <div className="animate-pulse text-center">
        <div className="text-2xl font-extrabold">LinguaTrack AI</div>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    </div>
  );
}
