import { NextResponse } from "next/server";

const GITHUB_PAT = "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";

export async function GET() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/atianalew-ctrl/lumeya-connect/commits/main",
      {
        headers: {
          Authorization: `token ${GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return NextResponse.json(null);
    const data = await res.json();
    return NextResponse.json({
      sha: data.sha?.slice(0, 7),
      message: data.commit?.message?.split("\n")[0],
      author: data.commit?.author?.name,
      date: data.commit?.author?.date,
      url: data.html_url,
    });
  } catch {
    return NextResponse.json(null);
  }
}
