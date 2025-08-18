import type { Metadata } from "next";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { StickyAd } from "@/components/sticky-ad";

export const metadata: Metadata = {
  title: {
    default: "TempMailed - Your Secure Temporary Email Address",
    template: "%s | TempMailed",
  },
  description: "Get a free, secure, and anonymous temporary email address with TempMailed. Protect your privacy and avoid spam with our disposable email service.",
  keywords: ["temporary email", "disposable email", "temp mail", "anonymous email", "spam protection"],
  openGraph: {
    title: "TempMailed - Secure Temporary Email",
    description: "Your go-to solution for temporary, disposable email addresses.",
    type: "website",
    url: "https://tempmailed.vlkn.in",
    images: [{ url: "https://placehold.co/1200x630.png", alt: "TempMailed Hero Image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TempMailed - Secure Temporary Email",
    description: "Your go-to solution for temporary, disposable email addresses.",
    images: ["https://placehold.co/1200x630.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  const theme = window.localStorage.getItem('theme');
                  if (theme) return theme;
                  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                const theme = getTheme();
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5298799876063123"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-body antialiased pb-28">
        {children}
        <Toaster />
        <StickyAd />
      </body>
    </html>
  );
}
