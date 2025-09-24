import { Flame, Home, LineChart, LogOut, NotebookPen, Settings as SettingsIcon, SquarePen, User, UserCog } from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function MainLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const nav = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/progress", label: "Progress", icon: LineChart },
    { to: "/journal", label: "Journal", icon: NotebookPen },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 text-foreground">
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 grid place-items-center">
              <SquarePen className="size-5 text-primary" />
            </div>
            <div className="leading-tight">
              <div className="font-extrabold tracking-tight">LinguaTrack AI</div>
              <div className="text-xs text-muted-foreground">Personalized Learning</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-amber-600">
              <Flame className="size-4" />
              <span className="text-xs font-semibold">7 day streak</span>
            </div>
            {user?.role === "admin" && (
              <NavLink to="/admin" className={({ isActive }) => cn("rounded-full px-2 py-1 text-xs font-medium border", isActive ? "bg-primary text-primary-foreground border-transparent" : "bg-background hover:bg-accent")}>Admin</NavLink>
            )}
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 pb-28 pt-4">
        <Outlet />
      </main>

      {location.pathname !== "/login" && (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="mx-auto max-w-md grid grid-cols-3 p-2 gap-2">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent text-foreground"
                    )
                  }
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();
  const onLogout = () => {
    logout();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full border size-9 grid place-items-center bg-background hover:bg-accent">
        <span className="text-sm font-semibold">{initials}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>{user?.name || user?.email || "Account"}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 size-4" /> Profile</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}><SettingsIcon className="mr-2 size-4" /> Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout} className="text-red-600"><LogOut className="mr-2 size-4" /> Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
