# Ondine — diagram sumber

Diagram di direktori ini ditulis dalam dialek Mermaid yang dirender oleh Ondine
(`ondine.sh`). Sumbernya `.mmd`, hasil render berupa SVG terang, SVG gelap, dan kartu PNG
1200×630.

| Diagram | Sumber | Terang | Gelap |
| --- | --- | --- | --- |
| Model kelas inti | `class-model.mmd` | [svg](class-model.svg) | [svg](class-model.dark.svg) |
| Model kelas pendukung | `class-supporting.mmd` | [svg](class-supporting.svg) | [svg](class-supporting.dark.svg) |
| Alur compiler | `ondine-flowchart.mmd` | [svg](ondine-flowchart.svg) | [svg](ondine-flowchart.dark.svg) |

Render ulang: `./render-class.sh` untuk diagram kelas (pola yang sama dengan
`c4/render.sh`).

**Latar.** Image worker Ondine mengirim SVG tanpa latar sama sekali, sehingga tampil
transparan di penampil gambar, Word, dan GitHub — kotak catatan dan label tepi jadi
kehilangan kontrasnya. `render-class.sh` menambahkan satu `<rect data-background>` tepat
setelah `<style>`, memakai `--ondine-bg` milik skema itu sendiri: putih solid di berkas
terang, hitam solid di berkas gelap. Karena diletakkan paling belakang, tidak ada elemen
yang tertutup. Jangan hapus langkah itu bila worker menambah dukungan latar bawaan.

## Model kelas

Dua diagram, bukan satu: seluruh sepuluh tabel dalam satu bidang menghasilkan garis yang
saling menyilang dan tidak terbaca. Pembagiannya mengikuti pertanyaan yang berbeda.

- **Inti** — rantai kerja: unit kerja → aktivitas → penugasan → catatan periode, dengan
  `users` di kedua ujung.
- **Pendukung** — akun dan jejaknya: login, pengumuman, reset kata sandi, jabatan.

`volume` tidak disimpan sebagai kolom independen di kelas `Activity`; nilainya turunan
(`frequency × minutes × sdm`) yang dihitung ulang di server.

**Yang tidak digambarkan sebagai relasi basis data:** `activities.category_id` dan
`assignments.category_id` menyimpan id unit kerja, tetapi keduanya **tidak** punya
`FOREIGN KEY` ke `categories`. Integritasnya dijaga kode aplikasi (dan `deleteCategory`
membersihkan turunannya secara manual dalam satu transaksi). Diagram menandainya sebagai
kolom biasa, bukan panah — itu keadaan sebenarnya, bukan kelalaian gambar.

`users.jabatan` adalah teks bebas; tabel `positions` adalah master jabatan yang terpisah
dan belum dipakai untuk mengisi kolom itu.

Sumber fakta: `sqlite3 data/app.db ".schema"` dan `pragma_foreign_key_list`, dicocokkan
dengan `src/lib/db.ts`.
