# 🚫 ANTISLOP.md — Standar Kualitas Kode

Berikut adalah larangan keras yang harus ditaati dalam seluruh pengembangan aplikasi "BAHASA & KARAKTER":

1. **Dilarang menulis placeholder**, komentar `// TODO`, `// implement here`, `// TBD`, atau fungsi kosong. Setiap file harus **100% fungsional** saat ditulis.
2. **Dilarang menggunakan mock data statis** di komponen UI produksi. Semua data wajib berasal dari MySQL melalui Prisma. Data contoh hanya diperbolehkan di `prisma/seed.ts`.
3. **Dilarang menggunakan estetika gradasi ungu-biru neon** (standar hasil AI generatif). Gunakan palet warna yang ditetapkan di `design.md` (identitas Tenun Donggala & Alam Sulawesi Tengah).
4. **Wajib menangani error** dengan `try/catch` + toast notifikasi dalam **Bahasa Indonesia**, serta status loading (`isPending` / skeleton) pada **setiap mutasi**.
5. **Dilarang menggunakan tipe `any`** atau `@ts-ignore`. Semua kode harus terdefinisi dengan benar dalam TypeScript strict mode.
6. **Animasi hanya boleh memanipulasi properti GPU** (`transform`, `scale`, `x`, `y`, `opacity`). Dilarang menganimasikan properti layout berat atau loop tak terbatas.