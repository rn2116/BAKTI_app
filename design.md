# 🎨 DESIGN.md — Panduan Desain Visual

Aplikasi "BAHASA & KARAKTER" menggunakan identitas visual Royal Indigo, Tenun Donggala, dan Alam Sulawesi Tengah.

---

## 1. Palet Warna

| Variabel | Nilai Hex | Deskripsi | Penggunaan |
|----------|-----------|-----------|------------|
| `--background` | `#FAFAF8` | Warm Alabaster | Background utama halaman |
| `--card` | `#FFFFFF` | Surface/Kartu | Latar belakang card, border `#E4E4E7`, shadow-xs |
| `--primary` | `#3C22BB` | Royal Indigo | Tombol utama, link aktif, brand utama (hover: `#2E1994`) |
| `--primary-soft` | `#3C22BB`/10 | Indigo Tint | Aksen lembut / active state background (`text-[#3C22BB] border-[#3C22BB]/20`) |
| `--secondary` | `#065F46` | Hijau Zamrud Lore Lindu | Progres selesai, aksi positif, kategori Budaya Sulteng |
| `--accent` | `#D97706` | Emas Amber | Poin, Level, Badge, Top 3 Peringkat |

---

## 2. Tipografi

- **UI & Navigasi:** Plus Jakarta Sans
- **Teks bacaan materi:** Lora, ukuran minimal `16px`, leading `leading-relaxed`

---

## 3. Lencana Kategori (CategoryBadge)

| Kode Kategori | Warna Tailwind | Keterangan |
|---------------|----------------|------------|
| `BAHASA_INDONESIA` | `sky-800` | Bahasa Indonesia |
| `KARAKTER` | `red-800` | Pendidikan Karakter |
| `BUDAYA_SULTENG` | `emerald-800` | Budaya Sulawesi Tengah |

---

## 4. Sistem Animasi (framer-motion + `<MotionConfig reducedMotion="user">`)

| Efek | Implementasi | Keterangan |
|------|--------------|------------|
| AnimatedProgressBar | `animate` dari `0%` ke nilai aktual + counter angka | Bilah progres belajar & XP Level Bar |
| Pop-in poin/level + canvas-confetti | `whileTap` / `initial`/`animate` + `canvas-confetti` | Saat meraih badge baru atau sertifikat |
| Tekan opsi kuis | `whileTap={{ scale: 0.98 }}` | Tombol pilihan jawaban kuis |
| Transisi antar-soal | `<AnimatePresence mode="wait">` | Animasi ganti nomor soal dalam mode fokus |
| Staggered list | `staggerChildren: 0.04` | Daftar materi dan papan peringkat |
