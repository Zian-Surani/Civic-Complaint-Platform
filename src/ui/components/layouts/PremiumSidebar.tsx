import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { Shield, ChevronRight, HelpCircle } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  badge?: string | number;
}

interface PremiumSidebarProps {
  navItems: NavItem[];
  title?: string;
}

export function PremiumSidebar({ navItems, title = "Civic Portal" }: PremiumSidebarProps) {
  const location = useLocation();

  return (
    <aside className="hidden w-72 flex-shrink-0 border-r border-border/50 bg-sidebar lg:flex lg:flex-col">
      {/* Logo Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border/30">
        <motion.div 
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))] shadow-soft-md"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Shield className="h-5 w-5 text-white" />
        </motion.div>
        <div>
          <h1 className="font-semibold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-auto px-4 py-6">
        <p className="px-3 mb-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Navigation
        </p>
        <div className="space-y-1">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.href;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link
                  to={item.href}
                  className={cn(
                    "sidebar-item group relative",
                    isActive && "sidebar-item-active"
                  )}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  
                  <span className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-primary-foreground/20" 
                      : "bg-muted/50 group-hover:bg-muted"
                  )}>
                    {item.icon}
                  </span>
                  <span className="flex-1 font-medium">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                      isActive 
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={cn(
                    "h-4 w-4 opacity-0 transition-all duration-200 group-hover:opacity-50 group-hover:translate-x-0.5",
                    isActive && "opacity-50"
                  )} />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border/30 p-4">
        <motion.div 
          className="rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border border-border/30"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <HelpCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Need Help?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contact support for assistance
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </aside>
  );
}
