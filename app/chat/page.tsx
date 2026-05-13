import ChatShell from "@/components/chat/ChatShell";
import { parseLocale } from "@/lib/locale";

type ChatPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = {
  title: "Talk to Sean - AI Profile Assistant",
  description: "Ask Sean Yu's AI profile assistant about his public work and projects.",
};

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const params = searchParams ? await searchParams : {};
  const rawLang = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const locale = parseLocale(rawLang);

  return <ChatShell initialLocale={locale} />;
}
