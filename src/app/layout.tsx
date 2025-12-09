import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';

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
          <Header />
          <main className="container main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
