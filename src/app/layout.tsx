import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "WWM Companion — Where Winds Meet Build Planner",
    template: "%s | WWM Companion",
  },
  description:
    "Community build builder and skill rotation planner for Where Winds Meet. Create, share, and discover builds.",
  keywords: [
    "Where Winds Meet",
    "WWM",
    "build planner",
    "skill rotation",
    "community builds",
    "MMO build guide",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "WWM Companion",
    title: "WWM Companion — Where Winds Meet Build Planner",
    description:
      "Community build builder and skill rotation planner for Where Winds Meet.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} bg-gray-950 text-gray-100 min-h-screen flex flex-col antialiased`}
      >
        <Header />
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
