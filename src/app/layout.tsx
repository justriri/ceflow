import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Ceflow is an AI-powered yield agent that helps users discover, optimize, and execute the best stablecoin yield opportunities on Celo.";

export const metadata: Metadata = {
  title: {
    default: "Ceflow — The AI Yield Agent for Celo Stablecoins",
    template: "%s · Ceflow",
  },
  description,
  applicationName: "Ceflow",
  openGraph: {
    title: "Ceflow — The AI Yield Agent for Celo Stablecoins",
    description,
    siteName: "Ceflow",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceflow — The AI Yield Agent for Celo Stablecoins",
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
