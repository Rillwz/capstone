# C200 — Lampiran A–F

> Berkas lampiran untuk `C200.md` (Spesifikasi Produk "Umsura Assignment"). Dokumen utama memuat
> Bab 1–5 dan Lampiran G; berkas ini memuat Lampiran A–F sesuai template C200 S1 Informatika.
> Nomor tabel dan gambar mengikuti dokumen utama.

---

## Lampiran A. Notulen Elisitasi dengan Mitra / Partner Elicitation Minutes

Tujuh sesi elisitasi menjadi sumber seluruh aturan bisnis dan angka target pada dokumen ini. Kolom
"Dipakai di" menautkan setiap sesi ke bagian dokumen yang bersangkutan, sehingga setiap angka dapat
ditelusuri. Paraf mitra dibubuhkan pada kolom terakhir saat pengumpulan.

| Sesi | Tanggal | Peserta | Pokok bahasan | Keputusan | Dipakai di | Paraf |
|:----:|:------------|:--------------------------|:-----------------------|:-------------------------------------|:-----------------------|:-----:|
| 1 | 21 Okt 2026 | Admin unit, 2 pelaksana, tim | Kondisi awal: lembar kerja, penugasan lisan, rekap manual | Masalah P1–P5 diterima; bukti harus melekat pada periode, bukan pada folder | 2.1, 2.3, Bab 1 | |
| 2 | 28 Okt 2026 | Admin unit, atasan langsung, tim | Siklus kerja dan penurunan periode | Tujuh periode baku; satu definisi aktivitas berlaku berulang; kemunculan hanya boleh ditandai pada periodenya sendiri | 2.1, 2.3, Gambar 2.3 | |
| 3 | 30 Okt 2026 | Admin unit, pelaksana, tim | Bukti pekerjaan | Catatan dan tautan berdiri sendiri dari status; catatan bertahan walau penyelesaian dibatalkan | F-18, Tabel 2.8, Gambar 2.3 | |
| 4 | 2 Nov 2026 | Admin unit, atasan langsung, tim | Instruksi langsung dan hak akses | Hanya peran 0 dan 1 boleh memberi instruksi; penerima selalu non-admin; instruksi identik dipakai ulang | F-11, F-12, Tabel 2.6 | |
| 5 | 4 Nov 2026 | Admin unit, tim | Lembur | Ambang menit awal 60; batas waktu diam 180 menit; satu pengajuan menunggu per tanggal; hanya tanggal hari ini | F-23–F-28, Tabel 2.6 | |
| 6 | 6 Nov 2026 | Admin unit, pelaksana, tim | Absensi | Satu titik kantor; radius 10–300 m; jarak dihitung server; satu kejadian per jenis per hari; tanpa selfie dan tanpa persentase kehadiran | F-36–F-40, Tabel 2.6, Lampiran G | |
| 7 | 6 Nov 2026 | Admin unit, satu pelaksana | Validasi wireframe | Cakupan per unit dinaikkan; tombol centang diperbesar dan dipisah dari tautan catatan; status ditulis sebagai kata, bukan warna saja | UI-01, UI-09, 3.1.3 | |

Sesi 7 adalah validasi wireframe dan dihitung sebagai satu dari dua pengguna mitra yang disyaratkan
template (3.1.3): dua peserta dari dua peran berbeda, diwawancara terpisah pada hari yang sama.

---

## Lampiran B. Dokumentasi Observasi / Observation Photos

Observasi dilakukan di ruang unit kerja pada 28 Oktober 2026 dan 4 November 2026, masing-masing
± 90 menit, mengamati cara kerja saat ini tanpa mengubahnya.

| No | Berkas | Isi yang ditunjukkan | Dipakai di |
|:----:|:----------------|:-----------------------------------|:-------------|
| B-1 | `[berkas foto]` | Lembar kerja MPP tercetak dengan tanda tangan manual | 2.1, 2.4.1 |
| B-2 | `[berkas foto]` | Dua pegawai menyalin capaian dari lembar kerja ke rekap | P3, T4 |
| B-3 | `[berkas foto]` | Percakapan grup pesan berisi penugasan lisan | P1, P2 |
| B-4 | `[berkas foto]` | Buku absen kertas di meja depan | P6, F-36 |
| B-5 | `[berkas foto]` | Rekap lembur manual pada lembar kerja terpisah | P4, F-23 |

Berkas foto disimpan di repositori proyek dan disisipkan pada versi cetak dokumen ini.

---

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

**Tabel C.1 Berkas Sumber Diagram**

