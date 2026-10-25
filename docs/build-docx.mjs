// Build the proposal .docx from the Markdown source.
//
// Pandoc regenerates the styles of its output (the reference document's styles only
// survive for custom style ids), so the typography is patched onto the finished
// file: Times New Roman 12pt, black headings, justified body, A4, and a centred
// page number in the footer.
//
//   node docs/build-docx.mjs
//
// No binary is kept in the repository. The template is rebuilt from pandoc's own
// default every time, so this script stays the single source of truth.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, readdirSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "proposal-pengembangan-produk.md");
const output = join(here, "proposal-pengembangan-produk.docx");

// A4 minus the 1 inch margins: the usable text width, in twips.
const TEXT_WIDTH = 9026;

const pandoc = ["pandoc", `${process.env.HOME}/.local/bin/pandoc`].find((bin) => {
  try {
    execFileSync(bin, ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
});
if (!pandoc) throw new Error("pandoc not found (install pandoc, or put it on PATH)");

const work = mkdtempSync(join(tmpdir(), "umsura-assignment-docx-"));
const run = (cmd, args, cwd = work) => execFileSync(cmd, args, { cwd, stdio: "pipe" });

/** Set the run properties of one style, adding an <w:rPr> when the style has none. */
const setRunProps = (xml, styleId, props) => {
  const style = new RegExp(`(<w:style [^>]*w:styleId="${styleId}"[^>]*>)([\\s\\S]*?)(</w:style>)`);
  return xml.replace(style, (_match, open, body, close) => {
    if (/<w:rPr>/.test(body)) {
      return open + body.replace(/<w:rPr>[\s\S]*?<\/w:rPr>/, `<w:rPr>${props}</w:rPr>`) + close;
    }
    return open + body.replace(/<\/w:pPr>|<\/w:style>/, (m) => m) + `<w:rPr>${props}</w:rPr>` + close;
  });
};

try {
  // 1. Pandoc's default template, unpacked so the parts can be patched.
  run("sh", ["-c", `"${pandoc}" --print-default-data-file reference.docx > ref.docx`]);
  run("unzip", ["-q", "ref.docx", "-d", "ref"]);

  const read = (part) => readFileSync(join(work, "ref", part), "utf8");
  const write = (part, xml) => writeFileSync(join(work, "ref", part), xml);

  // 2. Footer with a centred page number.
  write(
    "word/footer1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="center" /></w:pPr>
    <w:r><w:fldChar w:fldCharType="begin" /></w:r>
    <w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:fldChar w:fldCharType="separate" /></w:r>
    <w:r><w:t>1</w:t></w:r>
    <w:r><w:fldChar w:fldCharType="end" /></w:r>
  </w:p>
</w:ftr>`,
  );

  // 3. Register the footer: content type, relationship, and the section reference.
  write(
    "[Content_Types].xml",
    read("[Content_Types].xml").replace(
      "</Types>",
      '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" /></Types>',
    ),
  );
  write(
    "word/_rels/document.xml.rels",
    read("word/_rels/document.xml.rels").replace(
      "</Relationships>",
      '<Relationship Id="rIdFooter1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml" /></Relationships>',
    ),
  );
  write(
    "word/document.xml",
    read("word/document.xml").replace(
      "<w:sectPr>",
      '<w:sectPr><w:footerReference w:type="default" r:id="rIdFooter1" /><w:pgSz w:w="11906" w:h="16838" /><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0" />',
    ),
  );

  const patched = join(work, "reference.docx");
  run("zip", ["-q", "-X", "-r", patched, ...readdirSync(join(work, "ref"))], join(work, "ref"));

  // 4. Render the Markdown.
  run(pandoc, ["--reference-doc=" + patched, "--resource-path", here, "-o", output, source]);

  // 5. Patch the result: typography and table geometry.
  const outDir = join(work, "out");
  run("unzip", ["-q", output, "-d", outDir]);
  const readOut = (part) => readFileSync(join(outDir, part), "utf8");
  const writeOut = (part, xml) => writeFileSync(join(outDir, part), xml);

  let styles = readOut("word/styles.xml");
  const times = '<w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" />';
  styles = styles.replace(/<w:rFonts w:asciiTheme="minorHAnsi"[^/]*\/>/, times);
  for (const [id, size] of [
    ["Heading1", "32"],
    ["Heading2", "28"],
    ["Heading3", "26"],
  ]) {
    styles = setRunProps(styles, id, `${times}<w:b /><w:color w:val="000000" /><w:sz w:val="${size}" /><w:szCs w:val="${size}" />`);
  }
  styles = setRunProps(styles, "Title", `${times}<w:b /><w:sz w:val="40" /><w:szCs w:val="40" />`);
  // Justified body text, as in an academic report.
  styles = styles.replace(
    /(<w:style [^>]*w:styleId="BodyText"[^>]*>[\s\S]*?<w:pPr>)/,
    "$1<w:jc w:val=\"both\" />",
  );
  // The architecture diagrams are wider than the text column; 9pt monospace fits them.
  const mono = '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas" w:cs="Consolas" /><w:sz w:val="18" /><w:szCs w:val="18" />';
  styles = setRunProps(styles, "SourceCode", mono);
  styles = setRunProps(styles, "VerbatimChar", mono);
  writeOut("word/styles.xml", styles);

  // Pandoc gives every table column the same width, which wraps the long text
  // columns badly. Size each column by the content it holds.
  const cellLength = (cell) =>
    [...cell.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].reduce((sum, m) => sum + m[1].length, 0);
  let document = readOut("word/document.xml");
  document = document.replace(/<w:tbl>[\s\S]*?<\/w:tbl>/g, (table) => {
    const rows = table.match(/<w:tr>[\s\S]*?<\/w:tr>/g) ?? [];
    if (!rows.length) return table;
    const cells = rows.map((row) => row.match(/<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g) ?? []);
    const columns = cells[0].length;
    const weights = Array.from({ length: columns }, (_, column) =>
      Math.max(6, Math.min(80, ...cells.map((row) => cellLength(row[column] ?? "")))),
    );
    const sum = weights.reduce((a, b) => a + b, 0);
    const widths = weights.map((weight) => Math.max(700, Math.round((TEXT_WIDTH * weight) / sum)));
    widths[0] += TEXT_WIDTH - widths.reduce((a, b) => a + b, 0);

    let out = table.replace(
      /<w:tblW[^/]*\/>/,
      `<w:tblW w:w="${TEXT_WIDTH}" w:type="dxa" />`,
    );
    out = out.replace(
      /<w:tblGrid>[\s\S]*?<\/w:tblGrid>/,
      `<w:tblGrid>${widths.map((width) => `<w:gridCol w:w="${width}" />`).join("")}</w:tblGrid>`,
    );
    // Give every cell the width of its column, so Word and LibreOffice agree.
    let column = 0;
    out = out.replace(/<w:tc(?:\s[^>]*)?>[\s\S]*?<\/w:tc>/g, (cell) => {
      const width = widths[column] ?? widths[widths.length - 1];
      column = (column + 1) % columns;
      return cell.replace(
        /<w:tcPr\s*\/>/,
        `<w:tcPr><w:tcW w:w="${width}" w:type="dxa" /></w:tcPr>`,
      );
    });
    return out;
  });
  writeOut("word/document.xml", document);

  // Zip skips an entry whose file is not older than the archive's copy, and the
  // two are written within the same second. Build a fresh archive and swap it in.
  const final = join(work, "final.docx");
  run("zip", ["-q", "-X", "-r", final, ...readdirSync(outDir)], outDir);
  copyFileSync(final, output);

  console.log(`wrote ${output}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
