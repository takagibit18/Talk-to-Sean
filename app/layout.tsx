import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sean Yu | AI-native Developer",
  description:
    "Sean Yu's overseas portfolio with an embedded AI profile assistant for projects, skills, contact, and collaboration fit."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
