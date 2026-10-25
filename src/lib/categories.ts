// Work units (kategori) — dibaca dari tabel `categories` (lib/db.ts). Selalu dibaca ulang
// per render, bukan konstanta level modul: modul server di-cache, jadi daftar yang
// dihitung sekali akan beku setelah kategori ditambah/diubah/dihapus.
import {
  Broom,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  HeartPulse,
  Landmark,
  Megaphone,
  MonitorSmartphone,
  Package,
  Scale,
  Shield,
  Truck,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  Tags,
  Zap,
  type AstroComponent,
} from "@lucide/astro";
import { getCategory, listCategories as listCategoryRows } from "./db";

/** Ikon yang boleh dipilih di form tambah/edit — kunci = nilai kolom `icon`. */
export const ICON_PALETTE = {
  "clipboard-list": ClipboardList,
  "file-text": FileText,
  wallet: Wallet,
  warehouse: Warehouse,
  "user-cog": UserCog,
  megaphone: Megaphone,
  "flask-conical": FlaskConical,
  "monitor-smartphone": MonitorSmartphone,
  "graduation-cap": GraduationCap,
  broom: Broom,
  handshake: Handshake,
  users: Users,
  truck: Truck,
  shield: Shield,
  scale: Scale,
  landmark: Landmark,
  "heart-pulse": HeartPulse,
  package: Package,
  "calendar-days": CalendarDays,
  tags: Tags,
  zap: Zap,
} satisfies Record<string, AstroComponent>;

type IconKey = keyof typeof ICON_PALETTE;

export type Category = {
  id: string;
  label: string;
  icon: AstroComponent;
  /** Kunci teks kolom `icon` — dipakai untuk menandai ikon terpilih di form edit. */
  iconKey: string;
};

const toCategory = (row: { id: string; label: string; icon: string }): Category => ({
  id: row.id,
  label: row.label,
  icon: ICON_PALETTE[row.icon as IconKey] ?? Tags,
  iconKey: row.icon,
});

export const listCategories = (): Category[] => listCategoryRows().map(toCategory);

export const findCategory = (id: string | undefined): Category | undefined => {
  const row = id ? getCategory(id) : undefined;
  return row ? toCategory(row) : undefined;
};
