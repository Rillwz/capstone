// Work units (kategori) — one source for the index grid and the detail routes.
import {
  Broom,
  ClipboardList,
  FileText,
  FlaskConical,
  GraduationCap,
  Handshake,
  Megaphone,
  MonitorSmartphone,
  UserCog,
  Wallet,
  Warehouse,
} from "@lucide/astro";

export const categories = [
  { id: "tata-usaha", label: "Tata Usaha", icon: ClipboardList },
  { id: "kesekretariatan", label: "Kesekretariatan", icon: FileText },
  { id: "keuangan", label: "Keuangan", icon: Wallet },
  { id: "sarpras", label: "SARPRAS", icon: Warehouse },
  { id: "kepegawaian", label: "KEPEGAWAIAN", icon: UserCog },
  { id: "humas", label: "HUMAS", icon: Megaphone },
  { id: "laboran", label: "LABORAN", icon: FlaskConical },
  { id: "it", label: "IT", icon: MonitorSmartphone },
  { id: "admin-prodi", label: "ADMIN PRODI", icon: GraduationCap },
  { id: "kerumahtanggaan", label: "KERUMAHTANGGAAN", icon: Broom },
  { id: "kerjasama", label: "KERJASAMA", icon: Handshake },
];

export const findCategory = (id: string | undefined) =>
  categories.find((category) => category.id === id);
