# 📘 RULES.md — BAHASA & KARAKTER

Project: Platform Pembelajaran Interaktif Bahasa Indonesia, Pendidikan Karakter, dan Budaya Sulawesi Tengah
Tech Stack: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui + Prisma + MySQL

---

## 1. Tech Stack Lock (TIDAK BOLEH DIUBAH)

| Layer | Teknologi | Keterangan |
|-------|-----------|------------|
| Framework | Next.js | App Router (latest stable), React Server Components sebagai default |
| Bahasa | TypeScript | `strict: true` di `tsconfig.json` |
| Styling | Tailwind CSS | JIT mode, custom config mengikuti `design.md` |
| UI Library | shadcn/ui | Komponen primitif ditempatkan di `components/ui/` |
| Ikon | lucide-react | Semua ikon harus diimpor dari sini |
| Animasi | framer-motion | Hanya properti GPU (transform, opacity, scale, x, y) |
| Konfeti | canvas-confetti | Saat meraih badge baru atau sertifikat |
| Database | MySQL 8.0+ | via Prisma ORM (`@prisma/client`) |
| Validasi | zod | Skema validasi ditempatkan di `validations/` |
| Autentikasi | jose + bcryptjs | Stateless JWT dalam HTTP-only cookie (cocok PM2 Cluster + Nginx LB) |
| PDF | jspdf / @react-pdf/renderer | Sertifikat digital |
| Excel | xlsx | Ekspor laporan nilai guru |

---

## 2. Arsitektur Komponen Modular & Reusable

- Terapkan **Single Responsibility** & **DRY** (Don't Repeat Yourself).
- **Dilarang** menulis ulang pola UI yang sama di banyak halaman. Buat sekali di `shared` atau `ui`, lalu gunakan ulang.
- Pisahkan komponen ke dalam kategori berikut:
  - `components/ui/` — Primitif shadcn/ui (Button, Card, Dialog, Input, dll.)
  - `components/layout/` — AppShell, DesktopSidebar, MobileBottomNav, PageHeader, QuizFocusHeader
  - `components/shared/` — StatCard, CategoryBadge, EmptyState, DataTable, SearchFilterBar, ConfirmDialog
  - `components/gamification/` — AnimatedProgressBar, XpLevelCard, BadgeCard, ConfettiTrigger
- Logika mutasi (write) ditempatkan di `src/actions/` sebagai **Server Actions** yang divalidasi Zod.
- Kueri pembacaan (read-only) ditempatkan di `src/services/`, teroptimasi dengan `select` / `include`.
- File halaman (`page.tsx`) harus tetap **bersih dan ringkas** (hanya orchestrasi panggilan service + action).

---

## 3. Struktur Folder Wajib (`src/`)

```text
src/
├── actions/          # Server Actions per domain (auth, material, quiz, school, user)
├── app/
│   ├── (auth)/       # Route group publik & autentikasi (/masuk, /daftar)
│   ├── (dashboard)/  # Route group terlindungi (layout Sidebar + BottomNav)
│   │   ├── siswa/    # /siswa, /siswa/materi, /siswa/materi/[slug], /siswa/kuis, /siswa/kuis/[id]/mulai, /siswa/peringkat, /siswa/sertifikat
│   │   ├── guru/     # /guru, /guru/kelas, /guru/materi, /guru/kuis, /guru/rekap
│   │   └── admin/    # /admin, /admin/sekolah, /admin/pengguna, /admin/konten
│   └── api/          # Endpoint khusus (misal: generate PDF/Excel stream)
├── components/
│   ├── ui/           # Komponen dasar shadcn/ui
│   ├── layout/       # AppShell, DesktopSidebar, MobileBottomNav, QuizFocusHeader
│   ├── shared/       # StatCard, CategoryBadge, EmptyState, DataTable, SearchFilterBar
│   └── gamification/ # AnimatedProgressBar, XpLevelCard, BadgeCard, ConfettiTrigger
├── lib/              # prisma.ts (singleton), auth.ts (jose JWT), utils.ts, constants.ts
├── services/         # Fungsi query database read-only teroptimasi
├── types/            # Definisi tipe TypeScript & payload Prisma
└── validations/      # Skema validasi Zod per domain
```

---

## 4. Database Standards

- Skema relasional **3NF eksplisit**: `master_regencies`, `master_schools`, `master_classes`, `master_users`, `learning_materials`, `user_material_progress`, `quizzes`, `quiz_questions`, `quiz_attempts`, `quiz_attempt_answers`, `master_badges`, `user_badges`, `user_certificates`.
- Seluruh operasi penambahan poin, pembaruan level, dan pemberian badge **wajib** menggunakan `prisma.$transaction()` untuk mencegah race condition.
- Composite index wajib untuk tabel leaderboard (`quiz_attempts`).
- Enum ketat untuk `Role`, `Category`, `Difficulty`.

---

## 5. Bahasa Antarmuka & Penamaan

- Seluruh teks UI pengguna: **Bahasa Indonesia baku** sesuai KBBI & EYD V (Masuk, Daftar, Keluar, Unduh, Unggah, Dasbor, Peringkat, Pratinjau).
- Penamaan variabel, fungsi, komponen, dan kolom database: **Bahasa Inggris**.