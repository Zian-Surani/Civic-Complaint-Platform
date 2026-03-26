
'use client'

import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { getDashboardPath } from "../components/ProtectedRoute";
import { supabase } from "../integrations/supabase/client";
import { lovable } from "../integrations/lovable";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { useToast } from "../hooks/use-toast";
import { z } from "zod";
import { FloatingElements } from "../components/animations/FloatingElements";
import {
  Shield,
  AlertCircle,
  ArrowRight,
  Check,
  User,
  Building2,
  Settings,
  ArrowLeft,
  Loader2,
} from "lucide-react";
type AppRole = "citizen" | "authority" | "admin";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long");

const isDevelopment = process.env.NODE_ENV === "development";

const demoCredentials: Record<AppRole, { email: string; password: string; displayName: string }> | null =
  isDevelopment
    ? {
        citizen: { email: "citizen.demo@civicportal.gov", password: "Demo@123456", displayName: "Demo Citizen" },
        authority: { email: "authority.demo@civicportal.gov", password: "Demo@123456", displayName: "Demo Authority" },
        admin: { email: "admin.demo@civicportal.gov", password: "Demo@123456", displayName: "Demo Admin" },
      }
    : null;

const roleConfig: Record<AppRole, { label: string; description: string; icon: typeof User; color: string }> = {
  citizen: {
    label: "Civic User",
    description: "Submit and track civic complaints",
    icon: User,
    color: "from-primary to-[hsl(var(--accent-cyan))]",
  },
  authority: {
    label: "Local Authority",
    description: "Manage ward-assigned complaints",
    icon: Building2,
    color: "from-[hsl(var(--severity-medium))] to-[hsl(var(--severity-high))]",
  },
  admin: {
    label: "Central Admin",
    description: "System-wide analytics & management",
    icon: Settings,
    color: "from-[hsl(var(--accent-purple))] to-[hsl(var(--accent-indigo))]",
  },
};

