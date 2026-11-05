import { getLocale, getTranslations } from "next-intl/server";
import { BookPlus, GitBranch, GitCommitHorizontal, GitMerge, GitPullRequest, GitPullRequestClosed, Tag, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { WaveCard } from "@/components/ui/wave-card";
import { contactInfo } from "@/lib/contact-info";
import { getGithubLog, type LogEntryKind } from "@/lib/github-log";

const ICONS: Record<LogEntryKind, LucideIcon> = {
  commit: GitCommitHorizontal,
  "pr-opened": GitPullRequest,
  "pr-merged": GitMerge,
  "pr-closed": GitPullRequestClosed,
  branch: GitBranch,
  repo: BookPlus,
  tag: Tag,
};

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000],
  ["month", 2_592_000],
  ["week", 604_800],
  ["day", 86_400],
  ["hour", 3_600],
  ["minute", 60],
];

function timeAgo(isoDate: string, locale: string) {
  const seconds = (new Date(isoDate).getTime() - Date.now()) / 1000;
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  const [unit, size] = UNITS.find(([, unitSeconds]) => Math.abs(seconds) >= unitSeconds) ?? ["minute", 60];
  return formatter.format(Math.trunc(seconds / size), unit);
}

/** "Captain's log": latest public GitHub activity, refreshed hourly. Hidden when GitHub has nothing to show. */
export async function GithubLog() {
  const [entries, logTexts, locale] = await Promise.all([getGithubLog(), getTranslations("log"), getLocale()]);
  if (!entries.length) return null;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10">
      <Reveal>
        <h2 className="font-display text-3xl font-medium tracking-tight text-signal">{logTexts("title")}</h2>
        <p className="mt-2 text-muted-foreground">{logTexts("subtitle")}</p>
      </Reveal>
      <Reveal className="mt-6" delay={0.1}>
        <WaveCard className="py-2!">
          <ol className="divide-y divide-border">
            {entries.map((entry) => {
              const Icon = ICONS[entry.kind];
              return (
                <li key={entry.id}>
                  <a
                    href={entry.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex min-h-11 items-start gap-3 py-3 transition-colors"
                  >
                    <Icon aria-hidden className="mt-0.5 size-4 shrink-0 text-signal" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm transition-colors group-hover:text-signal">
                        {logTexts(`kinds.${entry.kind}`, { repo: entry.repo, number: entry.number ?? 0, detail: entry.detail ?? "" })}
                      </span>
                      {entry.kind === "commit" && entry.detail && (
                        <span className="mt-0.5 block truncate font-data text-xs text-muted-foreground">“{entry.detail}”</span>
                      )}
                    </span>
                    <time dateTime={entry.date} className="shrink-0 font-data text-xs text-muted-foreground">
                      {timeAgo(entry.date, locale)}
                    </time>
                  </a>
                </li>
              );
            })}
          </ol>
          <a
            href={contactInfo.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex min-h-11 items-center font-data text-xs text-muted-foreground transition-colors hover:text-signal"
          >
            {logTexts("profile")} →
          </a>
        </WaveCard>
      </Reveal>
    </section>
  );
}
