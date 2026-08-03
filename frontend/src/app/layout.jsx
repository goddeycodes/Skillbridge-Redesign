import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import './globals.css';

export const metadata = {
  title: 'SkillBridge — Peer-to-Peer Skill Exchange',
  description: 'Trade skills, earn credits, grow together.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontSize: '14px' },
              success: { iconTheme: { primary: '#1C6E6A', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}