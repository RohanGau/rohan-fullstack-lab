import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { Inter } from 'next/font/google';
import { logoUrl, siteUrl } from '@/lib/constant';
import { ThemeProvider } from '@/components/theme/theme-provider';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0ea5e9' },
    { media: '(prefers-color-scheme: dark)', color: '#0ea5e9' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Rohan Kumar – Senior Frontend Engineer',
    template: '%s · Rohan Kumar',
  },
  description:
    'Senior Software Engineer specializing in frontend architecture, performance, and scalable design systems.',
  keywords: [
    'Rohan Kumar',
    'Senior Frontend Engineer',
    'React',
    'Next.js',
    'TypeScript',
    'Performance',
    'Architecture',
  ],
  authors: [{ name: 'Rohan Kumar', url: siteUrl }],
  creator: 'Rohan Kumar',
  publisher: 'Rohan Kumar',
  alternates: {
    canonical: '/', // good for home; use generateMetadata on inner pages
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Rohan Kumar',
    locale: 'en_US',
    title: 'Rohan Kumar – Senior Frontend Engineer',
    description: 'Building clean, scalable web experiences with React, Next.js, and TypeScript.',
    images: [
      {
        url: 'https://pub-92ca52f522664b02af9bc8a7906e3013.r2.dev/uploads/2025/08/10/og_image-3a0564a6.png?cb=1754843343426',
        width: 1200,
        height: 630,
        alt: 'Rohan Kumar — Senior Frontend Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@yourhandle', // ← replace with your real handle
    title: 'Rohan Kumar – Senior Frontend Engineer',
    description: 'Frontend architecture, performance, and design systems.',
    images: [
      'https://pub-92ca52f522664b02af9bc8a7906e3013.r2.dev/uploads/2025/08/10/og_image-3a0564a6.png?cb=1754843343426',
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icon-192.png', sizes: '180x180' }],
  },
  category: 'technology',
  // Optional: if you have a web app manifest
  // manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('min-h-screen flex flex-col bg-background text-foreground', inter.className)}
      >
        <ThemeProvider>
          <Header />
          <main id="content" className="flex-1 container max-w-5xl px-4 py-10 mx-auto">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
        {/* JSON-LD: Person */}
        <Script
          id="ld-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Rohan Kumar',
              url: siteUrl,
              logo: logoUrl,
              jobTitle: 'Senior Software Engineer (Frontend)',
              sameAs: ['https://github.com/rohan', 'https://www.linkedin.com/in/rohan-gautam'],
            }),
          }}
        />
        {/* JSON-LD: WebSite */}
        <Script
          id="ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: siteUrl,
              logo: logoUrl,
              name: 'Rohan Kumar Portfolio',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${siteUrl}/search?q={query}`,
                'query-input': 'required name=query',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
