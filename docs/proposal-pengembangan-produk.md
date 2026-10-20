---
title: "Proposal Pengembangan Produk"
subtitle: "Aplikasi Penugasan Unit Kerja (Better Belt)"
author: "Tim Pengembang Better Belt"
date: "Oktober 2026"
lang: id
---

# Halaman Pengesahan

Proposal Pengembangan Produk berjudul **"Aplikasi Penugasan Unit Kerja (Better Belt)"**
disusun sebagai dokumen perencanaan pengembangan produk yang memuat latar belakang,
rumusan masalah, tujuan, pemilihan solusi dan teknik, skenario pemanfaatan, serta
kebutuhan sumber daya pengembangan.

| Jabatan | Nama | NIP | Tanda Tangan | Tanggal |
| :--- | :--- | :--- | :--- | :--- |
| Penyusun (Ketua Tim) | ................................ | ................................ | .................... | .................... |
| Penyusun (Anggota) | ................................ | ................................ | .................... | .................... |
| Penyusun (Anggota) | ................................ | ................................ | .................... | .................... |
| Pembimbing I | ................................ | ................................ | .................... | .................... |
| Pembimbing II | ................................ | ................................ | .................... | .................... |
| Kepala Unit Kerja | ................................ | ................................ | .................... | .................... |

> Nama, NIP, dan tanda tangan dilengkapi pada tahap finalisasi dokumen.

# Abstrak

Keguasaan tugas berulang di lingkungan administrasi fakultas nyaris selalu bergantung
pada ingatan dan catatan pribadi. Matriks Aktivitas Unit Kerja memuat 186 jenis
aktivitas pada sebelas unit kerja, masing-masing dengan frekuensi, durasi, jumlah
sumber daya manusia, dan siklus periodisitas yang jelas, tetapi informasi tersebut
tidak pernah menjadi sumber penugasan yang otomatis. Akibatnya, aktivitas periodik
yang terlambat tidak tercatat, tidak ada bukti siapa mengerjakan apa, dan beban kerja
tidak pernah terlihat oleh kepala unit kerja.

Proposal ini berkembang melalui pengembangan aplikasi Better Belt, sebuah aplikasi web
penugasan unit kerja yang menerjemahkan setiap penugasan menjadi kemunculan per periode.
Pengguna melihat tugas hari ini, minggu ini, bulan ini, dan semester ini; periode yang
berakhir tanpa penyelesaian dicatat otomatis sebagai terlewat sehingga tidak ada
pekerjaan yang hilang tanpa jejak; tugas yang terlambat tetap dapat diselesaikan dan
ditandai terlambat. Seluruh aturan periode ditulis sekali dalam satu mesin kalender
yang diperiksa oleh 30 pengujian otomatis. Dibangun dengan kerangka Astro, basis data
SQLite tertanam, dan autentikasi berbasis peran, aplikasi ini berjalan pada server
kampus tanpa biaya lisensi.

Penyusunan produk memerlukan 3,00 man-month dari tiga anggota tim selama satu bulan dan
27 machine-month pemakaian server dan perangkat, dengan biaya operasional tahunan
sekitar Rp 3,7 juta. Hasil akhirnya adalah satu-satunya sumber kebenaran tentang
status, bukti penyelesaian, dan riwayat keterlambatan seluruh kegiatan berulang di
unit kerja fakultas.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Kata Pengantar

Segala puji dipanjatkan kepada Tuhan Yang Maha Esa atas terselesaiknya proposal
pengembangan produk yang berjudul "Aplikasi Penugasan Unit Kerja (Better Belt)". Pada
kesempatan ini, tim penyusun menyampaikan terima kasih kepada para pembimbing yang
telah memberikan arahan dan pendampingan, kepada kepala unit kerja serta pengelola
tata usaha yang telah menyediakan data Matriks Aktivitas Unit Kerja dan waktu untuk
menggali kebutuhan lapangan, serta kepada seluruh anggota tim yang telah bekerja
menyusun, membangun, dan menguji aplikasi ini.

Proposal ini disusun sebagai dasar perencanaan pengembangan produk, mencakup masalah
yang hendak diselesaikan, pilihan solusi dan teknik beserta pertimbangannya, serta
kebutuhan sumber daya manusia dan mesin. Dokumen ini juga menjadi rujukan bersama
bagi tim pengembang, dasar justifikasi biaya bagi bagian keuangan, dan bahan bukti
bagi proses pemeriksaan.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# Daftar Isi


| Bab | Judul | Halaman |
| :--- | :--- | ---: |
| 1 | **Pendahuluan** | 5 |
| 1.1 | Ringkasan Isi Dokumen | 5 |
| 1.2 | Aplikasi Dokumen | 5 |
| 1.3 | Referensi | 6 |
| 1.4 | Daftar Singkatan | 8 |
| 2 | **Proposal Pengembangan Produk** | 10 |
| 2.1 | Latar Belakang Masalah | 10 |
| 2.2 | Rumusan Masalah | 12 |
| 2.3 | Tujuan | 13 |
| 2.4 | Pemilihan Solusi dan Teknik | 14 |
| 2.5 | Skenario Pemanfaatan Produk oleh Pemangku Kepentingan | 24 |
| 3 | **Sumber Daya Pengembangan** | 27 |
| 3.1 | Man-Month | 27 |
| 3.2 | Machine-Month | 29 |
| 3.3 | Alat Pengembangan | 32 |
| 3.4 | Peralatan Pengujian | 34 |
| 3.5 | Kebutuhan Tenaga Ahli | 37 |
| 4 | **Kesimpulan** | 41 |

> Nomor halaman mengikuti penomoran otomatis dokumen dan diverifikasi ulang pada
> tahap finalisasi setelah naskah diletakkan di pengolah kata.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 1. Pendahuluan

## 1.1 Ringkasan Isi Dokumen

Dokumen ini merupakan proposal pengembangan produk **Better Belt**, aplikasi web
pengelolaan penugasan kerja berulang pada unit kerja fakultas. Dokumen disusun untuk
menjawab tiga hal sekaligus: masalah yang hendak diselesaikan, solusi serta teknik
yang dipilih beserta alasannya, dan sumber daya yang dibutuhkan untuk menjalankan
pengembangan sampai produk siap digunakan.

Struktur dokumen dibagi ke dalam empat bab.

1. **Pendahuluan** memuat ringkasan isi dokumen, aplikasi dokumen, daftar referensi,
   dan daftar singkatan. Bab ini memberi pembaca kerangka berpikir yang sama sebelum
   membaca bagian teknis.
2. **Proposal Pengembangan Produk** merupakan bab terpanjang. Bab ini memuat latar
   belakang masalah berdasarkan data nyata unit kerja, rumusan masalah yang
   dirumuskan sebagai pernyataan yang dapat diuji, tujuan, pemilihan solusi dan teknik
   (analisis alternatif, arsitektur, model data, keamanan, dan mutu), serta skenario
   pemanfaatan produk oleh pemangku kepentingan.
3. **Sumber Daya Pengembangan** memuat man-month, machine-month, alat pengembangan,
   peralatan pengujian, dan kebutuhan tenaga ahli. Bab ini menjadi dasar penghitungan
   biaya dan penempatan orang.
4. **Kesimpulan** merangkum pencapaian, keterbatasan, dan rencana pengembangan
   berikutnya.

Pembaca yang hanya membutuhkan angka anggaran dapat langsung menuju Bab 3. Pembaca
yang membutuhkan justifikasi teknis dapat menuju Subbab 2.4. Pembaca yang membutuhkan
gambaran operasional dapat menuju Subbab 2.5.

## 1.2 Aplikasi Dokumen

Dokumen ini dipakai pada empat tingkat dalam siklus hidup produk.

| No | Pengguna | Aplicasi | Output yang dihasilkan |
| :--- | :--- | :--- | :--- |
| 1 | Kepala Unit Kerja | Menetapkan ruang lingkup, prioritas, dan batas fitur sebelum pengembangan dimulai | Ruang lingkup yang disepakati dan daftar fitur yang ditunda |
| 2 | Tim Pengembang | Acuan kerja harian, pemetaan fase, dan pembagian peran | Rencana mingguan dan kriteria selesai per fitur |
| 3 | Bagian Pengadaan dan Keuangan | Dasar justifikasi kebutuhan biaya (server, perangkat uji, lisensi) | Justifikasi anggaran berbasis man-month dan machine-month |
| 4 | Auditor | Rekam jejak keputusan teknis untuk pemeriksaan | Daftar rujukan, tabel penilaian alternatif, dan bukti pengujian |

Dokumen ini bukan dokumen spesifikasi fungsional terperinci dan bukan dokumen
kontrak. Spesifikasi rinci per halaman tertuangkan pada dokumentasi kode sumber
(`AGENTS.md` serta komentar pada modul `src/lib/`), sedangkan dokumen ini berperan
sebagai dokumen rencana dan justifikasi.

Tiga prinsip penggunaan dokumen:

- **Acuan, bukan dokumen kaku.** Angka man-month dan machine-month adalah estimasi
  berbasis asumsi yang dinyatakan eksplisit pada Subbab 3.1.4 dan 3.2.5, sehingga
  dapat dikoreksi bila asumsi berubah.
- **Dapat ditelusuri.** Setiap fitur yang disebut pada Bab 2 dapat ditelusuri ke modul
  kode dan skenario uji pada Subbab 3.4.3.
- **Berlaku suruh.** Dokumen disusun sebagai proposal yang dapat dipresentasikan pada
  forum review proyek dan dijadikan bahan persetujuan.

## 1.3 Referensi

### 1.3.1 Rujukan Internal

