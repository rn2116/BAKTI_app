# Panduan Deployment cPanel — LMS BAHASA & KARAKTER (BBPST)

Panduan ini menjelaskan langkah-langkah deployment aplikasi **BAHASA & KARAKTER** (Next.js App Router + Prisma ORM + MySQL) ke server cPanel **Balai Bahasa Provinsi Sulawesi Tengah** menggunakan **Setup Node.js App (Phusion Passenger)**.

---

## 1. Membuat Paket Produksi dari Komputer Lokal
Jalankan perintah berikut di root proyek:

```bash
npm run pack:cpanel
```

Skrip `scripts/pack-cpanel.sh` akan otomatis menjalankan `npx prisma generate` (termasuk target `rhel-openssl-3.0.x` dan `rhel-openssl-1.0.x` untuk AlmaLinux/CloudLinux), `npm run build`, lalu menghasilkan arsip **`bakti-cpanel-ready.zip`** berisi `.next`, `public`, `prisma`, `server.js`, `package.json`, `package-lock.json`, dan `next.config.js` (tanpa `node_modules`, `.env`, maupun binary `cloudflared`).

---

## 2. Persiapan Database MySQL di cPanel
1. Masuk ke **cPanel** → buka **MySQL® Databases** (atau **Manage My Databases**).
2. Buat database baru (contoh: `bbpst_bahasa_karakter`).
3. Buat user MySQL baru dengan kata sandi kuat (contoh: `bbpst_lms_user`).
4. Tambahkan user tersebut ke database pada menu **Add User To Database** dan centang **ALL PRIVILEGES**.
5. Catat koneksi string format Prisma:
   ```env
   mysql://USER_DB:PASSWORD_DB@localhost:3306/NAMA_DATABASE
   ```

---

## 3. Upload & Ekstrak Berkas ke cPanel
1. Buka **File Manager** di cPanel.
2. Buat atau masuk ke direktori aplikasi (misalnya `/home/USER_CPANEL/bakti-app` di luar `public_html` atau direktori subdomain yang ditentukan).
3. Unggah **`bakti-cpanel-ready.zip`** lalu klik **Extract**.
4. Pastikan folder unggahan media dan cache memiliki izin tulis **`755`**:
   - `public/uploads` → `755`
   - `public/uploads/audio` → `755`
   - `public/uploads/tts-cache` → `755`

---

## 4. Konfigurasi Setup Node.js App (Phusion Passenger)
1. Buka menu **Setup Node.js App** di cPanel → klik **Create Application**.
2. Isi pengaturan berikut:
   - **Node.js version:** `18.x` atau `20.x` (disarankan Node 20 LTS)
   - **Application mode:** `Production`
   - **Application root:** jalur folder tempat Anda mengekstrak `bakti-cpanel-ready.zip` (misal: `bakti-app`)
   - **Application URL:** domain/subdomain tujuan (misal: `bakti.balaibahasasulteng.id`)
   - **Application startup file:** `server.js`
3. Pada bagian **Environment Variables**, tambahkan variabel berikut satu per satu:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `mysql://USER_DB:PASSWORD_DB@localhost:3306/NAMA_DATABASE`
   - `JWT_SECRET` = `<acak-panjang-minimal-32-karakter>`
   - `JWT_EXPIRES_IN` = `7d`
   - `APP_URL` = `https://domain-anda.id`
   - `NEXT_PUBLIC_APP_URL` = `https://domain-anda.id`
   - `NEXT_PUBLIC_KEPALA_BALAI_NAMA` = `Dr. Asrif, M.Hum.`
   - `NEXT_PUBLIC_KEPALA_BALAI_NIP` = `197412152002121002`
4. Klik **Create** / **Save**.

> **Catatan:** Jika mengubah `NEXT_PUBLIC_KEPALA_BALAI_NAMA`, `NEXT_PUBLIC_KEPALA_BALAI_NIP`, atau `NEXT_PUBLIC_APP_URL` setelah build, Anda dapat membangun ulang paket di lokal (`npm run pack:cpanel`) atau menjalankan `npm run build` di Terminal cPanel.

---

## 5. Instalasi Dependensi & Sinkronisasi Database
Buka **Terminal** cPanel (atau SSH) lalu aktifkan virtual environment Node.js sesuai perintah `source ...` yang tampil di halaman **Setup Node.js App**, kemudian jalankan:

```bash
npm install --omit=dev && npx prisma generate && npx prisma db push && npm run prisma:seed
```

Penjelasan langkah:
- `npm install --omit=dev`: memasang dependensi produksi saja dari `package-lock.json`.
- `npx prisma generate`: memastikan Prisma Client binary Linux RHEL/AlmaLinux di server terpasang.
- `npx prisma db push`: membuat dan menyinkronkan seluruh tabel serta indeks MySQL.
- `npm run prisma:seed`: mengisi data awal kabupaten/kota Sulawesi Tengah, sekolah, akun contoh, matriks 9 bahasa daerah, materi, dan bank kuis.

---

## 6. Menjalankan & Memastikan Izin Direktori
1. Verifikasi izin tulis folder upload audio & cache TTS di Terminal:
   ```bash
   mkdir -p public/uploads/audio public/uploads/tts-cache
   chmod -R 755 public/uploads
   ```
2. Kembali ke **Setup Node.js App** di cPanel → klik **Restart**.
3. Buka domain aplikasi di peramban dan uji:
   - Halaman `/masuk` menampilkan logo resmi Kemendikdasmen – BBPST dan favicon Tut Wuri Handayani.
   - Uji login Siswa/Guru/Admin, putar audio (`/api/tts` dan `/api/audio`), unggah rekaman suara, serta cetak sertifikat PDF/PNG dan verifikasi QR (`/verifikasi/[kode]`).
