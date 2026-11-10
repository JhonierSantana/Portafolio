/**
 * Builds the CV from content.mjs:
 *  - public/cv/jhonier-santana-cv-{es,en}.pdf  (downloaded from the site)
 *  - <out-dir>/Jhonier_Santana_CV_Fullstack_{ES,EN}.{pdf,docx}  (to send or upload; DOCX is editable)
 *
 * ATS rules followed: one column, real selectable text, standard section names, no tables,
 * icons, images or text boxes, contact details in the body (not in a header), plain URLs.
 *
 * Usage: npm run cv [-- --out-dir <folder>]   (default out dir: dist-cv/)
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import {
  AlignmentType,
  BorderStyle,
  Document,
  LevelFormat,
  Packer,
  Paragraph,
  TabStopType,
  TextRun,
} from "docx";
import { cv } from "./content.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const outDirFlag = process.argv.indexOf("--out-dir");
const OUT_DIR = outDirFlag > -1 ? path.resolve(process.argv[outDirFlag + 1]) : path.join(ROOT, "dist-cv");
const ACCENT = "1F4E8C";

/**
 * Contact details as short lines of parts ({ text, href?, label? }), so no URL is ever split across
 * lines. The portfolio gets its own line because its address is long.
 */
const contactLines = ({ contact }) => [
  [{ text: contact.location }, { text: contact.phone }, { text: contact.email, href: `mailto:${contact.email}` }],
  [
    { text: contact.linkedin, href: `https://www.${contact.linkedin}` },
    { text: contact.github, href: `https://${contact.github}` },
  ],
  [{ label: contact.portfolio.label, text: contact.portfolio.url, href: `https://${contact.portfolio.url}` }],
];

const partText = ({ label, text }) => (label ? `${label}: ${text}` : text);

// ---------------------------------------------------------------- PDF (HTML printed by Chromium)

const escapeHtml = (text) =>
  text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function renderHtml(data) {
  const { contact, sections } = data;
  const contactHtml = contactLines(data)
    .map((line) =>
      line
        .map((part) => {
          const text = part.href ? `<a href="${part.href}">${escapeHtml(part.text)}</a>` : escapeHtml(part.text);
          return part.label ? `${escapeHtml(part.label)}: ${text}` : text;
        })
        .join(" | "),
    )
    .join("<br>");

  const jobs = data.experience
    .map(
      (job) => `
      <article class="entry">
        <p class="entry-head"><span><strong>${escapeHtml(job.role)}</strong> | ${escapeHtml(job.company)} | ${escapeHtml(job.location)}</span><span class="date">${escapeHtml(job.period)}</span></p>
        <ul>${job.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}</ul>
      </article>`,
    )
    .join("");
  const skills = data.skills
    .map(([group, items]) => `<p class="skill"><strong>${escapeHtml(group)}:</strong> ${escapeHtml(items)}</p>`)
    .join("");
  const education = data.education
    .map(
      (item) =>
        `<p class="entry-head"><span><strong>${escapeHtml(item.title)}</strong> | ${escapeHtml(item.institution)}</span><span class="date">${escapeHtml(item.period)}</span></p>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="${data.lang}">
<head>
<meta charset="utf-8">
<title>${escapeHtml(contact.name)} – CV</title>
<style>
  @page { size: Letter; margin: 0.4in 0.55in; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: Arial, Helvetica, sans-serif; font-size: 9.2pt; line-height: 1.27; color: #1f2933; }
  a { color: inherit; text-decoration: none; }
  h1 { margin: 0; font-size: 20pt; letter-spacing: 0.2pt; color: #111827; }
  .headline { margin: 2pt 0 0; font-size: 10.5pt; font-weight: bold; color: #${ACCENT}; }
  .contact { margin: 3pt 0 0; font-size: 8.8pt; }
  h2 { margin: 8pt 0 3pt; padding-bottom: 2pt; border-bottom: 1px solid #${ACCENT}; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.6pt; color: #${ACCENT}; }
  p { margin: 0; }
  .entry { margin-top: 3pt; break-inside: avoid; }
  .entry-head { display: flex; justify-content: space-between; gap: 12pt; margin-top: 3pt; }
  .date { white-space: nowrap; font-style: italic; }
  ul { margin: 2pt 0 0; padding-left: 13pt; }
  li { margin-top: 1pt; }
  .skill { margin-top: 2pt; }
</style>
</head>
<body>
  <h1>${escapeHtml(contact.name)}</h1>
  <p class="headline">${escapeHtml(data.headline)}</p>
  <p class="contact">${contactHtml}</p>

  <h2>${escapeHtml(sections.summary)}</h2>
  <p class="summary">${escapeHtml(data.summary)}</p>

  <h2>${escapeHtml(sections.experience)}</h2>
  ${jobs}

  <h2>${escapeHtml(sections.skills)}</h2>
  ${skills}

  <h2>${escapeHtml(sections.education)}</h2>
  ${education}

  <h2>${escapeHtml(sections.languages)}</h2>
  <p>${escapeHtml(data.languages)}</p>
</body>
</html>`;
}

// ---------------------------------------------------------------- DOCX (editable copy)

const FONT = "Arial";
const PAGE = { width: 12240, height: 15840 }; // US Letter, in DXA
const MARGIN = { top: 648, bottom: 648, left: 792, right: 792 }; // 0.45in / 0.55in
const RIGHT_TAB = PAGE.width - MARGIN.left - MARGIN.right;

const run = (text, options = {}) => new TextRun({ text, font: FONT, size: 18, ...options });
const datedLine = (left, date) =>
  new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }],
    spacing: { before: 100, after: 20 },
    keepNext: true,
    children: [...left, run(`\t${date}`, { italics: true })],
  });

