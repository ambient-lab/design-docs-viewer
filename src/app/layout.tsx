import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getDocCategories } from "@/lib/docs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "設計書ビューア | Spring Sample Project",
  description: "Spring Sample Projectの設計書をMarkdown形式で閲覧できます",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = getDocCategories();

  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Sidebar categories={categories} />
        <main className="ml-72 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