| No | Berkas sumber | Hasil render | Dipakai sebagai |
|:----:|:--------------------------------------|:-----------------------------|:---------------------|
| C-1 | `c200/diagram/konteks.mmd` | `img/konteks.png`, `.svg` | Gambar 2.1 |
| C-2 | `c200/diagram/usecase.mmd` | `img/usecase.png`, `.svg` | Gambar 2.2 |
| C-3 | `c200/diagram/activity-selesai.mmd` | `img/activity-selesai.png`, `.svg` | Gambar 2.3 |
| C-4 | `c200/diagram/erd.mmd` | `img/erd.png`, `.svg` | Gambar 2.4 |
| C-5 | `c200/diagram/arsitektur.mmd` | `img/arsitektur.png`, `.svg` | Gambar 2.5 |
| C-6 | `c200/diagram/userflow-ruangkerja.mmd` | `img/userflow-ruangkerja.png` | Gambar 3.1 |
| C-7 | `c200/diagram/activity-instruksi.mmd` | `img/activity-instruksi.png`, `.svg` | 2.3.2.3 (narasi) |
| C-8 | `c200/diagram/activity-lembur.mmd` | `img/activity-lembur.png`, `.svg` | 2.3.2.3 (narasi) |
| C-9 | `c200/diagram/activity-absensi.mmd` | `img/activity-absensi.png`, `.svg` | 2.3.2.3 (narasi) |
| C-10 | `c200/diagram/activity-reset.mmd` | `img/activity-reset.png`, `.svg` | 2.3.2.3 (narasi) |
| C-11 | `c200/diagram/userflow-lembur.mmd` | `img/userflow-lembur.png` | 3.1.2 (narasi) |
| C-12 | `c200/diagram/userflow-absensi.mmd` | `img/userflow-absensi.png` | 3.1.2 (narasi) |
| C-13 | `c200/diagram/wireframe-ruangkerja.mmd` | `img/wireframe-ruangkerja.png` | 3.1.3 (narasi) |
| C-14 | `c200/diagram/wireframe-dasbor.mmd` | `img/wireframe-dasbor.png` | 3.1.3 (narasi) |
| C-15 | `c200/diagram/wireframe-absensi.mmd` | `img/wireframe-absensi.png` | 3.1.3 (narasi) |
| C-16 | `c200/diagram/sequence-selesai.mmd` | `img/sequence-selesai.png`, `.svg` | — (acuan C300) |
| C-17 | `c200/diagram/deployment.mmd` | `img/deployment.png`, `.svg` | — (acuan C300) |
| C-18 | `c200/diagram/mermaid.json` | — | Tema render bersama |

Diagram C-7 sampai C-15 dirender dan disimpan di repositori, tetapi pada dokumen utama hanya
diringkas sebagai narasi agar jumlah halaman terkendali; sumbernya tetap lengkap dan dapat dirujuk.
Diagram C-16 dan C-17 disiapkan untuk Bab 3 C300.

---

## Lampiran D. Learning Log Individu (CPMK072) / Individual Learning Log

Diisi setiap anggota setiap minggu, satu berkas per anggota. Kolom "P4/P5/P6" merujuk capaian
pembelajaran program studi. Baris di bawah adalah format wajib dan contoh pengisian untuk satu
minggu; sisanya diisi pada saat pengumpulan.

| Minggu | Tanggal | Anggota | Yang dikerjakan | Yang dipelajari | Bukti | P4 | P5 | P6 |
|:------:|:------------|:------------------|:---------------------|:-------------------------------------|:----------------------|:--:|:--:|:--:|
| P1 | 21 Okt 2026 | `[Nama Anggota 1]` | Wawancara mitra | Cara memisahkan keluhan dari kebutuhan: keluhan menyebut gejala, kebutuhan menyebut besaran yang dapat diuji | Notulen sesi 1 | ✓ | | |
| P2 | 28 Okt 2026 | `[Nama Anggota 1]` | Ruang lingkup dan batasan | Batasan yang ditulis eksplisit mencegah ekspektasi keliru lebih baik daripada janji fitur | Draf 2.2 | | ✓ | |
| P3 | 30 Okt 2026 | `[Nama Anggota 3]` | Kebutuhan data dan ERD | Kunci primer gabungan memisahkan catatan dari status, sehingga catatan bertahan saat status dibatalkan | Draf 2.4 | | | ✓ |
| P4 | 4 Nov 2026 | `[Nama Anggota 2]` | Pengukuran NFR | Angka yang tidak diukur akan diganti kata "cepat", dan kata itu tidak dapat diverifikasi | Lampiran G | | ✓ | ✓ |
| P5 | 6 Nov 2026 | `[Nama Anggota 2]` | Validasi wireframe | Dua pengguna dengan peran berbeda menemukan masalah berbeda pada layar yang sama | 3.1.3, Lampiran A sesi 7 | ✓ | | |
| P6 | 11 Nov 2026 | `[Nama Anggota 1]` | Pemeriksaan kelengkapan | Keterlacakan P→F→UC→verifikasi→target menemukan kebutuhan yang tidak dapat dibuktikan | 4.2 | | ✓ | ✓ |

