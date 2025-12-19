import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { FloatingNav } from "@/components/layout/floating-nav";
import { CommandPalette } from "@/components/layout/command-palette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kiwi Status",
  description: "Self-hosted uptime monitoring tool",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/fonts/fonts.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="relative min-h-screen">
            <FloatingNav />
            <CommandPalette />
            <main className="px-6 lg:px-8 pb-12 max-w-[1600px] mx-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
