import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'FastJob - Industrial Hiring Platform',
  description: 'No frills, high density job board.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout-wrapper">
          <ToastProvider>
            <Header />
            <main className="container main-content">
              {children}
            </main>
          </ToastProvider>
        </div>
      </body>
    </html>
  );
}
