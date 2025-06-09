import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ModeToggle } from "@/components/mode-toggle";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import Link from "next/link";
import { CalendarRange } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "timetable.1024.works | イベントのタイムテーブル作成・協調編集アプリ",
  description:
    "timetable.1024.worksは、イベントのタイムテーブルをリアルタイムで共同編集できるWebアプリです。シンプルなUIでドラッグ＆ドロップやリンク共有も可能。",
  openGraph: {
    title:
      "timetable.1024.works | イベントのタイムテーブル作成・協調編集アプリ",
    description:
      "timetable.1024.worksは、イベントのタイムテーブルをリアルタイムで共同編集できるWebアプリです。シンプルなUIでドラッグ＆ドロップやリンク共有も可能。",
    url: "https://timetable.1024.works/",
    siteName: "timetable.1024.works",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: "timetable.1024.works OGP image",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "timetable.1024.works | イベントのタイムテーブル作成・協調編集アプリ",
    description:
      "timetable.1024.worksは、イベントのタイムテーブルをリアルタイムで共同編集できるWebアプリです。シンプルなUIでドラッグ＆ドロップやリンク共有も可能。",
    images: ["/ogp.png"],
    site: "@hota1024",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <header className="sticky top-0 z-20 w-full bg-background/60 backdrop-blur-sm shadow-sm border-b border-border/30 px-0 py-0">
              <div className="max-w-2xl mx-auto w-full flex items-center justify-between py-2 px-2 sm:px-0">
                <Link
                  href="/"
                  className="flex items-center gap-2 group select-none"
                >
                  <span className="rounded-full bg-primary/5 p-1">
                    <CalendarRange className="size-5 text-primary/60 group-hover:scale-105 transition-transform" />
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-primary/70 group-hover:text-primary transition-colors">
                    timetable.1024.works
                  </span>
                </Link>
                <ModeToggle />
              </div>
            </header>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