| Kode | Judul | Lokasi |
| :--- | :--- | :--- |
| R-01 | Matriks Aktivitas Unit Kerja (MPP), 11 unit kerja dan 186 jenis aktivitas | `MPP.xlsx`, lembar 1 sampai 11 |
| R-02 | Kode sumber aplikasi Better Belt, 5.485 baris kode pada 44 berkas | Repositori proyek |
| R-03 | Panduan pengembangan proyek | `AGENTS.md` |
| R-04 | Konfigurasi autentikasi dan sesi | `src/auth.config.ts` |
| R-05 | Skema basis data dan fungsi akses data | `src/lib/db.ts` |
| R-06 | Mesin periode (occurrence engine) | `src/lib/tasks.ts` |
| R-07 | Modul pemeriksaan mandiri kalender, 30 pemeriksaan | `src/scripts/check-tasks.ts` |
| R-08 | Kosakata domain dan daftar unit kerja | `src/lib/activities.ts` dan `src/lib/categories.ts` |

### 1.3.2 Rujukan Teknis

| Kode | Judul | Penerbit |
| :--- | :--- | :--- |
| T-01 | Astro Documentation, bagian Rendering Modes, Routing, Middleware, dan Sessions | The Astro Company |
| T-02 | Astro Integrations, Node Adapter | The Astro Company |
| T-03 | Tailwind CSS v4 Documentation, bagian Theme Variables dan Custom Variants | Tailwind Labs |
| T-04 | auth-astro dan Auth.js Core Documentation, bagian Credentials Provider dan JWT Session Strategy | Auth.js |
| T-05 | better-sqlite3 Documentation, bagian WAL Mode dan Prepared Statements | Community project |
| T-06 | SQLite Documentation, bagian Write-Ahead Logging dan Query Planner | SQLite Consortium |
| T-07 | MDN Web Docs, bagian CSS Custom Properties, `color-scheme`, dan elemen `dialog` | Mozilla |
| T-08 | bcryptjs Documentation, bagian Adaptive Hashing | OpenJS Foundation |
| T-09 | Lucide Icons, Icon Library | Lucide Contributors |
| T-10 | Motion for JavaScript, Animation Runtime | Motion Contributors |

### 1.3.3 Rujukan Standar dan Regulasi

| Kode | Judul | Issuing Body |
| :--- | :--- | :--- |
| S-01 | ISO/IEC 25010:2011, Product Quality Model | ISO dan IEC |
| S-02 | IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications | IEEE |
| S-03 | WCAG 2.2, Web Content Accessibility Guidelines | W3C |
| S-04 | Undang-Undang Nomor 20 Tahun 2023 tentang Aparatur Nkrais | Pemerintah Republik Indonesia |
| S-05 | Peraturan Pemerintah Nomor 11 Tahun 2017 tentang Pengelolaan Aparatur Nkrais | Pemerintah Republik Indonesia |
| S-06 | Surat Keputusan Dekan tentang Struktur dan Tupoksi Unit Kerja | Universitas Muhammadiyah Surabaya, menunggu nomor |

> Rujukan S-06 diperbarui pada tahap finalisasi setelah nomor SK Dekan dikonfirmasi.

## 1.4 Daftar Singkatan

| Singkatan | Bentuk Lengkap | Keterangan |
| :--- | :--- | :--- |
| API | Application Programming Interface | Antarmuka pemrograman antarkomponen |
| CRUD | Create, Read, Update, Delete | Operasi dasar pengelolaan data |
| CSS | Cascading Style Sheets | Bahasa tampilan |
| E2E | End-to-End | Pengujian alur lengkap dari antarmuka sampai data |
| ERD | Entity Relationship Diagram | Diagram relasi entitas basis data |
| HTTP | HyperText Transfer Protocol | Protokol transfer data |
| ISO | International Organization for Standardization | Lembaga standar internasional |
| JSON | JavaScript Object Notation | Format pertukaran data |
| KPI | Key Performance Indicator | Indikator keberhasilan |
| MPP | Matriks Aktivitas Unit Kerja | Sumber data master jenis aktivitas per unit kerja |
| MVP | Minimum Viable Product | Versi pertama dengan fitur inti |
| PRD | Product Requirement Document | Dokumen kebutuhan produk |
| QA | Quality Assurance | Jaminan mutu |
| RBAC | Role-Based Access Control | Pengaturan akses berbasis peran |
| SLA | Service Level Agreement | Tingkat layanan yang dijanjikan |
| SSD | Solid State Drive | Media penyimpanan padat |
| SSR | Server-Side Rendering | Perenderan di sisi server |
| TU | Tata Usaha | Unit kerja yang mengurusi administrasi umum |
| UI | User Interface | Antarmuka pengguna |
| UX | User Experience | Pengalaman pengguna |
| WCAG | Web Content Accessibility Guidelines | Pedoman aksesibilitas web dari W3C |
| WAP | Weighted Analytical Process | Metode penilaian alternatif solusi berbobot |

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 2. Proposal Pengembangan Produk

## 2.1 Latar Belakang Masalah

### 2.1.1 Kondisi Unit Kerja

Fakultas menjalankan sebelas unit kerja, yaitu Tata Usaha, Kesekretariatan, Keuangan,
SARPRAS, Kepegawaian, Humas, Laboran, IT, Admin Prodi, Kerumahtanggaan, dan
Kerjasama. Seluruh unit kerja tersebut memiliki tarefas administratif yang bersifat
berulang dan tercatat resmi dalam Matriks Aktivitas Unit Kerja (MPP). Matriks itu
memuat sebelas unit kerja dengan total 186 jenis aktivitas, dan setiap baris aktivitas
menggandung dua belas atribut: nomor, bidang, tupoksi, jenis aktivitas unit kerja,
tanggal, penanda utama, penanda periodik, penanda bukan tupoksi, periode, frekuensi
per tahun, durasi dalam menit, dan jumlah sumber daya manusia yang mengerjakan.

Nilai-nilai pada atribut tersebut bukan sekadar deskripsi. Frekuensi, durasi, dan
jumlah sumber daya manusia bersama-sama menentukan beban kerja tahunan setiap
aktivitas, yang dalam aplikasi dihitung sebagai volume: frekuensi dikali durasi
dikali jumlah sumber daya manusia. Periode pada setiap baris declares how sering
aktivitas itu harus diulang: harian, mingguan, bulanan, atau semesteran. Inilah
ciri khas pekerjaan administrasi fakultas, karena beban kerjanya berulang, terukur, dan
tidak pernah selesai hanya dengan satu tindakan.

Selama ini informasi tersebut dikelola dengan cara konvensional, yaitu melalui
spreadsheet, pesan_groups, dan ingatan pribadi. Cara ini bekerja pada satu aktivitas
atau satu minggu, tetapi tidak bertahan ketika jumlah aktivitas, orang, dan periode
menjadi banyak.

### 2.1.2 Permasalahan yang Teridentifikasi

1. **Penugasan tersebar.** Tidak ada satu pun tempat yang Holds daftar resmi aktivitas
   yang sedang dikerjakan seorang pegawai. Penugasan diberikan lewat pesan atau
   lisan, sehingga tidak ada bukti siapa mengerjakan apa.
2. **Siklus periodik diabaikan.** aktivitas harian, mingguan, bulanan, dan semesteran
   diperlakukan sama. Ketika periode mingguan berakhir tanpa pekerjaan, tidak ada yang
   mencatatnya sebagai keterlambatan.
3. **Tidak ada jejak audit.** Setelah pekerjaan selesai, tidak ada catatan waktu
   penyelesaian. Cuando seorang pegawai bertukar tugas dengan rekan, tidak ada
   history yang bisa dilanjutkan.
4. **Pemantauan tertunda.** Kepala unit kerja baru mengetahui kesibukan anak buah
   setelah bertanya atau setelah kegiatan selesai, bukan secara langsung.
5. **Beban kerja tidak terukur.** Atribut volume, durasi, dan frekuensi sudah ada di
   MPP, tetapi tidak pernah dipakai untuk melihat siapa yang paling banyak menanggung
   pekerjaan rutin.
6. **Adopsi sulit.** Solusi yang banyak memakai aplikasi-featured umum dengan
   pemisahan data per pengguna justru memperlambat adopsi, karena setiap orang
   harus mengelola daftar tugasnya sendiri.

### 2.1.3 Dampak Permasalahan

| Dampak | Manifestasi | parties yang Terdampak |
| :--- | :--- | :--- |
| Ketidakpatuhan tupoksi | Aktivitas periodik terlambat atau tidak dikerjakan sama sekali | Kepala Unit Kerja |
| Akuntabilitas lemah | Tidak ada bukti siapa mengerjakan apa dan kapan | Auditor, Bagian Keuangan |
| Beban kerja tidak adil | Distribusi kerja rutin tidak terlihat | Kepala Unit Kerja, seluruh SDM |
| Kualitas data rendah | Rekap manual prone to salah hitung dan tidak dapat dipertanggungjawabkan | Perencana |
| Ketergantungan orang | Pengknow-how pekerjaan rutin hilang ketika pegawai bercuti | seluruh unit kerja |

### 2.1.4 Solusi yang Diusulkan

Better Belt menyediakan satu aplikasi web yang menyatukan katalog aktivitas, penugasan,
danbumusan tempat bekerja. Admin menetapkan aktivitas kepada orang; aplikasi
menerjemahkan setiap penugasan menjadi kemunculan per periode sehingga pengguna
melihat tugas hari ini, minggu ini, bulan ini, dan semester ini. Periode yang berakhir
tanpa penyelesaian dicatat otomatis sebagai terlewat saat pengguna membuka halaman,
sehingga tidak ada pekerjaan yang hilang tanpa jejak. Seluruh data disimpan pada
server kampus dalam basis data tertanam, tanpa ketergantungan pada layanan pihak
ketiga.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 2.2 Rumusan Masalah

