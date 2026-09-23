import { describe, expect, it } from "vitest";
import { getProjectSlugs, getAllProjectsMeta } from "@/lib/projects";

describe("projects lib", () => {
  it("returns matching slugs for es and en", () => {
    expect(getProjectSlugs("es").sort()).toEqual(getProjectSlugs("en").sort());
  });

  it("loads metadata for every project in both locales", async () => {
    const es = await getAllProjectsMeta("es");
    const en = await getAllProjectsMeta("en");
    expect(es).toHaveLength(3);
    expect(en).toHaveLength(3);
    expect(es.map((p) => p.slug).sort()).toEqual(en.map((p) => p.slug).sort());
  });
});
