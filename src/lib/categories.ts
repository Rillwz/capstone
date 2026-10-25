// Work units (kategori) — dibaca dari tabel `categories` (lib/db.ts). Selalu dibaca ulang
// per render, bukan konstanta level modul: modul server di-cache, jadi daftar yang
// dihitung sekali akan beku setelah kategori ditambah/diubah/dihapus.
import {
  Sparkles,
  CalendarDays,
  ClipboardDocumentList,
  DocumentText,
  Beaker,
  AcademicCap,
  UserGroup,
  Heart,
  BuildingLibrary,
  Megaphone,
  ComputerDesktop,
  Cube,
  Scale,
  ShieldCheck,
  Truck,
  Cog6Tooth,
  Users,
  Wallet,
  ArchiveBox,
  Tag,
  Bolt,
  type IconComponent,
} from "./icons";
import { DIRECT_CATEGORY, getCategory, listCategories as listCategoryRows } from "./db";

/** Ikon yang boleh dipilih di form tambah/edit — kunci = nilai kolom `icon`. */
export const ICON_PALETTE = {
  "clipboard-list": ClipboardDocumentList,
  "file-text": DocumentText,
  wallet: Wallet,
  warehouse: ArchiveBox,
  "user-cog": Cog6Tooth,
  megaphone: Megaphone,
  "flask-conical": Beaker,
  "monitor-smartphone": ComputerDesktop,
  "graduation-cap": AcademicCap,
  broom: Sparkles,
  handshake: UserGroup,
  users: Users,
  truck: Truck,
  shield: ShieldCheck,
  scale: Scale,
  landmark: BuildingLibrary,
  "heart-pulse": Heart,
  package: Cube,
  "calendar-days": CalendarDays,
  tags: Tag,
  zap: Bolt,
} satisfies Record<string, IconComponent>;

type IconKey = keyof typeof ICON_PALETTE;

export type Category = {
  id: string;
  label: string;
  icon: IconComponent;
  /** Kunci teks kolom `icon` — dipakai untuk menandai ikon terpilih di form edit. */
  iconKey: string;
};

const toCategory = (row: { id: string; label: string; icon: string }): Category => ({
  id: row.id,
  label: row.label,
  icon: ICON_PALETTE[row.icon as IconKey] ?? Tag,
  iconKey: row.icon,
});

/** Setiap unit, termasuk unit sistem — dipakai untuk mengelompokkan aktivitas yang sudah ada. */
export const listAllCategories = (): Category[] => listCategoryRows().map(toCategory);

/**
 * Unit kerja biasa. Unit sistem "Instruksi" sengaja tidak ikut: ia bukan unit kerja,
 * jadi tidak pernah muncul di daftar, form, atau pemilih kategori.
 */
export const listCategories = (): Category[] =>
  listAllCategories().filter((category) => category.id !== DIRECT_CATEGORY);

/**
 * Unit sistem tempat aktivitas hasil dialog Instruksi bermuara. Dibaca terpisah supaya
 * tidak pernah tercampur dengan daftar unit kerja biasa.
 */
export const systemCategory = (): Category | undefined => findCategory(DIRECT_CATEGORY);

export const findCategory = (id: string | undefined): Category | undefined => {
  const row = id ? getCategory(id) : undefined;
  return row ? toCategory(row) : undefined;
};