| No | Rumusan Masalah | Sumber | Fokus Pengujian |
| :--- | :--- | :--- | :--- |
| R-01 | Bagaimana mendata jenis aktivitas kerja berulang secara terstruktur sehingga menjadi sumber penugasan yang sahih? | R-01 (MPP) | Uji presisi impor data |
| R-02 | Bagaimana admin menetapkan penugasan untuk setiap tenaga kerja secara massal dan dapat dikoreksi? | Wawancara | Uji fungsional |
| R-03 | Bagaimana menampilkan tugas berulang dalam bentuk kemunculan per periode agar pengguna mengetahui apa yang harus dikerjakan hari ini, minggu ini, bulan ini, dan semester ini? | Wawancara | Uji fungsional |
| R-04 | Bagaimana mencatat tugas yang terlampaui secara otomatis tanpa memerlukan pencatatan manual? | Wawancara | Uji fungsional dan 30 pemeriksaan kalender |
| R-05 | Bagaimana menyediakan riwayat pekerjaan yang dapat ditelusuri dan disaring menurut status? | Wawancara | Uji fungsional |
| R-06 | Bagaimana mencari pengguna dan aktivitas di antara banyak data secara cepat? | Wawancara | Uji fungsional |
| R-07 | Bagaimana melindungi data penugasan dari akses tidak sah dan membatasi tindakan berdasarkan peran? | Kebijakan fakultas | Uji keamanan |
| R-08 | Bagaimana memperkirakan beban kerja per pengguna dari atribut volume, durasi, dan frekuensi? | R-01 | Uji rekap |
| R-09 | Bagaimana menyediakan antarmuka yang dapat dipakai pengguna non-teknis di perangkat bergerak? | Wawancara | Uji kegunaan |
| R-10 | Bagaimana menjamin aplikasi siap produksi dengan biaya sumber daya yang terukur? | Kebijakan fakultas | Audit |

## 2.3 Tujuan

### 2.3.1 Tujuan Umum

Tersedianya aplikasi penugasan unit kerja yang menjadi satu-satunya sumber kebenaran
tentang status, bukti penyelesaian, dan riwayat keterlambatan seluruh kegiatan
berulang di unit kerja fakultas, sehingga tupoksi dijalankan tepat waktu,
terdokumentasi, dan dapat diaudit.

### 2.3.2 Tujuan Khusus

| No | Tujuan Khusus | Indikator Keberhasilan | Verifikasi |
| :--- | :--- | :--- | :--- |
| T-01 | Mendigitalkan jenis aktivitas MPP menjadi katalog aktivitas terstruktur | 186 baris MPP terimpor ke tabel `activities` dengan atribut utuh | Uji impor |
| T-02 | Menyediakan penugasan massal per pengguna | Satu penugasan dapat memuat minimal 5 aktivitas | Uji fungsional |
| T-03 | Menyusun tugas berulang per periode | Seluruh tugas pada empat periode tampil pada kelompok yang sesuai | Uji fungsional |
| T-04 | Mencatat keterlambatan otomatis | Periode yang berakhir tanpa penyelesaian tercatat sebagai terlewat tanpa tindakan manual | Uji fungsional |
| T-05 | Menyediakan ruang kerja pengguna dan halaman riwayat | Halaman `/user` dan `/user/riwayat` berfungsi tanpa galat | Uji fungsional |
| T-06 | Mempercepat pencarian pengguna dan aktivitas | Pencarian responsif tanpa pemuatan ulang halaman | Uji fungsional |
| T-07 | Menegakkan otorisasi berbasis peran | Tiga peran terisolasi: admin, pengguna, dan admin prodi | Uji keamanan |
| T-08 | Menjaga mutu kode dan aplikasi | `astro check` tanpa galat dan 30 pemeriksaan kalender lulus | Uji otomatis |

## 2.4 Pemilihan Solusi dan Teknik

### 2.4.1 Metode Pemilihan

Pemilihan solusi memakai *Weighted Analytical Process* (WAP). Setiap kriteria diberi
bobot, dan setiap alternatif dinilai dengan skala 1 sampai 5, dengan 1 berarti sangat
buruk dan 5 berarti sangat baik. Nilai akhir sebuah alternatif adalah jumlah tertimbang
seluruh skornya.

Nilai akhir alternatif ke-i dihitung dengan rumus berikut, dengan i sebagai indeks
kriteria dan n sebagai jumlah kriteria.

Nilai akhir = jumlah dari (bobot i dikali skor i), untuk i dari 1 sampai n

Kriteria dan bobotnya ditetapkan bersama pemangku kepentingan pada rapat kebutuhan.

| Kode | Kriteria | Bobot | Alasan Pemberian Bobot |
| :--- | :--- | :---: | :--- |
| K-01 | Kesesuaian dengan kebutuhan operasional dan MPP | 0,25 | Kebutuhan inti; MPP harus menjadi sumber tunggal |
| K-02 | Kemudahan adopsi pengguna non-teknis | 0,15 | Sasaran pengguna tenaga administrasi, bukan pengembang |
| K-03 | Biaya pengembangan dan pemeliharaan | 0,20 | Sumber daya yang tersedia terbatas, lihat Subbab 3.1 |
| K-04 | Mutu data dan kemampuan audit | 0,15 | Keterlambatan harus terbukti, bukan hanya tercatat |
| K-05 | Skalabilitas dan daya layanan | 0,10 | Jumlah pengguna sedang, tetapi data bertambah terus |
| K-06 | Ketersediaan dukungan dan kemandirian | 0,05 | Solusi tidak boleh terkunci pada vendor yang akan hilang |
| K-07 | Keamanan dan kepatuhan | 0,10 | Data kepegawaian bersifat terbatas |
| | **Total** | **1,00** | |

### 2.4.2 Kandidat Solusi

**Alternatif A, spreadsheet bersama dan grup pesan.**

Data MPP sudah berbentuk spreadsheet sehingga pemindahannya nyaris tanpa biaya.
Namun rumus yang harus disusun pengguna secara manual, seperti perhitungan periode,
tenggat, dan penandaan keterlambatan, tetap berada di luar sistem. Tidak ada
pencatatan otomatis, riwayat perubahan tidak dapat diaudit, dan setiap pengguna
mengerjakan salinan sendiri sehingga data terpecah.

**Alternatif B, aplikasi web kustom ringan dengan Astro dan SQLite, dipilih.**

Satu aplikasi web milik fakultas yang menyajikan katalog aktivitas, penugasan, ruang
kerja pengguna, dan riwayat. Basis data tertanam pada server kampus, tanpa biaya
lisensi, tanpa ketergantungan layanan pihak ketiga, dan seluruh aturan periode ditulis
sekali dalam satu mesin kalender yang dapat diuji otomatis.

**Alternatif C, platform low-code atau layanan task manager berbayar.**

Cepat untuk membuat papan tugas, tetapi tidak memodelkan kemunculan per periode, tidak
memiliki pencatatan keterlambatan otomatis, data MPP berada di luar sistem, dan akses
data kepegawaian berada di luar lingkungan kampus.

**Alternatif D, aplikasi enterprise dengan framework lain dan basis data terpisah.**

Kuat dan skalabel, tetapi menuntut biaya lisensi server dan penyimpanan awan,
pengalaman operasional yang tidak dimiliki tim, serta waktu pengembangan jauh
melebihi jendela satu bulan yang disepakati.

### 2.4.3 Hasil Penilaian

| Kode | A, Spreadsheet | B, Web kustom, dipilih | C, Low-Code dan SaaS | D, Enterprise |
| :--- | :---: | :---: | :---: | :---: |
| K-01 Kesesuaian kebutuhan (0,25) | 3 | **5** | 2 | 5 |
| K-02 Kemudahan adopsi (0,15) | 4 | **4** | 3 | 2 |
| K-03 Biaya (0,20) | 5 | **3** | 4 | 1 |
| K-04 Mutu data dan audit (0,15) | 1 | **5** | 2 | 5 |
| K-05 Skalabilitas (0,10) | 2 | **4** | 5 | 5 |
| K-06 Dukungan dan kemandirian (0,05) | 5 | **4** | 2 | 3 |
| K-07 Keamanan (0,10) | 2 | **5** | 3 | 5 |
| **Nilai akhir** | **3,15** | **4,30** | **2,95** | **3,65** |
| **Peringkat** | 3 | **1, dipilih** | 4 | 2 |

Alternatif B dipilih dengan nilai 4,30. Alternatif D unggul pada skala dan keamanan,
namun kalah telak pada biaya dan waktu. Perbedaan skala itu tidak material untuk
jumlah pengguna pada orde puluhan sampai ratusan, sehingga B memberikan rasio
manfaat terhadap biaya terbaik terhadap sumber daya yang tersedia.

### 2.4.4 Arsitektur Sistem

Aplikasi memakai arsitektur berlapis tiga dengan pemisahan tanggung jawab yang
jelas. Seluruh permintaan HTTP ditangani di sisi server melalui *server-side
rendering*.

```
LAPISAN PRESENTASI  (src/pages, src/components, src/layouts)
  /login  /dashboard  /dashboard/{assignments,users,posts,categories}
  /user  /user/riwayat  /profile
  Komponen: Button, Input, Select, ChoiceGroup, Dialog, Table, TaskCard
---------------------------------------+----------------------------------
                                        |  HTML dan titik pengait data-*
+--------------------------------------v----------------------------------+
|  LAPISAN LOGIKA DAN BISNIS  (src/lib)                                    |
|  auth.ts       requireAdmin dan requireUser (RBAC)                       |
|  tasks.ts      mesin periode: period key, tenggat, periode lampau        |
|  activities.ts validasi baris aktivitas, volume = frekuensi x durasi x SDM|
|  categories.ts sebelas unit kerja: id, label, ikon                        |
|  format.ts     format tanggal, periode, angka                            |
|  db.ts         lebih dari 30 fungsi akses data, seluruhnya prepared      |
+--------------------------------------+----------------------------------+
                                        |  better-sqlite3, mode WAL
+--------------------------------------v----------------------------------+
|  LAPISAN DATA  (data/app.db, SQLite)                                     |
|  users | posts | login_logs | activities | assignments | activity_logs    |
+--------------------------------------------------------------------------+
```

Alur satu permintaan halaman dijelaskan berikut ini.

```
Peramban -- GET /dashboard/assignments?user=9 dan cookie sesi --> Server
  Server : requireAdmin, gagal --> 302 ke /login
          : requireAdmin, lolos --> baca data dengan prepared statement
          : hitung status kemunculan lewat tasks.ts
          : render HTML --> 200
  Peramban : menerima HTML lengkap, tanpa hydration JavaScript untuk konten
```

