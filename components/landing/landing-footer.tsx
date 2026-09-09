import Link from "next/link";
import Image from "next/image";
import { GitCommit, ArrowUpRight } from "lucide-react";

interface CommitItem {
  sha: string;
  message: string;
  date: string;
  authorName: string;
  url: string;
}

const FALLBACK_COMMITS: CommitItem[] = [
  {
    sha: "6f2281c",
    message: "Merge pull request #11 from ozcod/bug/singup",
    date: "2026-08-13",
    authorName: "Ozair Ahmad",
    url: "https://github.com/ozcod/oagpt/commit/6f2281c",
  },
  {
    sha: "7a727f4",
    message: "feat: implement authentication system with email verification, sign-in, and sign-up flows",
    date: "2026-08-13",
    authorName: "Ozair Ahmad",
    url: "https://github.com/ozcod/oagpt/commit/7a727f4",
  },
  {
    sha: "96c0204",
    message: "fix: use standard authClient.signUp.email and ensure verification email link redirects to /auth/signin",
    date: "2026-08-08",
    authorName: "Ozair Ahmad",
    url: "https://github.com/ozcod/oagpt/commit/96c0204",
  },
];

async function getRecentCommits(): Promise<CommitItem[]> {
  try {
    const res = await fetch("https://api.github.com/repos/ozcod/oagpt/commits?per_page=3", {
      headers: {
        "User-Agent": "oagpt-app",
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return FALLBACK_COMMITS;
    const data = await res.json();
    if (!Array.isArray(data)) return FALLBACK_COMMITS;

    return data.map((item: {
      sha: string;
      html_url: string;
      commit: {
        message: string;
        author?: { name?: string; date?: string };
      };
    }) => ({
      sha: item.sha.slice(0, 7),
      message: item.commit.message.split("\n")[0],
      date: item.commit.author?.date ? item.commit.author.date.slice(0, 10) : "",
      authorName: item.commit.author?.name || "Ozair Ahmad",
      url: item.html_url,
    }));
  } catch {
    return FALLBACK_COMMITS;
  }
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const TECH_STACK = [
  "Next.js 15",
  "React 19",
  "TypeScript",
  "Tailwind CSS v4",
  "PostgreSQL",
  "Drizzle ORM",
  "Better Auth",
  "LangChain JS",
  "FLUX 1 Schnell",
];

export async function LandingFooter() {
  const commits = await getRecentCommits();

  return (
    <footer className="border-t border-white/[0.06] bg-[#121212] pt-14 pb-10 text-zinc-400">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12 border-b border-white/[0.06]">
          {/* Left Column: Brand, Project by ozairahmad.com, and Technologies used */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Image
                  src="/logo-white.png"
                  alt="OAGPT"
                  width={20}
                  height={20}
                  className="rounded opacity-90"
                />
                <span className="text-sm font-semibold tracking-tight text-white">
                  OAGPT
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400">Unified AI Chat &amp; Studio</span>
              </div>

              <p className="mt-2 text-xs text-zinc-400 max-w-md leading-relaxed">
                A project by{" "}
                <a
                  href="https://ozairahmad.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white hover:text-blue-400 underline underline-offset-4 transition-colors"
                >
                  ozairahmad.com
                </a>
                . Engineered for deep reasoning, rapid code synthesis, and photorealistic AI image generation.
              </p>
            </div>

            {/* Technologies Used Section */}
            <div>
              <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mb-2.5">
                Technologies Used
              </div>
              <div className="flex flex-wrap gap-1.5 max-w-lg">
                {TECH_STACK.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 text-[11px] font-mono text-zinc-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: GitHub Repository & Latest changes module card */}
          <div className="lg:col-span-5 flex justify-start lg:justify-end">
            <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#171717] p-4 text-left shadow-xl shadow-black/40">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                    <GitCommit className="h-3 w-3 text-zinc-400 shrink-0" />
                    <span>GITHUB REPOSITORY • ozcod/oagpt</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-0.5">
                    Latest changes
                  </div>
                </div>

                <Link
                  href="https://github.com/ozcod/oagpt/commits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-zinc-400 hover:text-white flex items-center gap-0.5 transition-colors"
                >
                  <span>Commits</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Commits List */}
              <div className="space-y-2">
                {commits.slice(0, 3).map((commit) => (
                  <Link
                    key={commit.sha}
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2.5 rounded-lg p-1.5 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-zinc-300 group-hover:text-white group-hover:bg-white/10 shrink-0">
                        {commit.sha}
                      </span>
                      <span className="text-[11px] text-zinc-400 group-hover:text-zinc-200 truncate">
                        {commit.message}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0">
                      {formatDate(commit.date)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Navigation */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div>
            &copy; {new Date().getFullYear()} OAGPT. A project by{" "}
            <a
              href="https://ozairahmad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
            >
              ozairahmad.com
            </a>
          </div>

          <div className="flex items-center gap-5 text-zinc-400">
            <Link href="/chat" className="hover:text-white transition-colors">
              Chat
            </Link>
            <Link href="/images" className="hover:text-white transition-colors">
              Studio
            </Link>
            <Link href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/auth/signin" className="hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
