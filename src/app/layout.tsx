import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PredictCast - Decentralized Prediction Markets",
  description: "A decentralized prediction market platform built on Farcaster. Create markets, make predictions, and earn rewards.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "PredictCast - Decentralized Prediction Markets",
    description: "A decentralized prediction market platform built on Farcaster",
    type: "website",
    url: "https://predictcast-v2.vercel.app",
    images: [
      {
        url: "https://predictcast-v2.vercel.app/api/og",
        width: 1200,
        height: 630,
        alt: "PredictCast",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PredictCast - Decentralized Prediction Markets",
    description: "A decentralized prediction market platform built on Farcaster",
    images: ["https://predictcast-v2.vercel.app/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