Pemilihan *server-side rendering* disengaja. Sebagian besar konten aplikasi berupa
tabel dan formulir, bukan interaksi berbasis state yang rumit. Dengan SSR, aplikasi
hanya memerlukan JavaScript untuk perilaku tambahan seperti pencarian langsung,
dialog, dan animasi. Waktu muat di perangkat terbatas tetap kecil, dan aplikasi tetap
dapat dibaca apabila sebagian skrip gagal dimuat.

### 2.4.5 Tumpukan Teknologi

| Lapisan | Teknologi | Versi | Alasan Pemilihan | Alternatif yang Ditolak |
| :--- | :--- | :--- | :--- | :--- |
| Kerangka kerja | Astro | 7.4 | SSR tanpa kelebihan JavaScript, komponen berfile `.astro`, adapter Node resmi | Next.js dengan beban JavaScript lebih besar, SvelteKit karena belum dikuasai tim |
| Bahasa | TypeScript | 6 | Tipe pada model periode dan data, `astro check` menangkap galat lebih awal | JavaScript murni tanpa keamanan tipe |
| Gaya | Tailwind CSS | 4.3 | Token warna berbasis variabel CSS sehingga satu palet dapat ditukar di seluruh aplikasi | CSS biasa yang berduplikasi, SASS dengan build lambat |
| Basis data | SQLite dan better-sqlite3 | 13.0 | Basis data tertanam tanpa proses server database, mode WAL mendukung tulis dan baca bersamaan | PostgreSQL yang berlebihan secara operasional untuk skala ini |
| Autentikasi | auth-astro berbasis Auth.js Core | 4.2 dan 0.18 | Sesi JWT tanpa tabel sesi, callback dapat membaca ulang peran dari basis data | Paket autentikasi buatan sendiri dengan risiko keamanan |
| Hash kata sandi | bcryptjs | 3.0 | Hash adaptif, work factor dapat dinaikkan tanpa mengubah data lama | MD5 dan SHA-1 yang tidak aman untuk kata sandi |
| Render konten | marked | 18.1 | Pengumuman ditulis dalam Markdown | HTML mentah dengan risiko injeksi skrip |
| Animasi | motion | 14.3 | Animasi teks berputar pada halaman masuk | Keyframes CSS murni dengan kendali waktu yang lebih sulit |
| Ikon | @lucide/astro | 1.59 | Ikon konsisten, semantik jelas, ukuran diatur lewat utilitas | Emoji dan SVG manual yanguche konsistensi serta aksesibilitas |
| Runtime | Bun | 1.4 atau lebih baru | Peladen pengembangan cepat, `bun run` untuk skrip pemeriksaan | Node.js yang tetap didukung dan tidak menjadi ketergantungan proyek |

### 2.4.6 Model Data

Enam tabel dengan kunci asing yang jelas dan batasan integritas di level basis data.

```
    users --1:N--> login_logs
      |
      +---------1:N--> assignments --N:1--> activities --N:1--> unit kerja
      |                     |
      +---------1:N--> activity_logs --N:1--> activities
```

| Tabel | Kolom Utama | Constraint | Index |
| :--- | :--- | :--- | :--- |
| `users` | id, name, email, password_hash, role dengan nilai 0, 1, atau 2 | email UNIQUE, role CHECK | Kunci utama |
| `posts` | id, title, body, author_id, created_at, updated_at, position | author_id menuju users dengan CASCADE | Kunci utama |
| `login_logs` | id, user_id, ip, user_agent, created_at | user_id menuju users dengan CASCADE | `idx_login_logs_user` pada user_id dan id menurun |
| `activities` | id, category_id, name, date, utama, periodik, bukan_tupoksi, periode, frequency, minutes, sdm, volume | Tiga CHECK untuk penanda, CHECK untuk periode | `idx_activities_category` |
| `assignments` | id, user_id, category_id, activity_id, created_at | UNIQUE pada user_id dan activity_id | `idx_assignments_user` |
| `activity_logs` | id, user_id, activity_id, period_key, status, completed_at | UNIQUE pada user_id, activity_id, dan period_key; CHECK untuk status | `idx_activity_logs_user` pada user_id dan period_key |

**Catatan normalisasi.** Atribut `volume` bersifat turunan, yaitu frekuensi dikali
durasi dikali jumlah sumber daya manusia, dan tidak pernah dihitung di sisi peramban.
Nilainya dihitung ulang di server saat baris disimpan, sehingga tidak ada dua sumber
nilai yang saling bertentangan.

Seluruh kunci non-primer pada tabel `activities` bergantung penuh pada kunci utama,
tidak ada dependensi transitif, dan tabel `assignments` dipisahkan dari
`activity_logs` karena yang pertama menyatakan penerima tugas sedangkan yang kedua
menyatakan kejadian pada satu periode.

**Akses data.** Seluruh kueri memakai *prepared statement* berparameter, sehingga nilai
dari formulir tidak pernah dirangkai ke dalam teks SQL.

### 2.4.7 Model Periode dan Mesin Kemunculan

Tugas berulang tidak disimpan sebagai satu tugas, melainkan sebagai kemunculan
(*occurrence*): satu penugasan meluas menjadi banyak kemunculan, satu untuk setiap
periode. Identitas kemunculan adalah *period key* yang stabil.

| Periode | Format Period Key | Contoh | Rentang Periode | Tenggat |
| :--- | :--- | :--- | :--- | :--- |
| Harian | `YYYY-MM-DD` | `2026-10-20` | Satu hari | Hari itu sendiri |
| Mingguan | `YYYY-Www` dengan ISO dan Senin sebagai awal | `2026-W43` | Senin sampai Minggu | Hari Minggu |
| Bulanan | `YYYY-MM` | `2026-10` | Satu sampai 31 sesuai kalender | Tanggal pada aktivitas, atau akhir bulan |
| Semesteran | `YYYY-S1` atau `YYYY-S2` | `2026-S1` | Januari sampai Juni, Juli sampai Desember | 30 Juni dan 31 Desember |

Seluruh aritmetika tanggal memakai tanggal sipil pada zona waktu Asia/Jakarta yang
dihitung dalam UTC. Tidak ada pergantian waktu musim panas di area tersebut, sehingga
tanggal tidak pernah bergeser.

```
Penugasan : satu baris pada tabel assignments
     |
     v
Kemunculan : dihitung dari periode dan tanggal penugasan s/d periode berjalan
     Harian    : setiap hari sejak penugasan dibuat
     Mingguan  : setiap minggu ISO sejak penugasan dibuat
     Bulanan   : setiap bulan sejak penugasan dibuat
     Semesteran: setiap semester sejak penugasan dibuat
     v
Status kemunculan
     sudah ada baris di activity_logs -> status: selesai atau terlewat
     belum ada, periode sudah berakhir -> terlewat saat materialisasi
     belum ada, periode masih berjalan      -> belum dikerjakan
```

Batas atas jumlah periode lampau yang dimaterialisasi adalah 400 periode per penugasan,
sekitar 13 bulan untuk tugas harian, sehingga basis data tidak tumbuh tanpa batas
ketika penugasan lama dibiarkan berbulan-bulan.

### 2.4.8 Mekanisme Pencatatan Keterlambatan

Tugas yang terlewat dicatat otomatis saat halaman pengguna dibuka, bukan melalui
*cron job*. Alasan pemilihan ini:

1. **Ketersediaan.** Aplikasi tidak bergantung pada penjadwal eksternal, sehingga
   penyimpangan jam server tidak menyebabkan keterlambatan tidak tercatat.
2. **Sederhana dan idempoten.** Aturan UNIQUE pada kombinasi user_id, activity_id, dan
   period_key memastikan pencatatan dua kali untuk periode yang sama tidak
   menduplikasi baris.
3. **Cukup untuk skala.** Beban materialisasi hanya berupa penulisan beberapa baris
   per penugasan aktif.

Status terlambat tidak disimpan sebagai kolom tersendiri, melainkan diturunkan. Sebuah
kemunculan berstatus terlewat yang kemudian diselesaikan pengguna berubah menjadi
selesai dengan penanda terlambat, karena waktu penyelesaian melewati tenggat periode
tersebut.

### 2.4.9 Keamanan dan Otorisasi

| Aspek | Penerapan |
| :--- | :--- |
| Penyimpanan kata sandi | bcrypt, dengan work factor yang dapat dinaikkan tanpa memigrasikan data lama |
| Sesi | JWT pada cookie `httpOnly`, peran dan identitas dibaca ulang dari basis data pada setiap callback, sehingga perubahan kata sandi atau peran langsung berlaku |
| Otorisasi | `requireAdmin` untuk area administrasi, `requireUser` untuk ruang kerja, peran admin dialihkan ke dasbor |
| Matriks peran | Admin menangani seluruh modul, pengguna hanya ruang kerja dan riwayat, admin prodi area admin terbatas sesuai unit kerjanya |
| SQL | Seluruh kueri berupa prepared statement, tidak ada perakitan string SQL dari masukan pengguna |
| Masukan formulir | Validasi di sisi server pada `parseActivity`, meliputi rentang frekuensi 1 sampai 999, durasi 1 sampai 1440 menit, jumlah SDM 1 sampai 999, dan tanggal yang harus benar-benar ada di bulan tersebut |
| Jejak akses | Tabel `login_logs` menyimpan waktu, alamat IP, dan perangkat pada setiap login |
| Audit data | Tabel `activity_logs` menyimpan waktu penyelesaian dan waktu perubahan baris |

Yang belum dikerjakan pada versi ini dan masuk rencana lanjutan adalah verifikasi dua
faktor, pembatasan akses berdasarkan alamat IP unit kerja, dan pencadatan siapa yang
mengubah baris jenis aktivitas.

### 2.4.10 Desain Antarmuka dan Aksesibilitas

