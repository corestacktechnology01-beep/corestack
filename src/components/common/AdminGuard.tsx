import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isAdminProfile } from '@/contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

/**
 * Protects admin routes.
 * Waits for both user + profile to load before deciding to redirect.
 * Redirects to /admin/login only when we are certain user is NOT admin.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || profile === undefined) return;
    if (!user || !isAdminProfile(profile, user)) {
      navigate('/admin/login', { replace: true });
    }
  }, [user, profile, loading, navigate]);

  // Show spinner while: initial auth load, OR user logged in but profile still fetching
  if (loading || (user && profile === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // Not logged in or not admin — render nothing (redirect in progress)
  if (!user || !isAdminProfile(profile, user)) {
    return null;
  }

  return <>{children}</>;
}
