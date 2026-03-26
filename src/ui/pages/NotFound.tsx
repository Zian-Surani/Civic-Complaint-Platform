import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Shield, Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))] shadow-glow-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Civic Portal</h1>
                <p className="text-xs text-muted-foreground">Complaint Management</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-lg mx-auto">
          {/* Animated 404 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative inline-block mb-8"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-[hsl(var(--accent-indigo))]/20 blur-3xl" />
            <h1 className="relative text-[10rem] font-bold leading-none tracking-tighter text-gradient">
              404
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-foreground">
              Page not found
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
              Let's get you back on track.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              asChild
              className="rounded-xl btn-premium bg-gradient-to-r from-primary to-[hsl(var(--accent-indigo))] shadow-glow-primary"
            >
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="rounded-xl border-border/50 hover:bg-accent/50"
            >
              <Link to="/auth">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Login
              </Link>
            </Button>
          </motion.div>

          {/* Decorative elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Search className="h-4 w-4" />
            <span>Looking for something specific?</span>
            <Link to="/auth" className="text-primary hover:underline font-medium">
              Contact support
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Civic Portal. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;
