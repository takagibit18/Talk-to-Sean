import HomeContent from "@/components/HomeContent";
import { getGitHubUser, getGitHubRepos } from "@/lib/github";
import { getContributions } from "@/lib/contributions";
import { CV_DATA } from "@/lib/cv-data";
import { parseLocale } from "@/lib/locale";

export const revalidate = 3600;

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : {};
  const rawLang = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const initialLocale = parseLocale(rawLang);
  const [user, repos, contributions] = await Promise.all([
    getGitHubUser(),
    getGitHubRepos(6),
    getContributions(),
  ]);
  const talkToSeanUrl = "/chat";
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: CV_DATA.en.hero.name,
    alternateName: CV_DATA.en.hero.nameLatin,
    jobTitle: "Agent / LLM Engineer",
    url: "https://takagibit18.github.io",
    sameAs: ["https://github.com/takagibit18"],
    email: CV_DATA.en.contact.email,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <HomeContent
        user={user}
        repos={repos}
        contributions={contributions}
        talkToSeanUrl={talkToSeanUrl}
        initialLocale={initialLocale}
      />
    </>
  );
}
