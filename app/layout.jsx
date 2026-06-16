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
  metadataBase: new URL('https://YOUR-VERCEL-DOMAIN.vercel.app'), // Update this after deployment!
  title: {
    default: `${BRAND_NAME} - AI Course Generator & Learning Content Creator`,
    template: `%s | ${BRAND_NAME}`,
  },
  description: BRAND_TAGLINE,
  keywords: [
    "AI course generator",
    "create courses with AI",
    "AI quiz maker",
    "course creator",
    "AI learning content",
    "educational content AI",
    "build courses automatically",
    "CourseForge AI",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://YOUR-VERCEL-DOMAIN.vercel.app",
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    siteName: BRAND_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    creator: "@yourhandle",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
