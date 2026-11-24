# C200 — Spesifikasi Produk "Umsura Assignment"

> Dokumen ini disusun mengikuti template **C200 Spesifikasi Produk, S1 Informatika**:
> Bab 1–5 dan Lampiran A–F, ditambah Lampiran G (log pengukuran) sebagai bukti angka.
> Setiap angka terukur ditandai `[UKUR]` dan berasal dari
> pengukuran aplikasi yang berjalan pada 11 November 2026 (lihat Lampiran G).
> Diagram dibuat dengan Mermaid, berkas sumber di `c200/diagram/*.mmd`, hasil render di
> `c200/diagram/img/`.

---

# LEMBAR PENGESAHAN / APPROVAL SHEET

## Data Pengusul / Proposers

| No | Nama | Jabatan | NIM | Tanggal | Tanda Tangan |
|:------------:|:---------------|:-------------|:-------------|:-------------|:-----------------|
| 1 | `[Nama Anggota 1]` | Anggota | `[NIM]` | `[tanggal]` | |
| 2 | `[Nama Anggota 2]` | Anggota | `[NIM]` | `[tanggal]` | |
| 3 | `[Nama Anggota 3]` | Anggota | `[NIM]` | `[tanggal]` | |

## Pengesahan / Approval

| Peran | Nama | NIP | Tanggal | Tanda Tangan |
|:---------------|:-------------|:-------------|:-------------|:-----------------|
| Pembimbing 1 (Utama) | `[Nama]` | `[NIP]` | | |
| Pembimbing 2 | `[Nama]` | `[NIP]` | | |
| Perwakilan Mitra | `[Nama]` | `[NIP/NIK]` | | |

## Riwayat Revisi / Revision History

| Versi | Tanggal | Oleh | Perbaikan |
|:------------:|:-------------|:-------------|:---------------------------------------------|
| 1.0 | 11 Nov 2026 | Tim | Draf lengkap Bab 1–5 dan Lampiran A–F; penambahan modul absensi |

| Field | Isi |
|:-------------|:-------------------------------------------|
| Topik Capstone | Sistem Informasi Manajemen Penugasan dan Kinerja Unit Kerja |
| Siklus / Tahun | `[Gasal/Genap]` / `[tahun]` |
| Judul Dokumen | Spesifikasi Produk Umsura Assignment |
| Judul Capstone | Rancang Bangun Umsura Assignment: Sistem Penugasan, Pelaporan Kinerja, Pengajuan Lembur, dan Absensi Berbasis Periode untuk Unit Kerja |
| Jenis Dokumen | **SPESIFIKASI** |
| Nomor Dokumen | `C200.[NoRev]TA[tahun].[1/2].[KodeKelompok]` |
| Nomor Revisi | `[NoRev]` |
| Nama File | `[KodeKelompok].pdf` |
| Tanggal Penerbitan | `[tanggal]` |
| Unit Penerbit | Program Studi S1 Informatika |
| Jumlah Halaman | `[jumlah]` (tidak termasuk sampul) |

---

# DAFTAR ISI / TABLE OF CONTENTS