const mapDbRole = (dbRole?: string | null): AppRole | null => {
  switch (dbRole) {
    case "civic_user":
      return "citizen";
    case "local_authority":
      return "authority";
    case "admin":
      return "admin";
    default:
      return null;
  }
};

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  const { user, role, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const navigateToRole = (roleValue: AppRole | null | undefined) => {
    const targetRole = roleValue ?? "citizen";
    navigate(getDashboardPath(targetRole), { replace: true });
  };

  const resolveRoleForUser = async (userId: string, fallbackRole?: AppRole | null) => {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      const mappedRole = mapDbRole(userData?.role);
      if (mappedRole) return mappedRole;
    } catch (err) {
      console.error("Error fetching role for navigation:", err);
    }

    return fallbackRole ?? "citizen";
  };

  useEffect(() => {
    if (user && role) {
      const from = (location.state as { from?: Location })?.from?.pathname;
      const dashboardPath = getDashboardPath(role);
      navigate(from || dashboardPath, { replace: true });
    }
  }, [user, role, navigate, location.state]);

  useEffect(() => {
    if (selectedRole && demoCredentials) {
      const creds = demoCredentials[selectedRole];
      setLoginEmail(creds.email);
      setLoginPassword(creds.password);
    }
  }, [selectedRole, demoCredentials]);

  const handleRoleSelect = (roleValue: AppRole) => {
    setSelectedRole(roleValue);
    if (demoCredentials) {
      const creds = demoCredentials[roleValue];
      setLoginEmail(creds.email);
      setLoginPassword(creds.password);
    }
  };

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(loginEmail);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.loginEmail = e.errors[0].message;
    }
    try {
      passwordSchema.parse(loginPassword);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.loginPassword = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    try {
      nameSchema.parse(signupName);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupName = e.errors[0].message;
    }
    try {
      emailSchema.parse(signupEmail);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupEmail = e.errors[0].message;
    }
    try {
      passwordSchema.parse(signupPassword);
    } catch (e) {
      if (e instanceof z.ZodError) newErrors.signupPassword = e.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      toast({
        title: "Select user type",
        description: "Please choose a user type before signing in.",
        variant: "destructive",
      });
      return;
    }
    if (!validateLogin()) return;

    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description:
          error.message === "Invalid login credentials"
            ? "Invalid email or password. Please try again."
            : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login successful",
      description: "Redirecting to your dashboard...",
    });

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const resolvedRole = await resolveRoleForUser(authUser.id, selectedRole);
        navigateToRole(resolvedRole);
      } else {
        navigateToRole(selectedRole);
      }
    } catch (err) {
      console.error("Navigation after login failed:", err);
      navigateToRole(selectedRole);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    if (error) {
      let message = error.message;
      if (error.message.includes("already registered")) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({ title: "Registration failed", description: message, variant: "destructive" });
    } else {
      setSignupSuccess(true);
      toast({ title: "Account created!", description: "You can now sign in with your credentials." });
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-between relative overflow-hidden p-12">
        <FloatingElements />
        <div className="animated-gradient absolute inset-0" />

        <div className="relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <motion.div
            className="flex items-center gap-3 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))] shadow-glow-primary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Civic Portal</h1>
              <p className="text-sm text-muted-foreground">Complaint Management System</p>
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-8">
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-4xl font-semibold tracking-tight text-foreground">
              Unified Access <span className="text-gradient">Portal</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-md">
              One platform for citizens, authorities, and administrators to manage civic complaints efficiently.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="relative flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 via-[hsl(var(--accent-cyan))]/10 to-[hsl(var(--accent-indigo))]/10"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/20 to-[hsl(var(--accent-indigo))]/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="relative flex h-36 w-36 items-center justify-center rounded-3xl bg-background/80 shadow-soft-lg"
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg viewBox="0 0 120 120" className="h-24 w-24">
                  <defs>
                    <linearGradient id="avatar-grad" x1="0" x2="1" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--accent-indigo))" />
                    </linearGradient>
                  </defs>
                  <circle cx="60" cy="60" r="48" fill="url(#avatar-grad)" opacity="0.12" />
                  <circle cx="60" cy="48" r="18" fill="url(#avatar-grad)" />
                  <path
                    d="M30 96c6-18 24-28 30-28s24 10 30 28"
                    fill="url(#avatar-grad)"
                  />
                  <circle cx="52" cy="46" r="2.5" fill="white" />
                  <circle cx="68" cy="46" r="2.5" fill="white" />
                  <path d="M52 58c6 6 10 6 16 0" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="relative z-10 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          (c) 2026 Civic Portal. All rights reserved.
        </motion.div>
      </div>

      <div className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-12 bg-background">
        <motion.div
          className="w-full max-w-md space-y-8"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:hidden">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))]">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Civic Portal</h1>
                <p className="text-xs text-muted-foreground">Complaint Management</p>
              </div>
            </div>

          </div>

          <div className="glass-card rounded-2xl p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-foreground">Welcome</h2>
              <p className="text-muted-foreground mt-1">Sign in to your account or create a new one</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-xl bg-muted p-1 mb-6">
                <TabsTrigger
                  value="login"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm transition-all"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-soft-sm transition-all"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Quick Select
                    </Label>
                    <RadioGroup
                      value={selectedRole || ""}
                      onValueChange={(value) => handleRoleSelect(value as AppRole)}
                      className="grid grid-cols-3 gap-2"
                    >
                      {(Object.entries(roleConfig) as [AppRole, typeof roleConfig[AppRole]][]).map(([key, config]) => {
                        const Icon = config.icon;
                        return (
                          <motion.div key={key} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Label
                              htmlFor={`role-${key}`}
                              className={`flex flex-col items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
                                selectedRole === key
                                  ? "border-primary bg-primary/5"
                                  : "border-border/50 hover:border-border hover:bg-muted/50"
                              }`}
                            >
                              <RadioGroupItem value={key} id={`role-${key}`} className="sr-only" />
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                                  selectedRole === key ? `bg-gradient-to-br ${config.color}` : "bg-muted"
                                }`}
                              >
                                <Icon
                                  className={`h-4 w-4 ${selectedRole === key ? "text-white" : "text-muted-foreground"}`}
                                />
                              </div>
                              <span
                                className={`text-xs font-medium ${
                                  selectedRole === key ? "text-primary" : "text-muted-foreground"
                                }`}
                              >
                                {config.label}
                              </span>
                            </Label>
                          </motion.div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl border-border/50 bg-muted/50 px-4 focus-visible:ring-1 transition-all"
                    />
                    {errors.loginEmail && (
                      <motion.p
                        className="text-sm text-destructive flex items-center gap-1.5"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.loginEmail}
                      </motion.p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="********"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-xl border-border/50 bg-muted/50 px-4 focus-visible:ring-1 transition-all"
                    />
                    {errors.loginPassword && (
                      <motion.p
                        className="text-sm text-destructive flex items-center gap-1.5"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.loginPassword}
                      </motion.p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 rounded-xl btn-premium bg-gradient-to-r from-primary to-[hsl(var(--accent-indigo))]"
                    disabled={isLoading || isGoogleLoading || !selectedRole}
                  >
                    {isLoading ? (
                      <motion.div
                        className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    ) : (
                      <>
                        Sign In<ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 transition-all"
                    disabled={isLoading || isGoogleLoading || isAppleLoading}
                    onClick={async () => {
                      setIsGoogleLoading(true);
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: "google",
                          options: {
                            redirectTo: window.location.origin,
                          },
                        });
                        if (error) {
                          toast({
                            title: "Google sign-in failed",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      } catch (err) {
                        toast({
                          title: "Google sign-in failed",
                          description: err instanceof Error ? err.message : "An unexpected error occurred",
                          variant: "destructive",
                        });
                      } finally {
                        setIsGoogleLoading(false);
                      }
                    }}
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 transition-all"
                    disabled={isLoading || isGoogleLoading || isAppleLoading}
                    onClick={async () => {
                      setIsAppleLoading(true);
                      try {
                        const { error } = await supabase.auth.signInWithOAuth({
                          provider: "apple",
                          options: {
                            redirectTo: window.location.origin,
                          },
                        });
                        if (error) {
                          toast({
                            title: "Apple sign-in failed",
                            description: error.message,
                            variant: "destructive",
                          });
                        }
                      } catch (err) {
                        toast({
                          title: "Apple sign-in failed",
                          description: err instanceof Error ? err.message : "An unexpected error occurred",
                          variant: "destructive",
                        });
                      } finally {
                        setIsAppleLoading(false);
                      }
                    }}
                  >
                    {isAppleLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                        </svg>
                        Apple
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                {signupSuccess ? (
                  <motion.div
                    className="text-center py-8 space-y-4"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--severity-very-low-bg))]"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2, type: "spring" }}
                    >
                      <Check className="h-7 w-7 text-[hsl(var(--severity-very-low))]" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-lg">Account Created!</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Switch to the Sign In tab to access your account.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        disabled={isLoading}
                        className="h-11 rounded-xl border-border/50 bg-muted/50 px-4 focus-visible:ring-1"
                      />
                      {errors.signupName && (
                        <motion.p
                          className="text-sm text-destructive flex items-center gap-1.5"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.signupName}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-11 rounded-xl border-border/50 bg-muted/50 px-4 focus-visible:ring-1"
                      />
                      {errors.signupEmail && (
                        <motion.p
                          className="text-sm text-destructive flex items-center gap-1.5"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.signupEmail}
                        </motion.p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="********"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isLoading}
                        className="h-11 rounded-xl border-border/50 bg-muted/50 px-4 focus-visible:ring-1"
                      />
                      {errors.signupPassword && (
                        <motion.p
                          className="text-sm text-destructive flex items-center gap-1.5"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.signupPassword}
                        </motion.p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-xl btn-premium bg-gradient-to-r from-primary to-[hsl(var(--accent-indigo))]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <motion.div
                          className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      ) : (
                        <>
                          Create Account<ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      New accounts are registered as citizens by default.
                    </p>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
