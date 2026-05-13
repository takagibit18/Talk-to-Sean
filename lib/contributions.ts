const USERNAME = process.env.GITHUB_USERNAME || "takagibit18";

export interface ContributionDay {
  date: string;
  count: number;
}

export async function getContributions(): Promise<ContributionDay[]> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${USERNAME}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.contributions || [];
  } catch {
    return [];
  }
}
