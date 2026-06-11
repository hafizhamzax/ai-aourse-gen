import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { UserDetailProvider } from './_context/UserDetailContext';
import ToasterProvider from './_components/ToasterProvider';
import { ThemeProvider } from './_context/ThemeContext';
import { BRAND_NAME, BRAND_TAGLINE } from '@/lib/brand';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: BRAND_NAME,
  description: BRAND_TAGLINE,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <UserDetailProvider>{children}</UserDetailProvider>
        </ThemeProvider>
        <ToasterProvider />
      </body>
    </html>
  );
}