function renderDocx(data) {
  const { contact, sections } = data;
  const heading = (text) =>
    new Paragraph({
      spacing: { before: 180, after: 60 },
      keepNext: true,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 2 } },
      children: [run(text.toUpperCase(), { bold: true, size: 21, color: ACCENT })],
    });
  const bullet = (text) =>
    new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 20 }, children: [run(text)] });

  const children = [
    new Paragraph({ children: [run(contact.name, { bold: true, size: 40, color: "111827" })] }),
    new Paragraph({ spacing: { before: 40 }, children: [run(data.headline, { bold: true, size: 21, color: ACCENT })] }),
    ...contactLines(data).map(
      (line, index) => new Paragraph({ spacing: { before: index ? 0 : 60 }, children: [run(line.map(partText).join(" | "), { size: 17 })] }),
    ),
    heading(sections.summary),
    new Paragraph({ children: [run(data.summary)] }),
    heading(sections.experience),
    ...data.experience.flatMap((job) => [
      datedLine([run(job.role, { bold: true }), run(` | ${job.company} | ${job.location}`)], job.period),
      ...job.points.map(bullet),
    ]),
    heading(sections.skills),
    ...data.skills.map(
      ([group, items]) => new Paragraph({ spacing: { before: 30 }, children: [run(`${group}: `, { bold: true }), run(items)] }),
    ),
    heading(sections.education),
    ...data.education.map((item) => datedLine([run(item.title, { bold: true }), run(` | ${item.institution}`)], item.period)),
    heading(sections.languages),
    new Paragraph({ children: [run(data.languages)] }),
  ];

  return new Document({
    creator: contact.name,
    title: `${contact.name} – CV`,
    description: data.headline,
    styles: { default: { document: { run: { font: FONT, size: 18 } } } },
    numbering: {
      config: [
        {
          reference: "bullets",
          levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 260, hanging: 200 } } } }],
        },
      ],
    },
    sections: [{ properties: { page: { size: PAGE, margin: MARGIN } }, children }],
  });
}

// ---------------------------------------------------------------- build

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch();
try {
  for (const data of Object.values(cv)) {
    const page = await browser.newPage();
    await page.setContent(renderHtml(data), { waitUntil: "load" });
    const pdf = await page.pdf({ format: "Letter", preferCSSPageSize: true, printBackground: false });
    await page.close();

    const docx = await Packer.toBuffer(renderDocx(data));
    const sendName = `Jhonier_Santana_CV_Fullstack_${data.lang.toUpperCase()}`;
    await writeFile(path.join(ROOT, "public", "cv", `jhonier-santana-cv-${data.lang}.pdf`), pdf);
    await writeFile(path.join(OUT_DIR, `${sendName}.pdf`), pdf);
    await writeFile(path.join(OUT_DIR, `${sendName}.docx`), docx);
    console.log(`✓ ${data.lang}: public/cv/jhonier-santana-cv-${data.lang}.pdf, ${sendName}.pdf, ${sendName}.docx`);
  }
} finally {
  await browser.close();
}
