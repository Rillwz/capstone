# Checklist C200 — Umsura Assignment

Daftar periksa kesiapan dokumen **C200 Spesifikasi Produk** terhadap template
`Template_C200_Spesifikasi_Produk_S1_Informatika` (BAB 1–5 + Lampiran A–F).

| Field | Isi |
|---|---|
| Dokumen diperiksa | `C200_PLAN_1.md` |
| Pembanding | Template C200 S1 Informatika (Undip) |
| Sumber kebenaran kedua | Kode di repo ini (`src/`, `compact.md`) |
| Tanggal periksa | 11 Nov 2026 |

**Status**

| Tanda | Arti |
|---|---|
| ✅ | Ada dan sesuai template |
| 🟡 | Ada, tetapi belum lengkap / belum memenuhi syarat template |
| ⬜ | Belum ada sama sekali |
| ⛔ | Tidak berlaku, alasan ditulis |

Kolom **Bukti** merujuk baris `C200_PLAN_1.md` atau berkas kode. Kolom **To-do** adalah
tindakan yang harus dikerjakan sebelum pengumpulan.

---

## Ringkasan

| Bab | Item | ✅ | 🟡 | ⬜ | Blocker? |
|---|:--:|:--:|:--:|:--:|---|
| Halaman depan | 5 | 4 | 1 | 0 | tidak |
| Bab 1 | 4 | 3 | 1 | 0 | tidak |
| Bab 2 | 22 | 9 | 9 | 4 | **ya** |
| Bab 3 | 6 | 3 | 1 | 2 | **ya** |
| Bab 4 | 2 | 0 | 0 | 2 | **ya** |
| Bab 5 | 4 | 0 | 0 | 4 | **ya** |
| Lampiran A–F | 6 | 0 | 0 | 6 | **ya** |

Angka penting yang dipakai di bawah: **35** kebutuhan fungsional (F-01…F-35), **12** kebutuhan
non-fungsional (NF-01…NF-12), **0** kode `UI-xx`, **15** use case, **6** use case scenario,
**19** tanda `[UKUR]` yang belum diisi, **14** tabel basis data (draft menulis 12), **31** aksi
mutasi.

---

## Halaman Depan

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| — | Halaman identitas (topik, siklus, judul, jenis, nomor, revisi, file) | 🟡 | `:10` | Isi `[NoRev]`, `[tahun]`, `[Gasal/Genap]`, kode kelompok |
| — | Data pengusul (3 anggota: nama, jabatan, NIM, tanggal, tanda tangan) | ✅ | `:12` | Tambah kolom NIM + tanda tangan saat finalisasi Word |
| — | Pembimbing 1 (utama) & Pembimbing 2 | ✅ | `:12` | — |
| — | Riwayat revisi (versi, tanggal, oleh, perbaikan) | ✅ | `:12` | — |
| — | Daftar isi, daftar gambar, daftar tabel | 🟡 | `:10` | Dibuat setelah semua gambar/tabel bernomor; draft belum punya penomoran tetap |

---

## BAB 1 — Pendahuluan

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 1.1 | Ringkasan isi dokumen + tujuan spesifik | ✅ | `:30` | — |
| 1.2 | Aplikasi dokumen (3 fungsi) | ✅ | `:56` | — |
| 1.3 | Referensi format IEEE | 🟡 | `:67` | 4 dari 6 referensi kandidat; `[6]` masih `[Tambahkan jurnal…]`. Verifikasi isi tiap sitasi |
| 1.4 | Daftar singkatan | 🟡 | `:89` | Tambah `PDP`, `SUS`, `WCAG`, `UAT`, `RACI` saat bab terkait masuk |

---

## BAB 2 — Spesifikasi Sistem dan Pengguna

### 2.1–2.2

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 2.1 | Gambaran sistem + alasan + manfaat | ✅ | `:112` | — |
| 2.2 | Batasan sistem (eksplisit, beralasan) | ✅ | `:169` | 10 butir, masing-masing berargumen. Pertahankan format ini |

