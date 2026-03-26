import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../integrations/supabase/client";
import { getUserFriendlyError } from "../../lib/error-utils";
import { PremiumLayout, citizenNavItems } from "../../components/layouts/PremiumLayout";
import { PremiumCard, PremiumCardContent, PremiumCardHeader, PremiumCardTitle, PremiumCardDescription } from "../../components/ui/premium-card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "../../components/ui/form";
import { useToast } from "../../hooks/use-toast";
import { FileText, MapPin, Tag, Send, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description must be less than 2000 characters"),
  ward_id: z.string().min(1, "Please select a ward"),
  category_id: z.string().min(1, "Please select a category"),
  address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address must be less than 200 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface Ward {
  id: string;
  name: string;
  authority_id: string | null;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

export default function NewComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [wards, setWards] = useState<Ward[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      ward_id: "",
      category_id: "",
      address: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const wardsRes = await supabase.from("wards").select("id, name, authority_id").order("name");
        const categoriesRes = await supabase
          .from("complaint_categories")
          .select("id, name, description")
          .eq("is_active", true)
          .order("name");

        const { data: wardsData, error: wardsError } = wardsRes;
        const { data: categoriesData, error: categoriesError } = categoriesRes;

        if (wardsError) {
          const wardsErrorDetails = {
            message: (wardsError as any)?.message,
            details: (wardsError as any)?.details,
            hint: (wardsError as any)?.hint,
            code: (wardsError as any)?.code,
            raw: wardsError,
            status: (wardsRes as any)?.status,
            statusText: (wardsRes as any)?.statusText,
          };
          console.error("Failed to load wards:", wardsErrorDetails);
          toast({
            title: "Unable to load wards",
            description: (wardsError as any)?.message || "Please check your database permissions.",
            variant: "destructive",
          });
        }

        if (categoriesError) {
          const categoriesErrorDetails = {
            message: (categoriesError as any)?.message,
            details: (categoriesError as any)?.details,
            hint: (categoriesError as any)?.hint,
            code: (categoriesError as any)?.code,
            raw: categoriesError,
            status: (categoriesRes as any)?.status,
            statusText: (categoriesRes as any)?.statusText,
          };
          console.error("Failed to load categories:", categoriesErrorDetails);
          toast({
            title: "Unable to load categories",
            description: (categoriesError as any)?.message || "Please check your database permissions.",
            variant: "destructive",
          });
        }

        if (wardsData) setWards(wardsData);
        if (categoriesData) setCategories(categoriesData);
        if (!wardsError && wardsData && wardsData.length === 0) {
          toast({
            title: "No wards available",
            description: "The wards table returned 0 rows.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchData();
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    if (!user) return;

    setIsSubmitting(true);

    try {
      const [{ data: sessionData }, { data: userData, error: userError }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.auth.getUser(),
      ]);

      console.log("Supabase auth session:", {
        hasSession: !!sessionData?.session,
        sessionUserId: sessionData?.session?.user?.id,
        userIdFromHook: user.id,
        userIdFromAuth: userData?.user?.id,
        userError,
      });

      if (!sessionData?.session || !userData?.user) {
        throw new Error("No active session. Please sign in again.");
      }

      const selectedWard = wards.find((ward) => ward.id === values.ward_id);
      let assignedTo: string | null = null;

      if (selectedWard?.authority_id) {
        const { data: wardAuthorityUser } = await supabase
          .from("users")
          .select("id")
          .eq("role", "local_authority")
          .eq("authority_id", selectedWard.authority_id)
          .eq("is_active", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        assignedTo = wardAuthorityUser?.id ?? null;
      }

      // Fallback: keep submissions routable even when a ward has no dedicated authority user yet.
      if (!assignedTo) {
        const { data: fallbackAuthorityUser } = await supabase
          .from("users")
          .select("id")
          .eq("role", "local_authority")
          .eq("is_active", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        assignedTo = fallbackAuthorityUser?.id ?? null;
      }

      const { data, error, status, statusText } = await supabase
        .from("complaints")
        .insert({
          user_id: user.id,
          title: values.title,
          description: values.description,
          ward_id: values.ward_id,
          category_id: values.category_id,
          location_details: values.address,
          assigned_to: assignedTo,
        })
        .select()
        .single();

      if (error) {
        console.error("Complaint submit error:", {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
          status,
          statusText,
          raw: error,
        });
        if (userData?.user?.id && userData.user.id !== user.id) {
          console.error("Auth mismatch: session user != hook user", {
            sessionUserId: userData.user.id,
            hookUserId: user.id,
          });
        }
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully. You can track its status from your dashboard.",
      });

      // Redirect after showing success animation
      setTimeout(() => {
        navigate("/citizen");
      }, 1500);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: getUserFriendlyError(error, 'submit'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <PremiumLayout navItems={citizenNavItems} title="New Complaint">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-[hsl(var(--severity-very-low))]/20 mb-6"
          >
            <CheckCircle2 className="h-12 w-12 text-[hsl(var(--severity-very-low))]" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold mb-2"
          >
            Complaint Submitted!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            Redirecting to dashboard...
          </motion.p>
        </div>
      </PremiumLayout>
    );
  }

  return (
    <PremiumLayout navItems={citizenNavItems} title="New Complaint">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="fade-in">
          <h2 className="text-2xl font-semibold tracking-tight">Submit New Complaint</h2>
          <p className="text-muted-foreground mt-1">
            Provide details about your civic issue and we'll route it to the appropriate authority
          </p>
        </div>

        <PremiumCard className="slide-up" style={{ animationDelay: "100ms" }}>
          <PremiumCardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <PremiumCardTitle>Complaint Details</PremiumCardTitle>
                <PremiumCardDescription>Fill in the details of your complaint</PremiumCardDescription>
              </div>
            </div>
          </PremiumCardHeader>
          <PremiumCardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Brief summary of the issue"
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>A clear, concise title for your complaint</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="ward_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          Ward
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select ward" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingOptions && (
                              <SelectItem value="loading" disabled>
                                Loading wards...
                              </SelectItem>
                            )}
                            {!isLoadingOptions && wards.length === 0 && (
                              <SelectItem value="no-wards" disabled>
                                No wards available
                              </SelectItem>
                            )}
                            {!isLoadingOptions &&
                              wards.map((ward) => (
                                <SelectItem key={ward.id} value={ward.id}>
                                {ward.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          Category
                        </FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingOptions && (
                              <SelectItem value="loading" disabled>
                                Loading categories...
                              </SelectItem>
                            )}
                            {!isLoadingOptions && categories.length === 0 && (
                              <SelectItem value="no-categories" disabled>
                                No categories available
                              </SelectItem>
                            )}
                            {!isLoadingOptions &&
                              categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location / Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Street address or landmark"
                          className="rounded-xl"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Where is the issue located?</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed description of the issue, including any relevant context or urgency..."
                          className="rounded-xl min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Be specific - detailed descriptions help authorities resolve issues faster
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--severity-medium-bg))] border border-[hsl(var(--severity-medium))]/20">
                  <AlertTriangle className="h-5 w-5 text-[hsl(var(--severity-medium))] shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Severity is automatically calculated based on your description, category, and ward sensitivity. Critical keywords will escalate priority.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-xl flex-1"
                    onClick={() => navigate("/citizen")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-xl flex-1 btn-premium"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Complaint
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </PremiumCardContent>
        </PremiumCard>
      </div>
    </PremiumLayout>
  );
}
