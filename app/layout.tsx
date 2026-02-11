import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rexon - Find Commercial warehouses in India",
  description: "Rexon is India's leading platform for finding and listing commercial warehouses. Discover the perfect space for your business needs with our extensive listings and user-friendly interface.",
  keywords: "commercial warehouse, warehouse rental, warehouse for sale, commercial space India, warehouse listing",
  authors: [{ name: "Rexon" }],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
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
    <html lang="en">
      <head>
        {/* Optimize image loading from Unsplash CDN */}
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        {/* Preconnect to S3 bucket */}
        <link rel="dns-prefetch" href="https://rexon-web.s3.ap-south-2.amazonaws.com" />
        <link rel="preconnect" href="https://rexon-web.s3.ap-south-2.amazonaws.com" crossOrigin="anonymous" />
        {/* Performance optimizations */}
        <meta name="theme-color" content="#1e3a8a" />
        <meta httpEquiv="x-ua-compatible" content="IE=edge" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
