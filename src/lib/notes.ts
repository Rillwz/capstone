// Catatan & tautan yang menempel pada satu kemunculan tugas (occurrence).
//
// Catatan berdiri sendiri dari log status: membatalkan tanda selesai tidak menghapus
// catatan, dan catatan boleh ditulis sebelum tugasnya diselesaikan.

export const NOTE_MAX = 1000;

export interface NoteInput {
  note: string;
  /** Absolute http(s) URL, or "" when no link was given. */
  link: string;
}

/**
 * Validate one submitted note: the message to show, or the parsed values.
 * An empty submission is legal — it removes the note.
 */
export function parseNoteValues(note: string, link: string): { error: string } | { value: NoteInput } {
  const text = note.trim();
  const rawLink = link.trim();

  if (text.length > NOTE_MAX) return { error: `Keterangan maksimal ${NOTE_MAX} karakter.` };

  if (!rawLink) return { value: { note: text, link: "" } };

  // Only absolute http(s): a "javascript:" link would run in the reader's browser.
  let url: URL;
  try {
    url = new URL(rawLink);
  } catch {
    return { error: "Tautan harus berupa URL lengkap, misalnya https://contoh.id/file." };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { error: "Tautan harus diawali http:// atau https://." };
  }

  return { value: { note: text, link: url.toString() } };
}

/** The same validation, straight from a submitted form. */
export function parseNote(form: FormData): { error: string } | { value: NoteInput } {
  return parseNoteValues(String(form.get("note") ?? ""), String(form.get("link") ?? ""));
}

/** The host of a link, for the chip label ("drive.google.com"). */
export function linkLabel(link: string): string {
  try {
    return new URL(link).host.replace(/^www\./, "");
  } catch {
    return link;
  }
}
