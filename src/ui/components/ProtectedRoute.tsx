import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
type AppRole = 'citizen' | 'authority' | 'admin';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Return Navigate wrapped in fragment to avoid ref warning
    return (
      <>
        <Navigate to="/auth" state={{ from: location }} replace />
      </>
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = getDashboardPath(role);
    return (
      <>
        <Navigate to={dashboardPath} replace />
      </>
    );
  }

  return <>{children}</>;
}

export function getDashboardPath(role: AppRole | null): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'authority':
      return '/authority';
    case 'citizen':
    default:
      return '/citizen';
  }
}
