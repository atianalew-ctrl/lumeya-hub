const GITHUB_PAT = "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";
const REPO = "atianalew-ctrl/lumeya-connect";

export async function getLatestCommit() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/commits/main`,
      {
        headers: {
          Authorization: `token ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      sha: data.sha?.slice(0, 7),
      message: data.commit?.message?.split("\n")[0],
      author: data.commit?.author?.name,
      date: data.commit?.author?.date,
      url: data.html_url,
    };
  } catch {
    return null;
  }
}

export async function getCommits(limit = 15) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/commits?sha=main&per_page=${limit}`,
      {
        headers: {
          Authorization: `token ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: Record<string, unknown>) => ({
      sha: (c.sha as string)?.slice(0, 7),
      message: ((c.commit as Record<string, unknown>)?.message as string)?.split("\n")[0],
      author: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.name,
      date: ((c.commit as Record<string, unknown>)?.author as Record<string, unknown>)?.date,
      url: c.html_url,
    }));
  } catch {
    return [];
  }
}
