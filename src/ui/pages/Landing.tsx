import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { AnimatedCounter } from "../components/animations/AnimatedCounter";
import { FloatingElements } from "../components/animations/FloatingElements";
import { ThemeToggleSimple } from "../components/ui/theme-toggle";
import {
  Shield,
  ArrowRight,
  Users,
  MapPin,
  BarChart3,
  Clock,
  CheckCircle2,
  FileText,
  Zap,
  Eye,
  ChevronRight,
  Activity,
  TrendingUp,
  Bell,
  Github,
} from "lucide-react";
import { useState, useEffect } from "react";

const rotatingHighlights = [
  "Ward-Based Intelligence",
  "Real-Time Escalation",
  "SLA-Driven Resolution",
  "Priority Scoring Engine",
  "Live Analytics Dashboard",
];

export default function Landing() {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % rotatingHighlights.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      icon: FileText,
      title: "Citizen Raises Complaint",
      description: "Submit civic issues with location and category details through our intuitive portal.",
      color: "hsl(217 91% 50% / 0.15)",
    },
    {
      icon: Zap,
      title: "System Prioritizes",
      description: "AI-driven severity scoring based on urgency, location sensitivity, and complaint clustering.",
      color: "hsl(270 67% 58% / 0.15)",
    },
    {
      icon: MapPin,
      title: "Ward-Based Routing",
      description: "Complaints are automatically assigned to the correct local authority based on ward mapping.",
      color: "hsl(172 66% 40% / 0.15)",
    },
    {
      icon: CheckCircle2,
      title: "Resolution & Tracking",
      description: "Authorities resolve within SLA deadlines while citizens track progress in real-time.",
      color: "hsl(152 69% 41% / 0.15)",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Faster Resolution",
      description: "Priority-based queue ensures critical issues are addressed first with strict SLA enforcement.",
      gradient: "from-primary/10 to-[hsl(var(--accent-cyan))]/10",
    },
    {
      icon: MapPin,
      title: "Ward Accountability",
      description: "Clear ownership with local authorities responsible for their assigned geographic areas.",
      gradient: "from-[hsl(var(--accent-teal))]/10 to-primary/10",
    },
    {
      icon: BarChart3,
      title: "Data-Driven Governance",
      description: "Comprehensive analytics and heatmaps for informed decision-making and resource allocation.",
      gradient: "from-[hsl(var(--accent-indigo))]/10 to-[hsl(var(--accent-purple))]/10",
    },
    {
      icon: Eye,
      title: "Complete Transparency",
      description: "Real-time status updates and visibility into complaint lifecycle for all stakeholders.",
      gradient: "from-[hsl(var(--accent-purple))]/10 to-primary/10",
    },
  ];

  const stats = [
    { label: "Wards Covered", value: 10, suffix: "+" },
    { label: "Priority Levels", value: 5, suffix: "" },
    { label: "SLA Tracked", value: 100, suffix: "%" },
    { label: "Uptime", value: 24, suffix: "/7" },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))] shadow-glow-primary">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Civic Portal</h1>
                <p className="text-xs text-muted-foreground">Complaint Management</p>
              </div>
            </motion.div>
            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ThemeToggleSimple />
              <Button asChild className="rounded-xl btn-premium bg-gradient-to-r from-primary to-[hsl(var(--accent-indigo))]">
                <Link to="/auth">
                  Login to Portal
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <FloatingElements />
        <div className="animated-gradient absolute inset-0" />
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div 
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/10 to-[hsl(var(--accent-indigo))]/10 px-5 py-2.5 text-sm font-medium text-primary border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Activity className="h-4 w-4 animate-pulse" />
              Government-Grade Civic Technology
            </motion.div>
            
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Adaptive Civic Complaint
              <span className="block mt-2 text-gradient">Prioritization System</span>
            </motion.h1>
            
            <motion.p 
              className="mt-6 text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              An intelligent, ward-based civic complaint prioritization and resolution platform
              that transforms how municipalities handle citizen grievances.
            </motion.p>

            {/* Rotating highlight */}
            <motion.div 
              className="mt-8 flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <TrendingUp className="h-5 w-5 text-[hsl(var(--accent-cyan))]" />
              <span className="text-muted-foreground">Powered by</span>
              <span className="relative h-6 overflow-hidden">
                {rotatingHighlights.map((text, index) => (
                  <motion.span
                    key={text}
                    className="absolute left-0 font-semibold text-gradient whitespace-nowrap"
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ 
                      y: highlightIndex === index ? 0 : highlightIndex > index ? -30 : 30,
                      opacity: highlightIndex === index ? 1 : 0
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {text}
                  </motion.span>
                ))}
              </span>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Button asChild size="lg" className="rounded-xl btn-premium px-8 bg-gradient-to-r from-primary to-[hsl(var(--accent-indigo))] shadow-glow-primary">
                <Link to="/auth">
                  <Users className="mr-2 h-5 w-5" />
                  Login to Portal
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl border-border/50 hover:bg-accent/50 group">
                <a href="#how-it-works">
                  Learn How It Works
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="glass-card rounded-2xl p-6 text-center"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-4xl font-bold text-gradient">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tech Separator */}
      <div className="tech-separator my-8 mx-auto max-w-5xl" />

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How the <span className="text-gradient">System</span> Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A streamlined four-step process from complaint submission to resolution
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative rounded-2xl border border-border/50 bg-card p-6 shadow-soft-md card-hover"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <motion.div 
                  className="absolute -top-3 left-6 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))] text-xs font-bold text-white shadow-glow-primary"
                  whileHover={{ scale: 1.1 }}
                >
                  {index + 1}
                </motion.div>
                <div 
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: step.color }}
                >
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why This <span className="text-gradient">Platform</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for modern municipalities with citizen-centric governance in mind
            </p>
          </motion.div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className={`flex gap-5 rounded-2xl border border-border/50 bg-gradient-to-br ${benefit.gradient} p-6 shadow-soft-md card-hover`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-background/80 backdrop-blur-sm shadow-soft-md">
                  <benefit.icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{benefit.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="animated-gradient absolute inset-0" />
        <FloatingElements />
        
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary border border-primary/20">
              <Bell className="h-4 w-4" />
              Ready to Transform
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Transform <span className="text-gradient">Civic Governance</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join the platform that brings transparency, accountability, and efficiency to municipal complaint management.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-xl btn-premium px-10 bg-gradient-to-r from-primary to-[hsl(var(--accent-indigo))] shadow-glow-primary">
                <Link to="/auth">
                  Access the Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/50 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[hsl(var(--accent-indigo))]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Civic Portal</p>
                <p className="text-xs text-muted-foreground">Government Complaint Management</p>
              </div>
            </div>
            
            {/* Developer Credit */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Developed by</span>
              <a 
                href="https://github.com/Zian-Surani" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 hover:bg-foreground/10 border border-border/50 transition-colors group"
              >
                <span className="font-medium text-foreground">Zian Rajeshkumar Surani</span>
                <Github className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </a>
            </div>
            
            <div className="text-center sm:text-right">
              <p className="text-sm text-muted-foreground">
                An initiative for transparent and accountable civic governance.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Â© {new Date().getFullYear()} Municipal Corporation. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
