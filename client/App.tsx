import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import Challenge from "./pages/Challenge";
import Progress from "./pages/Progress";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import MainLayout from "@/components/MainLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const App = () => (
  <BrowserRouter>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route element={<MainLayout /> }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/challenge" element={<Challenge />} />
                <Route path="/lessons" element={<Lessons />} />
                <Route path="/lessons/:lang" element={<LessonDetail />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/admin" element={<Placeholder title="Admin Panel" description="Manage Lessons, Challenges, Community and Users." />} />
                <Route path="/community" element={<Placeholder title="Community" description="Leaderboards and forums coming soon." />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/support" element={<Support />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
    </ThemeProvider>
  </BrowserRouter>
);

createRoot(document.getElementById("root")!).render(<App />);
