import './globals.css';
import { Inter } from 'next/font/google';
import { cookies } from 'next/headers';
import { getUserBySessionToken } from '../database/users';

const inter = Inter({ subsets: ['latin'] });
export const metadata = {
  title: { default: 'BikeTheMap | UpLeveled', template: '%s | UpLeveled' },
  description: 'Generated',
};

export default async function RootLayout({ children }) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get('sessionToken');

  const user = !sessionToken?.value
    ? undefined
    : await getUserBySessionToken(sessionToken.value);
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