### 2.3 Kebutuhan Fungsional

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 2.3 | Tabel kebutuhan fungsional berkode + prioritas MoSCoW | 🟡 | `:208` | 35 butir ada, tetapi prioritas hanya "Wajib/Opsional" — template meminta **Must/Should/Could/Won't**. Tambah tabel Won't (fitur yang disepakati tidak dikerjakan) |
| 2.3 | Setiap kebutuhan tertaut ke masalah C100 | ⬜ | — | C100 tidak memakai kode `P-x`; masalah hanya bernomor 1–5. **Beri `P1–P5` di C100 lalu petakan tiap F ke P** |
| 2.3.1 | Deskripsi fitur utama | 🟡 | `:253` | 6 fitur inti ada (deskripsi + manfaat). Template minta **satu tabel per fitur Must**: Deskripsi, Manfaat (+ P-x), User Story ID/EN, AC Gherkin |
| 2.3.1 | Acceptance Criteria Given–When–Then | ⬜ | — | Tulis ≥1 skenario positif + ≥1 negatif per fitur Must. AC ini menjadi skenario uji C500 |
| 2.3.2.1 | Use case diagram | ✅ | `:346` | 15 UC, aktor di luar batas sistem. Ganti ke PlantUML bila template menuntut (lihat Lampiran C) |
| 2.3.2.1 | Tabel pemetaan UC → kode F | 🟡 | `:346` | Diagram ada, tabel pemetaan UC/aktor/kode F tidak ada |
| 2.3.2.1 | `<<include>>` / `<<extend>>` | 🟡 | `:346` | Pastikan relasi include/extend tergambar, bukan hanya garis aktor–UC |
| 2.3.2.2 | Use case scenario untuk **semua UC Must** | 🟡 | `:390` | Baru 6 dari 15 UC (UC-01, 03, 04, 05, 10, 11, 13). Tambah 8 UC sisanya |
| 2.3.2.2 | ≥2 alur alternatif/negatif per UC | 🟡 | `:390` | Sebagian UC punya 1 alur negatif. Wajib 2 (input tidak valid, koneksi putus, kegagalan sistem eksternal) |
| 2.3.2.2 | Pra-kondisi, pasca-kondisi, aktor sekunder | ✅ | `:390` | — |
| 2.3.2.3 | Activity diagram ≥2, swimlane per aktor | ✅ | `:610` | 4 diagram (selesai, instruksi, lembur, reset sandi) |
| 2.3.2.3 | Narasi + aturan bisnis bersumber mitra | 🟡 | `:610` | Narasi ada; aturan bisnis belum dikutip ke notulen (butuh Lampiran A) |

### 2.4 Kebutuhan Data

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 2.4 | 8 butir kebutuhan data (D-01…D-08) | ✅ | `:706` | Semua butir terisi |
| 2.4 | Jumlah tabel sesuai kenyataan | 🟡 | `:706` vs `src/lib/db.ts` | Draft menulis **dua belas** tabel; basis data punya **14** (`attendance_location`, `attendance_logs` tidak dihitung). Perbaiki |
| 2.4 | UU PDP: data pribadi, siapa boleh akses, persetujuan | 🟡 | `:755` | Keamanan teknis ada; **dasar pemrosesan/persetujuan** dan daftar data pribadi belum dinyatakan eksplisit |
| 2.4.1 | Migrasi data awal | ⬜ | — | Tulis impor MPP: 11 unit, 206 baris, `import-mpp.ts` idempoten, validasi lewat `parseActivityValues`, verifikasi mitra sebelum dipakai |
| 2.4.2 | ERD konseptual | 🟡 | `:840` | Mermaid ada; entitas absensi belum masuk |
| 2.4.3 | Kamus data per entitas transaksi | ⬜ | — | Buat tabel: `activity_logs`, `occurrence_notes`, `overtime_requests`, `attendance_logs` — atribut, deskripsi, aturan validasi, contoh |

### 2.5 Kebutuhan Non-Fungsional

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 2.5 | Kode NF + karakteristik ISO/IEC 25010:2023 | 🟡 | `:868` | 12 NF ada; kolom "Asal" (angka ini dari mana) belum ada |
| 2.5 | Tidak ada kata ambigu tanpa angka | 🟡 | `:868` | **19 tanda `[UKUR]`** masih kosong, termasuk NF-01, NF-02, NF-07, NF-08. Ukur dari aplikasi berjalan (`curl -w`, DevTools, `sqlite3`) |
| 2.5.1 | Kinerja terukur | 🟡 | `:887` | NF-01 & NF-02 masih `[UKUR]` |
| 2.5.2 | Keamanan (autentikasi, kerahasiaan, audit, integritas transmisi) | 🟡 | `:901` | Tidak ada NF untuk **log audit** dan **integritas transmisi**; catatan cookie `Secure` masih berupa instruksi `[…]` |
| 2.5.3 | Keandalan (ketersediaan, RPO/RTO) | 🟡 | `:919` | Ketersediaan, RPO, RTO semua `[UKUR]` |
| 2.5.4 | Skalabilitas, interaksi, kompatibilitas, pemeliharaan | 🟡 | `:930` | Tidak ada NF **usability/SUS**, **aksesibilitas WCAG**, dan **compatibility** dalam bentuk terukur |
| 2.5.5 | Teknologi lingkungan operasional (a–e) | 🟡 | `:943` | Isi ada; template meminta pernyataan tegas bahwa **pemilihan framework/DBMS diputuskan di C300** dengan perbandingan alternatif |

