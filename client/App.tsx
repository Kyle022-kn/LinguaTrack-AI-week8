import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import Admin from "./pages/Admin";
import Challenge from "./pages/Challenge";
import Progress from "./pages/Progress";
import Lessons from "./pages/Lessons";
import LessonDetail from "./pages/LessonDetail";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import Journal from "./pages/Journal";
import Settings from "./pages/Settings";
import AIPractice from "./pages/AIPractice";
import MainLayout from "@/components/MainLayout";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

function RequireAuth() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function RequireAdmin() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;
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
              <Route path="/signup" element={<SignUp />} />
              <Route path="/forgot" element={<ForgotPassword />} />
              <Route path="/reset" element={<ResetPassword />} />

              <Route element={<RequireAuth />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/challenge" element={<Challenge />} />
                  <Route path="/ai-practice" element={<AIPractice />} />
                  <Route path="/lessons" element={<Lessons />} />
                  <Route path="/lessons/:lang" element={<LessonDetail />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/journal" element={<Journal />} />
                  <Route element={<RequireAdmin />}>
                    <Route path="/admin" element={<Admin />} />
                  </Route>
                  <Route
                    path="/community"
                    element={
                      <Placeholder
                        title="Community"
                        description="Leaderboards and forums coming soon."
                      />
                    }
                  />
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