Antarmuka memakai satu set komponen yang dipakai ulang lintas halaman pada
`src/components/ui/`, yaitu tombol, masukan, pilihan, kelompok pilihan, dialog, tabel,
dan kartu statistik. Prinsip yang dipakai:

- **Semantik HTML lebih dahulu.** Dialog memakai elemen `dialog` asli sehingga fokus
  terkurung, tombol Escape berfungsi, dan overlay berada di lapisan teratas tanpa
  penulisan JavaScript tambahan.
- **Warna bukan satu-satunya pembawa makna.** Status selesai, terlewat, dan terlambat
  selalu disertai label teks.
- **Palet sebagai variabel CSS.** Setiap utilitas warna Tailwind versi 4 dikompilasi
  menjadi variabel `var(--color-*)`. Karena itu tiga tema, yaitu Terang, Gelap, dan
  Kertas, hanya merupakan pemetaan ulang variabel pada elemen `html`, tanpa mengubah
  satu pun komponen.
- **Pemasangan tema tanpa kedip.** Tema dipasang sebelum lukisan pertama melalui skrip
  inline pada `head`, sehingga tidak ada kedipan palet yang salah.
- **Pencarian yang tidak mengganggu.** Pencarian pada kontainer pengguna bekerja secara
  langsung tanpa memuat ulang halaman, menyorot bagian yang cocok dengan Pending
  simpul teks dan bukan `innerHTML`, dapat dipicu tombol `/`, dan dibersihkan dengan
  Escape.

Pemeriksaan aksesibilitas yang dijalankan meliputi label pada seluruh medan, kontras
teks pada tema gelap dan kertas, target sentuh minimal 36 piksel, `aria-label` pada
tombol tanpa teks, serta peran `status` pada penghitung hasil pencarian.

### 2.4.11 Mutu dan Pengujian

| Jenis | Alat dan Metode | Cakupan | Status |
| :--- | :--- | :--- | :--- |
| Pemeriksaan tipe | `astro check` | 47 berkas, TypeScript dan template Astro | Tanpa galat dan tanpa peringatan |
| Pemeriksaan kalender | `src/scripts/check-tasks.ts` | 30 pemeriksaan atas kunci periode, rentang periode, tenggat, periode lampau, dan selisih hari | Semua lulus |
| Uji fungsional | Peramban tanpa kepala, Chromium | Alur masuk, penugasan, penyelesaian, pembatalan, riwayat, dan pencarian | Lulus |
| Uji keamanan | Peramban tanpa kepala | `periodKey` palsu dan `activityId` tak dikenal ditolak tanpa menulis baris | Lulus |
| Uji build | `astro build` | Build produksi dengan adapter Node | Sukses |
| Uji regresi | Pemeriksaan manual terhadap kode lama | Tidak ada perubahan pada modul lain | Tidak ada perubahan |

Pemeriksaan kalender diletakkan terpisah dari peramban justru karena seluruh konsep
tenggat dan terlewat pada aplikasi bertumpu pada fungsi di `src/lib/tasks.ts`. Batas
kalender, seperti tahun kabisat, pergantian minggu ISO, akhir bulan, dan pergantian
semester, lebih aman diuji di lingkungan Node daripada di lingkungan peramban.

### 2.4.12 Kinerja dan Skalabilitas

- Basis data berjalan pada mode WAL, sehingga penulisan log yang terjadi setiap kali
  pengguna menyelesaikan tugas tidak memblokir pembacaan.
- Tiga indeks komposit mendukung kueri utama, yaitu daftar kemunculan per pengguna,
  daftar riwayat per pengguna, dan katalog aktivitas per unit kerja.
- Halaman dilayani pada mode *standalone* adapter Node sebagai satu proses tanpa
  keluaran keluar selain basis data.
- **Isolasi cache dependensi Vite.** Server pengembangan, `astro check`, dan
  `astro build` memakai direktori cache yang berbeda. Tanpa pemisahan ini, proses
  pemeriksaan atau build dapat menghapus bundel yang sudah disiapkan oleh server
  pengembangan, sehingga peramban menerima galat `504 Outdated Optimize Dep` dan
  seluruh skrip klien pada dependensi tersebut mati tanpa jejak. Gejala yang pernah
  muncul dari keadaan tersebut adalah animasi teks di halaman masuk yang berhenti
  berputar tanpa pesan galat.
- Beban skrip klien ringan: satu bundel Motion untuk animasi teks, serta skrip kecil
  untuk pencarian, notifikasi, dan dialog.

### 2.4.13 Diagram Alur Utama

**Penugasan aktivitas kepada pengguna.**

```
Admin              Server, halaman /dashboard/assignments        Basis Data
   |                          |                                        |
   |-- pilih pengguna ------->|                                        |
   |-- pilih aktivitas ------>|-- validasi --------------------------->|
   |                          |   aktivitas belum ditugaskan?         |
   |                          |<-- ya ---------------------------------|
   |-- konfirmasi ----------->|-- INSERT assignments, UNIQUE --------->|
   |                          |<-- satu baris per aktivitas -----------|
   |<-- daftar penugasan dan tombol hapus --|                           |
```

**Penyelesaian tugas oleh pengguna.**

```
Pengguna           Server, halaman /user                    Basis Data
   |                       |                                      |
   |-- tandai tugas ------>|-- validasi period_key dan activity_id |
   |                       |   keduanya diminta dari server       |
   |                       |<-- dari formulir: activityId, periodKey|
   |                       |-- INSERT atau UPDATE activity_logs -->|
   |                       |   status selesai, completed_at sekarang
   |                       |   bila melewati tenggat, tandai terlambat
   |<-- redirect dan pesan "Selesai" --|                            |
```

**Materialisasi keterlambatan.**

```
Pengguna membuka /user
        |
        v
materializeOverdue(userId)
        |  untuk tiap penugasan dan tiap periode lampau:
        |     INSERT dengan status terlewat, UNIQUE mengabaikan duplikat
        v
Tampilkan kelompok: Terlewat, Hari ini, Minggu ini, Bulan ini, Semester ini
```

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

## 2.5 Skenario Pemanfaatan Produk oleh Pemangku Kepentingan

### 2.5.1 Pemangku Kepentingan dan Kebutuhannya

| Pemangku Kepentingan | Kebutuhan Utama | Manfaat dari Better Belt |
| :--- | :--- | :--- |
| Kepala Unit Kerja | Melihat sejauh mana tupoksi unit berjalan dan siapa yang tertinggal | Ringkasan status per periode dan riwayat yang dapat ditelusuri |
| Admin, operator sistem | Menugaskan aktivitas berulang ke banyak orang sekaligus | Penugasan massal dengan katalog MPP sebagai sumber tunggal |
| Dosen, staf, dan admin prodi | Mengetahui apa yang harus dikerjakan hari ini dan menandainya selesai | Ruang kerja pribadi dengan tugas terlambat yang tetap dapat diselesaikan |
| Bagian keuangan dan perencana | Bukti bahwa kegiatan sudah dilaksanakan | Jejak audit berisi siapa, kapan, dan untuk periode apa |
| Tim TI | Operasional yang stabil dan mudah dirawat | Basis data tertanam tanpa layanan pihak ketiga dan log akses lengkap |

### 2.5.2 Alur Skenario per Aktor

**Skenario 1, admin membuka periode kerja baru pada hari Senin pagi.**

1. Admin membuka `/dashboard/assignments` dan memilih pengguna dari kontainer pengguna.
2. Admin mengetik "dosen" pada kotak pencarian. Dua pengguna yang cocok ditampilkan
   lengkap dengan jumlah tugas masing-masing, sehingga admin tidak perlu membuka daftar
   satu per satu.
3. Admin membuka dialog penugasan, memilih lima aktivitas MPP, misalnya Absensi Harian
   dan Rapat Evaluasi Mingguan, lalu menyubmitkan.
4. Sistem menyimpan lima baris penugasan. Aktivitas yang sudah ditugaskan sebelumnya
   tidak dapat dipilih lagi sehingga tidak terjadi penugasan ganda.

**Skenario 2, pengguna membuka ruang kerjanya pada pagi hari kerja.**

1. Pengguna masuk dan langsung dibuka ke halaman `/user`, yang menampilkan ringkasan
   jumlah tugas selesai hari ini, tugas terlewat, dan tugas selesai bulan ini.
2. Tugas yang terlewat tampil di bagian paling atas dengan penanda yang berbeda,
   disertai tombol Selesaikan.
3. Pengguna menyelesaikan tugas yang terlewat. Sistem menandai tugas selesai sekaligus
   terlambat, karena waktu penyelesaian melewati tenggat periode.
4. Kelompok Hari ini, Minggu ini, Bulan ini, dan Semester ini menampilkan sisa tugas.
   Tugas yang ditandai selesai dapat dikembalikan apabila salah tandai.

**Skenario 3, kepala unit meninjau kepatuhan.**

1. Kepala unit membuka daftar riwayat pada `/user/riwayat` dan menyaring baris
   berstatus Terlewat.
2. Kronologi keterlambatan beserta waktu penyelesaiannya digunakan menyusun ringkasan
   beban kerja untuk laporan kepatuhan unit.

**Skenario 4, pengguna baru masuk ke sistem.**

1. Admin membuat akun pengguna dari `/dashboard/users` dengan peran yang sesuai.
2. Pengguna menerima kredensial, masuk melalui `/login`, dan kecloak dicatat pada tabel
   `login_logs` lengkap dengan alamat IP dan perangkat.
3. Admin menugaskan aktivitas, dan pengguna langsung melihat tugasnya pada `/user`.

### 2.5.3 Skenario Gagal dan Penanganannya

