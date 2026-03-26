import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { PremiumSidebar } from "./PremiumSidebar";
import { PremiumHeader } from "./PremiumHeader";
import { Home, FileText, Plus, MapPin, Users, BarChart3, Settings } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

interface PremiumLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  },
  exit: { 
    opacity: 0, 
    y: -12,
    transition: { duration: 0.2, ease: "easeIn" as const }
  },
};

export function PremiumLayout({ children, navItems, title }: PremiumLayoutProps) {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <PremiumSidebar navItems={navItems} />

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <PremiumHeader title={title} navItems={navItems} />

        {/* Page content with transitions */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
              className="mx-auto max-w-7xl p-3 sm:p-4 lg:p-6"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

// Pre-configured nav items for each role
export const citizenNavItems: NavItem[] = [
  { label: "Dashboard", href: "/citizen", icon: <Home className="h-4 w-4" /> },
  { label: "My Complaints", href: "/citizen/complaints", icon: <FileText className="h-4 w-4" /> },
  { label: "New Complaint", href: "/citizen/new", icon: <Plus className="h-4 w-4" /> },
];

export const authorityNavItems: NavItem[] = [
  { label: "Dashboard", href: "/authority", icon: <Home className="h-4 w-4" /> },
  { label: "Complaints", href: "/authority/complaints", icon: <FileText className="h-4 w-4" /> },
  { label: "My Wards", href: "/authority/wards", icon: <MapPin className="h-4 w-4" /> },
];

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: <Home className="h-4 w-4" /> },
  { label: "All Complaints", href: "/admin/complaints", icon: <FileText className="h-4 w-4" /> },
  { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
  { label: "Configuration", href: "/admin/config", icon: <Settings className="h-4 w-4" /> },
];
