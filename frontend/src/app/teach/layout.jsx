import ProtectedRoute from '../../components/shared/ProtectedRoute';
import AppShell from '../../components/shared/AppShell';
export default function TeachLayout({children}){return <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>}
