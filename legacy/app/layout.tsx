import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import type { DynamicLayoutProps } from "@/lib/types";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gharmai Kirana — Online Grocery Birgunj",
  description:
    "घरमै किराना, पसलभन्दा सस्तो मूल्यमा। Online grocery delivery in Birgunj at prices lower than local retail shops.",
};

export default function RootLayout({ children }: DynamicLayoutProps) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}