# Deploy ke Oracle Cloud Always Free

App ini butuh proses Node yang hidup terus + file SQLite di disk, jadi VPS gratis adalah
satu-satunya opsi gratis yang tidak mengubah kode. Panduan ini memakai 1 VM ARM (2 OCPU /
12 GB, batas Always Free sejak Juni 2026) dengan HTTPS otomatis lewat Caddy dan
`<ip>.sslip.io` — tanpa beli domain.

## 1. Buat VM

1. Daftar di <https://cloud.oracle.com/free> (butuh kartu untuk verifikasi; tidak ditagih
   selama tetap di batas Always Free). Region: **Singapore** — atau Jakarta kalau tenancy-mu menyediakannya.
2. Compute → Instances → Create instance.
   - Image: **Ubuntu 24.04** (aarch64)
   - Shape: **VM.Standard.A1.Flex**, 2 OCPU / 12 GB
   - Boot volume: 50 GB (cukup, jatah 200 GB)
   - SSH key: simpan file `.key`-nya
3. Kalau muncul **"Out of capacity"**: ganti Availability Domain, atau coba lagi beberapa
   jam kemudian. Ini masalah umum di shape ARM gratis, bukan konfigurasi salah.
4. Setelah jalan, **reserve public IP**-nya (Networking → Reserved public IPs → Create, lalu
   assign ke instance). IP ephemeral bisa berubah saat instance di-stop, dan hostname
   `sslip.io` ikut berubah kalau IP-nya berubah.

## 2. Buka port 80 dan 443

Dua lapis, keduanya wajib:

- **VCN security list**: Networking → Virtual Cloud Networks → VCN kamu → Security Lists →
  Default Security List → Add Ingress Rules. Dua rule: source `0.0.0.0/0`, protocol TCP,
  destination port `80` dan `443`.
- **iptables di VM**: sudah ditangani `setup.sh`.

## 3. Jalankan bootstrap

```sh
scp -i ~/Downloads/ssh-key.key deploy/oracle/setup.sh ubuntu@<IP>:
ssh -i ~/Downloads/ssh-key.key ubuntu@<IP> 'sudo bash setup.sh'
```

Script memasang Node 22, bun, Caddy, membuat user `umsura`, clone repo, generate
`AUTH_SECRET`, build, lalu menjalankan systemd unit `umsura`. Selesai dengan URL
`https://<IP>.sslip.io` (sertifikat Let's Encrypt terbit pada request pertama — buka
sekali, tunggu beberapa detik).

Kalau gagal, baca `sudo cat /var/log/cloud-init-output.log` atau `journalctl -u umsura`.

## 4. Copy database

`data/` tidak masuk git, jadi DB harus dikirim manual. Hentikan server lokal dulu supaya
WAL-nya bersih, kalau tidak isi terbaru tertinggal di `app.db-wal`:

```sh
# di Mac, dari root repo. Hentikan dulu `npm start` / tunnel yang sedang jalan —
# checkpoint butuh koneksi tulis, dan file yang tersalin harus utuh.
sqlite3 data/app.db 'PRAGMA wal_checkpoint(TRUNCATE);'
scp -i ~/Downloads/ssh-key.key data/app.db ubuntu@<IP>:/tmp/app.db
ssh -i ~/Downloads/ssh-key.key ubuntu@<IP> \
  'sudo systemctl stop umsura &&
   sudo rm -f /opt/umsura/data/app.db-wal /opt/umsura/data/app.db-shm &&
   sudo install -o umsura -g umsura -m 640 /tmp/app.db /opt/umsura/data/app.db &&
   sudo systemctl start umsura'
```

## 5. Verifikasi

```sh
curl -sI https://<IP>.sslip.io/login | head -1     # 200
```

Login admin (`admin@assignment.id` / `password123`) **wajib diganti** sebelum URL dibagikan:
password itu tertulis di `compact.md`, dan setiap akun baru memakai `12345678`.

## Update kode

```sh
ssh -i ~/Downloads/ssh-key.key ubuntu@<IP> \
  'sudo -u umsura bash -c "cd /opt/umsura && git pull && bun install --frozen-lockfile && bun run build" && sudo systemctl restart umsura'
```

## Batas yang perlu diingat

- **Satu instance, satu proses.** SQLite + WAL; jangan tambah replika.
- **Backup** = copy `data/app.db` (atau `sqlite3 ... ".backup"`), tidak ada backup otomatis.
- Better-sqlite3 adalah native module: build di VM, jangan pernah copy `node_modules` dari Mac.
- Instance ARM gratis bisa di-reclaim Oracle kalau idle berbulan-bulan. Untuk demo capstone,
  aman.
