import { describe, expect, it } from "vitest";
import { getProjectSlugs, getAllProjectsMeta } from "@/lib/projects";

describe("projects lib", () => {
  it("returns matching slugs for es and en", () => {
    expect(getProjectSlugs("es").sort()).toEqual(getProjectSlugs("en").sort());
  });

  it("loads metadata for every project in both locales", async () => {
    const spanishProjects = await getAllProjectsMeta("es");
    const englishProjects = await getAllProjectsMeta("en");
    expect(spanishProjects).toHaveLength(3);
    expect(englishProjects).toHaveLength(3);
    expect(spanishProjects.map((project) => project.slug).sort()).toEqual(
      englishProjects.map((project) => project.slug).sort(),
    );
  });
});
