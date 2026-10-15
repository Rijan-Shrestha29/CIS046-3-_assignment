import './globals.css';
import Navbar from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: '🍌 Banana Game',
  description: 'Solve equations, collect bananas, top the leaderboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="text-center text-xs text-muted py-6">
            CIS046-3 — Software for Enterprise
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}