| No | Situasi | Penanganan Sistem |
| :--- | :--- | :--- |
| G-01 | Pengguna mengirim `periodKey` palsu untuk menandai tugas yang bukan miliknya | Parameter diverifikasi ulang terhadap daftar penugasan milik pengguna, permintaan ditolak, dan tidak ada baris tertulis |
| G-02 | Admin menugaskan aktivitas yang sudah ditugaskan ke pengguna yang sama | Ditolak oleh batasan UNIQUE pada kombinasi user_id dan activity_id |
| G-03 | Sesi kedaluwarsa saat membuka halaman sensitif | Dialihkan ke halaman masuk dengan pesan singkat |
| G-04 | Formulir aktivitas memuat tanggal yang tidak ada, misalnya 31 Februari | Ditolak di server dengan pesan yang menjelaskan, dan tanggal diperiksa terhadap kalender sebenarnya |
| G-05 | Koneksi basis data terputus saat menyimpan | Transaksi dibatalkan dan pesan kesalahan ditampilkan, tidak ada pencatatan setengah jadi |
| G-06 | Pencarian tidak menemukan kecocokan | Keadaan kosong dengan tombol Bersihkan pencarian |
| G-07 | Pengguna menekan tombol Selesaikan dua kali | Permintaan pertama berhasil, permintaan berikutnya tidak mengubah apa pun karena `period_key` sudah tercatat |

### 2.5.4 Rencana Adopsi

| Tahap | Periode | Kegiatan | Penanggung Jawab |
| :--- | :--- | :--- | :--- |
| T-1 | Minggu 1 | Impor katalog 186 jenis aktivitas MPP dan verifikasi silang dengan berkas Excel sumber | Admin |
| T-2 | Minggu 2 | Uji coba pada dua unit kerja, Tata Usaha dan Kesekretariatan | Kepala Unit Kerja |
| T-3 | Minggu 3 | Penyesuaian berdasarkan umpan balik dan pelatihan singkat 30 menit per pengguna | Tim pengembang |
| T-4 | Minggu 4 | Pelaksanaan penuh pada sebelas unit kerja | Seluruh unit |
| T-5 | Semester berikutnya | Penutupan periode lama dan penilaian beban kerja per pengguna | Kepala Unit Kerja |

Strategi adopsi mengutamakan pelatihan singkat, bukan dokumentasi panjang. Antarmuka
disengaja dibuat sesedikit mungkin untuk mengurangi beban pelatihan, dan pencarian
serta kotak centang adalah satu-satunya interaksi yang harus dipelajari pengguna.

### 2.5.5 Ukuran Keberhasilan

| No | Indikator | Target | Cara Pengukuran |
| :--- | :--- | :--- | :--- |
| K-01 | Cakupan penugasan | Minimal 90 persen jenis aktivitas MPP aktif pernah ditugaskan | Query tabel `assignments` |
| K-02 | Ketepatan pencatatan | Seluruh kemunculan pada periode lampau berstatus terlewat secara otomatis | 30 pemeriksaan kalender dan audit sampel |
| K-03 | Partisipasi pengguna | Minimal 80 persen pengguna aktif menandai satu tugas selesai setiap minggu | Query `activity_logs` |
| K-04 | Keterlambatan | Penurunan jumlah kemunculan terlewat minimal 30 persen dibanding semester sebelumnya | Rekap per unit kerja |
| K-05 | Ketersediaan layanan | Ketersediaan minimal 98 persen pada jam kerja | Log server |
| K-06 | Kepuasan pengguna | Skor rata-rata minimal 3,5 dari 5 pada kuesioner kegunaan | Kuesioner internal |


# 3. Sumber Daya Pengembangan

## 3.1 Man-Month

### 3.1.1 Definisi dan Rumus

Man-month adalah besaran kerja satu orang selama satu bulan kerja penuh, sehingga satu
man-month setara dengan satu orang selama satu bulan. Satuan ini dipilih karena tim
pengembangan berukuran kecil dan berdekatan, sehingga satuan orang biasa menyesatkan.

Man-month total = jumlah dari (jumlah orang dikali durasi dalam bulan), untuk seluruh
anggota tim.

Dalam dokumen ini satu bulan dihitung sebagai empat minggu kerja efektif, yaitu 20 hari
kerja setelah dikurangi hari libur nasional dan cuti bersama yang jatuh di dalam
periode.

### 3.1.2 Komposisi Tim

Tim terdiri atas tiga orang dengan peran berikut.

| Kode | Peran | Penanggung Jawab Utama | Kompetensi Inti |
| :--- | :--- | :--- | :--- |
| A-1 | Analis Sistem dan Full-stack, sekaligus penyusun proposal | Analisis kebutuhan, arsitektur, mesin periode, integrasi, dokumentasi | Pemodelan domain, TypeScript, basis data relasional |
| A-2 | Front-end dan Antarmuka | Komponen antarmuka, tema, dialog, pencarian langsung, aksesibilitas | HTML dan CSS modern, Tailwind, Browser API, design system |
| A-3 | Back-end, Basis Data, dan Pengujian | Skema basis data, kueri, validasi, pengujian otomatis, pengujian keamanan | SQL, pengujian, keamanan aplikasi |

Ketiga anggota bekerja penuh selama empat minggu dan satu bulan, dengan
koordinasi mingguan pada Subbab 3.1.3.

### 3.1.3 Alokasi per Fase

| Fase | Minggu | Hasil Utama | A-1 | A-2 | A-3 | Subtotal |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: |
| F-1 Analisis dan desain | 1 sampai 2 | Dokumen kebutuhan, model periode, skema basis data | 0,50 | 0,15 | 0,35 | 1,00 |
| F-2 Implementasi inti | 2 sampai 3 | Skema basis data, mesin periode, alur penugasan | 0,25 | 0,35 | 0,40 | 1,00 |
| F-3 Implementasi antarmuka | 3 sampai 4 | Komponen antarmuka, seluruh halaman, tema, pencarian | 0,10 | 0,30 | 0,05 | 0,45 |
| F-4 Pengujian dan perbaikan | 4 | Pengujian fungsional, pengujian keamanan, perbaikan galat | 0,05 | 0,10 | 0,15 | 0,30 |
| F-5 Dokumentasi dan serah terima | 4 sampai 5 | Dokumentasi teknis, panduan pengguna, deployment | 0,10 | 0,10 | 0,05 | 0,25 |
| | | **Total** | **1,00** | **1,00** | **1,00** | **3,00** |

### 3.1.4 Total Man-Month

| Peran | Durasi | Man-Month |
| :--- | :--- | :---: |
| Analis Sistem dan Full-stack (A-1) | 1 bulan | 1,00 |
| Front-end dan Antarmuka (A-2) | 1 bulan | 1,00 |
| Back-end, Basis Data, dan Pengujian (A-3) | 1 bulan | 1,00 |
| **Total kebutuhan** | | **3,00 man-month** |

Asumsi yang melandasi angka ini:

1. Komponen autentikasi, tata letak, dan pustaka antarmuka tidak dikerjakan dari nol.
   Kerangka Astro, Tailwind, Auth.js, dan Lucide digunakan apa adanya.
2. Basis data target berupa SQLite tertanam, sehingga tidak ada kebutuhan infrastruktur
   basis data terpisah.
3. Pengujian otomatis ditulis sendiri, 30 pemeriksaan kalender, dan bukan memakai
   kerangka pengujian pihak ketiga, sehingga biaya penyiapan mendekati nol.
4. Tidak ada tim operasional terpisah. Pengoperasian aplikasi setelah serah terima
   termasuk dalam rencana pemeliharaan pada Subbab 3.5.4 dan tidak dihitung dalam
   3,00 man-month pengembangan.
5. Tidak termasuk waktu penyusunan laporan akademik. Dokumen yang dihasilkan adalah
   produk, bukan laporan.

**Catatan sensitivitas.** Bila hanya satu anggota yang tersedia selama satu bulan,
luas cakupan yang dapat diselesaikan turun menjadi sekitar 45 persen dari versi tiga
orang, karena katalog MPP penuh, seluruh halaman, dan seluruh pengujian tidak muat
dikerjakan bersamaan. Sebaliknya, penambahan anggota keempat dan seterusnya
menghasilkan penurunan produktivitas akibat beban koordinasi tanpa penurunan waktu
yang berarti.

## 3.2 Machine-Month

### 3.2.1 Definisi dan Rumus

Machine-month adalah besaran sumber daya mesin, yaitu server dan perangkat kerja, yang
dipakai selama satu bulan.

Machine-month total = jumlah dari (jumlah mesin dikali durasi dalam bulan), untuk
seluruh aset.

### 3.2.2 Aset Komputasi

| Kode | Aset | Spesifikasi | Jumlah | Kepemilikan |
| :--- | :--- | :--- | :---: | :--- |
| M-1 | Server aplikasi fakultas | Intel Xeon E-2356G, 6 inti dan 12 thread pada 3,2 GHz, RAM 16 GB DDR4, SSD 500 GB, Ubuntu Server 22.04 LTS | 1 unit | Milik kampus |
| M-2 | Perangkat pengembangan | Laptop, 4 inti, RAM 8 GB, SSD 512 GB | 3 unit | Milik anggota tim |
| M-3 | Media cadangan | Disk eksternal 1 TB untuk salinan basis data harian | 1 unit | Milik kampus |
| M-4 | Jaringan dan nama domain | LAN kampus, alamat IPv4 statis, TLS melalui Let's Encrypt | 1 paket | Milik kampus |

### 3.2.3 Perhitungan Machine-Month

| Aset | Jumlah | Durasi dalam bulan | Machine-Month |
| :--- | :---: | :---: | :---: |
| M-1 Server aplikasi | 1 | 12 | 12 |
| M-2 Perangkat pengembangan | 3 | 1 | 3 |
| M-3 Media cadangan | 1 | 12 | 12 |
| **Total** | | | **27 machine-month** |

### 3.2.4 Estimasi Biaya

Karena server berada di milik kampus, tidak ada biaya sewa bulanan. Biaya yang
terhitung adalah biaya operasional dan penyisihan penggantian perangkat.

