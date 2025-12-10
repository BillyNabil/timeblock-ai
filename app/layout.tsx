import type { Metadata } from "next";
import { Outfit, Fredoka } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeBlock.ai",
  description: "Focus on what matters with AI-powered time blocking.",
  icons: {
    icon: "/icon.png",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${fredoka.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
