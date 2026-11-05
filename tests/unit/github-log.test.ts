import { afterEach, describe, expect, it, vi } from "vitest";
import { getGithubLog } from "@/lib/github-log";

const events = [
  { id: "1", type: "PullRequestEvent", created_at: "2026-11-05T01:46:46Z", repo: { name: "JhonierSantana/Portafolio" }, payload: { action: "merged", number: 5 } },
  { id: "2", type: "PullRequestEvent", created_at: "2026-11-05T01:46:35Z", repo: { name: "JhonierSantana/Portafolio" }, payload: { action: "opened", number: 5 } },
  { id: "3", type: "WatchEvent", created_at: "2026-11-04T10:00:00Z", repo: { name: "someone/else" }, payload: {} },
  { id: "4", type: "CreateEvent", created_at: "2026-11-04T03:04:42Z", repo: { name: "JhonierSantana/Portafolio" }, payload: { ref: "feat/avatar-3d", ref_type: "branch" } },
  { id: "5", type: "PushEvent", created_at: "2026-10-06T14:10:09Z", repo: { name: "JhonierSantana/shift-experiences" }, payload: { head: "ba2ea51" } },
];

function mockGithub() {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.includes("/events/public")) return new Response(JSON.stringify(events));
      if (url.includes("/commits/ba2ea51")) return new Response(JSON.stringify({ commit: { message: "Modify CodeQL workflow\n\nlong body" } }));
      return new Response("not found", { status: 404 });
    }),
  );
}

describe("getGithubLog", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("turns public events into log entries, newest pull request event only", async () => {
    mockGithub();
    const log = await getGithubLog();
    expect(log.map((entry) => entry.kind)).toEqual(["pr-merged", "branch", "commit"]);
    expect(log[0]).toMatchObject({ repo: "Portafolio", number: 5, url: "https://github.com/JhonierSantana/Portafolio/pull/5" });
    expect(log[1].detail).toBe("feat/avatar-3d");
    expect(log[2]).toMatchObject({ detail: "Modify CodeQL workflow", url: "https://github.com/JhonierSantana/shift-experiences/commit/ba2ea51" });
  });

  it("returns an empty log when GitHub fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("rate limited", { status: 403 })));
    expect(await getGithubLog()).toEqual([]);
  });
});
