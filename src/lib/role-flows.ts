import type { Role } from "@/types"

export type RoleFlowIconName =
  | "BookOpen"
  | "Compass"
  | "Layers"
  | "Award"
  | "Building2"
  | "ClipboardList"
  | "Mic"
  | "FileText"
  | "UserCheck"
  | "Languages"
  | "Volume2"
  | "ShieldCheck"
  | "Users"
  | "Settings"
  | "BarChart3"

export interface RoleFlowStep {
  stepNumber: number
  title: string
  description: string
  icon: RoleFlowIconName
  ctaLabel: string
  href: string
}

export interface RoleFlowDefinition {
  role: Role
  tabLabel: string
  badgeLabel: string
  title: string
  subtitle: string
  accentBgClass: string
  accentTextClass: string
  accentBorderClass: string
  steps: readonly RoleFlowStep[]
}

export const ROLE_FLOW_LIST: readonly RoleFlowDefinition[] = [
  {
    role: "SISWA",
    tabLabel: "Peserta Umum",
    badgeLabel: "Peserta & Masyarakat Umum",
    title: "Alur Belajar Peserta & Masyarakat Umum",
    subtitle:
      "Empat langkah terstruktur untuk memperdalam Bahasa Indonesia, Pendidikan Karakter, dan Kearifan Lokal Sulawesi Tengah.",
    accentBgClass: "bg-[#3C22BB]",
    accentTextClass: "text-[#3C22BB]",
    accentBorderClass: "border-[#3C22BB]/25",
    steps: [
      {
        stepNumber: 1,
        title: "Eksplorasi Materi Kartu",
        description:
          "Baca modul Bahasa Indonesia, Pendidikan Karakter, dan Kearifan Lokal Sulawesi Tengah hingga memenuhi gerbang keterlibatan baca.",
        icon: "BookOpen",
        ctaLabel: "Buka Katalog Materi",
        href: "/siswa/materi",
      },
      {
        stepNumber: 2,
        title: "Jelajahi Kamus Besar & Usul Kosakata",
        description:
          "Pelajari lema kearifan lokal, dengarkan pelafalan audio asli, serta usulkan kosakata daerah baru.",
        icon: "Compass",
        ctaLabel: "Buka Kamus Besar",
        href: "/siswa/budaya-bahasa",
      },
      {
        stepNumber: 3,
        title: "Belajar Bertahap 3 Tahap",
        description:
          "Selesaikan Kartu Kilas, Latihan Mencocokkan, dan Kuis Evaluasi dalam Mode Ujian Jujur.",
        icon: "Layers",
        ctaLabel: "Mulai Modul 3 Tahap",
        href: "/siswa/belajar-bahasa/KAILI",
      },
      {
        stepNumber: 4,
        title: "Raih Sertifikat & Peringkat",
        description:
          "Kumpulkan poin pengalaman (XP), pantau papan peringkat, serta unduh sertifikat digital resmi ber-QR Code per bagian bahasa daerah.",
        icon: "Award",
        ctaLabel: "Lihat Sertifikat",
        href: "/siswa/sertifikat",
      },
    ],
  },
  {
    role: "GURU",
    tabLabel: "Pendidik",
    badgeLabel: "Pendidik & Guru Pembimbing",
    title: "Alur Kerja Pendidik di Satuan Pendidikan",
    subtitle:
      "Kelola rombongan belajar, susun bahan ajar serta kuis berkualitas, dan pantau capaian peserta didik.",
    accentBgClass: "bg-[#065F46]",
    accentTextClass: "text-[#065F46]",
    accentBorderClass: "border-[#065F46]/25",
    steps: [
      {
        stepNumber: 1,
        title: "Kelola Kelas & Peserta",
        description:
          "Bentuk rombongan belajar dan pantau keaktifan peserta didik di satuan pendidikan Anda.",
        icon: "Building2",
        ctaLabel: "Kelola Kelas",
        href: "/guru/kelas",
      },
      {
        stepNumber: 2,
        title: "Susun Materi & Paket Kuis",
        description:
          "Telaah bahan ajar terstruktur dan susun butir soal evaluasi yang relevan bagi peserta.",
        icon: "ClipboardList",
        ctaLabel: "Buka Katalog Materi",
        href: "/guru/materi",
      },
      {
        stepNumber: 3,
        title: "Rekam Pelafalan & Impor Soal",
        description:
          "Gunakan Studio Rekaman Mini langsung di peramban atau unggah bank soal melalui templat Excel (.xlsx).",
        icon: "Mic",
        ctaLabel: "Kelola Bank Soal",
        href: "/guru/kuis",
      },
      {
        stepNumber: 4,
        title: "Pantau Rekapitulasi Nilai",
        description:
          "Evaluasi capaian kuis peserta beserta integritas ujian dan unduh laporan hasil belajar.",
        icon: "FileText",
        ctaLabel: "Lihat Rekap Nilai",
        href: "/guru/rekap",
      },
    ],
  },
  {
    role: "AHLI_BAHASA",
    tabLabel: "Ahli Bahasa Daerah",
    badgeLabel: "Ahli Bahasa & Pakar Kearifan Lokal",
    title: "Alur Kurasi & Dokumentasi Ahli Bahasa Daerah",
    subtitle:
      "Perkaya khazanah bahasa daerah Sulawesi Tengah dengan kosakata terkurasi dan rekaman suara penutur jati.",
    accentBgClass: "bg-[#065F46]",
    accentTextClass: "text-[#065F46]",
    accentBorderClass: "border-[#065F46]/25",
    steps: [
      {
        stepNumber: 1,
        title: "Registrasi & Verifikasi Kepakaran",
        description:
          "Daftar dengan melampirkan bukti sertifikat, piagam penghargaan, atau SK kepakaran untuk diverifikasi Admin BBPST.",
        icon: "UserCheck",
        ctaLabel: "Status Akun Pakar",
        href: "/ahli-bahasa/profil",
      },
      {
        stepNumber: 2,
        title: "Tambah Bahasa Daerah & Lema Kamus",
        description:
          "Tambahkan bahasa daerah baru di Sulawesi Tengah beserta kosakata, makna harfiah, makna filosofis, dan nilai karakter padanan.",
        icon: "Languages",
        ctaLabel: "Kelola Bahasa Daerah",
        href: "/ahli-bahasa/bahasa",
      },
      {
        stepNumber: 3,
        title: "Dokumentasi Suara Penutur Jati",
        description:
          "Rekam pelafalan autentik ungkapan daerah melalui Studio Rekaman Mini langsung pada entri kamus.",
        icon: "Volume2",
        ctaLabel: "Sunting Kamus & Audio",
        href: "/ahli-bahasa/kamus",
      },
      {
        stepNumber: 4,
        title: "Kurasi Usulan Masyarakat",
        description:
          "Tinjau, sunting ejaan, dan setujui usulan kosakata dari masyarakat umum sebelum diterbitkan ke Kamus Besar.",
        icon: "ShieldCheck",
        ctaLabel: "Buka Antrean Kurasi",
        href: "/ahli-bahasa/kurasi",
      },
    ],
  },
  {
    role: "ADMIN",
    tabLabel: "Admin BBPST",
    badgeLabel: "Administrator Balai Bahasa BBPST",
    title: "Alur Tata Kelola Administrator BBPST",
    subtitle:
      "Kendali mutu ekosistem literasi, verifikasi pakar, pengaturan sertifikat resmi, dan analitik provinsi.",
    accentBgClass: "bg-[#1E135E]",
    accentTextClass: "text-[#1E135E]",
    accentBorderClass: "border-[#1E135E]/25",
    steps: [
      {
        stepNumber: 1,
        title: "Verifikasi Ahli Bahasa & Pengguna",
        description:
          "Periksa dokumen bukti kepakaran pendaftar Ahli Bahasa Daerah serta kelola akun pengguna dan satuan pendidikan.",
        icon: "Users",
        ctaLabel: "Verifikasi Ahli Bahasa",
        href: "/admin/verifikasi-ahli",
      },
      {
        stepNumber: 2,
        title: "Moderasi Konten & Bank Soal",
        description:
          "Validasi materi pembelajaran dan butir soal pengajuan pendidik sebelum ditayangkan kepada publik.",
        icon: "ShieldCheck",
        ctaLabel: "Verifikasi Soal",
        href: "/admin/verifikasi-soal",
      },
      {
        stepNumber: 3,
        title: "Pengaturan Penandatangan Sertifikat",
        description:
          "Perbarui nama, jabatan (Kepala Balai atau Plt.), NIP, serta kontak narahubung resmi BBPST melalui Pengaturan Instansi.",
        icon: "Settings",
        ctaLabel: "Pengaturan Instansi",
        href: "/admin/pengaturan-instansi",
      },
      {
        stepNumber: 4,
        title: "Analitik & Pelaporan Instansi",
        description:
          "Pantau sebaran partisipasi kabupaten/kota, analisis butir ungkapan, serta ekspor laporan resmi Excel dan PDF.",
        icon: "BarChart3",
        ctaLabel: "Buka Analitik BBPST",
        href: "/admin/analitik",
      },
    ],
  },
] as const

export const ROLE_FLOW_BY_ROLE: Record<Role, RoleFlowDefinition> = {
  SISWA: ROLE_FLOW_LIST[0],
  GURU: ROLE_FLOW_LIST[1],
  AHLI_BAHASA: ROLE_FLOW_LIST[2],
  ADMIN: ROLE_FLOW_LIST[3],
}
