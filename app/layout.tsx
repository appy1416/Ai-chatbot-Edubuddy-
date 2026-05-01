import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata: Metadata = {
  title: 'EduBot — AI Student Learning Chatbot',
  description: 'Your personal AI-powered academic assistant. Get instant help with Math, Science, Programming, and more. Designed for students from primary to higher education.',
  keywords: 'AI chatbot, student learning, education, tutoring, homework help, study assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