| Komponen | Dasar Perhitungan | Estimasi per Bulan | Estimasi per Tahun |
| :--- | :--- | :---: | :---: |
| Listrik server | Daya rata-rata 150 W, sama dengan 0,15 kW dikali 24 jam dikali 30 hari, yaitu 108 kWh dikali Rp 1.500 per kWh | Rp 162.000 | Rp 1.944.000 |
| Listrik perangkat pengembangan | 3 laptop dikali 60 W dikali 8 jam per hari dikali 22 hari, yaitu 31,7 kWh dikali Rp 1.500 per kWh | Rp 47.500 | Tidak dibebankan ke proyek |
| Media cadangan | Penyewaan drive 1 TB tahunan | | Rp 600.000 |
| Nama domain dan TLS | Domain titik id dan sertifikat Let's Encrypt | Rp 15.000 | Rp 180.000 |
| Penyisihan penggantian perangkat | Penggantian setelah empat tahun pakai | Rp 83.000 | Rp 1.000.000 |
| **Total biaya operasional server per tahun** | | | **Rp 3.724.000** |

Biaya pengembangan perangkat kerja tidak dibebankan ke proyek karena merupakan aset milik
anggota tim. Biaya yang relevan adalah penyisihan penggantian sebesar sekitar
Rp 1.000.000 per tahun untuk tiga perangkat.

### 3.2.5 Asumsi dan Batasan

1. Server dipakai bersama dengan layanan kampus lain. Beban Better Belt diperkirakan
   di bawah 10 persen kapasitas CPU dan penyimpanan.
2. Ukuran basis data untuk sebelas unit kerja dengan 186 jenis aktivitas berada di bawah
   100 MB, sehingga penyimpanan 500 GB memberi ruang untuk salinan harian selama
   bertahun-tahun.
3. Angka biaya listrik memakai tarif rata-rata Rp 1.500 per kWh. Tarif listrik kampus
   yang sebenarnya dapat berbeda dan harus dikonfirmasi ke bagian keuangan.
4. Angka biaya tersebut tidak termasuk biaya SERVER yang hilang bila server tidak
   tersedia. Opsi cadangan adalah penyewaan VPS dengan biaya sekitar Rp 400.000 per
   bulan atau 12 machine-month, yang akan menaikkan total biaya operasional pertama
   sebesar sekitar Rp 4,8 juta.

## 3.3 Alat Pengembangan

### 3.3.1 Perkakas Perangkat Lunak

| No | Perkakas | Versi | Peran | Lisensi |
| :--- | :--- | :--- | :--- | :--- |
| P-01 | Visual Studio Code | 1.9x | Penyunting kode dengan ekstensi Astro dan Tailwind | MIT |
| P-02 | Bun | 1.4 atau lebih baru | Manajer paket, runtime skrip, dan peladen pengembangan | MIT |
| P-03 | Astro CLI | 7.4 | Kerangka kerja, peladen pengembangan, pemeriksaan tipe, dan build | MIT |
| P-04 | TypeScript | 6 | Pemeriksaan tipe | Apache-2.0 |
| P-05 | Tailwind CSS | 4.3 | Kompilasi utilitas gaya | MIT |
| P-06 | Git | 2.40 atau lebih baru | Version control | GPL-2.0 |
| P-07 | Chromium headless | 140 atau lebih baru | Peramban uji otomatis | BSD |
| P-08 | Playwright | 1.4x | Otomasi peramban untuk uji fungsional | Apache-2.0 |
| P-09 | Chrome DevTools | | Pemeriksaan jaringan dan audit aksesibilitas | proprietary |
| P-10 | DBeaver atau SQLiteStudio | | Peninjauan basis data dan kueri | GPL-2.0 |
| P-11 | LibreOffice | 7.x | Penyunting MPP dan penyusunan laporan | MPL-2.0 |
| P-12 | draw.io atau Excalidraw | | Diagram arsitektur dan alur | GPL-2.0 |
| P-13 | cURL atau Postman | | Uji permintaan HTTP | Apache-2.0 |

### 3.3.2 Pustaka dan Dependensi Proyek

| Pustaka | Versi | Kegunaan |
| :--- | :--- | :--- |
| astro | 7.4 | Kerangka kerja, SSR, routing, dan adapter Node |
| @astrojs/node | 11.1 | Adapter untuk lingkungan produksi Node dalam mode standalone |
| @astrojs/check | 0.9 | Pemeriksaan tipe Astro dan TypeScript |
| @tailwindcss/vite dan tailwindcss | 4.3 | Sistem gaya berbasis token CSS |
| auth-astro dan @auth/core | 4.2 dan 0.18 | Autentikasi kredensial dan sesi JWT |
| better-sqlite3 | 13.0 | Antarmuka basis data SQLite asli dengan WAL dan prepared statement |
| bcryptjs | 3.0 | Hash kata sandi adaptif |
| marked | 18.1 | Render Markdown untuk pengumuman |
| motion | 14.3 | Animasi teks berputar pada halaman masuk |
| @lucide/astro | 1.59 | Ikon antarmuka |
| typescript | 6 | Pemeriksaan tipe |
| next-auth | 4.24 | Ketergantungan transitif dari auth-astro, tidak diimpor langsung |

Seluruh pustaka berlisensi permissive, yaitu MIT, Apache-2.0, atau BSD, sehingga tidak
menimbulkan biaya lisensi. Tidak ada dependensi berbayar maupun layanan pihak ketiga
yang menyimpan data di luar kampus.

### 3.3.3 Repository dan Version Control

| Aspek | Ketentuan |
| :--- | :--- |
| Penyimpanan | Git privat pada repositori internal kampus, dengan cadangan pada repositori daring privat |
| Cabang | `main` untuk kode siap rilis, `feat/nama-fitur` selama pengembangan, `fix/nama-isu` untuk perbaikan |
| Konvensi commit | Format Conventional Commits, yaitu `feat`, `fix`, `docs`, dan `refactor` |
| Pemeriksaan sebelum push | `bun run check` tanpa galat dan `bun run build` sukses |
| Dokumentasi kebutuhan | Dua lapis, yaitu dokumen ini sebagai rencana dan komentar kode pada modul `src/lib/` |

## 3.4 Peralatan Pengujian

### 3.4.1 Spesifikasi Perangkat Uji

| Kode | Perangkat | Spesifikasi | Peran |
| :--- | :--- | :--- | :--- |
| T-D1 | Laptop pengembangan | Intel Core i5-1135G7, RAM 8 GB, SSD 512 GB, Windows 11 atau macOS 14 | Lingkungan pengembangan dan uji otomatis |
| T-D2 | Desktop uji | Intel Core i3-10100, RAM 8 GB, SSD 256 GB, Ubuntu 22.04 | Server uji lokal dan pengujian lintas peramban |
| T-D3 | Tablet | iPad 9 atau Galaxy Tab S6, 1200 x 2000 piksel | Uji tata letak responsif pada ukuran sedang |
| T-D4 | Ponsel | iPhone 12 atau Galaxy A52, 390 x 844 piksel | Uji ruang kerja pengguna pada layar kecil |
| T-D5 | Monitor | 24 inci, 1920 x 1080, skala 100 persen | Uji tampilan desktop |
| T-D6 | Jaringan | Wi-Fi kampus dan tethering 4G | Uji perilaku pada koneksi lambat |

### 3.4.2 Peramban dan Perangkat Lunak Uji

| Peramban atau Perangkat Lunak | Versi | Pengujian |
| :--- | :--- | :--- |
| Chromium melalui Playwright | 140 atau lebih baru | Uji fungsional otomatis untuk seluruh alur |
| Chrome | 140 atau lebih baru | Uji manual dan audit DevTools |
| Firefox | 128 atau lebih baru | Uji manual kompatibilitas |
| Safari pada macOS dan iOS | 18 atau lebih baru | Uji manual pada mesin render WebKit |
| Chrome pada Android | 140 atau lebih baru | Uji manual pada perangkat nyata |
| Lighthouse | 12.x | Audit performa, aksesibilitas, dan SEO dasar |

### 3.4.3 Matriks Skenario Uji

| ID | Skenario | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- |
| U-01 | Kunci periode harian, mingguan, bulanan, dan semesteran | `2026-10-20`, `2026-W43`, `2026-10`, dan `2026-S1` | Lulus, pemeriksaan kalender |
| U-02 | Rentang periode mingguan | Senin sampai Minggu sesuai ISO 8601 | Lulus, pemeriksaan kalender |
| U-03 | Tenggat periode | Harian sama dengan hari itu, mingguan hari Minggu, bulanan sesuai tanggal aktivitas, semesteran 30 Juni dan 31 Desember | Lulus, pemeriksaan kalender |
| U-04 | Periode lampau | Menghasilkan seluruh periode antara tanggal penugasan dan periode berjalan | Lulus, pemeriksaan kalender |
| U-05 | Batas 400 periode | Dihormati, tidak pernah tak terbatas | Lulus, pemeriksaan kalender |
| U-06 | Tanggal tidak ada, misalnya 31 Februari | Ditolak dengan pesan yang jelas | Lulus |
| U-07 | Volume dihitung di server | Frekuensi dikali durasi dikali SDM, bukan masukan peramban | Lulus |
| U-08 | Login dengan kredensial salah | Ditolak dengan pesan generik, percobaan tetap tercatat di log akses | Lulus |
| U-09 | Pengguna biasa membuka area admin | Dialihkan ke halaman miliknya | Lulus |
| U-10 | Penugasan ganda | Ditolak oleh batasan UNIQUE | Lulus |
| U-11 | `periodKey` palsu | Ditolak, tidak ada baris tertulis | Lulus |
| U-12 | `activityId` tak dikenal | Ditolak, tidak ada baris tertulis | Lulus |
| U-13 | Penyelesaian tugas tepat waktu | Status selesai tanpa penanda terlambat | Lulus |
| U-14 | Penyelesaian tugas melewati tenggat | Status selesai dengan penanda terlambat | Lulus |
| U-15 | Pembatalan penyelesaian | Status baris dikembalikan, tugas kembali terbuka | Lulus |
| U-16 | Pengelompokan tugas per periode | Tugas tampil pada kelompok yang benar | Lulus |
| U-17 | Pencarian pengguna berdasarkan nama dan surel | Hanya yang cocok ditampilkan, pencacah diperbarui | Lulus |
| U-18 | Pencarian tanpa hasil | Keadaan kosong dengan tombol bersihkan pencarian | Lulus |
| U-19 | Pintasan `/` dan Escape | Fokus ke kotak pencarian dan membersihkan pencarian | Lulus |
| U-20 | Penyorotan hasil pencarian | Bagian yang cocok disorot, teks asli tetap utuh | Lulus |
| U-21 | Pergantian tema | Palet berubah di seluruh halaman, pilihan tersimpan | Lulus |
| U-22 | Tema gelap pada dialog native | Dialog dan elemen native mengikuti palet gelap | Lulus |
| U-23 | Animasi halaman masuk pada semua tema | Teks berputar tetap berjalan | Lulus |
| U-24 | Galat konsol di seluruh halaman | Tidak ada galat konsol | Lulus |
| U-25 | Build produksi | `astro build` sukses tanpa galat | Lulus |

