import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { cookies, headers } from "next/headers";
import { localeFromAcceptLanguage, parseLocale } from "@/lib/locale";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

const themeInitScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("theme");
    const theme = stored === "light" || stored === "dark" ? stored : "dark";
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://takagibit18.github.io"),
  title: "Sean Yu - Agent / LLM Engineer",
  description:
    "Computer Science undergraduate at Minzu University of China. Python, FastAPI, LLM APIs, agents, RAG, and open source.",
  openGraph: {
    title: "Sean Yu - Agent / LLM Engineer",
    description:
      "Personal homepage and AI profile assistant for Sean Yu, focused on Agent, RAG, and LLM systems.",
    url: "/",
    siteName: "Talk to Sean",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Sean Yu" }],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Yu - Agent / LLM Engineer",
    description:
      "Agent, RAG, and LLM systems portfolio with an AI profile assistant.",
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const headersList = await headers();
  const requestLocale = headersList.get("x-talk-locale");
  const cookieLocale = cookieStore.get("lang")?.value;
  const lang = requestLocale
    ? parseLocale(requestLocale)
    : cookieLocale
      ? parseLocale(cookieLocale)
      : localeFromAcceptLanguage(headersList.get("accept-language"));

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>
        <a href="#main-content" className="skip-link focus-ring">
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
