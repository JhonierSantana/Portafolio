import { contactInfo } from "@/lib/contact-info";

export type LogEntryKind = "commit" | "pr-opened" | "pr-merged" | "pr-closed" | "branch" | "repo" | "tag";

export type LogEntry = {
  id: string;
  kind: LogEntryKind;
  /** Repository name without the owner. */
  repo: string;
  /** ISO date of the event. */
  date: string;
  url: string;
  /** Commit message, branch or tag name. */
  detail?: string;
  /** Pull request number. */
  number?: number;
};

type GithubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string };
  payload: {
    action?: string;
    number?: number;
    head?: string;
    ref?: string | null;
    ref_type?: "branch" | "repository" | "tag";
    pull_request?: { merged?: boolean };
  };
};

/** GitHub data changes slowly; one refresh per hour keeps well under the unauthenticated rate limit. */
const REVALIDATE_SECONDS = 3600;
const GITHUB_USERNAME = new URL(contactInfo.githubUrl).pathname.slice(1);

function githubFetch(path: string) {
  const token = process.env.GITHUB_TOKEN?.trim();
  return fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    next: { revalidate: REVALIDATE_SECONDS },
  });
}

/** Public events no longer include commit messages, so each pushed head is looked up. */
async function commitMessage(repo: string, sha: string) {
  const response = await githubFetch(`/repos/${repo}/commits/${sha}`);
  if (!response.ok) return undefined;
  const { commit } = (await response.json()) as { commit: { message: string } };
  return commit.message.split("\n")[0];
}

async function toEntry(event: GithubEvent): Promise<LogEntry | null> {
  const repoUrl = `https://github.com/${event.repo.name}`;
  const base = { id: event.id, repo: event.repo.name.split("/")[1], date: event.created_at };
  const { payload } = event;

  switch (event.type) {
    case "PushEvent":
      if (!payload.head) return null;
      return {
        ...base,
        kind: "commit",
        url: `${repoUrl}/commit/${payload.head}`,
        detail: await commitMessage(event.repo.name, payload.head),
      };
    case "PullRequestEvent": {
      const merged = payload.action === "merged" || (payload.action === "closed" && payload.pull_request?.merged);
      const kind = merged ? "pr-merged" : payload.action === "opened" ? "pr-opened" : payload.action === "closed" ? "pr-closed" : null;
      if (!kind || !payload.number) return null;
      return { ...base, kind, number: payload.number, url: `${repoUrl}/pull/${payload.number}` };
    }
    case "CreateEvent":
      if (payload.ref_type === "repository") return { ...base, kind: "repo", url: repoUrl };
      return {
        ...base,
        kind: payload.ref_type === "tag" ? "tag" : "branch",
        detail: payload.ref ?? undefined,
        url: `${repoUrl}/tree/${payload.ref ?? ""}`,
      };
    default:
      return null;
  }
}

/**
 * Latest public GitHub activity as captain's-log entries. Only the newest event per pull request
 * is kept (an "opened" followed by "merged" shows once). Any failure yields an empty log.
 */
export async function getGithubLog(limit = 5): Promise<LogEntry[]> {
  try {
    const response = await githubFetch(`/users/${GITHUB_USERNAME}/events/public?per_page=30`);
    if (!response.ok) return [];
    const events = (await response.json()) as GithubEvent[];

    const seenPullRequests = new Set<string>();
    const relevant = events.filter((event) => {
      if (event.type !== "PullRequestEvent") return ["PushEvent", "CreateEvent"].includes(event.type);
      const key = `${event.repo.name}#${event.payload.number}`;
      if (seenPullRequests.has(key)) return false;
      seenPullRequests.add(key);
      return true;
    });

    const entries = await Promise.all(relevant.slice(0, limit + 3).map(toEntry));
    return entries.filter((entry): entry is LogEntry => entry !== null).slice(0, limit);
  } catch {
    return [];
  }
}
