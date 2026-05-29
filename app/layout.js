import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: { default: 'BikeTheMap', template: '%s | BikeTheMap' },
  description: 'Plan bike routes with elevation and surface insights',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

// vercel ready