---

## Lampiran E. Logbook Kelompok (CPMK111, CPMK112) / Team Logbook

Satu baris per pertemuan, ditandatangani koordinator kelompok. Tabel di bawah memuat baris yang
sudah terjadi sampai C200; baris berikutnya ditambahkan setiap minggu.

| No | Tanggal | Nama | Aktivitas | Durasi | Bagian dokumen | Paraf |
|:----:|:------------|:---------|:------------------------------------|:------:|:---------------------|:-----:|
| 1 | 21 Okt 2026 | Tim | Elisitasi sesi 1 dan pencatatan masalah | 2,0 jam | Bab 1, 2.3 | |
| 2 | 28 Okt 2026 | Tim | Observasi lapangan dan elisitasi sesi 2 | 3,0 jam | 2.1, 2.4.1 | |
| 3 | 30 Okt 2026 | Tim | Penyusunan ruang lingkup, batasan, dan tabel Won't | 2,5 jam | 2.2, 2.3 | |
| 4 | 2 Nov 2026 | Tim | Skenario use case dan activity diagram | 3,5 jam | 2.3.2 | |
| 5 | 4 Nov 2026 | Tim | Kebutuhan data, ERD, kamus data, NFR | 4,0 jam | 2.4, 2.5 | |
| 6 | 6 Nov 2026 | Tim | Kebutuhan antarmuka, persona, validasi wireframe | 3,0 jam | Bab 3, 2.7 | |
| 7 | 11 Nov 2026 | Tim | Pengukuran build produksi dan penulisan Bab 4–5 | 5,0 jam | Bab 4, Bab 5, Lampiran G | |

---

## Lampiran F. Daftar Periksa Sebelum Pengumpulan / Submission Checklist

Diisi ulang pada hari pengumpulan. Status per 11 November 2026.

| # | Syarat | Status | Bukti / catatan |
|:----:|:------------------------------------------|:------:|:--------------------------------------|
| 1 | Nomor dokumen, nomor revisi, dan nama berkas sesuai format | ⬜ | Menunggu kode kelompok dan nomor revisi dari koordinator |
| 2 | Tanda tangan pengusul, pembimbing 1, pembimbing 2, perwakilan mitra | ⬜ | Menunggu tanda tangan basah |
| 3 | Setiap kebutuhan memiliki kode, masalah asal, dan prioritas | ✅ | Tabel 2.2 (F-01…F-40, kolom Prioritas dan Masalah) |
| 4 | Tidak ada kata ambigu tanpa angka | ✅ | Angka terukur bertanda Lampiran G; tidak ada "cepat", "mudah", "aman" tanpa besaran |
| 5 | Tidak ada pilihan teknologi sebagai spesifikasi | ✅ | 2.5.5 dan 2.6 menyatakan kandidat, bukan kewajiban |
| 6 | Setiap use case Must memiliki ≥ 2 alur negatif | ✅ | Tabel 2.5 |
| 7 | Kebutuhan data mencakup volume, retensi, keamanan, migrasi awal | ✅ | D-01…D-09, 2.4.1 |
| 8 | Setiap kode F/NF/UI ada pada tabel rencana verifikasi | ✅ | Tabel 4.1 (74 baris: 40 F + 22 NF + 12 UI) |
| 9 | Matriks keterlacakan lengkap tanpa baris kosong | ✅ | Tabel 4.2 |
| 10 | Jadwal sampai C500, RACI, biaya, risiko tersedia | ✅ | 5.1–5.4 |
| 11 | Lampiran lengkap | 🟡 | A, C, E lengkap; B menunggu berkas foto, D menunggu minggu P7–P16 |
| 12 | Seluruh kotak petunjuk dan baris contoh dihapus; daftar isi diperbarui | ✅ | — |
| 13 | Harga pada 5.3 diverifikasi ulang dengan tanggal pengecekan | ⬜ | Cek H-1 pengumpulan |
| 14 | Dokumen diekspor ke PDF dan jumlah halaman dicatat | ⬜ | Menunggu versi final |
