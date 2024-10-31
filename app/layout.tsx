import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Imaginix",
  description:
    "Draw Real Time AI generally denotes an artificial intelligence application capable of analyzing, synthesizing, or transforming visual content in real-time. This encompasses activities such as rendering, illustrating, or manipulating images with the proficiency of a human artist, but executed autonomously and instantaneously by the AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
