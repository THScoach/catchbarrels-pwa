import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import CoachRickChat from '@/components/coach-rick-chat';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CatchBarrels - Momentum Transfer System',
  description: 'AI-Powered Baseball Swing Analysis & Momentum Transfer Training',
  manifest: '/manifest.json',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  icons: {
    icon: '/catchbarrels-logo-512.png',
    shortcut: '/favicon.ico',
    apple: '/catchbarrels-logo-512.png',
  },
  openGraph: {
    title: 'CatchBarrels - Momentum Transfer System',
    description: 'AI-Powered Baseball Swing Analysis & Momentum Transfer Training',
    images: ['/catchbarrels-logo-512.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CatchBarrels',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BARRELS" />
      </head>
      <body className={inter.className}>
        <Providers>
          <MainLayout>
            {children}
          </MainLayout>
          <CoachRickChat />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
