import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import {
  Shield,
  Menu,
  User,
  LogOut,
  Bell,
  Home,
  FileText,
  Settings,
  Users,
  BarChart3,
  MapPin,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

export function DashboardLayout({ children, navItems, title }: DashboardLayoutProps) {
  const { profile, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const roleColors = {
    citizen: 'bg-blue-500/10 text-blue-600 border-blue-200',
    authority: 'bg-amber-500/10 text-amber-600 border-amber-200',
    admin: 'bg-purple-500/10 text-purple-600 border-purple-200',
  };

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          onClick={onClick}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            location.pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-card lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold">Civic Portal</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto px-4 py-4">
            <NavLinks />
          </div>

          {/* User section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium">
                  {profile?.full_name || 'User'}
                </p>
                <Badge variant="outline" className={cn('text-xs capitalize', role && roleColors[role])}>
                  {role || 'loading'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold">Civic Portal</span>
              </div>
              <div className="p-4">
                <NavLinks onClick={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold lg:text-xl">{title}</h1>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                3
              </span>
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Pre-configured nav items for each role
export const citizenNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/citizen', icon: <Home className="h-4 w-4" /> },
  { label: 'My Complaints', href: '/citizen/complaints', icon: <FileText className="h-4 w-4" /> },
  { label: 'New Complaint', href: '/citizen/new', icon: <FileText className="h-4 w-4" /> },
];

export const authorityNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/authority', icon: <Home className="h-4 w-4" /> },
  { label: 'Complaints', href: '/authority/complaints', icon: <FileText className="h-4 w-4" /> },
  { label: 'My Wards', href: '/authority/wards', icon: <MapPin className="h-4 w-4" /> },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: <Home className="h-4 w-4" /> },
  { label: 'All Complaints', href: '/admin/complaints', icon: <FileText className="h-4 w-4" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
  { label: 'Users', href: '/admin/users', icon: <Users className="h-4 w-4" /> },
  { label: 'Configuration', href: '/admin/config', icon: <Settings className="h-4 w-4" /> },
];