### 3.4.4 Data Uji

Data uji terdiri atas 186 jenis aktivitas MPP sebagai data uji impor, pengguna dummy
untuk setiap peran, penugasan yang sengaja dibuat mundur untuk menghasilkan
kemunculan terlewat, dan pengumuman contoh untuk menguji render Markdown. Data uji
disimpan terpisah dari data operasional, yaitu `data/app.db` untuk operasional dan
`data/app-test.db` untuk pengujian, sehingga pengujian tidak pernah mengotori data
asli.

## 3.5 Kebutuhan Tenaga Ahli

### 3.5.1 Profil Peran yang Dibutuhkan

| Peran | Jenjang Pendidikan | Pengalaman Minimum | Kompetensi Wajib | Bukti Kompetensi |
| :--- | :--- | :--- | :--- | :--- |
| Analis Sistem dan Full-stack | S1 Informatika atau Sistem Informasi | 2 tahun | TypeScript, SQL, pemodelan domain, HTTP dan keamanan dasar | Portofolio proyek |
| Front-end dan Antarmuka | S1 Informatika, DKV, atau Teknik Informatika | 1 sampai 2 tahun | HTML dan CSS modern, Tailwind, aksesibilitas WCAG, pengujian peramban | Portofolio antarmuka |
| Back-end, Basis Data, dan Pengujian | S1 Informatika atau Teknik Informatika | 2 tahun | SQL dengan normalisasi dan indeks, pengujian otomatis, keamanan aplikasi | Sertifikasi pengujian perangkat lunak |

### 3.5.2 Kebutuhan Rekrutmen

| Peran | Jumlah | Alokasi dalam Man-Month | Bentuk Pengadaan | Sumber |
| :--- | :---: | :---: | :--- | :--- |
| Analis Sistem dan Full-stack | 1 orang | 1,00 | Paket kerja capstone | Anggota tim |
| Front-end dan Antarmuka | 1 orang | 1,00 | Paket kerja capstone | Anggota tim |
| Back-end, Basis Data, dan Pengujian | 1 orang | 1,00 | Paket kerja capstone | Anggota tim |
| **Total** | **3 orang** | **3,00** | | |

Seluruh kebutuhan dapat dipenuhi dari anggota tim yang sudah ada, melalui tugas
kapstone atau magang, tanpa rekrutmen eksternal, asalkan ketiganya memiliki kompetensi
minimal seperti pada Tabel 3.5.1. Bila salah satu posisi diisi pihak luar,
kompensasinya berbentuk paket kerja, bukan gaji dalam anggaran proyek.

### 3.5.3 Kompetensi Non-Teknis

| Kompetensi | Penerapan | Penanggung Jawab |
| :--- | :--- | :--- |
| Komunikasi dengan pengguna non-teknis | Wawancara kebutuhan dan pelatihan adopsi pada Subbab 2.5.4 | A-1 |
| Manajemen waktu dan prioritas | Hasil utama per fase pada Subbab 3.1.3 | Seluruh anggota |
| Dokumentasi | Komentar kode, README, dan panduan pengguna | A-1 |
| Rutin pengujian | Pelaksanaan skenario uji pada Subbab 3.4.3 | A-3 |

### 3.5.4 Kebutuhan Berkelanjutan Pasca Serah Terima

| Kebutuhan | Volume | Alokasi | Keterangan |
| :--- | :--- | :--- | :--- |
| Pemeliharaan korektif | sekitar 4 insiden per bulan | 0,25 man-month per bulan | Perbaikan galat dan penyesuaian kecil |
| Pemeliharaan evolusioner | satu paket kecil per semester | 0,50 man-month per semester | Fitur baru berukuran kecil dan penyesuaian aturan periode |
| Pencadangan data | harian | otomatis | Skrip cadangan dengan rotasi 30 salinan |
| Pemeliharaan keamanan | triwulan | 0,10 man-month per triwulan | Pembaruan dependensi, audit kredensial, rotasi kata sandi |
| Sokongan pengguna | 2 jam per minggu | 0,20 man-month per bulan | Lewat helpdesk internal fakultas |
| **Total pemeliharaan** | | **sekitar 1,05 man-month per bulan** | |

Kebutuhan pemeliharaan ini berada di luar 3,00 man-month pengembangan dan wajib
dianggarkan dalam anggaran operasional tahun pertama.

```{=openxml}
<w:p><w:r><w:br w:type="page"/></w:r></w:p>
```

# 4. Kesimpulan

Proposal ini menghasilkan sebuah produk bernama Better Belt, aplikasi penugasan unit
kerja yang mengubah MPP, yaitu sebelas unit kerja dengan 186 jenis aktivitas berulang,
dari dokumen spreadsheet menjadi sistem kerja yang dapat diaudit.

Empat hal tercermin dari naskah ini.

**Pertama, masalahnya nyata dan terukur.** Data MPP menunjukkan bahwa unit kerja
menghadapi 186 jenis pekerjaan berulang dengan empat tingkat periodisitas, durasi,
dan kebutuhan tenaga yang berbeda. Ketika dicatat secara manual, informasi ini cepat
kehilangan konteks, dan yang tersisa hanyalah daftar tugas tanpa status.

**Kedua, solusinya dipilih secara disiplin, bukan secara sembarangan.** Empat alternatif dinilai
dengan bobot eksplisit. Aplikasi web kustom memperoleh 4,30, aplikasi enterprise
3,65, spreadsheet 3,15, dan low-code 2,95. Ketiga alternatif yang kalah dikalahkan
bukan pada fitur, melainkan pada biaya, waktu, dan kemandirian pengelolaan.

**Ketiga, teknik yang dipilih sesuai prinsip paling sederhana yang mampu.** Basis data
tertanam menggantikan server basis data terpisah. Pencatatan keterlambatan dijalankan
saat halaman dibuka menggantikan cron. Seluruh palet tema ditegakkan melalui variabel
CSS menggantikan percabangan pada setiap komponen. Rancangan ini menurunkan jumlah
kode yang harus dipelihara dan, yang lebih penting, menurunkan kemungkinan kegagalan,
karena setiap aturan hanya ditulis di satu tempat.

**Keempat, kualitas diverifikasi otomatis.** Tiga puluh pemeriksaan kalender,
pemeriksaan tipe tanpa galat, build produksi yang bersih, serta uji peramban otomatis
atas alur utama, termasuk penolakan `periodKey` dan `activityId` yang dipalsukan,
menjadi bukti bahwa aturan tenggat dan terlewat bekerja, bukan sekadar terlihat
bekerja.

Dengan 3,00 man-month pengembangan dan 27 machine-month pemakaian, produk ini dapat
direalisasikan pada jendela empat minggu, tanpa menambah biaya lisensi. Kebutuhan
pemeliharaan pasca serah terima, sekitar 1,05 man-month per bulan, adalah pos anggaran
yang tidak boleh dilewatkan. Sistem yang tidak dirawat akan kembali menjadi daftar
tugas yang tidak dipercaya, dan itulah sebab utama administrasi manual yang semula
berhasil akan kembali ke cara lama.

## Rencana Pengembangan Selanjutnya

| Prioritas | Rencana | Estimasi |
| :--- | :--- | :--- |
| 1 | Rekap keterlambatan per unit kerja dan per orang untuk laporan kepatuhan | 0,5 man-month |
| 2 | Ekspor rekap ke XLSX dan PDF sesuai format laporan unit | 0,4 man-month |
| 3 | Notifikasi surel pengingat sebelum tenggat | 0,3 man-month |
| 4 | PWA untuk pemasangan di ponsel | 0,4 man-month |
| 5 | Impor MPP.xlsx langsung ke katalog aktivitas | 0,3 man-month |
| 6 | Verifikasi dua faktor dan pembatasan alamat IP | 0,5 man-month |
| 7 | REST API untuk integrasi dengan sistem lain | 0,8 man-month |

# Lampiran

## Lampiran A, Daftar Perintah Pengembangan

| Perintah | Fungsi |
| :--- | :--- |
| `bun install` | Memasang dependensi proyek |
| `bun run dev` | Menjalankan peladen pengembangan di localhost pada port 4321 |
| `bun run check` | Pemeriksaan tipe seluruh proyek, harus tanpa galat |
| `bun run build` | Build produksi ke folder `dist` |
| `bun run src/scripts/check-tasks.ts` | Menjalankan 30 pemeriksaan kalender |
| `bun run src/scripts/seed.ts` | Memuat data contoh ke basis data pengembangan |

## Lampiran B, Glosarium Istilah

| Istilah | Pengertian |
| :--- | :--- |
| Kemunculan (*occurrence*) | Satu instantiation tugas berulang pada satu periode |
| *Period key* | Pengenal stabil satu kemunculan, misalnya `2026-W43` |
| Tenggat | Batas akhir penyelesaian satu periode |
| Terlewat | Kemunculan yang periodenya berakhir tanpa penyelesaian |
| Terlambat | Kemunculan yang diselesaikan setelah tenggatnya |
| Penugasan | Hubungan satu pengguna dengan satu jenis aktivitas |
| Unit kerja | Salah satu dari sebelas unit kerja fakultas |
| Aktivitas | Jenis pekerjaan berulang dari MPP |