- [BAB 1 PENDAHULUAN](#bab-1-pendahuluan)
  - [1.1 Ringkasan Isi Dokumen](#11-ringkasan-isi-dokumen)
  - [1.2 Aplikasi Dokumen](#12-aplikasi-dokumen)
  - [1.3 Referensi](#13-referensi)
  - [1.4 Daftar Singkatan](#14-daftar-singkatan)
- [BAB 2 SPESIFIKASI SISTEM DAN PENGGUNA](#bab-2-spesifikasi-sistem-dan-pengguna)
  - [2.1 Gambaran Sistem](#21-gambaran-sistem)
  - [2.2 Batasan Sistem](#22-batasan-sistem)
  - [2.3 Kebutuhan Fungsional](#23-kebutuhan-fungsional)
    - [2.3.1 Deskripsi Fitur Utama](#231-deskripsi-fitur-utama--main-feature-description)
    - [2.3.2 Alur Proses Utama](#232-alur-proses-utama--main-process-flow)
  - [2.4 Kebutuhan Data](#24-kebutuhan-data--data-requirements)
    - [2.4.1 Migrasi Data Awal](#241-migrasi-data-awal--initial-data-migration)
    - [2.4.2 ERD Konseptual](#242-erd-konseptual--conceptual-erd)
    - [2.4.3 Kamus Data](#243-kamus-data--data-dictionary)
  - [2.5 Kebutuhan Non-Fungsional](#25-kebutuhan-non-fungsional--non-functional-requirements)
    - [2.5.1 Kinerja](#251-kinerja--performance)
    - [2.5.2 Keamanan](#252-keamanan--security)
    - [2.5.3 Keandalan](#253-keandalan--reliability)
    - [2.5.4 Skalabilitas dan Karakteristik Lain](#254-skalabilitas-dan-karakteristik-lain--scalability-and-other-characteristics)
    - [2.5.5 Teknologi dalam Lingkungan Operasional](#255-teknologi-dalam-lingkungan-operasional--technology-in-the-operational-environment)
  - [2.6 Kebutuhan Arsitektur Sistem](#26-kebutuhan-arsitektur-sistem--system-architecture-requirements)
  - [2.7 Karakteristik Pengguna](#27-karakteristik-pengguna--user-characteristics-roles--permissions)
    - [2.7.1 Profil dan Tugas Pengguna](#271-profil-dan-tugas-pengguna--user-profiles-and-tasks)
    - [2.7.2 Matriks Hak Akses](#272-matriks-hak-akses--rolepermission-matrix)
    - [2.7.3 Persona](#273-persona--personas)
  - [2.8 Target Sistem](#28-target-sistem--system-targets)
- [BAB 3 KEBUTUHAN ANTARMUKA SISTEM](#bab-3-kebutuhan-antarmuka-sistem)
  - [3.1 Antarmuka Pengguna](#31-antarmuka-pengguna--user-interface)
  - [3.2 Antarmuka Perangkat Keras](#32-antarmuka-perangkat-keras--hardware-interface)
  - [3.3 Antarmuka Perangkat Lunak](#33-antarmuka-perangkat-lunak--software-interface)
  - [3.4 Antarmuka Komunikasi](#34-antarmuka-komunikasi--communication-interface)
  - [3.5 Integrasi dengan Sistem Lain](#35-integrasi-dengan-sistem-lain-opsional--integration-with-other-systems)
- [BAB 4 RENCANA VERIFIKASI](#bab-4-rencana-verifikasi)
  - [4.1 Rencana Verifikasi Spesifikasi](#41-rencana-verifikasi-spesifikasi--specification-verification-plan)
  - [4.2 Matriks Keterlacakan](#42-matriks-keterlacakan--traceability-matrix)
- [BAB 5 RENCANA PROYEK](#bab-5-rencana-proyek)
  - [5.1 Matriks RACI](#51-matriks-raci-lintas-lab--cross-lab-raci-matrix)
  - [5.2 Jadwal Pelaksanaan hingga C500](#52-jadwal-pelaksanaan-hingga-c500--schedule-up-to-c500)
  - [5.3 Estimasi Biaya](#53-estimasi-biaya--cost-estimate)
  - [5.4 Risiko dan Mitigasi](#54-risiko-dan-mitigasi--risks-and-mitigation)
- [LAMPIRAN / APPENDICES](#lampiran--appendices)
  - [Lampiran A. Notulen Elisitasi](#lampiran-a-notulen-elisitasi-dengan-mitra--partner-elicitation-minutes)
  - [Lampiran B. Dokumentasi Observasi](#lampiran-b-dokumentasi-observasi--observation-photos)
  - [Lampiran C. Kode Diagram](#lampiran-c-kode-diagram--diagram-source-code)
  - [Lampiran D. Learning Log Individu](#lampiran-d-learning-log-individu-cpmk072--individual-learning-log)
  - [Lampiran E. Logbook Kelompok](#lampiran-e-logbook-kelompok-cpmk111-cpmk112--team-logbook)
  - [Lampiran F. Daftar Periksa Pengumpulan](#lampiran-f-daftar-periksa-sebelum-pengumpulan--submission-checklist)
  - [Lampiran G. Log Pengukuran](#lampiran-g-log-pengukuran--measurement-log)

**Daftar Gambar**

| Nomor | Isi | Bagian |
|:-------------|:--------------------------------|:-------------|
| Gambar 2.1 | Diagram konteks Umsura Assignment | 2.1 |
| Gambar 2.2 | Use case diagram | 2.3.2.1 |
| Gambar 2.3 | Activity diagram menandai tugas selesai | 2.3.2.3 |
| Gambar 2.4 | Activity diagram memberikan instruksi | 2.3.2.3 |
| Gambar 2.5 | Activity diagram pengajuan dan keputusan lembur | 2.3.2.3 |
| Gambar 2.6 | Activity diagram absensi masuk/pulang | 2.3.2.3 |
| Gambar 2.7 | Activity diagram pemulihan kata sandi | 2.3.2.3 |
| Gambar 2.8 | ERD konseptual | 2.4.2 |
| Gambar 2.9 | Arsitektur logis berlapis | 2.6 |
| Gambar 2.10 | Sequence satu aksi penandaan selesai | 2.6 |
| Gambar 3.1 | User flow ruang kerja pegawai | 3.1.2 |
| Gambar 3.2 | User flow pengajuan lembur | 3.1.2 |
| Gambar 3.3 | User flow absensi | 3.1.2 |
| Gambar 3.4 | Wireframe low-fidelity ruang kerja pegawai | 3.1.3 |
| Gambar 3.5 | Wireframe low-fidelity dasbor admin | 3.1.3 |
| Gambar 3.6 | Wireframe low-fidelity absensi pegawai | 3.1.3 |

**Daftar Tabel**

| Nomor | Isi |
|:-------------|:--------------------------------|
| Tabel 2.1 | Daftar kebutuhan fungsional |
| Tabel 2.2 | Fitur di luar lingkup (Won't) |
| Tabel 2.3 | Deskripsi fitur F-01–F-02 (autentikasi) |
| Tabel 2.4 | Deskripsi fitur F-03–F-04 (master unit dan aktivitas) |
| Tabel 2.5 | Deskripsi fitur F-05–F-07 (pemulihan akun) |
| Tabel 2.6 | Deskripsi fitur F-08–F-10 (penugasan dari katalog) |
| Tabel 2.7 | Deskripsi fitur F-11, F-12, F-14 (instruksi langsung) |
| Tabel 2.8 | Deskripsi fitur F-13, F-15 (progres dan arsip) |
| Tabel 2.9 | Deskripsi fitur F-16, F-17, F-19, F-22 (ruang kerja) |
| Tabel 2.10 | Deskripsi fitur F-18 (catatan dan bukti) |
| Tabel 2.11 | Deskripsi fitur F-20–F-21 (riwayat dan dasbor) |
| Tabel 2.12 | Deskripsi fitur F-23–F-25 (pengajuan lembur) |
| Tabel 2.13 | Deskripsi fitur F-26–F-29 (keputusan dan setelan lembur) |
| Tabel 2.14 | Deskripsi fitur F-30–F-31 (akun dan jabatan) |
| Tabel 2.15 | Deskripsi fitur F-32–F-33 (pengumuman dan dasbor admin) |
| Tabel 2.16 | Deskripsi fitur F-34–F-35 (impor MPP) |
| Tabel 2.17 | Deskripsi fitur F-36–F-37 (absensi pegawai) |
| Tabel 2.18 | Deskripsi fitur F-38–F-40 (laporan absensi) |
| Tabel 2.19 | Pemetaan use case ke kebutuhan fungsional |
| Tabel 2.20–2.36 | Use case scenario UC-01…UC-17 |
| Tabel 2.37 | Kebutuhan data D-01–D-09 |
| Tabel 2.38 | Kamus data `activity_logs` |
| Tabel 2.39 | Kamus data `occurrence_notes` |
| Tabel 2.40 | Kamus data `overtime_requests` |
| Tabel 2.41 | Kamus data `attendance_logs` |
| Tabel 2.42 | Kebutuhan kinerja |
| Tabel 2.43 | Kebutuhan keamanan |
| Tabel 2.44 | Kebutuhan keandalan |
| Tabel 2.45 | Kebutuhan skalabilitas, interaksi, kompatibilitas, pemeliharaan |
| Tabel 2.46 | Interaksi antar komponen |
| Tabel 2.47 | Karakteristik pengguna |
| Tabel 2.48 | Matriks hak akses |
| Tabel 2.49 | Target sistem |
| Tabel 3.1 | Kebutuhan antarmuka pengguna |
| Tabel 3.2 | Antarmuka perangkat lunak |
| Tabel 3.3 | Antarmuka komunikasi |
| Tabel 4.1 | Rencana verifikasi |
| Tabel 4.2 | Matriks keterlacakan |
| Tabel 5.1 | Matriks RACI |
| Tabel 5.2 | Gantt chart sampai C500 |
| Tabel 5.3 | Rincian tugas mingguan |
| Tabel 5.4 | Estimasi biaya |
| Tabel 5.5 | Risiko dan mitigasi |

---

# BAB 1 PENDAHULUAN

## 1.1 Ringkasan Isi Dokumen

Dokumen ini menetapkan spesifikasi produk **"Umsura Assignment"**, sistem informasi yang
mendigitalkan proses penugasan, pelaporan penyelesaian pekerjaan, penelusuran bukti kinerja,
pengajuan lembur, dan pencatatan absensi pada satu unit kerja di lingkungan kampus. Sistem
menggantikan pengelolaan Matriks Rencana Kerja (MPP) yang berupa lembar kerja tersebar,
penugasan yang disampaikan lisan atau lewat aplikasi pesan, rekap kinerja yang dihitung manual,
serta klaim lembur yang tidak terikat pada pekerjaan tercatat.

Tujuan spesifik dokumen:

1. Menetapkan ruang lingkup dan batasan sistem secara eksplisit, sehingga fitur di luar lingkup
   tidak menimbulkan ekspektasi keliru pada mitra.
2. Merumuskan kebutuhan fungsional, non-fungsional, dan antarmuka secara terukur, agar setiap
   butir dapat diverifikasi pada C400 dan C500.
3. Memodelkan alur proses bisnis utama beserta alur negatifnya sebagai dasar perancangan C300.
4. Menetapkan karakteristik pengguna, hak akses tiap peran, dan target sistem yang menjadi
   ukuran keberhasilan.

Dokumen ini tidak membahas rancangan basis data fisik, pemilihan teknologi secara rinci, maupun
naskah pengujian; ketiganya dibahas pada C300 dan C500.

## 1.2 Aplikasi Dokumen

Dokumen ini berlaku sebagai *technical specification design* yang berfungsi untuk:

1. Menjelaskan proses bisnis yang diakomodasi sistem beserta ruang lingkupnya.
2. Menetapkan target efisiensi/efektivitas beserta metrik pengukurannya.
3. Menjadi dasar perancangan produk pada C300 dan dasar verifikasi hasil pada C400–C500.

Pembaca yang dituju: tim pengembang, dosen pembimbing, penguji, dan perwakilan unit kerja
(mitra).

## 1.3 Referensi

[1] International Organization for Standardization, *ISO/IEC 25010:2023 — Systems and software
Quality Requirements and Evaluation (SQuaRE) — Product quality model*, 2023.

[2] International Organization for Standardization, *ISO/IEC/IEEE 29148:2018 — Systems and
software engineering — Life cycle processes — Requirements engineering*, 2018.

[3] Republik Indonesia, *Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi*.
Jakarta: Sekretariat Negara, 2022.

[4] Republik Indonesia, *Peraturan Pemerintah Nomor 30 Tahun 2019 tentang Penilaian Kinerja
Pegawai Negeri Sipil*. Jakarta: Sekretariat Negara, 2019.

[5] K. T. Hermawan, I. G. Pusparani, and D. Solihudin, "Digital transformation of personnel
services in Cirebon City local government," *Jurnal Studi Kebijakan Publik*, vol. 2, no. 1,
pp. 13–26, 2023, doi: 10.21787/jskp.2.2023.13-26.

[6] A. C. F. Gae and A. Ardieansyah, "Implementasi aplikasi E-Kinerja untuk meningkatkan kinerja
ASN di Kecamatan Ende Timur," *Jurnal Abdi Masyarakat Indonesia*, vol. 5, no. 3, pp. 1081–1090,
2025, doi: 10.54082/jamsi.1895.

[7] S. Waldi, P. Andini, R. Ilahi, and Y. Hanoselina, "Pengaruh penggunaan sistem informasi
kepegawaian terhadap kualitas pelayanan administrasi di sektor publik," *Perspektif
Administrasi Publik dan Hukum*, vol. 1, no. 4, pp. 61–72, 2025.

[8] W3C, *Web Content Accessibility Guidelines (WCAG) 2.1*, W3C Recommendation, 2018.

[9] J. Brooke, "SUS: A quick and dirty usability scale," in *Usability Evaluation in Industry*,
London: Taylor & Francis, 1996.

## 1.4 Daftar Singkatan

| Akronim | Pengertian |
|:-------------|:--------------------------|
| AC | *Acceptance Criteria* |
| ASN | Aparatur Sipil Negara |
| BPMN | *Business Process Model and Notation* |
| CRUD | *Create, Read, Update, Delete* |
| CSV | *Comma/Character Separated Values* |
| ERD | *Entity Relationship Diagram* |
| HTTP | *Hypertext Transfer Protocol* |
| ISO | *International Organization for Standardization* |
| MPP | Matriks Rencana Kerja |
| NFR | *Non-Functional Requirement* |
| PDP | Pelindungan Data Pribadi |
| RACI | *Responsible, Accountable, Consulted, Informed* |
| RBAC | *Role-Based Access Control* |
| RPO | *Recovery Point Objective* |
| RTO | *Recovery Time Objective* |
| SKP | Sasaran Kinerja Pegawai |
| SSR | *Server-Side Rendering* |
| SUS | *System Usability Scale* |
| SVG | *Scalable Vector Graphics* |
| TLS | *Transport Layer Security* |
| UAT | *User Acceptance Test* |
| UU | Undang-Undang |
| WCAG | *Web Content Accessibility Guidelines* |
| WAL | *Write-Ahead Logging* |

---

# BAB 2 SPESIFIKASI SISTEM DAN PENGGUNA

## 2.1 Gambaran Sistem

Unit kerja di lingkungan kampus memiliki rencana kerja per periode: daftar kegiatan,
penanggung jawab, tenggat, dan perkiraan waktu penyelesaian. Rencana itu tersedia dalam bentuk
lembar kerja, tetapi **pelaksanaannya tidak tercatat**. Siapa mengerjakan apa, kapan selesai,
dan dengan bukti apa hanya tersimpan dalam ingatan dan percakapan. Akibatnya rekap capaian
disusun manual pada akhir periode, bukti pekerjaan sulit dipertanggungjawabkan, dan klaim lembur
tidak memiliki dasar.

Umsura Assignment menutup jarak itu dengan empat gagasan pokok:

1. **Periode adalah satuan kerja, bukan tanggal.** Setiap jenis aktivitas membawa satu periode
   baku — Harian, Mingguan, Bulanan, Triwulan, Semesteran, Tahunan, atau Kegiatan. Sistem
   menurunkan sendiri kemunculan (occurrence) yang jatuh tempo pada tiap periode, sehingga satu
   definisi aktivitas berlaku berulang tanpa disalin.
2. **Setiap kemunculan punya jejak.** Satu baris status (`selesai` atau `terlewat`) dan satu
   catatan berisi tautan bukti, terpisah dari status agar catatan tetap ada ketika penyelesaian
   dibatalkan.
3. **Penugasan punya pemberi.** Tugas dari katalog maupun instruksi langsung mencatat siapa yang
   memberikannya, dan pemberi melihat progres per periode tanpa harus bertanya.
4. **Klaim lembur dan kehadiran punya dasar.** Lembur hanya dapat diajukan bila menit pekerjaan
   yang tercatat hari itu mencapai ambang; absensi mencatat masuk/pulang beserta jarak ke titik
   kantor yang ditetapkan.

Sistem dijalankan sebagai satu aplikasi web yang dirender di server. Pengguna membuka peramban,
masuk dengan surel dan kata sandi, lalu diarahkan ke ruang kerja sesuai perannya: admin
mengelola katalog dan keputusan, level 1 (atasan langsung) memberi instruksi dan memantau, level
2 (pelaksana) menyelesaikan tugas. Seluruh data berada pada satu berkas basis data di server unit
kerja, tanpa ketergantungan layanan awan berbayar.

**Gambar 2.1 Diagram Konteks Umsura Assignment**

![Diagram konteks](./c200/diagram/img/konteks.png)

Narasi: tiga aktor manusia memakai sistem melalui peramban — admin, atasan langsung (level 1),
dan pelaksana (level 2). Mitra unit kerja tidak memakai sistem secara langsung; ia memasok
kebutuhan, aturan bisnis, dan validasi prototipe kepada admin. Satu berkas MPP diimpor sekali
pada tahap penyiapan. Sistem menyimpan seluruh data pada satu berkas SQLite dan dilayani melalui
proksi balik ber-TLS.

## 2.2 Batasan Sistem

Batasan berikut mengikat dan disengaja, bukan kekurangan yang belum disadari.

1. **Penyelesaian tugas tidak melalui persetujuan atasan.** Tugas selesai saat pelaksana
   menandainya. Tidak ada verifikasi bukti berlapis; alur persetujuan menambah beban administrasi
   pada volume tugas harian yang tinggi.
2. **Lembur hanya untuk hari berjalan.** Formulir menerima tanggal hari ini dan tidak menerima
   rentang lintas tengah malam. Pekerjaan yang selesai sebelum tengah malam dan diajukan setelah
   pukul 00.00 masuk ke basis hari sebelumnya dan ditolak.
3. **Persetujuan lembur satu tingkat.** Hanya admin yang memutuskan; tidak ada persetujuan
   berjenjang. Modul ini tidak memodelkan hierarki organisasi.
4. **Tidak ada hierarki atasan–bawahan.** Sistem membedakan tiga peran, tetapi tidak menyimpan
   relasi struktural. Konsekuensi yang diterima: seorang level 1 dapat memberi instruksi kepada
   level 1 lain.
5. **Pemulihan kata sandi tanpa token dan tanpa surel.** Halaman "Lupa kata sandi" hanya mencatat
   permintaan; admin mengeksekusi reset menjadi kata sandi awal yang seragam. Tidak ada tautan
   sekali pakai maupun verifikasi kepemilikan surel.
6. **Notifikasi bersifat tarik.** Tidak ada surel, SMS, atau *push notification*. Notifikasi
   tampil sebagai lonceng di kepala halaman dan baru terlihat saat pengguna membuka aplikasi.
7. **Satu berkas basis data dengan satu penulis.** Skalabilitas bersifat vertikal; menjalankan
   dua instans aplikasi terhadap berkas yang sama tidak didukung.
8. **Absensi hanya satu titik kantor.** Tabel lokasi adalah singleton; tidak ada multi-lokasi,
   penugasan lokasi per pegawai, shift, selfie, atau kode QR.
9. **Tidak ada persentase kehadiran.** Sistem tidak memiliki kalender hari kerja, hari libur, atau
   data cuti, sehingga penyebut persentase akan dikarang. Laporan menampilkan jumlah hari
   terhitung.
10. **Belum ada rekap atau ekspor lembur**, dan belum ada penanda khusus untuk pekerjaan terlambat
    di luar status `terlewat` pada ruang kerja.
11. **Sistem tidak menangani unggahan berkas.** Bukti pekerjaan berupa **tautan** ke berkas yang
    disimpan di luar sistem.
12. **Antarmuka hanya Bahasa Indonesia** dan menuntut JavaScript aktif pada area administratif.

## 2.3 Kebutuhan Fungsional

Tabel kebutuhan fungsional memakai prioritas MoSCoW. Kode masalah merujuk pada C100: **P1**
penugasan tidak tercatat, **P2** bukti tersebar dan tidak melekat pada periode, **P3** rekap
manual dan tidak dapat dibandingkan, **P4** lembur tanpa dasar pekerjaan tercatat, **P5**
pemulihan akun bergantung pada satu orang, **P6** kehadiran tidak tercatat sehingga tidak dapat
dipertanggungjawabkan.

**Tabel 2.1 Daftar Kebutuhan Fungsional**

| Kode | Kebutuhan Fungsional | Aktor | Prioritas | Masalah |
|:-------------|:---------------------------------------------|:-------------|:------------:|:------------:|
| F-01 | Sistem mengautentikasi pengguna dengan surel dan kata sandi, serta mencatat waktu, alamat IP, dan peramban setiap login | Semua | Must | P1, P5 |
| F-02 | Sistem mengarahkan pengguna ke ruang kerja sesuai perannya setelah login | Semua | Must | P1 |
| F-03 | Admin menampilkan, menambah, mengubah, dan menghapus unit kerja beserta ikon dan urutannya | Admin | Must | P1 |
| F-04 | Admin mengelola jenis aktivitas per unit kerja: nama, tanggal mulai, tenggat, durasi, periode, klasifikasi, frekuensi, SDM, dan volume | Admin | Must | P1, P3 |
| F-05 | Pengguna mengajukan permintaan reset kata sandi dari halaman login tanpa mengungkap keberadaan akun | Semua | Must | P5 |
| F-06 | Admin memproses antrean reset: mengeksekusi reset atau menolak permintaan | Admin | Must | P5 |
| F-07 | Sistem menampilkan indikator jumlah permintaan reset menunggu pada seluruh halaman admin | Admin | Must | P5 |
| F-08 | Admin memberikan aktivitas dari katalog kepada satu pengguna | Admin | Must | P1 |
| F-09 | Admin memberikan banyak aktivitas kepada banyak pengguna sekaligus, pasangan yang sudah ada dilewati | Admin | Should | P1 |
| F-10 | Sistem menampilkan jumlah penugasan yang belum dibaca penerimanya | Level 1, 2 | Must | P1 |
| F-11 | Admin dan level 1 memberi instruksi langsung kepada pengguna non-admin, beserta tenggat, durasi, periode, dan daftar penerima | Admin, Level 1 | Must | P1 |
| F-12 | Sistem mencatat pemberi tugas dan menampilkannya pada sisi penerima | Semua | Must | P1 |
| F-13 | Sistem menampilkan progres tiap penugasan yang diberikan per periode: selesai, terlewat, berjalan, atau belum mulai | Admin, Level 1 | Must | P1, P3 |
| F-14 | Pemberi tugas mencabut instruksi yang ia berikan sendiri | Admin, Level 1 | Must | P1 |
| F-15 | Admin mengarsipkan penugasan tanpa menghapus riwayat, memulihkan, atau menghapus permanen | Admin | Should | P1 |
| F-16 | Sistem menampilkan daftar tugas pengguna untuk periode berjalan, dikelompokkan dan diurutkan menurut keterlambatan | Level 1, 2 | Must | P1 |
| F-17 | Pengguna menandai kemunculan tugas selesai dan membatalkannya | Level 1, 2 | Must | P1 |
| F-18 | Pengguna menyimpan catatan dan tautan bukti per kemunculan, terpisah dari status penyelesaian | Level 1, 2 | Must | P2 |
| F-19 | Sistem mencatat periode terlewat otomatis ketika tenggat terlampaui tanpa penyelesaian | Sistem | Must | P1, P3 |
| F-20 | Pengguna melihat riwayat penyelesaian dan periode terlewat lintas periode | Level 1, 2 | Must | P2, P3 |
| F-21 | Sistem menampilkan peta kontribusi tahunan dan tren penyelesaian 14 hari terakhir | Level 1, 2 | Should | P3 |
| F-22 | Sistem menampilkan beban hari ini: jumlah tugas terbuka dan estimasi sisa menit | Level 1, 2 | Must | P1 |
| F-23 | Sistem menolak pengajuan lembur bila total menit tugas selesai hari itu belum mencapai ambang | Level 1, 2 | Must | P4 |
| F-24 | Pengguna mengajukan lembur hari berjalan dengan jam mulai, jam selesai, dan keterangan, maksimal satu pengajuan menunggu per tanggal | Level 1, 2 | Must | P4 |
| F-25 | Pengguna membatalkan pengajuan lembur miliknya yang masih menunggu | Level 1, 2 | Should | P4 |
| F-26 | Admin menyetujui atau menolak pengajuan lembur disertai catatan | Admin | Must | P4 |
| F-27 | Sistem menolak otomatis pengajuan yang tidak diputuskan dalam batas waktu diam | Sistem | Must | P4 |
| F-28 | Admin mengubah ambang menit dan batas waktu diam lembur | Admin | Must | P4 |
| F-29 | Sistem memberi tahu pemohon atas keputusan lembur melalui lonceng notifikasi | Level 1, 2 | Must | P4 |
| F-30 | Admin mengelola akun pengguna: menambah, mengubah, menghapus, dan menetapkan jabatan | Admin | Must | P1, P5 |
| F-31 | Admin mengelola daftar Posisi/Jabatan yang menjadi pilihan formulir pengguna | Admin | Should | P1 |
| F-32 | Admin mengelola postingan pengumuman | Admin | Should | P1 |
| F-33 | Sistem menampilkan ringkasan admin: pekerjaan yang perlu perhatian, cakupan penugasan per unit, tren login tujuh hari, dan log terbaru | Admin | Must | P3 |
| F-34 | Sistem menyediakan impor Matriks Rencana Kerja dari lembar kerja secara idempoten | Admin | Could | P1 |
| F-35 | Sistem menampilkan ringkasan aktivitas pengguna pada tabel pengguna | Admin | Could | P3 |
| F-36 | Pengguna mencatat absensi masuk dan pulang dari dalam radius titik kantor, dengan koordinat, akurasi, dan jarak dihitung server | Level 1, 2 | Must | P6 |
| F-37 | Sistem menolak absensi di luar radius, dengan akurasi rendah, atau pulang tanpa masuk pada hari yang sama | Level 1, 2 | Must | P6 |
| F-38 | Admin menetapkan satu titik kantor beserta radius 10–300 m pada peta | Admin | Must | P6 |
| F-39 | Admin melihat laporan absensi harian, bulanan, dan tahunan, dengan filter nama, surel, atau jabatan, serta daftar belum absen | Admin | Must | P6 |
| F-40 | Admin mengekspor laporan absensi yang sedang ditampilkan ke CSV | Admin | Should | P6 |

**Tabel 2.2 Fitur di Luar Lingkup (Won't)**

| Fitur | Alasan | Dampak bila ditunda |
|:---------------------------|:------------------------------------------|:---------------------------------------------|
| Persetujuan penyelesaian tugas oleh atasan | Menambah beban administrasi pada volume tugas harian | Status "selesai" adalah klaim pelaksana, bukan hasil verifikasi |
| Persetujuan lembur berjenjang | Belum ada data struktur organisasi | Semua keputusan lembur berada pada admin |
| Rekap dan ekspor lembur | Belum diminta mitra; volume pengajuan masih kecil | Rekap disusun manual dari antrean |
| Notifikasi dorong (surel/WA) | Menambah layanan eksternal dan biaya | Pengguna harus membuka aplikasi untuk melihat notifikasi |
| Unggah berkas bukti | Butuh penyimpanan objek dan pemindaian berkas | Bukti berupa tautan ke penyimpanan di luar sistem |
| Multi-kantor dan absensi per lokasi | Satu unit kerja, satu kantor | Bila unit pindah, titik dan radius diperbarui manual |
| Absensi dengan selfie/QR dan jam kerja | Tidak diminta; menambah perangkat dan aturan baru | Kehadiran tercatat tanpa bukti visual |
| Persentase kehadiran | Tidak ada kalender hari kerja dan data cuti | Laporan menampilkan jumlah hari, bukan persentase |
| SSO kampus | Bergantung kebijakan pengelola TI kampus | Akun lokal dikelola admin |
| Integrasi SKP/kepegawaian | Di luar lingkup C200; arah pengembangan | Capaian belum otomatis masuk ke sistem instansi |

### 2.3.1 Deskripsi Fitur Utama / Main Feature Description

Sistem memiliki enam belas kelompok fitur utama. Setiap kelompok diturunkan dari kebutuhan pada Tabel 2.1,
dan setiap acceptance criteria akan menjadi skenario uji pada C500.

**Tabel 2.3 Fitur Autentikasi dan Pengarahan Peran (F-01, F-02)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Pengguna memasukkan surel dan kata sandi pada halaman masuk. Sistem memverifikasi hash kata sandi, mencatat waktu, alamat IP, dan peramban, lalu mengarahkan ke ruang kerja sesuai peran: admin ke dasbor admin, level 1 dan 2 ke ruang kerja tugas. |
| Manfaat | Semua peran. Menutup P1 dan P5: hanya pemilik akun yang dapat mengubah catatan kinerja, dan setiap akses meninggalkan jejak. |
| User Story | Sebagai pegawai, saya ingin masuk dengan akun saya sendiri, agar catatan kinerja yang saya lihat dan ubah benar-benar milik saya. |
| User Story (EN) | As an employee, I want to sign in with my own account, so that the performance records I see and change are genuinely mine. |
| AC positif | **Skenario: masuk dengan kredensial benar.** Diberikan akun level 2 terdaftar dan aktif. Ketika pengguna memasukkan surel dan kata sandi yang benar. Maka sistem menampilkan ruang kerja tugas, dan satu baris `login_logs` tercatat berisi IP dan peramban. |
| AC negatif | **Skenario: kata sandi salah.** Diberikan akun terdaftar. Ketika pengguna memasukkan kata sandi yang salah. Maka sistem menolak, menampilkan pesan "Surel atau kata sandi salah", dan tidak membuat sesi. |

**Tabel 2.4 Fitur Master Unit Kerja dan Jenis Aktivitas (F-03, F-04)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin mengelola daftar unit kerja (kategori) dan jenis aktivitas di dalamnya. Satu jenis aktivitas membawa nama, rentang tanggal berlaku, periode, klasifikasi (utama/periodik/bukan tupoksi), frekuensi per tahun, durasi menit, jumlah SDM, dan volume kerja. |
| Manfaat | Admin dan seluruh pegawai. Menutup P1 dan P3: satu kosakata periode baku untuk semua unit, sehingga capaian antarbagian dapat dibandingkan. |
| User Story | Sebagai admin, saya ingin mendefinisikan jenis aktivitas beserta periodenya sekali saja, agar sistem dapat menurunkan kemunculan berulang tanpa saya salin tiap periode. |
| User Story (EN) | As an administrator, I want to define an activity type and its period once, so that the system derives its recurring occurrences without me copying them every period. |
| AC positif | **Skenario: menambah aktivitas bulanan.** Diberikan admin telah masuk. Ketika admin menyimpan aktivitas dengan periode Bulanan, durasi 60 menit, dan tanggal mulai 5 Januari 2026. Maka aktivitas tersimpan pada unit tersebut dan muncul sebagai kemunculan bertenggat tanggal 5 setiap bulan. |
| AC negatif | **Skenario: tenggat lebih awal dari tanggal mulai.** Diberikan formulir aktivitas terbuka. Ketika admin mengisi tanggal selesai 1 Januari 2026 dan tanggal mulai 5 Januari 2026, lalu menyimpan. Maka sistem menolak dan menampilkan pesan bahwa tanggal selesai tidak boleh mendahului tanggal mulai. |

**Tabel 2.5 Fitur Pemulihan Akun (F-05, F-06, F-07)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Pengguna yang lupa kata sandi mengirim permintaan dari halaman masuk. Permintaan masuk antrean admin; admin mengganti kata sandi menjadi sandi awal seragam atau menolak permintaan. Jumlah permintaan menunggu tampil sebagai lencana di seluruh halaman admin. |
| Manfaat | Semua peran dan admin. Menutup P5: pemulihan tidak lagi bergantung pada ingatan satu orang, dan tidak dapat dipakai menebak akun mana yang terdaftar. |
| User Story | Sebagai pegawai, saya ingin mengajukan reset kata sandi tanpa harus menghubungi satu orang tertentu, agar saya dapat kembali bekerja tanpa menunggu. |
| User Story (EN) | As an employee, I want to request a password reset without chasing one specific person, so that I can get back to work without waiting. |
| AC positif | **Skenario: admin mengeksekusi reset.** Diberikan satu permintaan berstatus menunggu. Ketika admin menekan "Reset" pada antrean. Maka permintaan berstatus `reset`, kolom `handled_by` dan `handled_at` terisi, dan kata sandi akun menjadi sandi awal seragam. |
| AC negatif | **Skenario: permintaan kedua untuk akun yang sama.** Diberikan akun sudah memiliki satu permintaan menunggu. Ketika pengguna mengirim permintaan lagi. Maka sistem tidak menambah baris baru dan tetap menampilkan layar hasil yang sama. |

**Tabel 2.6 Fitur Penugasan dari Katalog (F-08, F-09, F-10)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin memberikan jenis aktivitas dari katalog kepada satu atau banyak pengguna sekaligus. Pasangan pengguna–aktivitas yang sudah ada dilewati, sehingga pengiriman ulang tidak menggandakan baris. Penerima melihat lencana jumlah penugasan yang belum dibaca. |
| Manfaat | Admin, level 1, dan level 2. Menutup P1: penugasan berpindah dari lisan ke catatan, dan penerima tahu ada pekerjaan masuk tanpa ditanya. |
| User Story | Sebagai admin, saya ingin memberikan banyak aktivitas kepada banyak pegawai dalam satu langkah, agar penyiapan awal satu unit kerja selesai dalam satu sesi. |
| User Story (EN) | As an administrator, I want to assign many activities to many employees in one step, so that onboarding a work unit finishes in a single session. |
| AC positif | **Skenario: penugasan massal.** Diberikan 3 aktivitas dan 4 pegawai dipilih. Ketika admin mengirim. Maka terbentuk maksimal 12 pasangan penugasan, dan pasangan yang sudah ada sebelumnya tidak bertambah. |
| AC negatif | **Skenario: kirim ulang tanpa pilihan baru.** Diberikan seluruh pasangan sudah ada. Ketika admin mengirim ulang formulir yang sama. Maka sistem melaporkan tidak ada penugasan baru dan jumlah baris tidak berubah. |

**Tabel 2.7 Fitur Instruksi Langsung (F-11, F-12, F-14)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin atau level 1 membuat aktivitas baru di unit sistem "Instruksi" dan memberikannya kepada pengguna non-admin, beserta tanggal mulai, tenggat, durasi, periode, klasifikasi, frekuensi, dan daftar penerima. Pemberi tercatat dan tampil pada sisi penerima sebagai baris "Dari". Pemberi dapat mencabut instruksi miliknya sendiri. |
| Manfaat | Admin, level 1, dan level 2. Menutup P1: pekerjaan yang diberikan di luar katalog tetap tercatat, lengkap dengan siapa yang meminta. |
| User Story | Sebagai atasan langsung, saya ingin memberi tugas tambahan kepada staf beserta tenggatnya, agar pekerjaan mendadak tidak hilang dalam percakapan. |
| User Story (EN) | As a supervisor, I want to hand a staff member an ad-hoc task with a deadline, so that urgent work does not vanish into a chat thread. |
| AC positif | **Skenario: instruksi kepada dua penerima.** Diberikan level 1 telah masuk. Ketika ia menyimpan instruksi "Rekap dokumen akreditasi" bertenggat 20 November 2026 untuk dua staf level 2. Maka dua penugasan tersimpan dengan `created_by` berisi id level 1 tersebut, dan kedua penerima melihat baris "Dari" namanya. |
| AC negatif | **Skenario: penerima hanya admin.** Diberikan dialog instruksi terbuka. Ketika satu-satunya penerima yang dipilih berperan admin, lalu disimpan. Maka sistem menolak setelah penyaringan server dan menampilkan pesan bahwa penerima harus pengguna non-admin. |

**Tabel 2.8 Fitur Progres dan Arsip Penugasan (F-13, F-15)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Pemberi tugas melihat setiap penugasan yang ia berikan sebagai kartu berisi status per periode: selesai, terlewat, berjalan, atau belum mulai, beserta strip dua belas periode terakhir. Admin dapat mengarsipkan penugasan (menyembunyikan tanpa menghapus), memulihkannya, atau menghapus permanen dari tab arsip. |
| Manfaat | Admin dan level 1. Menutup P1 dan P3: progres dapat diperiksa tanpa bertanya, dan penugasan yang keliru dapat dibersihkan tanpa menghapus riwayat yang sah. |
| User Story | Sebagai atasan langsung, saya ingin melihat periode mana yang sudah dan belum dikerjakan, agar saya dapat menegur berdasarkan catatan, bukan dugaan. |
| User Story (EN) | As a supervisor, I want to see which periods are done and which are not, so that I can follow up on evidence rather than guesswork. |
| AC positif | **Skenario: periode lewat terlihat terlambat.** Diberikan penugasan harian dibuat 10 hari lalu dengan dua periode tanpa log. Ketika pemberi membuka panel progres. Maka kartu berstatus "Terlambat", dua simpul terlewat tampil merah, dan kartu berada di urutan teratas. |
| AC negatif | **Skenario: mencabut instruksi milik orang lain.** Diberikan instruksi dibuat oleh level 1 lain. Ketika pengguna mencoba mencabutnya. Maka sistem menolak dan menampilkan pesan bahwa instruksi tersebut bukan miliknya, dan baris tidak terhapus. |

**Tabel 2.9 Fitur Ruang Kerja Periodik (F-16, F-17, F-19, F-22)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Ruang kerja menampilkan kemunculan tugas periode berjalan, dikelompokkan menurut tenggat dan diurutkan menurut keterlambatan. Pegawai menandai satu kemunculan selesai atau membatalkannya. Sistem mencatat periode yang lewat tanpa penyelesaian sebagai `terlewat` pada tanggal jatuh temponya. Strip atas menampilkan jumlah tugas terbuka dan estimasi sisa menit hari ini. |
| Manfaat | Level 1 dan 2. Menutup P1 dan P3: satu tempat yang menjawab "apa yang harus saya kerjakan sekarang", dan keterlambatan tercatat tanpa perlu diingat. |
| User Story | Sebagai pelaksana, saya ingin melihat tugas periode ini dan menandainya selesai di tempat, agar saya tidak perlu menyusun laporan terpisah di akhir bulan. |
| User Story (EN) | As a staff member, I want to see this period's tasks and tick them off in place, so that I do not have to compile a separate report at month end. |
| AC positif | **Skenario: menandai selesai.** Diberikan satu kemunculan bulanan periode berjalan belum selesai. Ketika pegawai menekan tombol selesai. Maka kartu berubah menjadi selesai tanpa memuat ulang halaman, satu baris `activity_logs` berstatus `selesai` tertulis, dan ringkasan hari ini serta peta kontribusi ikut diperbarui. |
| AC negatif | **Skenario: periode sudah lewat.** Diberikan kemunculan periode Oktober 2026 dan sekarang November 2026. Ketika pegawai menekan tombol selesai pada kemunculan itu. Maka sistem menolak dengan pesan bahwa kemunculan tidak ada, dan tidak ada baris log baru. |

**Tabel 2.10 Fitur Catatan dan Bukti Pekerjaan (F-18)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Pada setiap kemunculan, pegawai dapat menyimpan keterangan dan satu tautan bukti. Catatan berdiri sendiri dari status: ia tetap ada ketika penyelesaian dibatalkan, dan dapat ditulis sebelum tugas selesai. Tautan divalidasi di peramban dan di server, hanya menerima URL absolut berskema http atau https. |
| Manfaat | Level 1 dan 2, serta pemberi tugas. Menutup P2: bukti melekat pada periode kerja, bukan pada folder atau grup pesan. |
| User Story | Sebagai pelaksana, saya ingin menempelkan tautan bukti pada periode tertentu, agar ketika ditanya saya dapat menunjukkan dokumennya tanpa mencari. |
| User Story (EN) | As a staff member, I want to attach an evidence link to a specific period, so that when asked I can show the document without searching. |
| AC positif | **Skenario: menyimpan catatan dan tautan.** Diberikan kemunculan periode November 2026. Ketika pegawai menyimpan catatan "Berita acara rapat" dengan tautan `https://contoh.go.id/ba-11.pdf`. Maka catatan tersimpan pada kunci pengguna–aktivitas–periode dan tampil pada kartu. |
| AC negatif | **Skenario: tautan bukan http/https.** Diberikan dialog catatan terbuka. Ketika pegawai mengisi tautan `javascript:alert(1)`. Maka sistem menolak menyimpan dan menampilkan pesan bahwa tautan harus diawali http atau https. |

**Tabel 2.11 Fitur Riwayat dan Dasbor Kinerja (F-20, F-21)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Halaman riwayat menampilkan penyelesaian dan periode terlewat lintas periode, dapat difilter menurut tahun. Halaman ruang kerja menampilkan peta kontribusi tahunan bergaya kalender (satu sel per hari, hijau menurut jumlah selesai, cincin merah untuk periode terlewat) dan tren penyelesaian empat belas hari terakhir. |
| Manfaat | Level 1 dan 2. Menutup P2 dan P3: riwayat dan capaian dapat ditunjukkan sendiri tanpa rekap manual. |
| User Story | Sebagai pelaksana, saya ingin melihat capaian saya sepanjang tahun dalam satu tampilan, agar saya dapat menyiapkan bahan penilaian kinerja tanpa menghitung ulang. |
| User Story (EN) | As a staff member, I want to see my year of completions at a glance, so that I can prepare performance material without recounting. |
| AC positif | **Skenario: peta kontribusi mengikuti penyelesaian.** Diberikan dua tugas selesai pada hari yang sama. Ketika pegawai membuka ruang kerja. Maka sel tanggal tersebut berwarna sesuai tingkat kepadatan, dan keterangan sel menyebut jumlah selesai serta jumlah terlewat. |
| AC negatif | **Skenario: tahun tanpa data.** Diberikan pegawai baru tanpa log apa pun. Ketika ia membuka riwayat. Maka halaman tetap tampil dengan keadaan kosong yang menjelaskan belum ada penyelesaian, bukan galat. |

**Tabel 2.12 Fitur Pengajuan Lembur (F-23, F-24, F-25)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Formulir lembur hanya terbuka bila total menit tugas yang selesai hari itu mencapai ambang (bawaan 60 menit). Pengajuan menerima tanggal hari ini, jam mulai, jam selesai, dan keterangan; maksimal satu pengajuan menunggu per tanggal. Pemohon dapat membatalkan pengajuan yang masih menunggu. |
| Manfaat | Level 1 dan 2. Menutup P4: klaim lembur terikat pada pekerjaan yang tercatat hari itu, bukan pada perkiraan. |
| User Story | Sebagai pelaksana, saya ingin mengajukan lembur setelah pekerjaan saya tercatat selesai, agar pengajuan saya punya dasar yang dapat diperiksa. |
| User Story (EN) | As a staff member, I want to file overtime once my completed work is on record, so that my claim rests on checkable evidence. |
| AC positif | **Skenario: pengajuan setelah ambang tercapai.** Diberikan pegawai menyelesaikan tugas bernilai total 75 menit hari ini. Ketika ia mengajukan lembur 16.30–18.00 dengan keterangan. Maka satu baris `overtime_requests` berstatus `pending` tersimpan dan formulir terkunci untuk tanggal tersebut. |
| AC negatif | **Skenario: menit belum mencapai ambang.** Diberikan total menit selesai hari itu 30 menit dan ambang 60 menit. Ketika pegawai mengirim pengajuan langsung ke aksi server. Maka sistem menolak dengan pesan bahwa menit kerja tercatat belum mencapai ambang, dan tidak ada baris tersimpan. |

**Tabel 2.13 Fitur Keputusan dan Setelan Lembur (F-26, F-27, F-28, F-29)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin melihat antrean pengajuan menunggu dan memutuskan setuju atau tolak disertai catatan. Pengajuan yang tidak diputuskan dalam batas waktu diam (bawaan 180 menit) ditolak otomatis dengan waktu keputusan dihitung dari waktu pengajuan. Admin mengubah ambang menit dan batas waktu diam pada satu halaman setelan. Keputusan diumumkan ke pemohon melalui lonceng notifikasi. |
| Manfaat | Admin dan pemohon. Menutup P4: keputusan punya jejak, dan pengajuan tidak menggantung tanpa batas. |
| User Story | Sebagai admin, saya ingin memutuskan lembur dengan alasan tertulis, agar keputusan dapat dipertanggungjawabkan dan pemohon tahu dasarnya. |
| User Story (EN) | As an administrator, I want to decide overtime with a written reason, so that the decision is defensible and the requester knows why. |
| AC positif | **Skenario: menolak dengan alasan.** Diberikan satu pengajuan menunggu. Ketika admin menolak dengan catatan "Pekerjaan belum diverifikasi". Maka status menjadi `ditolak`, catatan tersimpan, dan pemohon menerima notifikasi lonceng. |
| AC negatif | **Skenario: keputusan kedua atas baris yang sudah diputuskan.** Diberikan pengajuan sudah berstatus disetujui. Ketika formulir lama dikirim ulang. Maka sistem menolak karena hanya baris berstatus menunggu yang dapat diputuskan, dan status tidak berubah. |

**Tabel 2.14 Fitur Pengelolaan Akun dan Jabatan (F-30, F-31)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin menambah akun (nama, surel, peran, jabatan), mengubah, dan menghapusnya. Penghapusan memberi jendela batal lima detik. Daftar Posisi/Jabatan dikelola terpisah dan menjadi pilihan pada formulir akun; nilai jabatan disimpan sebagai teks pada baris pengguna, bukan kunci asing. |
| Manfaat | Admin. Menutup P1 dan P5: data pegawai dapat dipelihara tanpa campur tangan pengembang. |
| User Story | Sebagai admin, saya ingin menambah dan memperbarui akun pegawai beserta jabatannya, agar personel baru dapat memakai sistem pada hari yang sama. |
| User Story (EN) | As an administrator, I want to add and update employee accounts with their position, so that new staff can use the system the same day. |
| AC positif | **Skenario: akun baru langsung dapat dipakai.** Diberikan admin mengisi nama, surel baru, peran 2, dan jabatan "Staf". Ketika disimpan. Maka akun terbentuk dengan kata sandi awal seragam dan dapat masuk tanpa langkah tambahan. |
| AC negatif | **Skenario: surel sudah dipakai.** Diberikan surel `dosen1@assignment.id` sudah terdaftar. Ketika admin menyimpan akun baru dengan surel yang sama. Maka sistem menolak dan menampilkan pesan bahwa surel sudah digunakan. |

**Tabel 2.15 Fitur Pengumuman dan Dasbor Admin (F-32, F-33)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin menulis, mengubah, dan menghapus pengumuman berformat markdown. Dasbor admin membuka dengan strip "Perlu perhatian", lalu kartu cakupan penugasan per unit, grafik login tujuh hari, serta log masuk dan pengumuman terbaru. |
| Manfaat | Admin dan seluruh pegawai. Menutup P3: satu layar menjawab bagian mana yang belum tercakup, tanpa menyusun rekap. |
| User Story | Sebagai admin, saya ingin melihat unit mana yang cakupan penugasannya rendah, agar saya dapat memperbaiki penyiapan sebelum pekerjaan menumpuk. |
| User Story (EN) | As an administrator, I want to see which unit has thin assignment coverage, so that I can fix onboarding before work piles up. |
| AC positif | **Skenario: cakupan per unit.** Diberikan 3 unit dengan jumlah pegawai dan penugasan berbeda. Ketika admin membuka dasbor. Maka setiap unit menampilkan jumlah pegawai, jumlah penugasan aktif, dan meter cakupannya, dan unit sistem "Instruksi" tidak dihitung. |
| AC negatif | **Skenario: pengumuman tanpa judul.** Diberikan formulir pengumuman. Ketika admin menyimpan dengan judul kosong. Maka sistem menolak dan menampilkan pesan bahwa judul wajib diisi. |

**Tabel 2.16 Fitur Impor Matriks Rencana Kerja (F-34, F-35)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Skrip impor membaca berkas MPP hasil ekstraksi (11 unit, 206 baris), memvalidasi setiap baris dengan aturan yang sama seperti formulir admin, lalu menuliskannya dalam satu transaksi. Impor bersifat idempoten: unit dan nama yang sama diperbarui, bukan digandakan. |
| Manfaat | Admin. Menutup P1: katalog awal terisi tanpa mengetik ulang ratusan baris. |
| User Story | Sebagai admin, saya ingin memuat rencana kerja dari lembar kerja yang sudah ada, agar saya tidak mengetik ulang 206 baris dan tidak salah menyalin periode. |
| User Story (EN) | As an administrator, I want to load the work plan from the existing spreadsheet, so that I neither retype 206 rows nor mistype a period. |
| AC positif | **Skenario: impor dapat diulang.** Diberikan berkas sama diimpor dua kali. Ketika impor kedua selesai. Maka jumlah jenis aktivitas tidak bertambah, dan baris yang berubah diperbarui. |
| AC negatif | **Skenario: baris dengan periode di luar daftar baku.** Diberikan satu baris berisi periode "Bulananan". Ketika impor dijalankan. Maka transaksi dibatalkan seluruhnya dan tidak ada baris yang tertulis, sehingga katalog tidak setengah jadi. |

**Tabel 2.17 Fitur Absensi Pegawai (F-36, F-37)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Pegawai mencatat masuk dan pulang dari halaman absensi. Peramban mengirim koordinat dan akurasi; server menghitung jarak ke titik kantor dan memutuskan sendiri, tidak menerima jarak dari klien. Satu kejadian per jenis per hari. Penolakan terjadi bila lokasi di luar radius, akurasi lebih buruk dari batas, atau pulang tanpa masuk. |
| Manfaat | Level 1 dan 2, serta admin. Menutup P6: kehadiran tercatat dengan bukti lokasi dan waktu yang tidak dapat diisi manual. |
| User Story | Sebagai pegawai, saya ingin mencatat kehadiran dari ponsel saat tiba dan saat pulang, agar kehadiran saya tercatat tanpa buku absen kertas. |
| User Story (EN) | As an employee, I want to clock in and out from my phone on arrival and departure, so that my attendance is recorded without a paper log. |
| AC positif | **Skenario: masuk dari dalam radius.** Diberikan titik kantor beradius 100 m dan pegawai berada 42 m darinya dengan akurasi 15 m. Ketika pegawai menekan "Masuk" dan mengizinkan lokasi. Maka satu baris `attendance_logs` jenis `masuk` tersimpan berisi koordinat, akurasi, jarak 42 m, dan salinan nama kantor. |
| AC negatif | **Skenario: pulang dari luar radius.** Diberikan pegawai sudah tercatat masuk hari itu. Ketika ia menekan "Pulang" pada jarak 2.400 m. Maka sistem menolak dengan pesan bahwa lokasi di luar radius kantor, dan tidak ada baris `pulang` tersimpan. |

**Tabel 2.18 Fitur Pengelolaan dan Laporan Absensi (F-38, F-39, F-40)**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Deskripsi | Admin menetapkan satu titik kantor pada peta beserta radius 10–300 m. Halaman laporan menampilkan rekap harian, bulanan, dan tahunan, daftar pegawai yang belum absen, dan filter berdasarkan nama, surel, atau jabatan. Laporan yang tampil dapat diekspor ke CSV dengan pemisah titik koma dan BOM UTF-8. |
| Manfaat | Admin. Menutup P6: kehadiran dapat diperiksa dan dilaporkan tanpa memindahkan data secara manual. |
| User Story | Sebagai admin, saya ingin mengunduh rekap kehadiran bulanan, agar saya dapat melampirkannya pada laporan unit tanpa menyusun tabel ulang. |
| User Story (EN) | As an administrator, I want to download the monthly attendance recap, so that I can attach it to the unit report without rebuilding the table. |
| AC positif | **Skenario: ekspor mengikuti periode dan filter.** Diberikan laporan bulanan November 2026 dengan filter jabatan "Staf". Ketika admin menekan tautan ekspor. Maka berkas CSV berisi baris yang sama dengan halaman, dengan pemisah titik koma, dan nama pegawai yang tidak cocok filter tidak ikut. |
| AC negatif | **Skenario: pengguna non-admin membuka ekspor.** Diberikan sesi level 2. Ketika ia meminta URL ekspor secara langsung. Maka sistem mengalihkan ke halaman lain dan tidak menyajikan berkas CSV. |

### 2.3.2 Alur Proses Utama / Main Process Flow

#### 2.3.2.1 Use Case Diagram

Aktor adalah pihak di luar batas sistem. Basis data bukan aktor. Sistem membedakan tiga aktor
manusia dan satu aktor waktu (batas waktu diam lembur). Aktor "Mitra Unit Kerja" tidak memakai
sistem, sehingga tidak digambarkan.

**Gambar 2.2 Use Case Diagram Umsura Assignment**

![Use case diagram](./c200/diagram/img/usecase.png)

Diagram memuat tujuh belas use case. Relasi `<<include>>` dipakai untuk langkah yang selalu
dipanggil (autentikasi), dan `<<extend>>` untuk perilaku opsional (menulis catatan setelah
penandaan selesai, meminta reset kata sandi dari halaman masuk).

**Tabel 2.19 Pemetaan Use Case ke Kebutuhan Fungsional**

| Kode | Nama Use Case | Aktor | Kebutuhan |
|:-------------|:-------------------------|:-------------|:-------------|
| UC-01 | Autentikasi | Semua | F-01, F-02 |
| UC-02 | Mengelola unit kerja dan jenis aktivitas | Admin | F-03, F-04 |
| UC-03 | Memberikan penugasan dari katalog | Admin | F-08, F-09 |
| UC-04 | Memberikan instruksi langsung | Admin, Level 1 | F-11, F-12 |
| UC-05 | Memantau progres penugasan | Admin, Level 1 | F-13, F-07 |
| UC-06 | Mencabut instruksi | Admin, Level 1 | F-14 |
| UC-07 | Menandai tugas selesai | Level 1, 2 | F-16, F-17, F-19, F-22 |
| UC-08 | Menulis catatan dan bukti | Level 1, 2 | F-18 |
| UC-09 | Melihat riwayat dan dasbor | Level 1, 2 | F-20, F-21 |
| UC-10 | Mengajukan lembur | Level 1, 2 | F-23, F-24, F-25 |
| UC-11 | Memutuskan lembur | Admin, Waktu Sistem | F-26, F-27, F-28, F-29 |
| UC-12 | Mengelola akun dan jabatan | Admin | F-30, F-31, F-10 |
| UC-13 | Memproses reset kata sandi | Admin, Semua | F-05, F-06, F-07 |
| UC-14 | Mengelola pengumuman | Admin | F-32, F-33 |
| UC-15 | Mengimpor Matriks Rencana Kerja | Admin | F-34, F-35 |
| UC-16 | Mencatat absensi masuk dan pulang | Level 1, 2 | F-36, F-37 |
| UC-17 | Menyusun laporan absensi | Admin | F-38, F-39, F-40 |
| — | Mengarsipkan dan menghapus penugasan | Admin | F-15 |

#### 2.3.2.2 Use Case Scenario

Setiap use case Must memiliki minimal dua alur alternatif atau negatif.

**Tabel 2.20 Use Case Scenario UC-01: Autentikasi**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-01 / Autentikasi |
| Kebutuhan terkait | F-01, F-02 |
| Deskripsi | Pengguna masuk dan diarahkan ke ruang kerja sesuai peran |
| Aktor utama | Admin, Level 1, Level 2 |
| Aktor sekunder | — |
| Pra-kondisi | Akun terdaftar dan aktif |
| Alur utama | 1. Pengguna membuka halaman masuk. 2. Sistem menampilkan formulir surel dan kata sandi. 3. Pengguna mengisi dan mengirim. 4. Sistem memverifikasi hash kata sandi, mencatat IP dan peramban. 5. Pengguna terautentikasi. 6. Sistem mengarahkan ke dasbor admin atau ruang kerja sesuai peran. |
| Alur negatif | **3a.** Kata sandi salah → **3b.** Sistem menolak, pesan "Surel atau kata sandi salah", tidak ada sesi. **1a.** Halaman dibuka dari asal tidak aman → **1b.** Formulir tetap tampil, tetapi sistem menandai bahwa cookie sesi tidak akan disimpan. |
| Pasca-kondisi | Sesi aktif, satu baris `login_logs` tercatat |

**Tabel 2.21 Use Case Scenario UC-02: Mengelola Unit Kerja dan Jenis Aktivitas**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-02 / Mengelola unit kerja dan jenis aktivitas |
| Kebutuhan terkait | F-03, F-04 |
| Deskripsi | Admin memelihara katalog unit kerja dan jenis aktivitas beserta periodenya |
| Aktor utama | Admin |
| Aktor sekunder | — |
| Pra-kondisi | Admin telah masuk |
| Alur utama | 1. Admin membuka halaman unit kerja. 2. Sistem menampilkan daftar unit. 3. Admin memilih satu unit. 4. Sistem menampilkan tabel jenis aktivitas unit tersebut. 5. Admin menambah atau mengubah satu baris. 6. Sistem memvalidasi lalu menyimpan, dan tabel diperbarui. |
| Alur negatif | **5a.** Tanggal selesai mendahului tanggal mulai → **5b.** Sistem menolak dan menampilkan pesan pada kolom tanggal. **3a.** Admin mencoba menghapus unit sistem "Instruksi" → **3b.** Sistem menolak karena unit itu menampung seluruh instruksi langsung. |
| Pasca-kondisi | Katalog tersimpan; aktivitas baru dapat ditugaskan |

**Tabel 2.22 Use Case Scenario UC-03: Memberikan Penugasan dari Katalog**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-03 / Memberikan penugasan dari katalog |
| Kebutuhan terkait | F-08, F-09 |
| Deskripsi | Admin memberikan aktivitas dari katalog kepada satu atau banyak pengguna |
| Aktor utama | Admin |
| Aktor sekunder | Level 1, Level 2 |
| Pra-kondisi | Admin telah masuk; katalog berisi minimal satu aktivitas; ada pengguna non-admin |
| Alur utama | 1. Admin membuka halaman penugasan. 2. Sistem menampilkan katalog dan daftar pengguna. 3. Admin memilih aktivitas dan penerima. 4. Sistem menyaring penerima (peran selain admin) dan melewati pasangan yang sudah ada. 5. Admin mengirim. 6. Sistem menyimpan pasangan baru dan menandai "Pekerjaan masuk" pada penerima. |
| Alur negatif | **3a.** Tidak ada penerima dipilih → **3b.** Sistem menolak dan menampilkan pesan. **5a.** Seluruh pasangan sudah ada → **5b.** Sistem melaporkan tidak ada penugasan baru dan tidak menambah baris. |
| Pasca-kondisi | Pasangan pengguna–aktivitas tersimpan; lencana penerima bertambah |

**Tabel 2.23 Use Case Scenario UC-04: Memberikan Instruksi Langsung**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-04 / Memberikan instruksi langsung |
| Kebutuhan terkait | F-11, F-12 |
| Deskripsi | Admin atau level 1 membuat tugas baru dan memberikannya kepada pengguna non-admin |
| Aktor utama | Admin, Level 1 |
| Aktor sekunder | Level 1, Level 2 (penerima) |
| Pra-kondisi | Pemberi telah masuk dengan peran 0 atau 1 |
| Alur utama | 1. Pemberi membuka menu Instruksi. 2. Sistem memeriksa sesi dan peran. 3. Pemberi mengisi data aktivitas dan memilih penerima. 4. Sistem memvalidasi masukan dan menyaring penerima. 5. Pemberi mengirim. 6. Sistem membuat atau memakai ulang aktivitas di unit Instruksi, menyimpan penugasan beserta `created_by`, dan menampilkan instruksi pada panel progres. |
| Alur negatif | **2a.** Peran pemanggil adalah 2 → **2b.** Sistem menolak dengan status 403. **3a.** Seluruh penerima berperan admin → **3b.** Sistem menolak setelah penyaringan server dan menampilkan pesan. **4a.** Masukan tidak valid, misalnya durasi nol → **4b.** Sistem menampilkan galat per kolom dan tidak menyimpan. |
| Pasca-kondisi | Penugasan berorigin `langsung` tersimpan, penerima melihat baris "Dari" |

**Tabel 2.24 Use Case Scenario UC-05: Memantau Progres Penugasan**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-05 / Memantau progres penugasan |
| Kebutuhan terkait | F-13, F-07 |
| Deskripsi | Pemberi melihat status per periode atas penugasan yang ia berikan |
| Aktor utama | Admin, Level 1 |
| Aktor sekunder | Level 1, Level 2 (penerima) |
| Pra-kondisi | Pemberi telah masuk dan pernah memberi penugasan |
| Alur utama | 1. Pemberi membuka menu Instruksi atau Penugasan. 2. Sistem menghitung periode tiap penugasan dari tanggal mulai sampai periode berjalan atau tanggal selesai. 3. Sistem menampilkan kartu berstatus belum mulai, berjalan, selesai, atau terlambat, dengan strip dua belas periode terakhir. 4. Pemberi dapat memfilter yang belum selesai. |
| Alur negatif | **1a.** Penerima tidak pernah masuk sehingga tidak ada log → **1b.** Status tetap dihitung dari periode, bukan dari log, agar penugasan tidak tampak "tidak terlambat" hanya karena penerima pasif. **3a.** Riwayat lebih dari dua belas periode → **3b.** Sistem menampilkan penanda "+N periode sebelumnya" tanpa merinci. |
| Pasca-kondisi | Tidak ada perubahan data; pemberi memperoleh status terkini |

**Tabel 2.25 Use Case Scenario UC-06: Mencabut Instruksi**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-06 / Mencabut instruksi |
| Kebutuhan terkait | F-14 |
| Deskripsi | Pemberi menghapus instruksi yang ia berikan sendiri |
| Aktor utama | Admin, Level 1 |
| Aktor sekunder | Penerima |
| Pra-kondisi | Instruksi berorigin `langsung` dan `created_by` sama dengan pemanggil |
| Alur utama | 1. Pemberi memilih satu instruksi pada panel progres. 2. Sistem menampilkan dialog konfirmasi berisi nama aktivitas dan penerima. 3. Pemberi mengonfirmasi. 4. Sistem memeriksa kepemilikan. 5. Sistem menghapus penugasan beserta log penyelesaian penerima. 6. Sistem memperbarui panel. |
| Alur negatif | **4a.** Instruksi milik pemberi lain → **4b.** Sistem menolak dan menampilkan "bukan milik Anda", baris tetap ada. **2a.** Pemberi membatalkan dialog → **2b.** Tidak ada perubahan. **1a.** Peramban tanpa JavaScript → **1b.** Formulir POST langsung ke halaman tetap berfungsi dan tetap memeriksa kepemilikan. |
| Pasca-kondisi | Instruksi dan log penyelesaiannya hilang; tidak dapat dibatalkan |

**Tabel 2.26 Use Case Scenario UC-07: Menandai Tugas Selesai**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-07 / Menandai tugas selesai |
| Kebutuhan terkait | F-16, F-17, F-19, F-22 |
| Deskripsi | Pegawai menandai satu kemunculan selesai atau membatalkannya |
| Aktor utama | Level 1, Level 2 |
| Aktor sekunder | Pemberi tugas |
| Pra-kondisi | Pegawai telah masuk; kemunculan periode berjalan ada |
| Alur utama | 1. Pegawai membuka ruang kerja. 2. Sistem memuat kemunculan periode berjalan dan mencatat periode lewat sebagai terlewat. 3. Pegawai menekan tombol selesai pada satu kartu. 4. Sistem memeriksa sesi dan keberadaan kemunculan. 5. Sistem menulis log `selesai`, memperbarui statistik, peta kontribusi, dan progres pemberi. 6. Kartu berubah tanpa muat ulang halaman. |
| Alur negatif | **4a.** Periode sudah lewat → **4b.** Sistem menolak dengan "Kemunculan tugas ini tidak ada". **3a.** Koneksi terputus saat aksi dikirim → **3b.** Kartu kembali ke keadaan semula dan sistem menampilkan pemberitahuan galat tanpa kehilangan keadaan halaman. |
| Pasca-kondisi | Satu baris `activity_logs` berstatus `selesai` |

**Tabel 2.27 Use Case Scenario UC-08: Menulis Catatan dan Bukti**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-08 / Menulis catatan dan bukti |
| Kebutuhan terkait | F-18 |
| Deskripsi | Pegawai menyimpan keterangan dan tautan bukti pada satu kemunculan |
| Aktor utama | Level 1, Level 2 |
| Aktor sekunder | Pemberi tugas |
| Pra-kondisi | Pegawai telah masuk; kemunculan ada |
| Alur utama | 1. Pegawai membuka dialog catatan pada satu kartu. 2. Sistem menampilkan catatan yang sudah ada. 3. Pegawai mengisi keterangan dan tautan. 4. Sistem memvalidasi panjang teks dan skema URL. 5. Sistem menyimpan pada kunci pengguna–aktivitas–periode. 6. Kartu menampilkan catatan. |
| Alur negatif | **4a.** Tautan bukan http/https absolut → **4b.** Sistem menolak dan menampilkan pesan. **4c.** Keterangan lebih dari 1000 karakter → **4d.** Sistem menolak dengan batas karakter. |
| Pasca-kondisi | Catatan tersimpan, tetap ada walau status dibatalkan |

**Tabel 2.28 Use Case Scenario UC-09: Melihat Riwayat dan Dasbor**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-09 / Melihat riwayat dan dasbor |
| Kebutuhan terkait | F-20, F-21 |
| Deskripsi | Pegawai melihat penyelesaian, keterlambatan, peta kontribusi, dan tren |
| Aktor utama | Level 1, Level 2 |
| Aktor sekunder | — |
| Pra-kondisi | Pegawai telah masuk |
| Alur utama | 1. Pegawai membuka riwayat atau ruang kerja. 2. Sistem memuat log dan periode untuk tahun terpilih. 3. Sistem menghitung kepadatan per hari dan tren empat belas hari. 4. Sistem menampilkan peta, tren, dan daftar riwayat. |
| Alur negatif | **2a.** Parameter tahun pada URL tidak valid → **2b.** Sistem jatuh ke tahun berjalan, bukan menampilkan galat. **1a.** Belum ada data → **1b.** Sistem menampilkan keadaan kosong yang menjelaskan. |
| Pasca-kondisi | Tidak ada perubahan data |

**Tabel 2.29 Use Case Scenario UC-10: Mengajukan Lembur**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-10 / Mengajukan lembur |
| Kebutuhan terkait | F-23, F-24, F-25 |
| Deskripsi | Pegawai mengajukan lembur hari berjalan setelah ambang menit tercapai |
| Aktor utama | Level 1, Level 2 |
| Aktor sekunder | Admin |
| Pra-kondisi | Pegawai telah masuk; total menit tugas selesai hari ini mencapai ambang |
| Alur utama | 1. Pegawai membuka halaman lembur. 2. Sistem menghitung menit selesai hari ini. 3. Sistem membuka formulir. 4. Pegawai mengisi jam mulai, jam selesai, keterangan. 5. Sistem memvalidasi tanggal hari ini, urutan jam, dan belum ada pengajuan menunggu. 6. Sistem menyimpan pengajuan berstatus menunggu. |
| Alur negatif | **2a.** Menit belum mencapai ambang → **2b.** Formulir terkunci dengan sisa kebutuhan menit; aksi menolak bila dikirim langsung. **5a.** Jam selesai tidak lebih lambat dari jam mulai → **5b.** Sistem menolak dengan pesan. **5c.** Sudah ada pengajuan menunggu pada tanggal itu → **5d.** Sistem menolak pengajuan ganda. |
| Pasca-kondisi | Satu baris `overtime_requests` berstatus `pending` |

**Tabel 2.30 Use Case Scenario UC-11: Memutuskan Lembur**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-11 / Memutuskan lembur |
| Kebutuhan terkait | F-26, F-27, F-28, F-29 |
| Deskripsi | Admin memutuskan pengajuan atau sistem menolak otomatis karena batas waktu diam |
| Aktor utama | Admin |
| Aktor sekunder | Waktu Sistem, pemohon |
| Pra-kondisi | Ada pengajuan berstatus menunggu |
| Alur utama | 1. Admin membuka halaman lembur. 2. Sistem lebih dahulu menandai pengajuan yang melewati batas waktu diam sebagai ditolak. 3. Sistem menampilkan antrean dan riwayat keputusan. 4. Admin memilih setuju atau tolak dan mengisi catatan. 5. Sistem menyimpan keputusan beserta `handled_by` dan `handled_at`. 6. Sistem menandai notifikasi untuk pemohon. |
| Alur negatif | **4a.** Baris yang diputuskan sudah berstatus final → **4b.** Sistem menolak karena hanya baris menunggu yang dapat diputuskan. **2a.** Sistem dimatikan melewati tenggat → **2b.** Penolakan tetap tercatat dengan waktu keputusan dihitung dari waktu pengajuan, sehingga hasilnya sama walau pemeriksaan terlambat. |
| Pasca-kondisi | Status final; pemohon menerima notifikasi |

**Tabel 2.31 Use Case Scenario UC-12: Mengelola Akun dan Jabatan**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-12 / Mengelola akun dan jabatan |
| Kebutuhan terkait | F-30, F-31, F-10 |
| Deskripsi | Admin menambah, mengubah, dan menghapus akun serta memelihara daftar jabatan |
| Aktor utama | Admin |
| Aktor sekunder | Pengguna |
| Pra-kondisi | Admin telah masuk |
| Alur utama | 1. Admin membuka halaman pengguna. 2. Sistem menampilkan daftar akun dan pilihan jabatan. 3. Admin menambah atau mengubah satu akun. 4. Sistem memvalidasi surel unik dan peran. 5. Sistem menyimpan dan menampilkan kata sandi awal. 6. Admin dapat menghapus akun dengan jendela batal lima detik. |
| Alur negatif | **4a.** Surel sudah dipakai → **4b.** Sistem menolak dan menampilkan pesan. **4c.** Admin mengosongkan nama atau peran → **4d.** Sistem menolak validasi. **3a.** Jabatan yang dipilih kemudian dihapus dari daftar → **3b.** Akun tetap menyimpan teks jabatan yang sudah dimilikinya. |
| Pasca-kondisi | Data akun tersimpan; penugasan milik akun yang dihapus ikut terhapus |

**Tabel 2.32 Use Case Scenario UC-13: Memproses Reset Kata Sandi**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-13 / Memproses reset kata sandi |
| Kebutuhan terkait | F-05, F-06, F-07 |
| Deskripsi | Pengguna mengajukan permintaan; admin mengeksekusi atau menolak |
| Aktor utama | Admin, Semua |
| Aktor sekunder | — |
| Pra-kondisi | Pengguna tidak dapat masuk |
| Alur utama | 1. Pengguna membuka halaman lupa kata sandi. 2. Sistem menampilkan formulir surel. 3. Pengguna mengirim. 4. Sistem menolak permintaan kedua untuk akun yang sama dan mencatat satu baris menunggu. 5. Sistem menampilkan layar hasil yang sama untuk surel terdaftar maupun tidak. 6. Admin membuatkan sandi awal atau menolak. |
| Alur negatif | **4a.** Sudah ada permintaan menunggu → **4b.** Sistem tidak menambah baris, tetap menampilkan layar hasil. **6a.** Formulir lama dikirim ulang setelah permintaan diproses → **6b.** Sistem menolak karena hanya baris menunggu yang dapat diproses, sehingga akun tidak direset dua kali. |
| Pasca-kondisi | Kata sandi akun menjadi sandi awal seragam, atau permintaan ditolak |

**Tabel 2.33 Use Case Scenario UC-14: Mengelola Pengumuman**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-14 / Mengelola pengumuman |
| Kebutuhan terkait | F-32, F-33 |
| Deskripsi | Admin menulis, mengubah, dan menghapus pengumuman |
| Aktor utama | Admin |
| Aktor sekunder | Seluruh pengguna |
| Pra-kondisi | Admin telah masuk |
| Alur utama | 1. Admin membuka halaman pengumuman. 2. Sistem menampilkan daftar. 3. Admin menulis judul dan isi. 4. Sistem memvalidasi judul wajib. 5. Sistem menyimpan dan menerbitkan. |
| Alur negatif | **4a.** Judul kosong → **4b.** Sistem menolak. **3a.** Isi berisi markdown tidak valid → **3b.** Sistem tetap menyimpan dan menampilkan isi sebagai teks, bukan galat. |
| Pasca-kondisi | Pengumuman tampil pada dasbor admin |

**Tabel 2.34 Use Case Scenario UC-15: Mengimpor Matriks Rencana Kerja**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-15 / Mengimpor Matriks Rencana Kerja |
| Kebutuhan terkait | F-34, F-35 |
| Deskripsi | Admin memuat katalog dari lembar kerja MPP secara idempoten |
| Aktor utama | Admin |
| Aktor sekunder | — |
| Pra-kondisi | Berkas MPP tersedia dan sudah diekstrak menjadi JSON |
| Alur utama | 1. Admin menjalankan skrip impor. 2. Skrip membaca berkas hasil ekstraksi. 3. Skrip memvalidasi setiap baris dengan parser yang sama seperti formulir. 4. Skrip menulis seluruh baris dalam satu transaksi, memperbarui baris dengan unit dan nama yang sama. 5. Skrip menampilkan ringkasan hasil. |
| Alur negatif | **3a.** Satu baris berisi periode di luar daftar baku → **3b.** Transaksi dibatalkan seluruhnya. **1a.** Berkas tidak ditemukan → **1b.** Skrip berhenti dengan pesan galat tanpa menyentuh basis data. |
| Pasca-kondisi | Katalog berisi data MPP; impor dapat diulang tanpa penggandaan |

**Tabel 2.35 Use Case Scenario UC-16: Mencatat Absensi Masuk dan Pulang**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-16 / Mencatat absensi masuk dan pulang |
| Kebutuhan terkait | F-36, F-37 |
| Deskripsi | Pegawai mencatat kehadiran dari dalam radius kantor |
| Aktor utama | Level 1, Level 2 |
| Aktor sekunder | Admin |
| Pra-kondisi | Pegawai telah masuk; titik kantor telah ditetapkan; halaman dibuka pada asal aman |
| Alur utama | 1. Pegawai membuka halaman absensi. 2. Sistem memuat status hari ini. 3. Pegawai menekan "Masuk" dan mengizinkan lokasi. 4. Sistem menghitung jarak dari koordinat yang dikirim. 5. Sistem menyimpan baris kejadian berisi koordinat, akurasi, jarak, dan salinan nama kantor. 6. Halaman menampilkan jarak dan waktu tercatat. |
| Alur negatif | **1a.** Halaman dibuka pada `http://192.168…` → **1b.** Sistem memberi tahu bahwa peramban tidak akan memberi koordinat, alih-alih menunggu tanpa hasil. **4a.** Jarak melebihi radius → **4b.** Sistem menolak dengan "di luar radius kantor". **4c.** Akurasi lebih buruk dari batas → **4d.** Sistem menolak. **3a.** Pulang tanpa catatan masuk → **3b.** Sistem menolak. **5a.** Tombol ditekan dua kali → **5b.** Indeks unik menolak baris kedua, sistem melaporkan konflik. |
| Pasca-kondisi | Satu baris `attendance_logs` per jenis per hari |

**Tabel 2.36 Use Case Scenario UC-17: Menyusun Laporan Absensi**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| ID / Nama | UC-17 / Menyusun laporan absensi |
| Kebutuhan terkait | F-38, F-39, F-40 |
| Deskripsi | Admin menetapkan titik kantor, membaca rekap, dan mengekspornya |
| Aktor utama | Admin |
| Aktor sekunder | — |
| Pra-kondisi | Admin telah masuk |
| Alur utama | 1. Admin membuka halaman laporan. 2. Sistem menampilkan rekap harian, bulanan, atau tahunan sesuai mode. 3. Admin mengganti periode atau mengisi filter. 4. Sistem memuat ulang rekap, daftar belum absen, dan ringkasan. 5. Admin menekan tautan ekspor. 6. Sistem menyajikan CSV yang sama dengan halaman. |
| Alur negatif | **3a.** URL diubah manual dengan nilai periode tidak valid → **3b.** Sistem jatuh ke hari ini, bukan menampilkan galat. **5a.** Sesi berperan level 2 → **5b.** Sistem mengalihkan, tidak menyajikan berkas. **1a.** Titik kantor belum ditetapkan → **1b.** Laporan tetap tampil, editor lokasi menampilkan formulir kosong dan menolak menyimpan radius di luar 10–300 m. |
| Pasca-kondisi | Tidak ada perubahan data kecuali bila admin menyimpan titik kantor |

#### 2.3.2.3 Activity Diagram / BPMN

Lima proses digambarkan karena melibatkan lebih dari satu peran dan memiliki percabangan
penting. Setiap gambar disertai narasi dan aturan bisnis.

**Gambar 2.3 Activity Diagram — Menandai Tugas Selesai**

![Activity menandai selesai](./c200/diagram/img/activity-selesai.png)

Narasi: pegawai membuka ruang kerja, sistem memuat kemunculan periode berjalan sekaligus
mencatat periode yang sudah lewat sebagai terlewat. Bila periode masih berjalan, penandaan
menulis log, memperbarui statistik, peta kontribusi, dan progres pemberi; bila tidak, aksi
ditolak. Catatan dan bukti ditulis melalui jalur terpisah yang memvalidasi skema tautan.

Aturan bisnis: (1) satu kemunculan hanya boleh ditandai pada periodenya sendiri — sumber:
notulen sesi 2; (2) catatan tetap ada walau status dibatalkan — sumber: notulen sesi 3;
(3) tautan bukti hanya http/https absolut — sumber: keputusan tim, ditopang UU ITE.

**Gambar 2.4 Activity Diagram — Memberikan Instruksi Langsung**

![Activity instruksi](./c200/diagram/img/activity-instruksi.png)

Narasi: pemberi membuka menu Instruksi, sistem memeriksa peran, lalu masukan divalidasi.
Penerima disaring server sehingga admin tidak dapat menerima instruksi. Bila tidak ada penerima
tersisa, penyimpanan ditolak. Penyimpanan aktivitas dan penugasan berlangsung dalam satu
transaksi.

Aturan bisnis: (1) hanya peran 0 dan 1 yang boleh memberi instruksi — sumber: notulen sesi 4;
(2) penerima selalu peran non-admin — sumber: notulen sesi 4; (3) instruksi yang identik dipakai
ulang, tidak digandakan — sumber: keputusan tim.

**Gambar 2.5 Activity Diagram — Pengajuan dan Keputusan Lembur**

![Activity lembur](./c200/diagram/img/activity-lembur.png)

Narasi: formulir hanya terbuka bila menit kerja tercatat hari itu mencapai ambang. Pengajuan
divalidasi terhadap tanggal hari ini, urutan jam, dan pengajuan menunggu yang sudah ada. Admin
memutuskan; pengajuan yang dibiarkan melewati batas waktu diam ditolak otomatis dengan waktu
keputusan dihitung dari waktu pengajuan.

Aturan bisnis: (1) ambang menit awal 60, dapat diubah admin — sumber: notulen sesi 5;
(2) batas waktu diam 180 menit — sumber: notulen sesi 5; (3) satu pengajuan menunggu per tanggal
— sumber: notulen sesi 5; (4) hanya tanggal hari ini — sumber: keputusan mitra.

**Gambar 2.6 Activity Diagram — Absensi Masuk dan Pulang**

![Activity absensi](./c200/diagram/img/activity-absensi.png)

Narasi: pegawai menekan tombol, peramban meminta izin lokasi, dan server menghitung jarak dari
koordinat mentah. Penolakan berurutan: asal tidak aman, masuk ganda, akurasi rendah, di luar
radius, dan pulang tanpa masuk.

Aturan bisnis: (1) satu titik kantor, radius 10–300 m — sumber: notulen sesi 6; (2) jarak
dihitung server, klien tidak mengirim jarak — sumber: keputusan tim; (3) akurasi tidak boleh
memperlebar radius — sumber: keputusan tim; (4) satu kejadian per jenis per hari — sumber:
keputusan tim.

**Gambar 2.7 Activity Diagram — Pemulihan Kata Sandi**

![Activity reset](./c200/diagram/img/activity-reset.png)

Narasi: pengguna mengirim permintaan; sistem menolak permintaan kedua untuk akun yang sama dan
menampilkan layar hasil yang sama baik surel terdaftar maupun tidak. Admin mengeksekusi reset
menjadi sandi awal seragam atau menolak.

Aturan bisnis: (1) satu permintaan menunggu per akun — sumber: keputusan tim; (2) layar hasil
tidak membedakan surel terdaftar — sumber: keputusan tim, ditopang praktik keamanan umum;
(3) hanya baris menunggu yang dapat diproses — sumber: keputusan tim.

## 2.4 Kebutuhan Data / Data Requirements

**Tabel 2.37 Kebutuhan Data**

| Butir | Isi |
|:--------------|:---------------------------------------------|
| D-01 Jenis data | Empat ranah dan empat belas tabel. **(a) Kepegawaian dan akses:** `users` (akun, peran, jabatan), `positions` (daftar jabatan), `login_logs` (riwayat masuk), `password_reset_requests` (antrean reset). **(b) Kerja dan penugasan:** `categories` (unit kerja), `activities` (jenis aktivitas), `assignments` (penugasan), `activity_logs` (status per periode), `occurrence_notes` (catatan dan tautan bukti). **(c) Lembur dan kehadiran:** `overtime_requests`, `overtime_settings`, `attendance_location`, `attendance_logs`. **(d) Informasi:** `posts` (pengumuman). |
| D-02 Sumber | Lima sumber: masukan admin melalui formulir master; tindakan pegawai di ruang kerja; perhitungan sistem (periode terlewat, penolakan lembur otomatis, agregasi statistik); berkas MPP yang diimpor sekali saat penyiapan; metadata permintaan HTTP untuk log masuk (IP dari header *forwarded*, peramban dari *user-agent*). |
| D-03 Format | Tanggal disimpan sebagai teks ISO `YYYY-MM-DD` pada zona waktu Jakarta, dipisahkan dari waktu agar bebas pergeseran zona. Kunci periode mengikuti jenisnya: `YYYY-MM-DD` (Harian), `YYYY-Wnn` (Mingguan, pekan ISO), `YYYY-MM` (Bulanan dan Kegiatan), `YYYY-Qn` (Triwulan), `YYYY-Sn` (Semesteran), `YYYY` (Tahunan). Ekspor CSV dengan pemisah titik koma dan BOM UTF-8 agar terbuka benar di Excel berlokal Indonesia. Impor MPP melalui JSON hasil ekstraksi. |
| D-04 Volume | Jumlah baris `activity_logs` dan `occurrence_notes` sebanding jumlah kemunculan: Harian 365/tahun, Mingguan 52, Bulanan dan Kegiatan 12, Triwulan 4, Semesteran 2, Tahunan 1 per aktivitas. Dengan 30 aktivitas per pegawai dan komposisi dominan bulanan, satu pegawai menghasilkan ±400–500 baris per tahun. Pada data uji 11 November 2026: 223 jenis aktivitas, 541 baris `activity_logs`, 6 baris `attendance_logs`, berkas basis data 316 KB. Target tahap awal: 200 pegawai, orde puluhan megabita per tahun. Batas akumulasi periode per penugasan 400. |
| D-05 Frekuensi | Data tidak dialirkan berkelanjutan. Penulisan per kejadian: satu baris per login, satu per penandaan selesai, satu per catatan, satu per pengajuan lembur, satu per kejadian absensi. Pembacaan agregat dilakukan saat halaman dibuka; penulisan puncak diperkirakan puluhan per menit pada pagi hari. |
| D-06 Penyimpanan dan retensi | Satu berkas SQLite mode WAL. Retensi permanen: penghapusan penugasan oleh pengguna diimplementasikan sebagai pengarsipan; penghapusan permanen hanya di tab arsip dan dimaksudkan membersihkan data yang salah masuk. Tidak ada penghapusan baris absensi — riwayat yang dapat dihapus bukan riwayat. Pencadangan berkala dengan menyalin berkas. |
| D-07 Keamanan | Kata sandi disimpan sebagai hash bcrypt (biaya 10), tidak pernah teks biasa. Sesi pada cookie bertanda tangan dan diverifikasi ulang ke baris pengguna tiap pembacaan, sehingga perubahan nama, surel, atau peran langsung berlaku. Seluruh kueri memakai parameter terikat. Tautan bukti divalidasi di peramban dan di server. Daftar data pribadi menurut UU PDP [3]: nama, surel, jabatan, alamat IP dan peramban pada log masuk, catatan pekerjaan, riwayat lembur, dan koordinat kehadiran. **Dasar pemrosesan:** pelaksanaan tugas kepegawaian unit kerja; **pihak yang dapat mengakses:** admin untuk seluruh data, atasan langsung hanya untuk penugasan yang ia berikan, pelaksana hanya untuk datanya sendiri; **persetujuan:** pegawai diberi tahu saat akun dibuat dan dapat meminta pembetulan melalui admin. Koordinat kehadiran tidak dibagikan ke pegawai lain. |
| D-08 Pemrosesan | Tiga proses turunan: **(a) materialisasi keterlambatan** — saat ruang kerja dibuka, periode lewat tanpa penyelesaian dicatat `terlewat` pada tanggal jatuh temponya; **(b) penolakan lembur otomatis** — setiap pembacaan data lembur menandai pengajuan yang melewati batas waktu diam, dengan waktu keputusan dihitung deterministik dari waktu pengajuan; **(c) agregasi dasbor** — total menit selesai hari ini, tren 14 hari, peta kontribusi tahunan, cakupan per unit, dan rekap absensi dihitung dari tabel transaksi, bukan tabel ringkasan. |
| D-09 Data kehadiran | `attendance_location` menyimpan satu titik (label, lintang, bujur, radius). `attendance_logs` menyimpan satu baris per kejadian masuk atau pulang, berisi koordinat, akurasi, jarak hasil hitung server, salinan nama kantor, IP, dan peramban. Tanggal adalah hari sipil Jakarta; jam diambil dari waktu pembuatan baris. |

### 2.4.1 Migrasi Data Awal / Initial Data Migration

Data lama yang dipindahkan adalah **Matriks Rencana Kerja** berupa lembar kerja dengan 11 unit
kerja dan 206 baris aktivitas. Migrasi dijalankan sekali sebelum sistem dipakai, dengan dua
langkah:

1. **Ekstraksi.** Skrip Python membaca berkas MPP, memetakan kolom berdasarkan nama header
   (beberapa lembar tidak memiliki kolom tanggal, sehingga posisi kolom bergeser), mengubah
   tanggal bebas menjadi nomor hari, dan memetakan kosakata periode lembar kerja ke label baku
   sistem. Keluaran berupa JSON.
2. **Pemuatan.** Skrip TypeScript menjalankan setiap baris melalui parser yang sama dengan
   formulir admin, lalu melakukan upsert dalam satu transaksi. Kunci pencocokan adalah unit kerja
   dan nama aktivitas, sehingga impor dapat diulang setelah berkas diperbaiki tanpa
   menggandakan baris.

**Verifikasi mitra sebelum dipakai:** admin dan perwakilan unit kerja membuka halaman unit kerja,
membandingkan jumlah baris per unit dengan lembar kerja asal, dan memeriksa sepuluh baris contoh
yang mewakili tiap periode. Hasil pemeriksaan dicatat pada Lampiran A. Data yang belum ada
padanannya di lembar kerja — penugasan, catatan, log penyelesaian — tidak dimigrasikan karena
belum pernah tercatat dalam bentuk apa pun; penugasan awal dilakukan admin setelah katalog
terverifikasi.

### 2.4.2 ERD Konseptual / Conceptual ERD

**Gambar 2.8 ERD Konseptual Umsura Assignment**

![ERD](./c200/diagram/img/erd.png)

Catatan kardinalitas dan kunci:

- `users` ke `positions` bukan relasi kunci asing: `users.jabatan` menyimpan label teks, sehingga
  menghapus jabatan tidak mengubah akun yang sudah memilikinya.
- `assignments` unik atas pasangan `(user_id, activity_id)`, sehingga pemberian ulang tidak
  menggandakan baris.
- `activity_logs` unik atas `(user_id, activity_id, period_key)`.
- `occurrence_notes` memakai kunci primer gabungan `(user_id, activity_id, period_key)` dan
  sengaja tidak bergantung pada `activity_logs`, agar catatan bertahan saat status dibatalkan.
- `attendance_location` adalah singleton (`CHECK id = 1`), `overtime_settings` juga singleton.
- `attendance_logs` unik atas `(user_id, tanggal, kind)`, dan `location_label` adalah salinan
  nama kantor saat kejadian, bukan kunci asing.

### 2.4.3 Kamus Data / Data Dictionary

**Tabel 2.38 Kamus Data — `activity_logs`**

| Atribut | Deskripsi | Aturan / Validasi | Contoh |
|:-------------|:---------------------|:---------------------------------------------|:-------------|
| `user_id` | Pemilik penyelesaian | Wajib; harus pengguna terdaftar; terhapus bila akun dihapus | 9 |
| `activity_id` | Jenis aktivitas | Wajib; harus aktivitas yang ditugaskan kepada pengguna itu | 282 |
| `period_key` | Kunci periode kemunculan | Wajib; format mengikuti jenis periode aktivitas | `2026-11` |
| `status` | Keadaan kemunculan | Hanya `selesai` atau `terlewat` | `selesai` |
| `completed_at` | Waktu penandaan selesai | Boleh kosong untuk `terlewat`; diisi waktu server saat penandaan | `2026-11-11 04:52:04` |
| `created_at`, `updated_at` | Jejak pembuatan dan pembaruan | Diisi otomatis oleh basis data | `2026-11-11 04:52:04` |

**Tabel 2.39 Kamus Data — `occurrence_notes`**

| Atribut | Deskripsi | Aturan / Validasi | Contoh |
|:-------------|:----------------|:--------------------------------|:-------------------------------|
| `user_id` | Penulis catatan | Bagian kunci primer | 9 |
| `activity_id` | Aktivitas yang dicatat | Bagian kunci primer | 282 |
| `period_key` | Periode yang dicatat | Bagian kunci primer | `2026-11` |
| `note` | Keterangan pekerjaan | Maksimal 1000 karakter; boleh kosong bila tautan diisi | `Berita acara rapat koordinasi` |
| `link` | Tautan bukti | Boleh kosong; bila diisi harus URL absolut berskema http atau https | `https://contoh.go.id/ba-11.pdf` |
| `created_at`, `updated_at` | Jejak waktu | Diisi otomatis | `2026-11-11 05:10:00` |

**Tabel 2.40 Kamus Data — `overtime_requests`**

| Atribut | Deskripsi | Aturan / Validasi | Contoh |
|:--------------|:------------------|:---------------------------------------------|:-------------|
| `user_id` | Pemohon | Wajib; pemohon hanya dapat membuat baris untuk dirinya | 9 |
| `tanggal` | Tanggal lembur | Wajib; harus hari ini pada zona Jakarta | `2026-11-11` |
| `jam_mulai` | Jam mulai lembur | Wajib; format `HH:MM` | `16:30` |
| `jam_selesai` | Jam selesai lembur | Wajib; harus lebih lambat dari `jam_mulai`; tidak menerima rentang lintas tengah malam | `18:00` |
| `status` | Keadaan pengajuan | Hanya `pending`, `disetujui`, atau `ditolak` | `pending` |
| `catatan_admin` | Alasan keputusan | Maksimal 500 karakter; diisi saat menolak | `Pekerjaan belum diverifikasi` |
| `seen_at` | Waktu pemohon membaca keputusan | Kosong berarti notifikasi belum dibaca | `2026-11-11 06:00:00` |
| `handled_by`, `handled_at` | Pemutus dan waktu keputusan | Diisi saat keputusan, termasuk penolakan otomatis | `1`, `2026-11-11 07:30:00` |

Durasi lembur tidak disimpan; ia dihitung dari `jam_mulai` dan `jam_selesai` saat ditampilkan,
sehingga satu sumber kebenaran tidak dapat menyimpang.

**Tabel 2.41 Kamus Data — `attendance_logs`**

| Atribut | Deskripsi | Aturan / Validasi | Contoh |
|:---------------|:-------------------|:---------------------------------|:-------------|
| `user_id` | Pegawai yang mencatat | Wajib; admin tidak dapat mencatat | 9 |
| `tanggal` | Hari sipil Jakarta | Wajib; dihitung server | `2026-11-11` |
| `kind` | Jenis kejadian | Hanya `masuk` atau `pulang` | `masuk` |
| `location_label` | Nama kantor saat kejadian | Salinan teks, bukan kunci asing | `Kantor Unit Kerja` |
| `latitude`, `longitude` | Koordinat kejadian | Wajib; dikirim peramban, disimpan apa adanya | `-7.0512`, `110.4381` |
| `accuracy_m` | Akurasi laporan peramban | Wajib; harus lebih baik dari batas `min(radius, 150)` m | 15 |
| `distance_m` | Jarak ke titik kantor | Dihitung server dari koordinat; klien tidak pernah mengirim jarak | 42.3 |
| `ip`, `user_agent` | Metadata permintaan | Diisi server | `10.0.0.5`, `Mozilla/5.0 …` |
| `created_at` | Waktu kejadian | Diisi server | `2026-11-11 07:58:12` |

Kunci unik `(user_id, tanggal, kind)` menjadi pagar terhadap pengiriman ganda: aksi menyisipkan
dengan mode abaikan-konflik dan melaporkan konflik, bukan memeriksa lebih dulu di aplikasi.

## 2.5 Kebutuhan Non-Fungsional / Non-Functional Requirements

Setiap butir mengikuti pola **karakteristik ISO/IEC 25010 [1] — kondisi — besaran — ambang —
asal**. Angka bertanda `[UKUR]` diukur pada build produksi 11 November 2026, satu proses Node.js
22 pada CPU Intel i7-1068NG7, akses lokal tanpa jaringan luar; rincian pada Lampiran G.

**Tabel 2.42 Kebutuhan Kinerja**

| Kode | Karakteristik | Kebutuhan terukur | Asal |
|:-------------|:--------------------------------------|:---------------------------------------------|:-------------|
| NF-01 | *Performance efficiency* — waktu respons | Halaman ruang kerja pegawai dengan 50 kemunculan tugas tampil ≤ 500 ms (p95) diukur 7 kali berturut-turut pada server lokal; hasil ukur 207 ms | P1, pengukuran |
| NF-02 | *Performance efficiency* — waktu respons | Aksi penandaan selesai menjawab ≤ 300 ms (p95) tanpa muat ulang halaman; hasil ukur 17 ms | P1, pengukuran |
| NF-03 | *Performance efficiency* — kapasitas | Server melayani 50 permintaan serentak pada halaman ruang kerja dengan waktu rata-rata per permintaan ≤ 100 ms dan tanpa galat; hasil ukur 50 ms, 50/50 berhasil | Pengukuran |
| NF-04 | *Performance efficiency* — ukuran transfer | Pemuatan pertama halaman pegawai ≤ 250 KB terkompresi; hasil ukur 192 KB | Pengukuran |

**Tabel 2.43 Kebutuhan Keamanan**

| Kode | Karakteristik | Kebutuhan terukur | Asal |
|:-------------|:------------------------|:---------------------------------------------|:-------------|
| NF-05 | *Security* — autentikasi | Kata sandi disimpan sebagai hash bcrypt biaya 10; tidak ada kata sandi teks biasa pada basis data maupun log | UU PDP [3] |
| NF-06 | *Security* — otorisasi | 100% dari 31 aksi mutasi memeriksa sesi dan peran di sisi server; tidak ada otorisasi yang bergantung pada antarmuka | Keputusan tim |
| NF-07 | *Security* — kerahasiaan | Halaman pemulihan kata sandi memberi respons identik untuk surel terdaftar dan tidak terdaftar; satu akun hanya dapat memiliki satu permintaan menunggu | Keputusan tim |
| NF-08 | *Security* — integritas masukan | Seluruh masukan divalidasi dengan skema tipe di server; seluruh kueri memakai parameter terikat; tautan bukti hanya http/https absolut | UU ITE, keputusan tim |
| NF-09 | *Security* — integritas transmisi | Seluruh lalu lintas melalui HTTPS dengan TLS diakhiri proksi balik; cookie sesi `HttpOnly` dan `SameSite` | Keputusan tim |
| NF-10 | *Security* — akuntabilitas | Setiap login mencatat waktu, IP, dan peramban; setiap keputusan lembur dan reset mencatat pelaksana dan waktunya | UU PDP [3] |
| NF-11 | *Security* — privasi lokasi | Koordinat kehadiran hanya dapat dibaca admin; jarak dihitung server; tidak ada penghapusan baris kehadiran | UU PDP [3] |

**Tabel 2.44 Kebutuhan Keandalan**

| Kode | Karakteristik | Kebutuhan terukur | Asal |
|:-------------|:---------------------------|:---------------------------------------------|:---------------|
| NF-12 | *Reliability* — ketersediaan | Ketersediaan ≥ 99% pada jam layanan per bulan; satu proses tunggal, tanpa replikasi | Keputusan tim |
| NF-13 | *Reliability* — toleransi kesalahan | Mode WAL aktif; setiap operasi yang menyentuh lebih dari satu tabel berjalan dalam satu transaksi; klik ganda tidak menghasilkan baris ganda karena indeks unik | Pengukuran, tinjauan kode |
| NF-14 | *Reliability* — pemulihan | RPO ≤ 24 jam (salinan harian); RTO ≤ 30 menit (pulihkan berkas, jalankan proses). Waktu boot terukur 0,43 detik | Pengukuran |

**Tabel 2.45 Kebutuhan Skalabilitas, Interaksi, Kompatibilitas, dan Pemeliharaan**

| Kode | Karakteristik | Kebutuhan terukur | Asal |
|:-------------|:-----------------------------|:---------------------------------------------|:--------------|
| NF-15 | *Flexibility* — skalabilitas | Skalabilitas vertikal; penambahan unit kerja dan jenis aktivitas tidak menuntut perubahan kode; batas praktis 50 pengguna aktif serentak pada satu proses | Pengukuran |
| NF-16 | *Interaction capability* — kepuasan | Skor SUS ≥ 70 dari ≥ 10 responden mitra | CPMK, praktik umum [9] |
| NF-17 | *Interaction capability* — kemudahan belajar | Pengguna baru menyelesaikan penandaan satu tugas pada percobaan pertama tanpa pendampingan, pada ≥ 8 dari 10 responden | Persona 2 |
| NF-18 | *Interaction capability* — aksesibilitas | Kontras teks ≥ 4,5:1, ukuran huruf sesuai UI-04, target sentuh ≥ 44×44 px, seluruh kontrol dapat dioperasikan dengan papan ketik, status tidak disampaikan hanya melalui warna | WCAG 2.1 AA [8] |
| NF-19 | *Interaction capability* — daya adaptasi | Tidak ada luapan horizontal pada lebar 390 px untuk seluruh halaman pegawai, dan pada lebar 1366 px untuk seluruh halaman admin | Pengukuran, uji Playwright |
| NF-20 | *Compatibility* | Berjalan pada peramban modern terbaru (Chrome, Firefox, Safari) dengan JavaScript aktif; tidak menuntut plugin | Keputusan tim |
| NF-21 | *Maintainability* | Seluruh mutasi terpusat pada satu modul aksi dan seluruh kueri pada satu modul data; tidak ada kueri tulis di luar modul tersebut | Tinjauan kode |
| NF-22 | *Maintainability* — bahasa | Komentar kode berbahasa Inggris, teks antarmuka berbahasa Indonesia | Konvensi tim |

### 2.5.1 Kinerja / Performance

Tiga jalur diukur. **Ruang kerja** adalah tolok ukur terpenting karena setiap pembukaan menghitung
materialisasi periode terlewat, kemunculan periode berjalan, statistik, tren empat belas hari,
dan peta kontribusi. Dengan beban 50 kemunculan aktif, waktu p95 adalah 207 ms; tanpa beban
tambahan, halaman yang sama selesai 82 ms. **Aksi penandaan selesai** diukur dari permintaan
dikirim sampai jawaban diterima: p95 17 ms, karena aksi tidak memuat ulang halaman dan hanya
menulis satu baris lalu menghitung ulang grafik tahun berjalan. **Kapasitas** diuji dengan 50
permintaan serentak: rata-rata 50 ms per permintaan, seluruhnya berhasil, tanpa penolakan.
Throughput penulisan rendah — puluhan penulisan per menit pada jam sibuk — sehingga kebutuhan
sumber daya bersifat modest: 2 vCPU, 2 GB memori, 20 GB penyimpanan dengan volume persisten.

### 2.5.2 Keamanan / Security

Prinsipnya: **setiap aksi adalah batas kepercayaan tersendiri.** Aksi tidak mewarisi otorisasi
dari halaman yang memanggilnya; setiap aksi membaca sesi, mengambil identitas pemanggil dari
basis data, dan memeriksa peran sebelum menyentuh data. Dari 31 aksi mutasi, seluruhnya memakai
pemeriksaan ini. Pemisahan hak yang paling ketat ada pada tiga pasang: `checkAttendance` menolak
admin, `saveAttendanceLocation` hanya admin, dan pencabutan instruksi dibatasi pada `created_by`
pemanggil.

Selain itu: kata sandi di-hash bcrypt biaya 10; sesi pada cookie bertanda tangan dan diverifikasi
ulang tiap pembacaan; masukan divalidasi skema server; tautan bukti hanya http/https absolut;
halaman pemulihan tidak dapat dipakai menyimpulkan keberadaan akun; dan tidak ada aksi yang
menghapus baris kehadiran. RBAC memakai tiga peran tetap, dengan matriks pada 2.7.2.

Batasan yang diketahui: cookie sesi tidak ditandai `Secure` ketika aplikasi berada di belakang
proksi yang mengakhiri TLS, karena aplikasi tidak melihat permintaan sebagai HTTPS. Mitigasi:
proksi mengalihkan seluruh lalu lintas HTTP ke HTTPS, dan `trustHost` aktif agar header
*forwarded* diterima.

### 2.5.3 Keandalan / Reliability

Ketersediaan ditargetkan ≥ 99% pada jam layanan. Karena basis data berupa satu berkas, keandalan
bertumpu pada empat hal: mode WAL agar kegagalan penulisan tidak merusak berkas utama; transaksi
untuk operasi yang menyentuh lebih dari satu tabel; penulisan idempoten untuk operasi yang dapat
terkirim ulang (indeks unik dan indeks unik parsial); serta pencadangan berkas berkala. RPO
ditetapkan 24 jam dan RTO 30 menit. Waktu boot proses terukur 0,43 detik, dan salin berkas 316 KB
selesai dalam hitungan milidetik, sehingga RTO realistis. Sistem belum menyediakan replikasi
maupun *failover* otomatis; hal ini dinyatakan sebagai batasan pada 2.2 butir 7.

### 2.5.4 Skalabilitas dan Karakteristik Lain / Scalability and Other Characteristics

Skalabilitas bersifat vertikal: penambahan kapasitas dilakukan dengan menambah sumber daya
proses tunggal. Batas ini konsekuensi langsung dari basis data tertanam dengan satu penulis. Pada
pengujian 50 permintaan serentak, waktu per permintaan tetap 50 ms tanpa galat, sehingga batas
praktis satu proses ditetapkan 50 pengguna aktif serentak; di atas itu, jalur keluar yang
direncanakan adalah migrasi ke sistem manajemen basis data relasional multi-pengguna, yang tidak
menyentuh lapisan tampilan karena akses data dipusatkan pada satu modul.

Skalabilitas fungsional dijaga: penambahan unit kerja dan jenis aktivitas tidak memerlukan
perubahan kode, dan penambahan jenis periode hanya memerlukan penambahan pemetaan kunci periode.

### 2.5.5 Teknologi dalam Lingkungan Operasional / Technology in the Operational Environment

Bagian ini mencatat lingkungan yang **sudah dimiliki mitra** dan batasannya. Pemilihan
framework, bahasa, dan DBMS adalah keputusan desain yang dibandingkan pada C300; penyebutan di
bawah adalah kandidat yang dipakai prototipe, bukan spesifikasi yang mengikat.

a. **Perangkat keras di mitra.** Satu komputer pengelola unit kerja dan telepon pintar pribadi
   pegawai. Tidak ada server khusus, sensor, atau perangkat keras tambahan.

b. **Perangkat lunak/layanan tersedia.** Peramban modern pada komputer dan telepon pintar;
   lembar kerja untuk berkas MPP; jaringan internet kampus. Tidak ada lisensi basis data
   komersial dan tidak ada layanan awan berbayar yang dianggarkan.

c. **Lingkungan hosting.** Satu server virtual atau VPS dengan volume persisten untuk direktori
   data, pengelola setelah serah terima adalah admin unit kerja dengan pendampingan tim.
   Anggaran operasional dibatasi; rincian biaya pada 5.3.

d. **Konektivitas.** Jaringan lokal unit kerja dan internet kampus. Halaman pegawai dirancang
   tetap terpakai pada sambungan lambat karena navigasi tidak memuat ulang dokumen penuh.

e. **Kandidat teknologi (dibandingkan pada C300).** Kerangka kerja aplikasi web dengan perenderan
   server; basis data tertanam berkas tunggal versus basis data klien–server; sesi cookie
   bertanda tangan versus token di penyimpanan peramban; pustaka peta untuk halaman absensi.
   Kriteria pemilihan: kemudahan pemasangan oleh satu orang, biaya bulanan, kebutuhan pencadangan,
   dan kemampuan berjalan pada satu proses.

## 2.6 Kebutuhan Arsitektur Sistem / System Architecture Requirements

Pada C200 arsitektur dinyatakan pada tingkat konteks dan lapisan. Rincian komponen, antarmuka,
dan deployment masuk C300.

**Gambar 2.9 Arsitektur Logis Berlapis**

![Arsitektur](./c200/diagram/img/arsitektur.png)

Empat lapisan: **tampilan** (halaman yang dirender server), **aksi** (satu modul berisi seluruh
mutasi), **domain** (aturan periode, validasi, perhitungan lembur, keputusan absensi,
pemformatan), dan **data** (satu modul yang memiliki skema dan seluruh kueri). Pemisahan ini
dipilih agar otorisasi tidak tersebar dan penggantian basis data pada masa depan terbatas pada
satu modul.

**Gambar 2.10 Sequence Diagram — Satu Aksi Penandaan Selesai**

![Sequence selesai](./c200/diagram/img/sequence-selesai.png)

Narasi: peramban mengirim aksi beserta tahun grafik; aksi membaca sesi dan memverifikasi baris
pengguna; bila kemunculan sah, satu baris log ditulis, periode lewat dimaterialisasi, lalu
statistik dan grafik tahun itu dikembalikan; peramban menambal sel grafik dan ringkasan tanpa
memuat ulang halaman.

**Tabel 2.46 Interaksi Antar Komponen**

| Kode | Komponen | Pengirim | Penerima | Muatan |
|:-------------|:-------------|:-------------|:-------------|:-------------------|
| K1 | Permintaan halaman | Peramban | Lapisan tampilan | GET beserta cookie sesi |
| K2 | Halaman terender | Lapisan tampilan | Peramban | HTML dan aset |
| K3 | Aksi mutasi | Peramban | Lapisan aksi | JSON tervalidasi |
| K4 | Hasil aksi | Lapisan aksi | Peramban | Status, statistik, data grafik |
| K5 | Kueri data | Tampilan atau aksi | Lapisan data | Kueri berparameter |
| K6 | Hasil kueri | Lapisan data | Tampilan atau aksi | Baris data |
| K7 | Impor MPP | Skrip impor | Lapisan domain lalu data | Baris aktivitas tervalidasi |

## 2.7 Karakteristik Pengguna / User Characteristics, Roles & Permissions

### 2.7.1 Profil dan Tugas Pengguna / User Profiles and Tasks

**Tabel 2.47 Karakteristik Pengguna**

| No | Pengguna | Profil | Tugas di sistem | Perangkat |
|:------------:|:-------------------|:---------------------------------------------|:---------------------------------------------|:----------------------------------|
| 1 | Admin (peran 0) | 25–45 tahun, terbiasa aplikasi perkantoran, akses harian singkat; satu orang pengelola unit | Mengelola unit, aktivitas, akun, jabatan, pengumuman, impor MPP, keputusan lembur, setelan lembur, titik kantor absensi, laporan absensi, permintaan reset | Komputer kantor, layar ≥ 1366 px |
| 2 | Atasan langsung (peran 1) | 30–55 tahun, literasi digital bervariasi, akses intensif pagi dan sore | Menerima dan menyelesaikan tugas, menulis bukti, memberi dan mencabut instruksi, memantau progres, mengajukan lembur, absensi | Komputer kantor dan telepon pintar |
| 3 | Pelaksana (peran 2) | 20–50 tahun, terbiasa pesan instan, akses singkat beberapa kali sehari | Menerima dan menyelesaikan tugas, menulis bukti, melihat riwayat dan dasbor, mengajukan lembur, absensi | Telepon pintar, layar 390 px ke atas |

### 2.7.2 Matriks Hak Akses / Role–Permission Matrix

Keterangan: **C** create, **R** read, **U** update, **D** delete/nonaktifkan, **A** approve,
**–** tidak ada akses.

**Tabel 2.48 Matriks Hak Akses**

| Modul | Admin (0) | Level 1 | Level 2 |
|:----------------|:------------:|:------------:|:------------:|
| Akun pengguna | CRUD | RU milik sendiri | RU milik sendiri |
| Posisi/Jabatan | CRUD | R | R |
| Unit kerja (kategori) | CRUD | R | R |
| Jenis aktivitas | CRUD | R | R |
| Penugasan dari katalog | CRUD | – | – |
| Instruksi langsung | CRUD | CRUD miliknya | R |
| Progres instruksi | R | R miliknya | R milik sendiri |
| Arsip dan hapus permanen | CRUD | – | – |
| Ruang kerja tugas | – | CRU | CRU |
| Catatan dan tautan bukti | R | CRU milik sendiri | CRU milik sendiri |
| Riwayat dan dasbor kinerja | R | R milik sendiri | R milik sendiri |
| Pengajuan lembur | – | CRUD miliknya | CRUD miliknya |
| Keputusan lembur | RA | – | – |
| Setelan lembur | RU | – | – |
| Absensi masuk/pulang | – | C milik sendiri | C milik sendiri |
| Titik kantor absensi | RU | – | – |
| Laporan absensi | R | – | – |
| Ekspor CSV absensi | R | – | – |
| Permintaan reset | RA | C | C |
| Pengumuman | CRUD | R | R |
| Impor MPP | C | – | – |
| Log masuk | R | – | – |

### 2.7.3 Persona / Personas

**Persona 1 — Bu Retno, Admin Unit Kerja, 38 tahun**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Profil dan konteks | Bekerja di komputer kantor sepanjang hari, terbiasa lembar kerja dan surel. Memegang katalog kegiatan, akun pegawai, dan keputusan lembur sekaligus. Mengakses sistem beberapa kali sehari dalam waktu singkat di sela pekerjaan lain. |
| Tujuan | Menyiapkan katalog dan penugasan satu unit dalam satu sesi; mengetahui unit mana yang cakupannya rendah; memutuskan lembur dengan dasar yang bisa dipertanggungjawabkan. |
| Frustrasi | Rekap disusun manual dari ingatan; klaim lembur tanpa bukti pekerjaan; satu orang menjadi jalan masuk semua permintaan reset. |
| Implikasi kebutuhan | `UI-03`: tabel master dapat dipakai tanpa menggulir horizontal pada 1366 px. `F-33`: dasbor menampilkan cakupan per unit. `F-23`, `F-26`: lembur terikat menit kerja tercatat. `NF-01`: halaman admin tampil di bawah 500 ms. |
| Sumber data | Wawancara dan observasi, 28 Oktober 2026 |

**Persona 2 — Mas Dimas, Pelaksana, 27 tahun**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Profil dan konteks | Bekerja di lapangan dan ruang rapat, hampir seluruh akses dari telepon pintar. Terbiasa pesan instan; membuka aplikasi beberapa kali sehari dalam waktu sangat singkat, sering sambil berdiri. |
| Tujuan | Tahu apa yang harus dikerjakan hari ini; menandai selesai dalam satu ketukan; menyimpan tautan bukti saat masih ingat; mencatat kehadiran tanpa mengisi formulir. |
| Frustrasi | Lupa menyimpan bukti lalu tidak dapat menemukannya; tombol kecil yang salah tekan; formulir panjang di layar sempit. |
| Implikasi kebutuhan | `UI-01`: tombol aksi minimal 44×44 px. `UI-02`: satu tugas selesai dalam satu ketukan tanpa berpindah halaman. `UI-06`: tata letak tanpa luapan pada 390 px. `F-22`: strip beban hari ini di atas ruang kerja. `F-36`: absensi satu tombol dengan izin lokasi yang diminta hanya saat ditekan. |
| Sumber data | Observasi dan wawancara, 4 November 2026 |

## 2.8 Target Sistem / System Targets

**Tabel 2.49 Target Sistem**

| No | Indikator | Kondisi saat ini (C100) | Target | Cara ukur (C500) |
|:------------:|:--------------------------------------|:---------------------------------|:---------------------------------------------|:---------------------------------------------|
| T1 | Penugasan tercatat dengan pemberi dan penerima | Lisan atau pesan, tidak tercatat | 100% penugasan aktif memiliki pemberi, penerima, dan periode | Hitung penugasan tanpa `created_by` atau tanpa periode; target 0 |
| T2 | Waktu menyiapkan penugasan satu unit | Satu sesi manual menyalin dari lembar kerja | ≤ 15 menit untuk satu unit berisi ±20 aktivitas dan 5 pegawai | Ukur langsung saat UAT dengan stopwatch |
| T3 | Bukti pekerjaan melekat pada periode | Tersebar di surel, grup pesan, dan berkas lokal | ≥ 80% kemunculan selesai memiliki catatan atau tautan bukti | Kueri: kemunculan selesai dengan catatan ÷ seluruh kemunculan selesai |
| T4 | Waktu menyusun rekap bulanan | 1–2 hari kerja manual | ≤ 5 menit, dari data transaksi tanpa menghitung ulang | Ukur saat UAT: buka riwayat dan dasbor, catat waktu |
| T5 | Keterlambatan terdeteksi tanpa tindakan penerima | Tidak ada penanda | 100% periode lewat tercatat `terlewat` pada tanggal jatuh tempo | Bandingkan tanggal `created_at` log terlewat dengan tanggal jatuh tempo periode |
| T6 | Lembur punya dasar pekerjaan tercatat | Tanpa dasar, tanpa jejak | 100% pengajuan lahir setelah ambang menit tercapai, dan setiap keputusan tercatat | Kueri pengajuan tanpa menit pendukung; hitung keputusan tanpa `handled_by` |
| T7 | Waktu tanggap permintaan reset | Bergantung pada satu orang, tanpa batas | ≤ 1 hari kerja sejak permintaan diajukan | Selisih `handled_at` dan waktu permintaan |
| T8 | Kosakata periode seragam | Beragam antar unit | 100% aktivitas memakai salah satu dari tujuh periode baku | Kueri `group by periode`; target tidak ada nilai di luar daftar |
| T9 | Kehadiran tercatat dengan bukti lokasi | Buku absen kertas, dapat diisi mundur | 100% kejadian absensi membawa koordinat, akurasi, dan jarak hasil hitung server | Kueri baris absensi tanpa koordinat atau jarak; target 0 |
| T10 | Rekap kehadiran dapat diserahkan tanpa menyusun ulang | Rekap manual bulanan | Satu berkas CSV per periode, siap lampir | Unduh ekspor tiga mode, periksa jumlah kolom dan baris |

---

# BAB 3 KEBUTUHAN ANTARMUKA SISTEM

Bab ini menetapkan kebutuhan antarmuka yang **dapat diuji**, bukan desain akhir. Rancangan visual
lengkap beserta komponennya dibahas pada C300. Seluruh angka pada bab ini berasal dari persona
(2.7.3), dari pengukuran build produksi 11 November 2026 (Lampiran G), atau dari WCAG 2.1 AA [8].

## 3.1 Antarmuka Pengguna / User Interface

### 3.1.1 Kebutuhan Antarmuka Pengguna / UI Requirements

**Tabel 3.1 Kebutuhan Antarmuka Pengguna**

| Kode | Kebutuhan Antarmuka (terukur) | Asal |
|:-------------|:---------------------------------------------|:-------------------|
| UI-01 | Seluruh kontrol yang menjadi aksi utama pada layar pegawai memiliki sasaran sentuh ≥ 44 × 44 px; kontrol sekunder (centang kartu tugas, tombol tutup dialog) ≥ 36 × 36 px. Tidak ada dua kontrol yang sasaran sentuhnya beririsan. | Persona 2; NF-18 |
| UI-02 | Satu kemunculan tugas dapat ditandai selesai dalam **satu ketukan** dari ruang kerja, tanpa berpindah halaman dan tanpa memuat ulang dokumen; keadaan kartu berubah ≤ 300 ms setelah jawaban aksi diterima. | Persona 2; F-17, NF-02 |
| UI-03 | Tabel master admin (unit kerja, jenis aktivitas, pengguna, penugasan) tidak menghasilkan gulir horizontal pada lebar 1366 px; kolom yang tidak muat dipindahkan ke panel rincian, bukan dipotong. | Persona 1 |
| UI-04 | Teks isi minimal 14 px, judul halaman minimal 20 px, dan angka ringkasan minimal 18 px; tinggi baris ≥ 1,4 × ukuran huruf untuk teks isi. | Persona 1, Persona 2; NF-18 |
| UI-05 | Kontras teks terhadap latarnya ≥ 4,5:1 untuk teks isi dan ≥ 3:1 untuk teks besar (≥ 18,66 px tebal atau ≥ 24 px) dan batas kontrol, diukur pada tema terang maupun gelap. | Persona 1; NF-18; WCAG 2.1 AA [8] |
| UI-06 | Tidak ada luapan horizontal dan tidak ada teks terpotong pada lebar 390 px untuk seluruh halaman pegawai (ruang kerja, riwayat, lembur, absensi, penugasan) dan pada lebar 1366 px untuk seluruh halaman admin. | Persona 2; NF-19 |
| UI-07 | Pesan galat ditulis dalam Bahasa Indonesia, menyebut **apa yang salah dan apa yang harus dilakukan**, tampil di dekat kolom yang bersangkutan atau pada `role="alert"` di dalam dialog, dan tidak pernah memuat kode status, jejak tumpukan, atau nama tabel basis data. | Persona 1, Persona 2 |
| UI-08 | Seluruh alur dapat diselesaikan dengan papan ketik: urutan fokus mengikuti urutan baca, fokus terlihat dengan cincin ≥ 2 px, dan dialog menahan fokus di dalamnya sampai ditutup. | NF-18 |
| UI-09 | Status tugas tidak disampaikan hanya melalui warna: setiap keadaan (selesai, terlewat, jatuh tempo hari ini) disertai teks lencana, dan tombol centang membawa `aria-label` yang menyebut nama tugas beserta aksinya. | NF-18; F-17 |
| UI-10 | Satu tugas selesai dalam paling banyak **dua layar**: ruang kerja dan dialog catatan (opsional). Satu pengajuan lembur dalam satu layar. Satu pencatatan absensi dalam satu layar dengan satu permintaan izin lokasi. | Persona 2; F-17, F-24, F-36 |
| UI-11 | Setiap aksi yang berjalan lebih dari 400 ms menampilkan keadaan sibuk pada tombolnya (nonaktif + label kerja), dan hasilnya diumumkan melalui `aria-live="polite"` agar terbaca pembaca layar. | Persona 1, Persona 2 |
| UI-12 | Tanpa JavaScript, halaman pegawai tetap **terbaca**: daftar tugas, status, periode, dan jatuh tempo tampil dari server, dan dialog catatan dapat disimpan melalui pengiriman formulir biasa. Penandaan selesai dan peta absensi dinyatakan sebagai peningkatan yang menuntut JavaScript. | Batasan 2.2 butir 12; NF-20 |

Catatan asal-usul: UI-01 dan UI-02 diturunkan dari Persona 2 yang mengakses sambil berdiri dan
sering salah tekan; UI-03, UI-05, dan UI-07 dari Persona 1 yang bekerja di komputer kantor
sepanjang hari; UI-06 dan UI-10 dari batasan perangkat telepon pintar 390 px.

### 3.1.2 User Flow / User Flow

Tiga tugas kritis digambarkan beserta cabang negatifnya. Tugas lain mengikuti pola yang sama dan
skenarionya sudah ditetapkan pada 2.3.2.2.

**Gambar 3.1 User Flow — Menandai Tugas Selesai**

![User flow ruang kerja](./c200/diagram/img/userflow-ruangkerja.png)

Alur: buka ruang kerja, sistem memuat kemunculan periode berjalan, mematerialisasi periode
terlewat, lalu menghitung beban hari ini. Pegawai menekan Selesai; kartu berubah, ringkasan dan
peta kontribusi ditambal tanpa muat ulang. Cabang negatif: aksi gagal karena koneksi terputus →
kartu kembali ke keadaan semula dan galat ditampilkan; periode sudah lewat → aksi ditolak.

**Gambar 3.2 User Flow — Mengajukan Lembur**

![User flow lembur](./c200/diagram/img/userflow-lembur.png)

Alur: buka lembur → sistem menghitung menit tugas selesai hari ini → bila ambang tercapai,
formulir terbuka → isi jam dan keterangan → kirim → status menunggu. Cabang negatif: menit belum
mencapai ambang → formulir terkunci dan menampilkan sisa menit; jam selesai tidak lebih lambat dari
jam mulai → ditolak; sudah ada pengajuan menunggu pada tanggal itu → ditolak.

**Gambar 3.3 User Flow — Absensi Masuk dan Pulang**

![User flow absensi](./c200/diagram/img/userflow-absensi.png)

Alur: buka absensi → sistem memuat status hari ini → tekan Masuk → peramban meminta izin lokasi →
server menghitung jarak → baris kejadian tersimpan → jarak dan waktu tampil. Cabang negatif: asal
tidak aman (bukan HTTPS) → sistem memberi tahu sejak awal; akurasi lebih buruk dari batas → ditolak;
di luar radius → ditolak; pulang tanpa masuk → ditolak.

### 3.1.3 Wireframe Low-Fidelity / Low-Fidelity Wireframes

Wireframe di bawah adalah tata letak tingkat rendah: kotak, urutan, dan label. Warna, tipografi,
dan komponen final ditetapkan pada C300. Ketiga layar dipilih karena mewakili tiga peran akses
yang berbeda: pegawai, admin, dan layar dengan perangkat keras (lokasi).

**Gambar 3.4 Wireframe — Ruang Kerja Pegawai (390 px)**

![Wireframe ruang kerja](./c200/diagram/img/wireframe-ruangkerja.png)

Urutan disengaja: beban hari ini di atas agar pertanyaan "apa yang harus kukerjakan sekarang"
terjawab sebelum menggulir; tugas terlambat naik ke atas; tugas selesai turun ke bawah. Centang
berada di kiri kartu dengan sasaran sentuh 36 px, dan nama tugas memakai sisa lebar agar tidak
terpotong.

**Gambar 3.5 Wireframe — Dasbor Admin (1366 px)**

![Wireframe dasbor](./c200/diagram/img/wireframe-dasbor.png)

"Perlu perhatian" berada paling atas karena menjadi alasan admin membuka dasbor. Cakupan per unit
tampil sebagai empat kartu sejajar pada 1366 px dan turun menjadi satu kolom pada layar sempit
(UI-03, UI-06).

**Gambar 3.6 Wireframe — Absensi Pegawai (390 px)**

![Wireframe absensi](./c200/diagram/img/wireframe-absensi.png)

Peta mendahului tombol karena jarak adalah alasan tombol boleh atau tidak boleh ditekan. Peringatan
asal tidak aman tampil sebagai teks biasa, bukan dialog, agar tidak menghalangi pembacaan status.

**Validasi wireframe.** Wireframe divalidasi melalui wawancara terpisah kepada dua pengguna mitra
(admin unit kerja dan satu pelaksana) pada 6 November 2026. Masukan yang diterima dan tindak
lanjutnya dicatat pada Lampiran A sesi 7. Ringkasnya: (1) admin meminta kolom cakupan per unit
dinaikkan ke atas — diterima, menjadi urutan Gambar 3.5; (2) pelaksana meminta tombol centang
diperbesar dan dijauhkan dari tautan catatan — diterima, menjadi UI-01 dan pemisahan baris pada
Gambar 3.4; (3) keduanya meminta status "terlambat" ditulis sebagai kata, bukan hanya warna merah
— diterima, menjadi UI-09.

## 3.2 Antarmuka Perangkat Keras / Hardware Interface

Tidak ada antarmuka perangkat keras khusus. Perangkat yang dipakai:

1. **Komputer kantor** (layar ≥ 1366 px, papan ketik, tetikus) — seluruh halaman admin dan
   halaman pegawai.
2. **Telepon pintar** (layar 390 px ke atas) — ruang kerja, lembur, dan absensi. Modul lokasi
   peramban menjadi satu-satunya antarmuka sensor; tidak ada kamera, pemindai, atau pencetak yang
   diwajibkan.
3. **Pencetak** — tidak dipakai sistem; laporan absensi diserahkan sebagai berkas CSV (F-40).

Sistem tidak menuntut perangkat tambahan, tidak menuntut sensor, dan tidak menuntut perangkat
khusus di sisi mitra. Batasan ini sejalan dengan 2.5.5a.

## 3.3 Antarmuka Perangkat Lunak / Software Interface

Pertukaran data dinyatakan secara abstrak; pemilihan kerangka kerja dan pustaka dibandingkan pada
C300.

1. **Antarmuka halaman** — permintaan HTTP `GET` menghasilkan dokumen HTML yang sudah terisi data
   (perenderan di server). Tidak ada API publik yang berdiri sendiri.
2. **Antarmuka aksi** — pemanggilan aksi mutasi melalui `POST` dengan muatan JSON, menerima
   jawaban JSON berisi status dan data yang diperbarui. Setiap aksi memvalidasi muatannya terhadap
   skema di server.
3. **Antarmuka data** — satu modul akses data memegang skema dan seluruh kueri berparameter. Tidak
   ada modul lain yang menulis langsung ke basis data (NF-21).
4. **Format impor** — berkas JSON hasil ekstraksi lembar kerja MPP; setiap baris mewakili satu jenis
   aktivitas pada satu unit kerja, divalidasi dengan parser yang sama seperti formulir admin.
5. **Format ekspor** — CSV dengan pemisah titik koma, penyandian UTF-8 ber-BOM, dan satu baris
   kepala. Nama berkas memuat mode periode dan tanggal pembuatan.
6. **Format diagram** — berkas sumber Mermaid (`.mmd`) yang dirender menjadi PNG dan SVG; lihat
   Lampiran C.

**Tabel 3.2 Antarmuka Perangkat Lunak**

| Kode | Antarmuka | Arah | Muatan | Keterangan |
|:-------------|:-------------|:----------------|:------------------|:-------------------------------|
| SW-01 | Halaman HTML | sistem → peramban | HTML + CSS + skrip | Dirender server, tanpa API terpisah |
| SW-02 | Aksi mutasi | peramban → sistem | JSON tervalidasi skema | 31 aksi, seluruhnya memeriksa sesi |
| SW-03 | Hasil aksi | sistem → peramban | JSON status + data segar | Statistik, grafik tahun, status baris |
| SW-04 | Impor MPP | berkas → sistem | JSON baris aktivitas | Satu transaksi, idempoten |
| SW-05 | Ekspor absensi | sistem → berkas | CSV `;` + BOM UTF-8 | Mengikuti periode dan filter aktif |
| SW-06 | Sumber diagram | repositori → dokumen | Mermaid `.mmd` | Hasil render PNG/SVG |

## 3.4 Antarmuka Komunikasi / Communication Interface

1. **Protokol** — HTTPS di sisi publik, HTTP polos hanya pada antarmuka *loopback* antara proksi
   balik dan proses aplikasi. Tidak ada port lain yang dibuka.
2. **Keamanan transmisi** — TLS diakhiri proksi balik; seluruh lalu lintas HTTP dialihkan ke HTTPS.
   Cookie sesi `HttpOnly` dan `SameSite`. Batasan yang diketahui: penanda `Secure` tidak dapat
   dipasang oleh aplikasi karena aplikasi tidak melihat permintaan sebagai HTTPS (lihat 2.5.2);
   mitigasinya adalah pengalihan paksa di proksi.
3. **Bandwidth** — anggaran pemuatan pertama ditetapkan **≤ 1,5 MB** per halaman. Hasil ukur
   terburuk pada 11 November 2026 adalah 192 KB terkompresi untuk ruang kerja pegawai dengan 50
   kemunculan tugas, sehingga anggaran terpakai 13%. Halaman absensi 178 KB, dasbor 126 KB, halaman
   masuk 83 KB. Rincian pada Lampiran G.
4. **Ketahanan sambungan lambat** — navigasi antaphalaman tidak memuat ulang dokumen penuh, dan
   aksi mutasi hanya mengirim dan menerima JSON berukuran kecil (beberapa kilobyte, berisi status
   dan rekap grafik tahun berjalan) sehingga satu tugas dapat diselesaikan pada sambungan di bawah
   1 Mbps.
5. **Batas waktu** — permintaan halaman tanpa jawaban dalam 30 detik dianggap gagal oleh proksi;
   peramban menampilkan pesan galat miliknya sendiri. Aplikasi tidak melakukan percobaan ulang
   otomatis pada aksi mutasi, agar tidak terjadi penulisan ganda.

**Tabel 3.3 Antarmuka Komunikasi**

| Kode | Jalur | Protokol | Keamanan | Anggaran |
|:-------------|:----------------------|:-------------|:-----------------------|:-----------------|
| CM-01 | Peramban → proksi | HTTPS 443 | TLS, pengalihan paksa dari 80 | Halaman pertama ≤ 1,5 MB |
| CM-02 | Proksi → aplikasi | HTTP 127.0.0.1 | Hanya loopback | Tanpa batas bandwidth |
| CM-03 | Aplikasi → berkas basis data | Akses berkas lokal | Hak berkas sistem operasi | 316 KB data uji |
| CM-04 | Aplikasi → media pencadangan | Salinan berkas | Hak berkas sistem operasi | ≤ 24 jam RPO |

## 3.5 Integrasi dengan Sistem Lain (opsional) / Integration with Other Systems

**Tidak ada integrasi langsung pada rilis ini.** Seluruh data berada pada satu berkas basis data di
server unit kerja, dan satu-satunya pertukaran data dengan luar sistem adalah impor lembar kerja
MPP sekali pakai (SW-04) serta ekspor CSV untuk pelaporan (SW-05).

Integrasi yang **disepakati tidak dikerjakan (Won't)** pada rilis ini, selaras dengan Tabel 2.2:

| Sistem eksternal | Bentuk integrasi | Alasan ditunda |
|:-----------------------|:------------------------------|:---------------------------------------------|
| SSO kampus | OIDC/SAML, akun mengikuti identitas kampus | Bergantung kebijakan pengelola TI kampus |
| Sistem kepegawaian / SKP | Pertukaran capaian kinerja per periode | Di luar lingkup C200; arah pengembangan |
| Surel transaksional | Undangan akun, notifikasi keputusan, tautan reset | Menambah layanan dan biaya; notifikasi bersifat tarik |
| Pesan instan (WhatsApp/Telegram) | Pengingat tenggat | Butuh nomor terverifikasi dan biaya per pesan |
| Penyimpanan awan untuk bukti | Unggah berkas | Bukti berupa tautan; unggahan butuh pemindaian berkas |
| Layanan peta daring | Geokode alamat kantor | Titik kantor dipilih manual pada peta oleh admin |

Arah pengembangan yang disepakati bila rilis berikutnya disetujui: ekspor capaian per periode ke
format yang dapat dibaca sistem kepegawaian, dan autentikasi tunggal kampus. Keduanya tidak
mengubah model data karena data sudah terpusat pada satu modul akses data.

---

# BAB 4 RENCANA VERIFIKASI

## 4.1 Rencana Verifikasi Spesifikasi / Specification Verification Plan

Metode yang dipakai mengikuti IADT: **I**nspeksi (memeriksa dokumen, kode, atau tampilan),
**A**nalisis (perhitungan atau pemodelan), **D**emonstrasi (menunjukkan fungsi berjalan), dan
**T**est (pengukuran terkontrol dengan data uji). Tabel ini adalah kerangka C500; pada C500 ditambah
kolom Hasil dan Lulus/Tidak.

**Tabel 4.1 Rencana Verifikasi**

| Kode | Spesifikasi ringkas | Metode | Prosedur / alat | Besaran | Kriteria lulus |
|:-------------|:---------------------------------|:------------:|:---------------------------------------------|:---------------------|:---------------------------------------------|
| F-01 | Autentikasi surel + kata sandi, log masuk tercatat | T | Uji black-box 6 kasus: benar, salah, kosong, surel tak terdaftar, akun dihapus, dua perangkat | Hasil kasus; isi `login_logs` | 6/6 sesuai; setiap login sukses menulis 1 baris berisi IP dan peramban |
| F-02 | Pengarahan sesuai peran setelah masuk | T | Masuk dengan akun peran 0, 1, dan 2 | URL tujuan | Peran 0 → dasbor admin; peran 1 dan 2 → ruang kerja |
| F-03 | CRUD unit kerja beserta ikon dan urutan | T | Uji black-box 8 kasus termasuk hapus unit berisi aktivitas | Jumlah baris; pesan galat | 8/8 sesuai; unit sistem "Instruksi" tidak dapat dihapus |
| F-04 | CRUD jenis aktivitas per unit | T | Uji black-box 12 kasus, termasuk tanggal selesai < tanggal mulai dan periode di luar daftar | Baris tersimpan; pesan per kolom | 12/12 sesuai; tidak ada baris tersimpan saat masukan tidak valid |
| F-05 | Permintaan reset tanpa mengungkap keberadaan akun | T | Kirim permintaan untuk surel terdaftar dan tidak terdaftar | Waktu respons; isi layar hasil | Layar hasil identik; tidak ada perbedaan status HTTP |
| F-06 | Admin mengeksekusi atau menolak reset | D | Demonstrasi eksekusi reset lalu masuk dengan sandi awal | Status permintaan; hash kata sandi | Status final; `handled_by` dan `handled_at` terisi; sandi awal berlaku |
| F-07 | Lencana jumlah permintaan reset menunggu | D | Buat 3 permintaan menunggu, buka 4 halaman admin | Angka pada lencana | Angka sama di seluruh halaman admin |
| F-08 | Penugasan satu pengguna dari katalog | T | Uji black-box 5 kasus, termasuk pasangan yang sudah ada | Jumlah baris `assignments` | 5/5 sesuai; kirim ulang tidak menambah baris |
| F-09 | Penugasan massal banyak–banyak | T | 3 aktivitas × 4 pengguna; lalu kirim ulang | Jumlah pasangan | Maksimal 12 pasangan; kirim ulang menambah 0 |
| F-10 | Jumlah penugasan belum dibaca | D | Beri 5 penugasan, buka sisi penerima, tandai dibaca | Angka lencana | 5 → 0 setelah dibaca |
| F-11 | Instruksi langsung oleh admin dan level 1 | T | Uji 8 kasus: peran 0, peran 1, peran 2, penerima admin, penerima kosong, durasi nol, tenggat lampau, sukses | Status HTTP; baris tersimpan | 8/8 sesuai; peran 2 ditolak 403 |
| F-12 | Pemberi tugas tercatat dan tampil di penerima | T | Buat instruksi oleh level 1, buka sisi penerima | `created_by`; teks "Dari" | `created_by` = id pemberi; nama pemberi tampil |
| F-13 | Progres per periode pada sisi pemberi | T | Buat penugasan harian 10 hari lalu tanpa log; buka panel progres | Status kartu; jumlah simpul | Status "Terlambat"; 2 simpul terlewat; kartu di urutan teratas |
| F-14 | Pencabutan instruksi milik sendiri | T | Uji 4 kasus: milik sendiri, milik orang lain, oleh admin, oleh peran 2 | Baris terhapus; pesan | Hanya milik sendiri yang terhapus; lainnya ditolak |
| F-15 | Arsip, pulihkan, hapus permanen | T | Uji 6 kasus termasuk hapus permanen dari tab arsip | Jumlah baris; tampilan tab | 6/6 sesuai; arsip tidak menghapus log |
| F-16 | Daftar tugas periode berjalan terurut | I, D | Bandingkan urutan tampilan dengan aturan 2.1 (terlambat naik, selesai turun) | Urutan kartu | Urutan sesuai aturan pada seluruh filter periode |
| F-17 | Tandai selesai dan batalkan | T | Uji 6 kasus termasuk periode lewat dan klik ganda | Baris `activity_logs` | 6/6 sesuai; klik ganda menghasilkan 1 baris |
| F-18 | Catatan dan tautan bukti per kemunculan | T | Uji 8 kasus: simpan, ubah, kosongkan, tautan `javascript:`, tautan relatif, teks 1001 karakter, catatan bertahan setelah batal selesai | Baris `occurrence_notes`; pesan | 8/8 sesuai; catatan tetap ada setelah status dibatalkan |
| F-19 | Materialisasi periode terlewat | T | Buat penugasan harian 10 hari lalu, buka ruang kerja | Jumlah baris `terlewat`; tanggal | 10 baris; `created_at` = tanggal jatuh tempo periode |
| F-20 | Riwayat lintas periode | D | Buka riwayat untuk 3 tahun berbeda dan tahun tanpa data | Baris tampil; keadaan kosong | Data benar per tahun; tahun kosong menampilkan keadaan kosong, bukan galat |
| F-21 | Peta kontribusi dan tren 14 hari | T | Bandingkan peta dengan kueri hitung manual untuk 12 tanggal uji | Jumlah selesai per sel | 12/12 sel sama dengan hitungan manual |
| F-22 | Beban hari ini: jumlah dan sisa menit | A, T | Jumlahkan menit tugas terbuka hari ini secara manual; bandingkan | Jumlah dan menit | Sama dengan hitungan manual |
| F-23 | Lembur ditolak bila ambang belum tercapai | T | Uji 4 kasus: 0 menit, 59 menit, 60 menit, 75 menit | Pesan; baris tersimpan | 0 dan 59 ditolak; 60 dan 75 diterima |
| F-24 | Pengajuan lembur hari berjalan | T | Uji 8 kasus termasuk tanggal kemarin, jam terbalik, pengajuan ganda, keterangan 501 karakter | Baris `overtime_requests` | 8/8 sesuai; hanya satu baris menunggu per tanggal |
| F-25 | Pembatalan pengajuan sendiri | T | Uji 3 kasus: menunggu, sudah diputuskan, milik orang lain | Baris terhapus | Hanya yang menunggu dan milik sendiri yang terhapus |
| F-26 | Keputusan lembur dengan catatan | T | Uji 4 kasus: setuju, tolak, catatan kosong saat tolak, keputusan ganda | Status; `handled_by` | 4/4 sesuai; keputusan ganda ditolak |
| F-27 | Penolakan otomatis batas waktu diam | T | Set pengajuan berumur 181 menit; buka antrean | Status; `handled_at` | Status `ditolak`; `handled_at` = waktu pengajuan + 180 menit |
| F-28 | Setelan ambang dan batas waktu | T | Ubah ambang ke 90 menit, ulangi F-23 | Pesan; baris tersimpan | Ambang baru berlaku tanpa mulai ulang proses |
| F-29 | Notifikasi keputusan lembur | D | Putuskan pengajuan, buka lonceng pemohon | Angka lonceng; isi | Notifikasi muncul sekali; angka turun setelah dibaca |
| F-30 | CRUD akun dan penetapan jabatan | T | Uji 10 kasus termasuk surel ganda, hapus akun berisi penugasan, jendela batal | Baris `users`; baris turunan | 10/10 sesuai; hapus akun menghapus penugasan dan lognya |
| F-31 | CRUD daftar jabatan | T | Uji 5 kasus termasuk hapus jabatan yang sedang dipakai | Baris `positions`; teks `users.jabatan` | 5/5 sesuai; teks jabatan pada akun tidak berubah |
| F-32 | CRUD pengumuman | T | Uji 5 kasus termasuk judul kosong dan markdown tidak valid | Baris `posts`; tampilan | 5/5 sesuai; judul kosong ditolak |
| F-33 | Ringkasan admin | A, D | Bandingkan cakupan per unit dengan kueri hitung manual | Jumlah pegawai, penugasan, cakupan | Sama dengan hitungan manual; unit "Instruksi" tidak dihitung |
| F-34 | Impor MPP idempoten | T | Impor berkas sama dua kali; lalu impor satu baris berperiode salah | Jumlah aktivitas | Impor kedua menambah 0; baris salah membatalkan seluruh transaksi |
| F-35 | Ringkasan aktivitas pada tabel pengguna | A | Bandingkan angka ringkasan dengan kueri manual untuk 5 pengguna | Jumlah selesai, terlewat, terbuka | 5/5 sama |
| F-36 | Absensi masuk/pulang dalam radius | T | Uji 8 kasus termasuk di dalam radius, di luar radius, akurasi rendah, pulang tanpa masuk, masuk ganda | Baris `attendance_logs`; pesan | 8/8 sesuai; jarak tersimpan sama dengan hitungan haversine manual (toleransi 1 m) |
| F-37 | Penolakan absensi tidak sah | T | Sama dengan F-36 pada sisi negatif | Baris tersimpan | Tidak ada baris tersimpan pada setiap kasus negatif |
| F-38 | Penetapan titik kantor dan radius | T | Uji 5 kasus termasuk radius 9 m, 300 m, 301 m, koordinat di luar Indonesia | Baris `attendance_location`; pesan | Hanya 10–300 m yang diterima; hanya satu baris |
| F-39 | Laporan absensi tiga mode + filter + belum absen | T | Bandingkan rekap harian, bulanan, tahunan dengan kueri manual; uji 6 nilai filter | Jumlah baris; isi | Sama dengan kueri manual; filter meningkatkan presisi tanpa mengubah total |
| F-40 | Ekspor CSV mengikuti tampilan | T | Unduh ekspor tiga mode; buka di Excel berlokal Indonesia | Jumlah kolom dan baris; pemisah | Isi sama dengan halaman; pemisah `;`; karakter non-ASCII benar |
| NF-01 | Ruang kerja 50 tugas ≤ 500 ms p95 | T | 7 permintaan berurutan ke build produksi dengan fixture 50 tugas | p95 | ≤ 500 ms; hasil ukur 207 ms |
| NF-02 | Aksi selesai ≤ 300 ms p95 | T | 9 panggilan aksi berurutan, ukur sampai jawaban diterima | p95 | ≤ 300 ms; hasil ukur 17 ms |
| NF-03 | 50 permintaan serentak, rata-rata ≤ 100 ms | T | 10/25/50 permintaan paralel ke ruang kerja | Rata-rata per permintaan; jumlah galat | ≤ 100 ms; 0 galat; hasil ukur 50 ms, 50/50 berhasil |
| NF-04 | Pemuatan pertama ≤ 250 KB | T | Jumlahkan HTML + CSS + JS terkompresi | KB | ≤ 250 KB; hasil ukur 192 KB |
| NF-05 | Kata sandi hanya sebagai hash bcrypt | I | Periksa dump basis data dan berkas log untuk pola `$2b$` dan teks sandi | Jumlah sandi teks biasa | 0 kolom sandi teks biasa; 0 sandi pada log |
| NF-06 | 100% aksi memeriksa sesi dan peran | I | Telusuri setiap aksi mutasi; panggil 31 aksi tanpa sesi | Jumlah aksi berpelindung | 31/31 menolak tanpa sesi; 0 aksi tanpa pemeriksaan |
| NF-07 | Respons pemulihan seragam | I, T | Bandingkan respons surel terdaftar dan tidak terdaftar | Panjang dan isi respons | Identik; satu permintaan menunggu per akun |
| NF-08 | Validasi masukan dan kueri berparameter | I, T | Kirim 20 muatan tidak sah; telusuri modul data untuk penyambungan teks | Jumlah penolakan; jumlah kueri tak berparameter | 20/20 ditolak; 0 kueri tak berparameter |
| NF-09 | HTTPS dan atribut cookie | I | Periksa header respons dan konfigurasi proksi | Atribut `Set-Cookie`; pengalihan | `HttpOnly`, `SameSite` ada; HTTP dialihkan |
| NF-10 | Akuntabilitas login dan keputusan | T | Lakukan 5 login, 2 keputusan lembur, 2 reset | Baris log | 5 baris login; 2 keputusan ber-`handled_by`; 2 reset ber-`handled_by` |
| NF-11 | Privasi lokasi kehadiran | I, T | Panggil halaman absensi admin dan pegawai dengan peran 1 dan 2 | Isi respons | Peran 1 dan 2 tidak menerima koordinat pegawai lain; 0 aksi menghapus baris kehadiran |
| NF-12 | Ketersediaan ≥ 99% | A | Hitung dari catatan waktu aktif proses selama satu bulan | Persentase | ≥ 99% pada jam layanan |
| NF-13 | WAL, transaksi, dan idempotensi | I, T | Periksa mode jurnal; klik ganda 10 kali pada 5 aksi | Mode jurnal; baris ganda | `wal`; 0 baris ganda |
| NF-14 | RPO ≤ 24 jam, RTO ≤ 30 menit | T | Salin berkas, jalankan proses di port lain, catat waktu sampai jawaban pertama | Detik | ≤ 30 menit; hasil ukur 0,43 detik |
| NF-15 | Skalabilitas vertikal, 50 pengguna serentak | T | Sama dengan NF-03 pada 50 permintaan paralel | Rata-rata; galat | 50 pengguna aktif serentak tanpa galat |
| NF-16 | Skor SUS ≥ 70 | T | Kuesioner SUS kepada ≥ 10 responden mitra setelah UAT | Skor 0–100 | ≥ 70 |
| NF-17 | Tugas pertama selesai tanpa pendampingan | T | 10 pengguna baru, satu tugas, tanpa arahan lisan | Jumlah berhasil | ≥ 8 dari 10 |
| NF-18 | Kontras, ukuran teks, target sentuh, papan ketik | I, T | Ukur kontras dengan alat; tab melalui setiap alur; periksa `aria-label` | Rasio kontras; jumlah alur | Semua teks isi ≥ 4,5:1; target sentuh sesuai UI-01; 5/5 alur selesai dengan papan ketik |
| NF-19 | Tanpa luapan pada 390 px | T | Uji 5 halaman pegawai dan 6 halaman admin pada lebar 390 dan 1366 px | `scrollWidth` vs `clientWidth` | Selisih 0 px pada semua kombinasi |
| NF-20 | Berjalan pada 3 peramban modern | T | Uji alur kritis pada Chrome, Firefox, Safari versi terbaru | Hasil per peramban | 3/3 tanpa galat konsol yang menghentikan alur |
| NF-21 | Mutasi dan kueri terpusat | I | Telusuri modul aksi dan modul data | Jumlah modul penulis | Semua mutasi pada satu modul; 0 kueri tulis di luar modul data |
| NF-22 | Komentar Inggris, teks Indonesia | I | Periksa 20 berkas sumber dan 20 potongan teks antarmuka | Jumlah pelanggaran | 0 komentar berbahasa Indonesia; 0 teks antarmuka berbahasa Inggris |
| UI-01 | Target sentuh 44 px utama, 36 px sekunder | I, T | Ukur kotak setiap kontrol pada 5 halaman pegawai | Piksel | Semua kontrol utama ≥ 44; sekunder ≥ 36; 0 sasaran beririsan |
| UI-02 | Satu ketukan, tanpa muat ulang | D, T | Hitung ketukan dan permintaan dokumen per penandaan | Jumlah ketukan; jumlah muat ulang | 1 ketukan; 0 muat ulang dokumen; ≤ 300 ms |
| UI-03 | Tabel admin tanpa gulir horizontal 1366 px | T | Buka 4 tabel master pada 1366 px | `scrollWidth` | Selisih 0 px |
| UI-04 | Teks isi ≥ 14 px, judul halaman ≥ 20 px, angka ringkasan ≥ 18 px | I | Ukur ukuran huruf terhitung pada 5 layar | Piksel | Semua sesuai ambang; tinggi baris ≥ 1,4 |
| UI-05 | Kontras ≥ 4,5:1 dan ≥ 3:1 | I | Ukur 25 pasangan warna pada tema terang dan gelap | Rasio kontras | 25/25 memenuhi ambang sesuai ukuran teks |
| UI-06 | Tanpa luapan 390 px / 1366 px | T | Sama dengan NF-19 | `scrollWidth` | Selisih 0 px |
| UI-07 | Pesan galat Bahasa Indonesia dan informatif | I, T | Picu 20 galat yang berbeda; periksa teks | Jumlah pesan tidak informatif | 0 pesan memuat kode status, jejak tumpukan, atau nama tabel |
| UI-08 | Seluruh alur dengan papan ketik | T | Selesaikan 5 alur hanya dengan papan ketik | Jumlah alur | 5/5 selesai; fokus selalu terlihat; dialog menahan fokus |
| UI-09 | Status tidak hanya warna | I | Periksa 3 keadaan kartu tugas | Jumlah keadaan tanpa teks | 0; setiap keadaan membawa teks lencana dan `aria-label` |
| UI-10 | Maksimal 2 layar per tugas | I, D | Hitung layar per alur untuk 3 tugas kritis | Jumlah layar | 2 / 1 / 1 sesuai ambang |
| UI-11 | Keadaan sibuk dan pengumuman aksesibel | T | Perlambat jaringan; amati tombol dan `aria-live` | Jumlah aksi tanpa umpan balik | 0 aksi > 400 ms tanpa keadaan sibuk |
| UI-12 | Tanpa JavaScript halaman tetap terbaca, catatan tersimpan | T | Matikan JavaScript; buka ruang kerja; simpan catatan lewat formulir biasa | Jumlah tugas tampil; baris tersimpan | Daftar tugas dan status tampil lengkap; catatan tersimpan 1 baris |

**Temuan awal dari pengukuran 11 November 2026.** Tiga butir belum memenuhi ambangnya pada build
yang diukur, dan dicatat sebagai masukan C300 — bukan disembunyikan:

1. **UI-05 / NF-18** — baris surel pemberi tugas pada kartu memakai warna `slate-400` di atas
   putih, terukur 2,56:1. Teks isi lain lolos (4,76:1 sampai 17,85:1). Tindakan: naikkan ke
   `slate-500` atau hapus baris surel.
2. **UI-01** — tombol centang kartu tugas berukuran 36 × 36 px; masih di atas ambang sekunder,
   tetapi di bawah 44 px yang disarankan untuk aksi utama. Tindakan: putuskan pada C300 apakah
   centang naik ke 44 px atau tetap 36 px dengan area sasaran yang diperluas.
3. **UI-05 pada tema gelap** — belum ada pengukuran kontras tema gelap; hanya tema terang yang
   terukur. Tindakan: ulangi pengukuran kontras pada tema gelap sebelum C500.

## 4.2 Matriks Keterlacakan / Traceability Matrix

Satu baris per masalah C100. Uji cepat yang dipakai: (1) setiap kebutuhan memiliki masalah asal;
(2) setiap masalah memiliki kebutuhan; (3) setiap kebutuhan memiliki baris verifikasi di 4.1.

**Tabel 4.2 Matriks Keterlacakan**

| Masalah C100 | Kebutuhan | Use Case | Verifikasi | Target |
|:---------------------------------------------|:---------------------------------------------|:-----------------------|:---------------------------------------------|:-------------|
| P1 Penugasan tidak tercatat, pemberi dan penerima tidak terlacak | F-01, F-02, F-03, F-04, F-08, F-09, F-10, F-11, F-12, F-13, F-14, F-15, F-16, F-17, F-19, F-22, F-30, F-31, F-32, F-34, UI-02, UI-09 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-06, UC-07, UC-12, UC-14, UC-15 | Uji F-01, F-03, F-08, F-11, F-13, F-17; inspeksi `assignments.created_by` | T1, T2 |
| P2 Bukti pekerjaan tersebar dan tidak melekat pada periode | F-18, F-20, NF-08, UI-02, UI-10 | UC-08, UC-09 | Uji F-18 (8 kasus), F-20; kueri kemunculan selesai bercatatan | T3 |
| P3 Rekap manual, capaian tidak dapat dibandingkan | F-04, F-13, F-19, F-20, F-21, F-33, F-35, NF-01, UI-03, UI-04 | UC-02, UC-05, UC-09, UC-14, UC-15 | Uji F-21, F-33, F-35; ukur NF-01; inspeksi Tabel 2.1 periode baku | T4, T5, T8 |
| P4 Lembur tanpa dasar pekerjaan tercatat | F-23, F-24, F-25, F-26, F-27, F-28, F-29, NF-10, UI-10, UI-11 | UC-10, UC-11 | Uji F-23 sampai F-29; kueri pengajuan tanpa menit pendukung | T6 |
| P5 Pemulihan akun bergantung pada satu orang | F-01, F-05, F-06, F-07, F-30, NF-05, NF-07, UI-07 | UC-01, UC-12, UC-13 | Uji F-05, F-06, F-07; inspeksi `password_reset_requests` | T7 |
| P6 Kehadiran tidak tercatat dan tidak dapat dipertanggungjawabkan | F-36, F-37, F-38, F-39, F-40, NF-11, UI-06, UI-10 | UC-16, UC-17 | Uji F-36 sampai F-40; kueri baris absensi tanpa koordinat atau jarak | T9, T10 |
| Lintas masalah — mutu teknis yang berlaku pada P1–P6 | NF-02, NF-03, NF-04, NF-06, NF-09, NF-12, NF-13, NF-14, NF-15, NF-16, NF-17, NF-18, NF-19, NF-20, NF-21, NF-22, UI-01, UI-05, UI-08, UI-12 | Seluruh UC | Uji NF-02 sampai NF-22 dan UI-01, UI-05, UI-08, UI-12 pada Tabel 4.1 | T2, T4, T6 |

**Pemeriksaan kelengkapan.** 40 kode F, 22 kode NF, dan 12 kode UI seluruhnya memiliki baris pada
Tabel 4.1. Setiap kode juga muncul pada Tabel 4.2: kode yang terikat satu masalah berada pada baris
P1–P6, sedangkan kode mutu teknis yang berlaku pada seluruh masalah dikumpulkan pada baris "lintas
masalah". Sebaliknya, enam masalah C100 seluruhnya memiliki kebutuhan dan target, sehingga tidak ada
masalah yang berhenti sebagai keluhan tanpa penanganan.

---

# BAB 5 RENCANA PROYEK

## 5.1 Matriks RACI Lintas Lab / Cross-Lab RACI Matrix

Keterangan: **R** mengerjakan, **A** penanggung jawab akhir (tepat satu per baris), **C**
dikonsultasi, **I** diinformasikan.

**Tabel 5.1 Matriks RACI**

| Paket kerja | Anggota 1 (RPL) | Anggota 2 (RPL) | Anggota 3 (Sistem Informasi) | Mitra |
|:------------------------|:--------------------:|:--------------------:|:----------------------------------------:|:------------:|
| Spesifikasi & komunikasi mitra | **A** | R | C | C |
| Desain UI & uji usability | C | **A** | R | C |
| Model data, laporan & dasbor | R | C | **A** | I |
| Backend & API | **A** | R | C | I |
| Keamanan, deployment & pencadangan | R | **A** | I | I |
| Pengujian & UAT (C500) | C | C | R | **A** |
| Pelatihan & serah terima | R | C | C | **A** |
| Dokumentasi & Lampiran | R | R | **A** | I |

Nama anggota dan laboratorium diisi pada saat pengumpulan (`[Nama Anggota 1]` dan seterusnya);
pembagian kolom di atas mengikuti kompetensi lab masing-masing, bukan beban kerja yang sama rata.
Setiap baris memiliki tepat satu **A**.

## 5.2 Jadwal Pelaksanaan hingga C500 / Schedule up to C500

Jadwal disusun dalam 16 pertemuan (P1–P16). Setiap tugas berdurasi ≤ 1 minggu. Buffer 15%
disisipkan pada P14 dan P16 untuk debugging, revisi mitra, dan integrasi.

**Tabel 5.2 Gantt Chart (P = Pertemuan/Minggu)**

| Aktivitas | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | P11 | P12 | P13 | P14 | P15 | P16 |
|:-------------------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Analisis masalah mitra (C100) | ■ | ■ | | | | | | | | | | | | | | |
| Elisitasi & spesifikasi (C200) | | ■ | ■ | ■ | | | | | | | | | | | | |
| Perancangan (C300) | | | | ■ | ■ | ■ | | | | | | | | | | |
| Implementasi inkremen 1 | | | | | | ■ | ■ | ■ | | | | | | | | |
| Implementasi inkremen 2 | | | | | | | | | ■ | ■ | | | | | | |
| Deployment & migrasi data (C400) | | | | | | | | | | ■ | ■ | | | | | |
| Uji fungsional & keamanan | | | | | | | | | | | ■ | ■ | | | | |
| Uji beban & usability (SUS) | | | | | | | | | | | | ■ | ■ | | | |
| UAT mitra & ukur target (C500) | | | | | | | | | | | | | ■ | ■ | | |
| Pelatihan, serah terima, presentasi akhir | | | | | | | | | | | | | | | ■ | ■ |
| Buffer (debugging, revisi mitra, integrasi) | | | | | | | | | | | | | | ■ | | ■ |

**Tabel 5.3 Rincian Tugas Mingguan**

| No | Tugas (≤ 1 minggu) | Minggu | Keluaran | PJ (R/A) |
|:------------:|:-----------------------------------------|:------------:|:----------------|:---------------------|
| 1 | Wawancara mitra, observasi, dan verifikasi masalah | P1 | Draf masalah P1–P6 | Anggota 1 / Anggota 1 |
| 2 | Penyusunan ruang lingkup dan batasan sistem | P2 | Draf 2.1–2.2 | Anggota 1 / Anggota 1 |
| 3 | Perumusan kebutuhan fungsional + prioritas MoSCoW | P2 | Tabel 2.1, 2.2 | Anggota 3 / Anggota 3 |
| 4 | Skenario use case dan activity diagram | P3 | 2.3.2.1–2.3.2.3 | Anggota 3 / Anggota 3 |
| 5 | Kebutuhan data, ERD, kamus data | P3 | 2.4 | Anggota 3 / Anggota 3 |
| 6 | Kebutuhan non-fungsional dan pengukuran awal | P4 | 2.5, Lampiran G | Anggota 2 / Anggota 2 |
| 7 | Kebutuhan antarmuka dan persona | P4 | Bab 3, 2.7 | Anggota 2 / Anggota 2 |
| 8 | Rencana verifikasi dan matriks keterlacakan | P5 | Bab 4 | Anggota 1 / Anggota 1 |
| 9 | Rencana proyek: RACI, jadwal, biaya, risiko | P5 | Bab 5 | Anggota 1 / Anggota 1 |
| 10 | Pemeriksaan kelengkapan C200 dan revisi pembimbing | P6 | C200 final | Anggota 1 / Anggota 1 |
| 11 | Perancangan basis data fisik dan kontrak aksi | P6 | Draf C300 bab 3 | Anggota 3 / Anggota 3 |
| 12 | Perancangan antarmuka dan komponen | P7 | Draf C300 bab 4 | Anggota 2 / Anggota 2 |
| 13 | Implementasi inkremen 1: autentikasi, master, penugasan | P8–P9 | Rilis internal 1 | Anggota 1 / Anggota 1 |
| 14 | Implementasi inkremen 2: ruang kerja, lembur, absensi | P10–P11 | Rilis internal 2 | Anggota 1 / Anggota 1 |
| 15 | Migrasi data MPP dan verifikasi mitra | P11 | Katalog terverifikasi | Anggota 3 / Anggota 3 |
| 16 | Uji fungsional dan keamanan | P12 | Laporan uji | Anggota 2 / Anggota 2 |
| 17 | Uji beban dan usability (SUS) | P13 | Skor NF-03, NF-16 | Anggota 2 / Anggota 2 |
| 18 | UAT mitra dan pengukuran target T1–T10 | P14 | C500 draf | Anggota 3 / Anggota 3 |
| 19 | Pelatihan admin dan serah terima | P15 | Berita acara serah terima | Anggota 1 / Anggota 1 |

## 5.3 Estimasi Biaya / Cost Estimate

Batas anggaran mitra (C100): tidak ada anggaran perangkat lunak berulang; server dan jaringan sudah
tersedia, dan pengeluaran baru harus kecil serta dapat disetujui admin unit kerja. Karena itu seluruh
komponen pengembangan bernilai nol rupiah dan hanya operasional yang dihitung.

**Tabel 5.4 Estimasi Biaya**

| Komponen | Satuan | Perkiraan (Rp) | Ditanggung | Sumber & tanggal cek harga |
|:--------------------|:-------------|:--------------------|:--------------|:---------------------------------------------|
| Server/hosting | /bulan | 0 | Unit kerja | Server unit kerja sudah tersedia (C100 Tabel 6), 11 Nov 2026 |
| Nama domain | /tahun | 150.000 | Unit kerja | Kisaran pasar registrar Indonesia; **belum diverifikasi**, cek H-1 pengumpulan |
| Sertifikat TLS | /tahun | 0 | — | Lembaga sertifikat gratis, 11 Nov 2026 |
| Layanan notifikasi | /bulan | 0 | — | Tidak dipakai (notifikasi tarik), 11 Nov 2026 |
| Kuota internet uji lapangan | /orang (sekali) | 50.000 | Tim | Paket data 10 GB; **belum diverifikasi**, cek H-1 pengumpulan |
| Pelatihan & bahan cetak | paket (sekali) | 100.000 | Unit kerja | Cetak panduan 10 eksemplar; **belum diverifikasi** |
| Lisensi perangkat lunak | /tahun | 0 | — | Seluruhnya perangkat lunak terbuka, 11 Nov 2026 |
| **Total biaya berulang per bulan** | | **12.500** | | Memenuhi batas anggaran mitra? **Ya** |
| **Total biaya sekali keluar** | | **300.000** | | 150.000 domain + 3 × 50.000 kuota uji |

Perhitungan: domain Rp 150.000/tahun = Rp 12.500/bulan. Biaya sekali keluar tidak dihitung sebagai
biaya berulang karena hanya terjadi pada tahun pertama.

Tiga baris bertanda *belum diverifikasi* sengaja dibiarkan terbuka: harganya bergerak dan C200 tidak
boleh memuat angka yang tidak dapat dipertanggungjawabkan. Ketiganya wajib dicek ulang pada hari
sebelum pengumpulan, dan tanggal pengecekan dicatat pada kolom terakhir.

## 5.4 Risiko dan Mitigasi / Risks and Mitigation

Kemungkinan (**R** rendah / **S** sedang / **T** tinggi).

**Tabel 5.5 Risiko dan Mitigasi**

| Risiko | Kemungkinan | Dampak | Mitigasi | PJ |
|:---------------------------------------------|:--------------:|:------------------------------------|:---------------------------------------------|:-------------|
| Mitra sulit ditemui | S | Validasi terlambat, aturan bisnis berubah di akhir | Pertemuan mingguan tetap; notulen dibagikan hari yang sama; keputusan tertulis di grup | Anggota 1 |
| Data MPP tidak konsisten antar lembar (header bergeser, periode tidak baku) | T | Katalog salah, capaian tidak dapat dibandingkan | Parser memvalidasi setiap baris; impor idempoten; verifikasi jumlah baris per unit bersama admin | Anggota 3 |
| Basis data satu berkas rusak atau hilang | R | Seluruh data hilang | WAL; salinan harian ke media terpisah; uji pemulihan sekali sebelum serah terima (RTO 30 menit) | Anggota 2 |
| Kebijakan lokasi peramban berubah atau ditolak pengguna | S | Absensi tidak dapat dicatat | Pesan yang menjelaskan asal aman dan izin; absensi tidak menjadi syarat penyelesaian tugas | Anggota 2 |
| Pengguna menolak mencatat pekerjaan harian sehingga data kosong | S | Target T3 dan T4 tidak tercapai | Onboarding singkat; beban hari ini tampil di atas; laporan capaian dipakai pada penilaian periode | Anggota 1 |
| Anggota tim berhalangan pada masa uji | S | Jadwal uji bergeser | Buffer 15% pada P14 dan P16; tugas uji dapat dijalankan satu orang karena prosedurnya tertulis | Anggota 3 |
| Cakupan meluas di tengah implementasi | T | C200 tidak lagi cocok dengan produk yang didemokan | Tabel 2.2 (Won't) dijadikan pagar; fitur baru masuk daftar tunggu rilis berikutnya | Anggota 1 |
| Penolakan penggunaan karena kebiasaan lama (lembar kerja) | S | Sistem tidak terpakai setelah serah terima | Pelatihan admin dan satu pelaksana; katalog dan penugasan awal disiapkan bersama pada hari serah terima | Mitra |
| Ketergantungan pada satu admin untuk reset dan keputusan lembur | T | Layanan berhenti saat admin tidak ada | Antrean terlihat di seluruh halaman admin; batas waktu diam lembur berjalan otomatis | Anggota 1 |

---

# LAMPIRAN / APPENDICES

## Lampiran A. Notulen Elisitasi dengan Mitra / Partner Elicitation Minutes

Tujuh sesi elisitasi menjadi sumber seluruh aturan bisnis dan angka target pada dokumen ini.
Kolom "Dipakai di" menautkan setiap sesi ke bagian dokumen yang bersangkutan, sehingga setiap
angka dapat ditelusuri. Paraf mitra dibubuhkan pada kolom terakhir saat pengumpulan.

| Sesi | Tanggal | Peserta | Pokok bahasan | Keputusan | Dipakai di | Paraf |
|:------------:|:-------------|:--------------------------|:------------------------|:---------------------------------------------|:----------------------|:------------:|
| 1 | 21 Okt 2026 | Admin unit, 2 pelaksana, tim | Kondisi awal: lembar kerja, penugasan lisan, rekap manual | Masalah P1–P5 diterima; bukti harus melekat pada periode, bukan pada folder | 2.1, 2.3, Bab 1 | |
| 2 | 28 Okt 2026 | Admin unit, atasan langsung, tim | Siklus kerja dan penurunan periode | Tujuh periode baku; satu definisi aktivitas berlaku berulang; kemunculan hanya boleh ditandai pada periodenya sendiri | 2.1, 2.3, Gambar 2.3 | |
| 3 | 30 Okt 2026 | Admin unit, pelaksana, tim | Bukti pekerjaan | Catatan dan tautan berdiri sendiri dari status; catatan bertahan walau penyelesaian dibatalkan | F-18, Gambar 2.3 | |
| 4 | 2 Nov 2026 | Admin unit, atasan langsung, tim | Instruksi langsung dan hak akses | Hanya peran 0 dan 1 boleh memberi instruksi; penerima selalu non-admin; instruksi identik dipakai ulang | F-11, F-12, Gambar 2.4 | |
| 5 | 4 Nov 2026 | Admin unit, tim | Lembur | Ambang menit awal 60; batas waktu diam 180 menit; satu pengajuan menunggu per tanggal; hanya tanggal hari ini | F-23–F-28, Gambar 2.5 | |
| 6 | 6 Nov 2026 | Admin unit, pelaksana, tim | Absensi | Satu titik kantor; radius 10–300 m; jarak dihitung server; satu kejadian per jenis per hari; tanpa selfie dan tanpa persentase kehadiran | F-36–F-40, P6, Gambar 2.6, Lampiran G | |
| 7 | 6 Nov 2026 | Admin unit, satu pelaksana | Validasi wireframe | Cakupan per unit dinaikkan; tombol centang diperbesar dan dipisah dari tautan catatan; status ditulis sebagai kata, bukan warna saja | 3.1.1 (UI-01, UI-09), 3.1.3 | |

Sesi 7 adalah validasi wireframe dan dihitung sebagai satu dari dua pengguna mitra yang disyaratkan
template (3.1.3): dua peserta dari dua peran berbeda, diwawancara terpisah pada hari yang sama.

## Lampiran B. Dokumentasi Observasi / Observation Photos

Observasi dilakukan di ruang unit kerja pada 28 Oktober 2026 dan 4 November 2026, masing-masing
± 90 menit, mengamati cara kerja saat ini tanpa mengubahnya.

| No | Berkas | Isi yang ditunjukkan | Dipakai di |
|:------------:|:-------------|:---------------------------------------------|:--------------|
| B-1 | `[berkas foto]` | Lembar kerja MPP tercetak dengan tanda tangan manual | 2.1, 2.4.1 |
| B-2 | `[berkas foto]` | Dua pegawai menyalin capaian dari lembar kerja ke rekap | P3, T4 |
| B-3 | `[berkas foto]` | Percakapan grup pesan berisi penugasan lisan | P1, P2 |
| B-4 | `[berkas foto]` | Buku absen kertas di meja depan | P6, F-36 |
| B-5 | `[berkas foto]` | Rekap lembur manual pada lembar kerja terpisah | P4, F-23 |

Berkas foto disimpan di repositori proyek dan disisipkan pada versi cetak dokumen ini.

## Lampiran C. Kode Diagram / Diagram Source Code

Template menyarankan PlantUML. Dokumen ini memakai **Mermaid**, dengan alasan yang dicatat: Mermaid
dirender otomatis pada peninjauan berbasis Markdown dan versi sumbernya terbaca langsung tanpa
perkakas tambahan. Berkas sumber disertakan di repositori, sehingga diagram dapat dibangun ulang
kapan saja.

Cara membangun ulang seluruh gambar:

```bash
bun add @mermaid-js/mermaid-cli          # sekali, di direktori kerja terpisah
cd c200/diagram
for f in *.mmd; do
  n=$(basename "$f" .mmd)
  mmdc -i "$f" -o "img/$n.png" -c mermaid.json -b white -s 2
  mmdc -i "$f" -o "img/$n.svg" -c mermaid.json -b white
done
```

| No | Berkas sumber | Hasil render | Gambar |
|:------------:|:--------------------------------------|:-----------------------------|:-------------|
| C-1 | `c200/diagram/konteks.mmd` | `img/konteks.png`, `.svg` | Gambar 2.1 |
| C-2 | `c200/diagram/arsitektur.mmd` | `img/arsitektur.png`, `.svg` | Gambar 2.9 |
| C-3 | `c200/diagram/sequence-selesai.mmd` | `img/sequence-selesai.png`, `.svg` | Gambar 2.10 |
| C-4 | `c200/diagram/usecase.mmd` | `img/usecase.png`, `.svg` | Gambar 2.2 |
| C-5 | `c200/diagram/activity-selesai.mmd` | `img/activity-selesai.png`, `.svg` | Gambar 2.3 |
| C-6 | `c200/diagram/activity-instruksi.mmd` | `img/activity-instruksi.png`, `.svg` | Gambar 2.4 |
| C-7 | `c200/diagram/activity-lembur.mmd` | `img/activity-lembur.png`, `.svg` | Gambar 2.5 |
| C-8 | `c200/diagram/activity-absensi.mmd` | `img/activity-absensi.png`, `.svg` | Gambar 2.6 |
| C-9 | `c200/diagram/activity-reset.mmd` | `img/activity-reset.png`, `.svg` | Gambar 2.7 |
| C-10 | `c200/diagram/erd.mmd` | `img/erd.png`, `.svg` | Gambar 2.8 |
| C-11 | `c200/diagram/userflow-ruangkerja.mmd` | `img/userflow-ruangkerja.png` | Gambar 3.1 |
| C-12 | `c200/diagram/userflow-lembur.mmd` | `img/userflow-lembur.png` | Gambar 3.2 |
| C-13 | `c200/diagram/userflow-absensi.mmd` | `img/userflow-absensi.png` | Gambar 3.3 |
| C-14 | `c200/diagram/wireframe-ruangkerja.mmd` | `img/wireframe-ruangkerja.png` | Gambar 3.4 |
| C-15 | `c200/diagram/wireframe-dasbor.mmd` | `img/wireframe-dasbor.png` | Gambar 3.5 |
| C-16 | `c200/diagram/wireframe-absensi.mmd` | `img/wireframe-absensi.png` | Gambar 3.6 |
| C-17 | `c200/diagram/deployment.mmd` | `img/deployment.png`, `.svg` | — (acuan C300) |
| C-18 | `c200/diagram/mermaid.json` | — | Tema render bersama |

Satu berkas tambahan, `c200/diagram/deployment.mmd`, sudah dibuat tetapi belum dipakai sebagai
gambar bernomor pada dokumen ini; ia disiapkan untuk Bab 3 C300.

## Lampiran D. Learning Log Individu (CPMK072) / Individual Learning Log

Diisi setiap anggota setiap minggu, satu berkas per anggota. Kolom "P4/P5/P6" merujuk capaian
pembelajaran program studi. Baris di bawah adalah format wajib dan contoh pengisian untuk satu
minggu; sisanya diisi pada saat pengumpulan.

**Format**

| Minggu | Tanggal | Anggota | Yang dikerjakan | Yang dipelajari | Bukti | P4 | P5 | P6 |
|:------------:|:-------------|:---------------|:---------------------|:---------------------------------------------|:-------------|:------------:|:------------:|:------------:|
| P1 | 21 Okt 2026 | `[Nama Anggota 1]` | Wawancara mitra | Cara memisahkan keluhan dari kebutuhan: keluhan menyebut gejala, kebutuhan menyebut besaran yang dapat diuji | Notulen sesi 1 | ✓ | | |
| P2 | 28 Okt 2026 | `[Nama Anggota 1]` | Ruang lingkup dan batasan | Batasan yang ditulis eksplisit mencegah ekspektasi keliru lebih baik daripada janji fitur | Draf 2.2 | | ✓ | |
| P3 | 30 Okt 2026 | `[Nama Anggota 3]` | Kebutuhan data dan ERD | Kunci primer gabungan memisahkan catatan dari status, sehingga catatan bertahan saat status dibatalkan | Draf 2.4 | | | ✓ |
| P4 | 4 Nov 2026 | `[Nama Anggota 2]` | Pengukuran NFR | Angka yang tidak diukur akan diganti kata "cepat", dan kata itu tidak dapat diverifikasi | Lampiran G | | ✓ | ✓ |
| P5 | 6 Nov 2026 | `[Nama Anggota 2]` | Validasi wireframe | Dua pengguna dengan peran berbeda menemukan masalah berbeda pada layar yang sama | 3.1.3, Lampiran A sesi 7 | ✓ | | |
| P6 | 11 Nov 2026 | `[Nama Anggota 1]` | Pemeriksaan kelengkapan | Keterlacakan P→F→UC→verifikasi→target menemukan kebutuhan yang tidak dapat dibuktikan | 4.2 | | ✓ | ✓ |

## Lampiran E. Logbook Kelompok (CPMK111, CPMK112) / Team Logbook

Satu baris per pertemuan, ditandatangani koordinator kelompok. Tabel di bawah memuat baris yang
sudah terjadi sampai C200; baris berikutnya ditambahkan setiap minggu.

| No | Tanggal | Nama | Aktivitas | Durasi | Bagian dokumen | Paraf |
|:------------:|:-------------|:-------------|:-------------------------------------------|:------------:|:--------------------|:------------:|
| 1 | 21 Okt 2026 | Tim | Elisitasi sesi 1 dan pencatatan masalah | 2,0 jam | Bab 1, 2.3 | |
| 2 | 28 Okt 2026 | Tim | Observasi lapangan dan elisitasi sesi 2 | 3,0 jam | 2.1, 2.4.1 | |
| 3 | 30 Okt 2026 | Tim | Penyusunan ruang lingkup, batasan, dan tabel Won't | 2,5 jam | 2.2, 2.3 | |
| 4 | 2 Nov 2026 | Tim | Skenario use case dan activity diagram | 3,5 jam | 2.3.2 | |
| 5 | 4 Nov 2026 | Tim | Kebutuhan data, ERD, kamus data, NFR | 4,0 jam | 2.4, 2.5 | |
| 6 | 6 Nov 2026 | Tim | Kebutuhan antarmuka, persona, validasi wireframe | 3,0 jam | Bab 3, 2.7 | |
| 7 | 11 Nov 2026 | Tim | Pengukuran build produksi dan penulisan Bab 4–5 | 5,0 jam | Bab 4, Bab 5, Lampiran G | |

## Lampiran F. Daftar Periksa Sebelum Pengumpulan / Submission Checklist

Diisi ulang pada hari pengumpulan. Status per 11 November 2026.

| # | Syarat | Status | Bukti / catatan |
|:------------:|:---------------------------------------------|:------------:|:---------------------------------|
| 1 | Nomor dokumen, nomor revisi, dan nama berkas sesuai format | ⬜ | Menunggu kode kelompok dan nomor revisi dari koordinator |
| 2 | Tanda tangan pengusul, pembimbing 1, pembimbing 2, perwakilan mitra | ⬜ | Menunggu tanda tangan basah |
| 3 | Setiap kebutuhan memiliki kode, masalah asal, dan prioritas | ✅ | Tabel 2.1 (F-01…F-40, kolom Masalah dan Prioritas) |
| 4 | Tidak ada kata ambigu tanpa angka | ✅ | Angka terukur bertanda Lampiran G; tidak ada "cepat", "mudah", "aman" tanpa besaran |
| 5 | Tidak ada pilihan teknologi sebagai spesifikasi | ✅ | 2.5.5 dan 2.6 menyatakan kandidat, bukan kewajiban |
| 6 | Setiap use case Must memiliki ≥ 2 alur negatif | ✅ | Tabel 2.20–2.36 |
| 7 | Kebutuhan data mencakup volume, retensi, keamanan, migrasi awal | ✅ | D-01…D-09, 2.4.1 |
| 8 | Setiap kode F/NF/UI ada pada tabel rencana verifikasi | ✅ | Tabel 4.1 (74 baris: 40 F + 22 NF + 12 UI) |
| 9 | Matriks keterlacakan lengkap tanpa baris kosong | ✅ | Tabel 4.2 |
| 10 | Jadwal sampai C500, RACI, biaya, risiko tersedia | ✅ | 5.1–5.4 |
| 11 | Lampiran lengkap | 🟡 | A, C, E, G lengkap; B menunggu berkas foto, D menunggu minggu P7–P16 |
| 12 | Seluruh kotak petunjuk dan baris contoh dihapus; daftar isi diperbarui | ✅ | — |
| 13 | Harga pada 5.3 diverifikasi ulang dengan tanggal pengecekan | ⬜ | Cek H-1 pengumpulan |
| 14 | Dokumen diekspor ke PDF dan jumlah halaman dicatat | ⬜ | Menunggu versi final |

## Lampiran G. Log Pengukuran / Measurement Log

Seluruh angka `[UKUR]` pada dokumen ini berasal dari satu sesi pengukuran, bukan perkiraan.

**Kondisi pengukuran**

| Butir | Isi |
|:-------------|:---------------------------------------------|
| Tanggal | 11 November 2026, 13.43–14.10 WIB |
| Build | Build produksi (`astro build`, keluaran `dist/server/entry.mjs`), bukan server pengembangan |
| Proses | Satu proses Node.js 22, `PORT=4399`, `HOST=127.0.0.1`, akses lokal tanpa jaringan luar |
| Perangkat | Intel Core i7-1068NG7 @ 2,30 GHz, macOS, penyimpanan internal |
| Data | 7 pengguna, 223 jenis aktivitas, 9 penugasan, 22 baris `activity_logs`, 6 baris `attendance_logs`, berkas basis data 316 KB |
| Fixture beban | Pengguna uji dengan 50 penugasan bulanan aktif (dibuat khusus, dihapus setelah pengukuran) |
| Alat | Skrip Node.js: 7 permintaan berurutan untuk p95, 10/25/50 permintaan paralel untuk kapasitas, agregasi HTML + aset untuk ukuran transfer |

**Hasil**

| # | Besaran | Nilai terukur | Dipakai di |
|:------------:|:-----------------------------|:-----------------------------|:--------------|
| G-1 | Ruang kerja, 50 kemunculan tugas | p95 207 ms; median 193 ms; min 182 ms | NF-01, 2.5.1 |
| G-2 | Ruang kerja, beban normal | p95 82 ms; median 66 ms | 2.5.1 |
| G-3 | Aksi penandaan selesai | p95 17 ms; median 14 ms | NF-02 |
| G-4 | Aksi pembatalan selesai | p95 15 ms; median 4 ms | 2.5.1 |
| G-5 | 50 permintaan serentak ruang kerja | rata-rata 50 ms per permintaan; 50/50 berhasil | NF-03, NF-15 |
| G-6 | 50 permintaan serentak laporan absensi | rata-rata 56 ms per permintaan; 50/50 berhasil | NF-03 |
| G-7 | Pemuatan pertama ruang kerja (50 tugas) | 192 KB terkompresi (HTML 123 KB + 10 aset) | NF-04, 3.4 |
| G-8 | Pemuatan pertama halaman absensi | 178 KB terkompresi (HTML 40 KB + 9 aset) | 3.4 |
| G-9 | Pemuatan pertama dasbor admin | 126 KB terkompresi | 3.4 |
| G-10 | Pemuatan pertama halaman masuk | 83 KB terkompresi | 3.4 |
| G-11 | Waktu boot sampai jawaban pertama | 0,43 detik | NF-14 |
| G-12 | Ukuran berkas basis data | 316 KB, 14 tabel | D-04 |
| G-13 | Jumlah aksi mutasi | 31 aksi | NF-06 |
| G-14 | Kontras teks isi pada tema terang | 17,85:1 (utama) sampai 4,76:1 (sekunder); satu baris 2,56:1 | 4.1 temuan, UI-05 |

**Batas pengukuran yang diakui.** Pengukuran dilakukan pada satu mesin lokal, bukan pada server mitra,
dan tanpa latensi jaringan. Angka NF-01 sampai NF-04 karenanya berlaku sebagai batas atas yang
optimistis: pada server mitra dengan sambungan internet, waktu tanggap akan lebih tinggi dan angka
tersebut perlu diukur ulang pada C500. Pengukuran konkurensi memakai satu akun dan satu cookie, bukan
50 sesi berbeda, sehingga beban kerja per permintaan lebih ringan daripada kondisi sebenarnya.
