import ProtectedRoute from '../../components/shared/ProtectedRoute';
import AppShell from '../../components/shared/AppShell';
import { Suspense } from 'react';

export default function MessagesLayout({ children }) {
  return (
    <ProtectedRoute>
      <AppShell>
        <Suspense fallback={<div className="p-10 text-center text-sm text-slate-400">Loading messages…</div>}>
          {children}
        </Suspense>
      </AppShell>
    </ProtectedRoute>
  );
}
