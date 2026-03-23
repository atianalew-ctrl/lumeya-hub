import { NextResponse } from "next/server";

const GITHUB_PAT = "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";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/atianalew-ctrl/lumeya-connect/commits?sha=main&per_page=15",
      {
        headers: {
          Authorization: `token ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return NextResponse.json([]);
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return NextResponse.json(data.map((c: any) => ({
      sha: c.sha?.slice(0, 7),
      message: c.commit?.message?.split("\n")[0],
      author: c.commit?.author?.name,
      date: c.commit?.author?.date,
      url: c.html_url,
    })));
  } catch {
    return NextResponse.json([]);
  }
}
