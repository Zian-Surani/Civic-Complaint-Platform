import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { RoleBadge } from "../badges/PremiumBadges";
import { NotificationDropdown } from "../notifications/NotificationDropdown";
import { ThemeToggle } from "../ui/theme-toggle";
import {
  Shield,
  Menu,
  User,
  LogOut,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

interface PremiumHeaderProps {
  title: string;
  navItems: NavItem[];
}

export function PremiumHeader({ title, navItems }: PremiumHeaderProps) {
  const { profile, role, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 items-center justify-between border-b border-border/50 bg-background/80 backdrop-blur-xl px-3 sm:px-4 lg:px-6">
      {/* Left side - Mobile menu & Title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-r-0">
            <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold">Civic Portal</h1>
                <p className="text-xs text-muted-foreground">Management System</p>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="sidebar-item"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      </div>

      {/* Right side - Theme, Notifications & User */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 rounded-xl px-2 sm:px-3 hover:bg-muted"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium leading-none">
                  {profile?.full_name || "User"}
                </p>
                {role && (
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {role}
                  </p>
                )}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">{profile?.full_name || "User"}</p>
                {role && <RoleBadge role={role} size="sm" />}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem 
              className="rounded-lg cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
