import HomeContent from "@/components/HomeContent";
import { getContributions } from "@/lib/contributions";
import { getGitHubRepos, getGitHubUser } from "@/lib/github";

export default async function Home() {
  const [user, repos, contributions] = await Promise.all([
    getGitHubUser(),
    getGitHubRepos(6),
    getContributions()
  ]);

  return (
    <HomeContent
      user={user}
      repos={repos}
      contributions={contributions}
    />
  );
}
