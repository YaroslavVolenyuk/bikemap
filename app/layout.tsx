import './globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import ServiceWorkerRegistrar from './Components/ServiceWorkerRegistrar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: { default: 'BikeTheMap', template: '%s | BikeTheMap' },
  description: 'Plan bike routes with elevation and surface insights',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BikeTheMap',
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: '#1a1a2e',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BikeTheMap" />
      </head>
      <body className={inter.className}>
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
