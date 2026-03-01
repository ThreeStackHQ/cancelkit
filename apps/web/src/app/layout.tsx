import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CancelKit",
    template: "%s | CancelKit",
  },
  description:
    "Cancel flow wizard for SaaS retention. Show a multi-step flow when users try to cancel.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
