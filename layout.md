# 📱 LAYOUT.md — Responsivitas & Tata Letak

---

## 1. Mobile-First (lebar < 768px)

- **Mobile Top Header:** `sticky top-0 inset-x-0 h-14 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 flex items-center justify-between z-40 md:hidden`. Menampilkan logo & nama singkat aplikasi di sisi kiri serta nama pengguna dan tombol **"Keluar"** (logout) yang selalu terlihat di sisi kanan.
- **Fixed Bottom Navigation Bar:** `fixed bottom-0 inset-x-0 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200 z-50 flex items-center justify-around px-2 md:hidden`. Maksimal 5 menu berlabel jelas dengan ikon di atas dan teks `text-[11px] font-medium` di bawah.
- **Ruang Aman Konten Mobile:** Pembungkus utama konten wajib memiliki `pb-24 md:pb-8` agar tidak tertutup Bottom Nav.
- **Tabel Responsif Mobile:** Tabel data diubah menjadi **Mobile Stacked Cards** (`md:hidden`) atau dibungkus kontainer `w-full overflow-x-auto rounded-xl border border-zinc-200` dengan `whitespace-nowrap` pada setiap sel agar layout tidak rusak dan tidak melebar keluar viewport (`overflow-x-hidden` pada wrapper).
- **Tipografi & Header Responsif:** `PageHeader` menggunakan `flex-col gap-3 sm:flex-row sm:items-center sm:justify-between` dengan tombol aksi `w-full sm:w-auto`. Teks judul dan soal menggunakan `break-words`.
- **Grid Statistik:** Kartu statistik menggunakan `grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4` dengan ukuran teks responsif `text-xl sm:text-2xl font-bold`.
- Tombol interaktif & opsi kuis minimal tinggi `48px` (`min-h-12`).

---

## 2. Desktop/Laptop (lebar ≥ 768px)

- Bottom Nav & Mobile Top Header disembunyikan (`md:hidden`).
- **Fixed Left Sidebar:** `hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-64 bg-white border-r border-zinc-200 z-40`, berisi logo branding, menu navigasi vertikal, ringkasan profil/poin, dan tombol keluar.
- Konten utama: `md:pl-64`, `max-w-6xl`, `mx-auto`.
- Grid adaptif: `md:grid-cols-2`, `lg:grid-cols-3` / `lg:grid-cols-4`.

---

## 3. Mode Fokus Kuis (`/siswa/kuis/[id]/mulai`)

- Sidebar, Mobile Top Header, dan Bottom Nav **disembunyikan sepenuhnya**.
- Tampilan hanya berisi:
  1. Header kuis (judul, timer mundur, progres soal),
  2. Area soal,
  3. Navigasi soal (sebelum / berikutnya).
