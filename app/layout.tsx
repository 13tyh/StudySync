import "./globals.css";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {ThemeProvider} from "@/components/theme-provider";
import {Toaster} from "@/components/ui/toaster";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "StudySync | 学習時間を可視化",
  description: "学習時間を楽しく見える化してモチベ維持ができるアプリ",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
