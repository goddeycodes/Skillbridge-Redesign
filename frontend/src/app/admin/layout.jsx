import ProtectedRoute from '../../components/shared/ProtectedRoute';
import AppShell from '../../components/shared/AppShell';

export const metadata = { title: 'Admin — SkillBridge' };

export default function AdminLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
