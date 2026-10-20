// Rewrite the "Daftar Isi" page numbers from the rendered document.
// Usage: node docs/update-toc.mjs
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const md = join(here, "proposal-pengembangan-produk.md");

// 1. Render the current document and read the page of every heading.
execFileSync("node", [join(here, "build-docx.mjs")], { stdio: "inherit" });
execFileSync("soffice", [
  "--headless",
  "--convert-to",
  "pdf",
  join(here, "proposal-pengembangan-produk.docx"),
  "--outdir",
  "/tmp/toc-update",
]);
const pdf = "/tmp/toc-update/proposal-pengembangan-produk.pdf";

// 2. Ask PDFKit for the page each heading starts on.
const headings = readFileSync(md, "utf8")
  .split("\n")
  .filter((line) => /^#{1,3} /.test(line))
  .map((line) => line.replace(/^#+/, "").trim());
writeFileSync("/tmp/toc-headings.txt", headings.join("\n"));

const swift = `
import Foundation
import PDFKit
let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1]))!
let headings = try! String(contentsOfFile: CommandLine.arguments[2], encoding: .utf8)
    .split(separator: "\\n").map(String.init)
var pages: [[String]] = []
for i in 0..<doc.pageCount {
    let text = (doc.page(at: i)?.string ?? "").replacingOccurrences(of: "\\u{00A0}", with: " ")
    pages.append(text.split(separator: "\\n").map { $0.trimmingCharacters(in: .whitespaces) })
}
for h in headings {
    var found = "-"
    for (i, page) in pages.enumerated() where page.contains(where: { $0 == h }) {
        found = "\\(i + 1)"
        break
    }
    print("\\(found)\\t\\(h)")
}
`;
writeFileSync("/tmp/toc-pages.swift", swift);
const pageOf = new Map(
  execFileSync("swift", ["/tmp/toc-pages.swift", pdf, "/tmp/toc-headings.txt"], { encoding: "utf8" })
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [page, ...rest] = line.split("\t");
      return [rest.join("\t"), /^\d+$/.test(page) ? Number(page) : null];
    }),
);

const wanted = [
  ["1", "Pendahuluan"], ["1.1", "Ringkasan Isi Dokumen"], ["1.2", "Aplikasi Dokumen"],
  ["1.3", "Referensi"], ["1.4", "Daftar Singkatan"], ["2", "Proposal Pengembangan Produk"],
  ["2.1", "Latar Belakang Masalah"], ["2.2", "Rumusan Masalah"], ["2.3", "Tujuan"],
  ["2.4", "Pemilihan Solusi dan Teknik"],
  ["2.5", "Skenario Pemanfaatan Produk oleh Pemangku Kepentingan"],
  ["3", "Sumber Daya Pengembangan"], ["3.1", "Man-Month"], ["3.2", "Machine-Month"],
  ["3.3", "Alat Pengembangan"], ["3.4", "Peralatan Pengujian"], ["3.5", "Kebutuhan Tenaga Ahli"],
  ["4", "Kesimpulan"],
];
const chapters = new Set(["1", "2", "3", "4"]);

// 3. Rewrite the table of contents.
let doc = readFileSync(md, "utf8");
const rows = wanted.map(([number, title]) => {
  const exact = pageOf.get(number.includes(".") ? `${number} ${title}` : `${number}. ${title}`);
  // A long heading wraps in the PDF, so fall back to its first words.
  const prefix = (number.includes(".") ? `${number} ` : `${number}. `) + title.split(" ").slice(0, 3).join(" ");
  const page = exact ?? pageOf.get(prefix) ?? "?";
  const text = chapters.has(number) ? `**${title}**` : title;
  return `| ${number} | ${text} | ${page} |`;
});
const header = "| Bab | Judul | Halaman |\n| :--- | :--- | ---: |";
const start = doc.indexOf("| Bab | Judul | Halaman |");
const end = doc.indexOf("\n", doc.indexOf("| 4 | **Kesimpulan** |"));
if (start < 0 || end < 0) throw new Error("table of contents not found");
doc = doc.slice(0, start) + header + "\n" + rows.join("\n") + doc.slice(end);
writeFileSync(md, doc);
console.log(rows.join("\n"));
