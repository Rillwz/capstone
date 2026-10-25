// Ikon UI — Heroicons 2 (24/outline), diimpor langsung sebagai komponen SVG Astro.
//
// Satu pintu untuk semua ikon: call site memakai nama komponen dari sini, bukan path
// berkas. Nama ekspor = nama ikon di https://heroicons.com (bukan nama Lucide lama),
// jadi menambah ikon berarti mencari namanya di sana lalu menambah satu baris di bawah.
//
// Berkas SVG-nya sudah membawa `aria-hidden="true"` dan `stroke="currentColor"`, jadi
// ikon dekoratif tidak perlu atribut tambahan. Warna ikut `currentColor` dan ukuran
// diatur utility Tailwind (`size-4`, `size-5`), bukan prop `size`.

export { default as AcademicCap } from "heroicons/24/outline/academic-cap.svg";
export { default as ArchiveBox } from "heroicons/24/outline/archive-box.svg";
export { default as ArrowLeft } from "heroicons/24/outline/arrow-left.svg";
export { default as ArrowTrendingUp } from "heroicons/24/outline/arrow-trending-up.svg";
export { default as ArrowLeftOnRectangle } from "heroicons/24/outline/arrow-left-on-rectangle.svg";
export { default as ArrowPath } from "heroicons/24/outline/arrow-path.svg";
export { default as ArrowRightOnRectangle } from "heroicons/24/outline/arrow-right-on-rectangle.svg";
export { default as ArrowUturnLeft } from "heroicons/24/outline/arrow-uturn-left.svg";
export { default as Bars3 } from "heroicons/24/outline/bars-3.svg";
export { default as Beaker } from "heroicons/24/outline/beaker.svg";
export { default as Bell } from "heroicons/24/outline/bell.svg";
export { default as Bold } from "heroicons/24/outline/bold.svg";
export { default as Bolt } from "heroicons/24/outline/bolt.svg";
export { default as Briefcase } from "heroicons/24/outline/briefcase.svg";
export { default as BuildingLibrary } from "heroicons/24/outline/building-library.svg";
export { default as CalendarDateRange } from "heroicons/24/outline/calendar-date-range.svg";
export { default as CalendarDays } from "heroicons/24/outline/calendar-days.svg";
export { default as ChartBar } from "heroicons/24/outline/chart-bar.svg";
export { default as PresentationChartBar } from "heroicons/24/outline/presentation-chart-bar.svg";
export { default as ChatBubbleLeftEllipsis } from "heroicons/24/outline/chat-bubble-left-ellipsis.svg";
export { default as Check } from "heroicons/24/outline/check.svg";
export { default as CheckBadge } from "heroicons/24/outline/check-badge.svg";
export { default as CheckCircle } from "heroicons/24/outline/check-circle.svg";
export { default as ChevronDoubleLeft } from "heroicons/24/outline/chevron-double-left.svg";
export { default as ChevronRight } from "heroicons/24/outline/chevron-right.svg";
export { default as ClipboardDocument } from "heroicons/24/outline/clipboard-document.svg";
export { default as ClipboardDocumentCheck } from "heroicons/24/outline/clipboard-document-check.svg";
export { default as ClipboardDocumentList } from "heroicons/24/outline/clipboard-document-list.svg";
export { default as Clock } from "heroicons/24/outline/clock.svg";
export { default as CodeBracket } from "heroicons/24/outline/code-bracket.svg";
export { default as Cog6Tooth } from "heroicons/24/outline/cog-6-tooth.svg";
export { default as ComputerDesktop } from "heroicons/24/outline/computer-desktop.svg";
export { default as Cube } from "heroicons/24/outline/cube.svg";
export { default as DocumentText } from "heroicons/24/outline/document-text.svg";
export { default as EllipsisVertical } from "heroicons/24/outline/ellipsis-vertical.svg";
export { default as ExclamationTriangle } from "heroicons/24/outline/exclamation-triangle.svg";
export { default as Eye } from "heroicons/24/outline/eye.svg";
export { default as EyeSlash } from "heroicons/24/outline/eye-slash.svg";
export { default as H2 } from "heroicons/24/outline/h2.svg";
export { default as Heart } from "heroicons/24/outline/heart.svg";
export { default as Inbox } from "heroicons/24/outline/inbox.svg";
export { default as InformationCircle } from "heroicons/24/outline/information-circle.svg";
export { default as Italic } from "heroicons/24/outline/italic.svg";
export { default as Key } from "heroicons/24/outline/key.svg";
export { default as Link } from "heroicons/24/outline/link.svg";
export { default as ListBullet } from "heroicons/24/outline/list-bullet.svg";
export { default as LockClosed } from "heroicons/24/outline/lock-closed.svg";
export { default as MagnifyingGlass } from "heroicons/24/outline/magnifying-glass.svg";
export { default as Megaphone } from "heroicons/24/outline/megaphone.svg";
export { default as Moon } from "heroicons/24/outline/moon.svg";
export { default as Newspaper } from "heroicons/24/outline/newspaper.svg";
export { default as Pencil } from "heroicons/24/outline/pencil.svg";
export { default as PencilSquare } from "heroicons/24/outline/pencil-square.svg";
export { default as Plus } from "heroicons/24/outline/plus.svg";
export { default as RectangleStack } from "heroicons/24/outline/rectangle-stack.svg";
export { default as Scale } from "heroicons/24/outline/scale.svg";
export { default as ShieldCheck } from "heroicons/24/outline/shield-check.svg";
export { default as Sparkles } from "heroicons/24/outline/sparkles.svg";
export { default as Squares2x2 } from "heroicons/24/outline/squares-2x2.svg";
export { default as Sun } from "heroicons/24/outline/sun.svg";
export { default as Tag } from "heroicons/24/outline/tag.svg";
export { default as Trash } from "heroicons/24/outline/trash.svg";
export { default as Truck } from "heroicons/24/outline/truck.svg";
export { default as User } from "heroicons/24/outline/user.svg";
export { default as UserGroup } from "heroicons/24/outline/user-group.svg";
export { default as UserMinus } from "heroicons/24/outline/user-minus.svg";
export { default as UserPlus } from "heroicons/24/outline/user-plus.svg";
export { default as Users } from "heroicons/24/outline/users.svg";
export { default as Wallet } from "heroicons/24/outline/wallet.svg";
export { default as XCircle } from "heroicons/24/outline/x-circle.svg";
export { default as XMark } from "heroicons/24/outline/x-mark.svg";
export type { SvgComponent as IconComponent } from "astro/types";
