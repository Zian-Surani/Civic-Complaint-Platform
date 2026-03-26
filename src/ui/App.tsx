import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { NotificationProvider } from "./hooks/useNotifications";
import { ThemeProvider } from "./hooks/useTheme";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Settings from "./pages/Settings";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import NewComplaint from "./pages/citizen/NewComplaint";
import ComplaintsList from "./pages/citizen/ComplaintsList";
import ComplaintDetail from "./pages/citizen/ComplaintDetail";
import AuthorityDashboard from "./pages/authority/AuthorityDashboard";
import AuthorityComplaintsList from "./pages/authority/ComplaintsList";
import AuthorityComplaintDetail from "./pages/authority/ComplaintDetail";
import AuthorityWards from "./pages/authority/AuthorityWards";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminComplaintsList from "./pages/admin/AdminComplaintsList";
import AdminComplaintDetail from "./pages/admin/AdminComplaintDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminConfig from "./pages/admin/AdminConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              
              {/* Settings Route - Available to all authenticated users */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            
            {/* Citizen Routes */}
            <Route
              path="/citizen"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/new"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <NewComplaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaints"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <ComplaintsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['citizen']}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />
            
            {/* Authority Routes */}
            <Route
              path="/authority"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/complaints"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityComplaintsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityComplaintDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/wards"
              element={
                <ProtectedRoute allowedRoles={['authority']}>
                  <AuthorityWards />
                </ProtectedRoute>
              }
            />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminComplaintsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminComplaintDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/config"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminConfig />
                </ProtectedRoute>
              }
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </NotificationProvider>
  </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
);

export default App;