### 2.6–2.8

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 2.6 | Diagram konteks level 0 (sistem 1 kotak + aktor + aliran data) | ⬜ | `:971` | Draft punya arsitektur logis, sequence, deployment — **bukan** diagram konteks. Tambah |
| 2.7.1 | Tabel profil pengguna (usia, keahlian, frekuensi, perangkat) | ⬜ | `:1045` | Hanya ada 3 deskripsi peran dalam prosa. Buat Tabel 2.12 |
| 2.7.2 | Matriks hak akses C/R/U/D/A | ✅ | `:1045` | Matriks ✓/— ada. Template minta notasi **C R U D A** per modul |
| 2.7.3 | ≥2 persona dari observasi | ⬜ | — | Belum ada persona. Turunkan ke kode F/UI/NF dan sebut sumber (tanggal observasi) |
| 2.8 | Target sistem: kondisi awal → target → cara ukur | 🟡 | `:1094` | 8 baris ada, tetapi banyak `[UKUR]` dan kolom **"Cara Ukur (C500)"** belum dipisah |

---

## BAB 3 — Kebutuhan Antarmuka Sistem

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 3.1.1 | Tabel kebutuhan UI berkode `UI-xx`, terukur, bersumber persona | ⬜ | — | **Belum ada satu pun kode `UI-xx`.** Isi mis. teks ≥16 px, target sentuh ≥48 dp, kontras ≥4,5:1 (WCAG 2.1 AA), maksimum layar per tugas, bahasa pesan galat |
| 3.1.2 | User flow tugas kritis + cabang negatif | ⬜ | — | Buat untuk minimal: menandai tugas selesai, mengajukan lembur, absensi masuk/pulang |
| 3.1.3 | Wireframe low-fidelity + validasi ≥2 pengguna | ⬜ | — | Sketsa layar utama + catat masukan mitra |
| 3.2 | Antarmuka perangkat keras | ✅ | `:1122` | 4 baris; tidak ada perangkat khusus — pernyataan ini tepat |
| 3.3 | Antarmuka perangkat lunak | ✅ | `:1136` | 6 butir, tidak menyebut framework secara berlebihan |
| 3.4 | Antarmuka komunikasi (protokol, TLS, bandwidth) | 🟡 | `:1155` | Bandwidth `[UKUR]` KB/halaman; ukuran halaman awal ≤1,5 MB belum diklaim |
| 3.5 | Integrasi dengan sistem lain (termasuk yang Won't) | ✅ | `:1169` | Dinyatakan tidak ada + 6 arah pengembangan. Tambah penanda "Won't" agar selaras tabel 2.3 |

---

## BAB 4 — Rencana Verifikasi

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 4.1 | Tabel rencana verifikasi untuk **semua** kode F, NF, UI | ⬜ | — | Belum ada. Kolom: Kode, Spesifikasi, Metode (I/A/D/T), Prosedur/alat, Besaran, Kriteria lulus |
| 4.2 | Matriks keterlacakan P-x → kebutuhan → UC → verifikasi → target | ⬜ | — | Butuh `P-x` (2.3) dan `UI-xx` (3.1) lebih dulu. Uji cepat: ada kebutuhan tanpa masalah asal? ada masalah tanpa kebutuhan? ada kebutuhan tanpa verifikasi? |

---

## BAB 5 — Rencana Proyek

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| 5.1 | RACI lintas lab (8 paket kerja × 3 anggota + mitra, tepat 1 A per baris) | ⬜ | — | Belum ada |
| 5.2 | Gantt sampai C500 (16 pertemuan) + tugas ≤1 minggu + buffer ±15% | ⬜ | — | Belum ada. C100 punya man-month, tetapi bukan jadwal C200 |
| 5.3 | Estimasi biaya + sumber & tanggal cek harga | ⬜ | — | Belum ada. Wajib memenuhi constraint anggaran mitra |
| 5.4 | Risiko & mitigasi (kemungkinan, dampak, PJ) | ⬜ | — | Belum ada |

---

## LAMPIRAN

| § | Item wajib | Status | Bukti | To-do |
|---|---|---|---|---|
| A | Notulen elisitasi per sesi + paraf mitra | ⬜ | — | Wajib: semua aturan bisnis dan angka target harus tertelusur ke sini |
| B | Dokumentasi foto observasi | ⬜ | — | — |
| C | Kode diagram (PlantUML) | 🟡 | `:1218` | Draft menyimpan Mermaid, bukan PlantUML. Template minta PlantUML (atau tautan repo) |
| D | Learning log individu (P4, P5, P6) | ⬜ | — | Satu per anggota per minggu |
| E | Logbook kelompok | ⬜ | — | Tanggal, nama, aktivitas, durasi, bagian dokumen |
| F | Daftar periksa sebelum pengumpulan | 🟡 | berkas ini | Berkas ini menggantikan Lampiran F, tetapi harus disalin ke dalam dokumen Word |

---

## Temuan Silang: Absensi Tidak Ada di C200

Kode sudah menjalankan absensi berbasis geolokasi, tetapi `C200_PLAN_1.md` tidak menyebutnya
sama sekali. Rincian di kode:

| Bukti kode | Isi |
|---|---|
| `src/lib/db.ts:221` | `attendance_location` — satu titik kantor, `radius_m` 10–300 |
| `src/lib/db.ts:234` | `attendance_logs` — satu baris per kejadian masuk/pulang |
| `src/pages/user/absensi.astro` | sisi pegawai: masuk/pulang + peta |
| `src/pages/dashboard/absensi.astro` | laporan harian/bulanan/tahunan + filter `q` |
| `src/pages/dashboard/absensi/lokasi.astro` | editor titik kantor |
| `src/pages/dashboard/absensi/export.ts` | ekspor CSV |
| `src/actions/index.ts` | `checkAttendance`, `saveAttendanceLocation` |

Pilih satu, jangan dibiarkan menggantung:

- **Opsi A — masukkan ke lingkup.** Tambah `F-36`…`F-40`, `D-09`, `UC-16`/`UC-17`, dua entitas
  di ERD 2.4.2, kamus data `attendance_logs`, `NF` privasi lokasi (UU PDP), dan satu `P-6` di
  C100. Batasan yang harus ditulis: satu kantor saja, tanpa selfie/QR, tanpa persentase
  kehadiran, tanpa jam kerja.
- **Opsi B — keluarkan dari lingkup.** Nyatakan di 2.2 bahwa absensi adalah fitur di luar C200
  dan tidak diklaim, agar penguji tidak menghitungnya sebagai kebutuhan tanpa kode.

Rekomendasi: **Opsi A**. Fitur sudah berjalan dan diuji; mengeluarkannya membuat dokumen
bertentangan dengan produk yang didemokan.

---

## Gate Pengumpulan (Lampiran F)

| # | Syarat | Status |
|---|---|:--:|
| 1 | Nomor dokumen, revisi, nama file sesuai format | ⬜ |
| 2 | Tanda tangan pengusul, pembimbing 1 & 2, perwakilan mitra lengkap | ⬜ |
| 3 | Setiap kebutuhan punya kode, asal masalah, dan prioritas | ⬜ (P-x belum ada) |
| 4 | Tidak ada kata ambigu (cepat, mudah, aman) tanpa angka | 🟡 (19 `[UKUR]`) |
| 5 | Tidak ada pilihan teknologi implementasi sebagai spesifikasi | 🟡 |
| 6 | Semua UC Must punya ≥2 alur negatif | ⬜ (6/15 UC, sebagian 1 alur) |
| 7 | Kebutuhan data mencakup volume, retensi, keamanan, migrasi awal | 🟡 (migrasi awal kosong) |
| 8 | Setiap kode F/NF/UI ada di Tabel Rencana Verifikasi | ⬜ (Bab 4 kosong) |
| 9 | Matriks keterlacakan lengkap tanpa baris kosong | ⬜ |
| 10 | Jadwal sampai C500, RACI, biaya, risiko tersedia | ⬜ |
| 11 | Lampiran lengkap (notulen, foto, kode diagram, learning log, logbook) | ⬜ |
| 12 | Seluruh kotak petunjuk dan baris contoh dihapus; daftar isi diperbarui | ⬜ |

---

## Urutan Pengerjaan (dependensi)

1. **Beri `P1–P5` (+`P6` bila absensi masuk) di C100.** Semua bab berikutnya bergantung pada ini.
2. **2.3.1** — tabel fitur + User Story + AC Gherkin; **2.3** — prioritas MoSCoW + tabel Won't.
3. **3.1.1** — tulis `UI-xx` dari persona; **2.7.3** — persona (2 buah, dari observasi).
4. **2.3.2.2** — lengkapi 9 UC scenario yang kurang, 2 alur negatif masing-masing.
5. **2.4.1, 2.4.3** — migrasi awal + kamus data; perbaiki 12 → 14 tabel; ERD + entitas absensi.
6. **2.6** — diagram konteks level 0.
7. **Isi 19 `[UKUR]`** dari aplikasi berjalan.
8. **Bab 4** — rencana verifikasi (semua F/NF/UI) lalu matriks keterlacakan.
9. **Bab 5** — RACI, Gantt, biaya, risiko.
10. **Lampiran A–F** — notulen lebih dulu, karena aturan bisnis dan angka target harus tertelusur.

Blocker yang harus beres sebelum Bab 4 bisa dikerjakan: langkah 1, 2, 3.
