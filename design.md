# 🎨 DESIGN.md — Panduan Desain Visual

Aplikasi "BAHASA & KARAKTER" menggunakan identitas visual Royal Indigo, Tenun Donggala, dan Alam Sulawesi Tengah dengan gaya edutech modern yang gamified, atraktif, dan ramah siswa.

---

## 1. Palet Warna Utama & Sidebar

| Variabel / Elemen | Nilai Hex | Deskripsi | Penggunaan |
|-------------------|-----------|-----------|------------|
| `--background` | `#FAFAF8` | Warm Alabaster | Background utama halaman |
| `--card` | `#FFFFFF` | Surface/Kartu | Latar belakang card, border `#E4E4E7`, shadow-xs |
| `--primary` | `#3C22BB` | Royal Indigo | Tombol utama, brand utama, item navigasi aktif (hover: `#2E1994`) |
| `--primary-soft` | `#3C22BB`/10 | Indigo Tint | Aksen lembut / active state background (`text-[#3C22BB] border-[#3C22BB]/20`) |
| `sidebar-bg` | `#1E135E` | Deep Indigo | Latar belakang Desktop Sidebar bernuansa edukatif & fokus |
| `--secondary` | `#065F46` | Hijau Zamrud Lore Lindu | Progres selesai, aksi positif, kategori Budaya Sulteng |
| `--accent` | `#D97706` | Emas Amber | Poin, Level, Badge, Top 3 Peringkat |

---

## 2. Palet Kartu Kategori & Menu Cepat (6 Kartu Berwarna Cerah & Bersih)

| Menu / Kategori | Warna Hex | Nama Warna | Rute Tautan |
|-----------------|-----------|------------|-------------|
| **Belajar Bahasa** | `#0284C7` | Sky Blue | `/siswa/materi?kategori=BAHASA_INDONESIA` |
| **Pendidikan Karakter** | `#059669` | Emerald Green | `/siswa/materi?kategori=KARAKTER` |
| **Kuis Interaktif** | `#3C22BB` | Royal Indigo | `/siswa/kuis` |
| **Tantangan Harian** | `#EA580C` | Vibrant Orange | `/siswa/peringkat` |
| **Bahasa & Budaya Sulteng** | `#0D9488` | Teal Zamrud | `/siswa/materi?kategori=BUDAYA_SULTENG` |
| **Prestasi & Sertifikat** | `#E11D48` | Rose Coral | `/siswa/sertifikat` |

---

## 3. Ilustrasi Vektor Lokal Sulawesi Tengah & Audio Umpan Balik

- **Ilustrasi Vektor Ringan (SVG Lokal):**
  Menggunakan grafik vektor inline (tanpa request file eksternal berat) bertema ikonik Sulawesi Tengah:
  - `danau-poso`: Perairan biru Danau Poso, perbukitan hijau, dan mentari terbit.
  - `lore-lindu`: Megalit Palindo Lembah Bada & cagar biosfer Lore Lindu.
  - `tenun-donggala`: Motif geometris Tenun Bomba/Donggala (indigo, emas, marun).
  - `kaledo-kuliner`: Semangkuk Kaledo khas Palu beruap hangat dan rempah.
  - `teluk-palu`: Jembatan Lalove / Teluk Palu dan pegunungan Gawalise.

- **Audio Efek Web Audio API:**
  Efek suara sintetis 0 KB tanpa file MP3:
  - `playOptionSelectSound()`: Suara ketukan *pop/click* lembut saat memilih opsi kuis.
  - `playNextQuestionSound()`: Suara geser halus saat berpindah butir soal.
  - `playQuizCompleteSound(isPassed)`: Melodi riang nada naik saat lulus atau nada lembut penyemangat jika belum lulus.
  - Disertai tombol toggle Mute/Unmute di header kuis (tersimpan di `localStorage`).

---

## 4. Tipografi

- **UI & Navigasi:** Plus Jakarta Sans
- **Teks bacaan materi:** Lora, ukuran minimal `16px`, leading `leading-relaxed`

---

## 5. Lencana Kategori (CategoryBadge)

| Kode Kategori | Warna Tailwind | Keterangan |
|---------------|----------------|------------|
| `BAHASA_INDONESIA` | `sky-800` | Bahasa Indonesia |
| `KARAKTER` | `red-800` | Pendidikan Karakter |
| `BUDAYA_SULTENG` | `emerald-800` | Budaya Sulawesi Tengah |

---

## 6. Sistem Animasi (framer-motion + `<MotionConfig reducedMotion="user">`)

| Efek | Implementasi | Keterangan |
|------|--------------|------------|
| AnimatedProgressBar | `animate` dari `0%` ke nilai aktual + counter angka | Bilah progres belajar & XP Level Bar |
| ProgressRingCard | `strokeDashoffset` SVG berputar dinamis | Cincin progres kelulusan materi |
| Pop-in poin/level + canvas-confetti | `whileTap` / `initial`/`animate` + `canvas-confetti` | Saat meraih badge baru atau lulus kuis |
| Tekan opsi kuis | `whileTap={{ scale: 0.98 }}` | Tombol pilihan jawaban kuis |
| Transisi antar-soal | `<AnimatePresence mode="wait">` | Animasi ganti nomor soal dalam mode fokus |
| Staggered list | `staggerChildren: 0.04` | Daftar materi dan papan peringkat |
