import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import MainLayout from "@/components/MainLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />

            <Route element={<RequireAuth />}>
              <Route element={<MainLayout /> }>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/challenge" element={<Placeholder title="Daily Challenge" description="Gamified quizzes with instant feedback." />} />
                <Route path="/lessons" element={<Placeholder title="Lessons" description="Practice and Quiz modes for each language." />} />
                <Route path="/lessons/:lang" element={<Placeholder title="Lesson Detail" description="Topic overview, Practice and Quiz." />} />
                <Route path="/progress" element={<Placeholder title="Progress" description="Charts, badges, and milestones." />} />
                <Route path="/journal" element={<Placeholder title="AI Journaling" description="Write entries and get AI corrections." />} />
                <Route path="/admin" element={<Placeholder title="Admin Panel" description="Manage Lessons, Challenges, Community and Users." />} />
                <Route path="/community" element={<Placeholder title="Community" description="Leaderboards and forums coming soon." />} />
                <Route path="/profile" element={<Placeholder title="Profile" description="Achievements, badges, and settings." />} />
                <Route path="/support" element={<Placeholder title="Support" description="Help center and FAQs." />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
