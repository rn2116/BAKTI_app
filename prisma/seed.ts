import { PrismaClient, Role, Category } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

const prisma = new PrismaClient()

function id() {
  return randomUUID()
}

function hash(password: string) {
  return bcrypt.hashSync(password, 10)
}

/** 13 Kabupaten/Kota Sulawesi Tengah (kode wilayah KEMENDAGRI) */
const REGENCIES = [
  { name: "Kabupaten Banggai", code: "7201" },
  { name: "Kabupaten Banggai Kepulauan", code: "7209" },
  { name: "Kabupaten Banggai Laut", code: "7213" },
  { name: "Kabupaten Buol", code: "7204" },
  { name: "Kabupaten Donggala", code: "7203" },
  { name: "Kabupaten Morowali", code: "7210" },
  { name: "Kabupaten Morowali Utara", code: "7214" },
  { name: "Kabupaten Parigi Moutong", code: "7207" },
  { name: "Kabupaten Poso", code: "7202" },
  { name: "Kabupaten Sigi", code: "7211" },
  { name: "Kabupaten Tojo Una-Una", code: "7212" },
  { name: "Kabupaten Toli-Toli", code: "7206" },
  { name: "Kota Palu", code: "7271" },
]

const BADGES = [
  {
    name: "Pemula",
    description: "Selesaikan satu materi pembelajaran pertama.",
    imageUrl: "/badges/pemula.svg",
    category: "LEARNING",
    xpThreshold: 0,
  },
  {
    name: "Pemula Kuis",
    description: "Selesaikan satu paket kuis pertama.",
    imageUrl: "/badges/pemula-kuis.svg",
    category: "QUIZ",
    xpThreshold: 0,
  },
  {
    name: "Cerdas",
    description: "Rapai nilai kuis minimal 80.",
    imageUrl: "/badges/cerdas.svg",
    category: "QUIZ",
    xpThreshold: 0,
  },
  {
    name: "Pahlawan Karakter",
    description: "Selesaikan materi Pendidikan Karakter.",
    imageUrl: "/badges/karakter.svg",
    category: "LEARNING",
    xpThreshold: 0,
  },
  {
    name: "Cinta Budaya Sulteng",
    description: "Selesaikan materi Budaya Sulawesi Tengah.",
    imageUrl: "/badges/budaya.svg",
    category: "LEARNING",
    xpThreshold: 0,
  },
  {
    name: "Juara Peringkat",
    description: "Masuk 3 besar papan peringkat kelas.",
    imageUrl: "/badges/juara.svg",
    category: "LEADERBOARD",
    xpThreshold: 0,
  },
  // 9 Lencana Budaya Daerah Sulawesi Tengah
  {
    name: "Sahabat Bahasa Kaili",
    description: "Mendalami kearifan lokal nilai Sintuvu bahasa Kaili.",
    imageUrl: "/badges/kaili.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Pamona",
    description: "Mendalami nilai Sintuwu Maroso bahasa Pamona.",
    imageUrl: "/badges/pamona.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Banggai",
    description: "Mendalami nilai Montolutusan bahasa Banggai.",
    imageUrl: "/badges/banggai.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Bungku",
    description: "Mendalami nilai Mosimpotowake bahasa Bungku.",
    imageUrl: "/badges/bungku.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Tolitoli",
    description: "Mendalami nilai Mototompiaan bahasa Tolitoli.",
    imageUrl: "/badges/tolitoli.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Buol",
    description: "Mendalami nilai Pogogut bahasa Buol.",
    imageUrl: "/badges/buol.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Saluan",
    description: "Mendalami nilai Molabot bahasa Saluan.",
    imageUrl: "/badges/saluan.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Mori",
    description: "Mendalami nilai Metulungi bahasa Mori.",
    imageUrl: "/badges/mori.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
  {
    name: "Sahabat Bahasa Taa",
    description: "Mendalami nilai Morambanga bahasa Taa.",
    imageUrl: "/badges/taa.svg",
    category: "REGIONAL_CULTURE",
    xpThreshold: 50,
  },
]

async function main() {
  // ========================================================================
  // 1. BERSIHKAN DATA LAMA (urutan terbalik dependensi foreign key)
  // ========================================================================
  await (prisma as any).characterMatrix.deleteMany()
  await prisma.quizAttemptAnswer.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.quizQuestion.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.userMaterialProgress.deleteMany()
  await prisma.learningMaterial.deleteMany()
  await prisma.userCertificate.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.masterBadge.deleteMany()
  await prisma.masterUser.deleteMany()
  await prisma.masterClass.deleteMany()
  await prisma.masterSchool.deleteMany()
  await prisma.masterRegency.deleteMany()

  // ========================================================================
  // 2. KABUPATEN / KOTA SULAWESI TENGAH
  // ========================================================================
  const regencyMap = new Map<string, any>()
  for (const regency of REGENCIES) {
    const created = await prisma.masterRegency.create({
      data: { id: id(), name: regency.name, code: regency.code },
    })
    regencyMap.set(regency.name, created)
  }

  const donggala = regencyMap.get("Kabupaten Donggala")!
  const palu = regencyMap.get("Kota Palu")!
  const poso = regencyMap.get("Kabupaten Poso")!

  // ========================================================================
  // 3. SEKOLAH & KELAS CONTOH
  // ========================================================================
  const smpn1Palu = await prisma.masterSchool.create({
    data: {
      id: id(),
      name: "SMP Negeri 1 Palu",
      npsn: "20123456",
      regencyId: palu.id,
      address: "Jl. Diponegoro No. 12, Palu",
      phone: "0511-123456",
      isActive: true,
    },
  })
  const smpn2Donggala = await prisma.masterSchool.create({
    data: {
      id: id(),
      name: "SMP Negeri 2 Donggala",
      npsn: "20123457",
      regencyId: donggala.id,
      address: "Jl. Sudirman No. 5, Donggala",
      phone: "0512-654321",
      isActive: true,
    },
  })
  const sman1Poso = await prisma.masterSchool.create({
    data: {
      id: id(),
      name: "SMA Negeri 1 Poso",
      npsn: "20123458",
      regencyId: poso.id,
      address: "Jl. Ahmad Yani No. 8, Poso",
      phone: "0513-987654",
      isActive: true,
    },
  })

  const classVIIA = await prisma.masterClass.create({
    data: { id: id(), name: "VII A", grade: 7, schoolId: smpn1Palu.id, isActive: true },
  })
  const classVIIB = await prisma.masterClass.create({
    data: { id: id(), name: "VII B", grade: 7, schoolId: smpn1Palu.id, isActive: true },
  })
  const classVIIIA = await prisma.masterClass.create({
    data: { id: id(), name: "VIII A", grade: 8, schoolId: smpn2Donggala.id, isActive: true },
  })
  const classXIIPA = await prisma.masterClass.create({
    data: { id: id(), name: "XII IPA 1", grade: 12, schoolId: sman1Poso.id, isActive: true },
  })

  // ========================================================================
  // 4. AKUN DEMO (ter-hash dengan bcryptjs)
  //    andi / siswa123  (siswa)
  //    guru / guru123   (guru)
  //    admin / admin123 (admin)
  // ========================================================================
  const adminUser = await prisma.masterUser.create({
    data: {
      id: id(),
      email: "admin@bahasakarakter.id",
      passwordHash: hash("admin123"),
      fullName: "Administrator Sistem",
      role: Role.ADMIN,
      schoolId: smpn1Palu.id,
      isActive: true,
      emailVerified: true,
    },
  })
  const guruUser = await prisma.masterUser.create({
    data: {
      id: id(),
      email: "guru@bahasakarakter.id",
      passwordHash: hash("guru123"),
      fullName: "Budi Santoso, S.Pd",
      role: Role.GURU,
      schoolId: smpn1Palu.id,
      classId: classVIIA.id,
      isActive: true,
      emailVerified: true,
    },
  })
  const andiUser = await prisma.masterUser.create({
    data: {
      id: id(),
      email: "andi@bahasakarakter.id",
      passwordHash: hash("siswa123"),
      fullName: "Andi Wijaya",
      nisn: "1234567890",
      role: Role.SISWA,
      schoolId: smpn1Palu.id,
      classId: classVIIA.id,
      isActive: true,
      emailVerified: true,
    },
  })
  const sitiUser = await prisma.masterUser.create({
    data: {
      id: id(),
      email: "siti@bahasakarakter.id",
      passwordHash: hash("siswa123"),
      fullName: "Siti Rahayu",
      nisn: "1234567891",
      role: Role.SISWA,
      schoolId: smpn2Donggala.id,
      classId: classVIIIA.id,
      isActive: true,
      emailVerified: true,
    },
  })
  const budiUser = await prisma.masterUser.create({
    data: {
      id: id(),
      email: "budi@bahasakarakter.id",
      passwordHash: hash("siswa123"),
      fullName: "Budi Pratama",
      nisn: "1234567892",
      role: Role.SISWA,
      schoolId: smpn1Palu.id,
      classId: classVIIB.id,
      isActive: true,
      emailVerified: true,
    },
  })

  // ========================================================================
  // 5. LENCANA (BADGE)
  // ========================================================================
  for (const badge of BADGES) {
    await prisma.masterBadge.create({
      data: { id: id(), ...badge, isActive: true },
    })
  }

  // ========================================================================
  // 5B. MATRIKS KARAKTER 9 BAHASA DAERAH SULAWESI TENGAH
  // ========================================================================
  const REGIONAL_MATRICES = [
    {
      indonesianCharacter: "Gotong Royong & Persatuan",
      regionalLanguage: "KAILI" as const,
      regionalTerm: "Masintuvu Kita Maroso, Morambanga Kita Marisi",
      characterSource:
        "Falsafah adat suku Kaili Lembah Palu dan pesisir Teluk Palu yang diwariskan turun-temurun dalam musyawarah Banua Oge.",
      implementation:
        "Bekerja sama membersihkan lingkungan sekolah, saling membantu teman yang tertinggal pelajaran, dan menyelesaikan perselisihan dengan musyawarah mufakat.",
    },
    {
      indonesianCharacter: "Kebersamaan & Solidaritas Kuat",
      regionalLanguage: "PAMONA" as const,
      regionalTerm: "Sintuwu Maroso",
      characterSource:
        "Pepatah adat masyarakat Pamona (Poso) yang melambangkan keutuhan ikatan persaudaraan sejati yang tak tergoyahkan oleh rintangan.",
      implementation:
        "Menjaga kerukunan antarumat beragama di sekolah, tidak membeda-bedakan latar belakang suku teman, dan saling menjenguk saat ada warga sekolah yang sakit.",
    },
    {
      indonesianCharacter: "Persaudaraan Tiga Serangkai",
      regionalLanguage: "BANGGAI" as const,
      regionalTerm: "Montolutusan",
      characterSource:
        "Nilai luhur kemasyarakatan Banggai (Batui, Balantak, Banggai Laut) tentang persaudaraan sejati yang saling menopang harkat martabat.",
      implementation:
        "Membela teman yang menjadi korban perundungan (bullying), berbagi bekal makanan sehat, dan setia kawan dalam kebaikan.",
    },
    {
      indonesianCharacter: "Tolong-Menolong Tanpa Pamrih",
      regionalLanguage: "BUNGKU" as const,
      regionalTerm: "Mosimpotowake",
      characterSource:
        "Tradisi adat tolong-menolong suku Bungku di Morowali dalam kegiatan berladang, mendirikan rumah warga, dan hajatan kampung.",
      implementation:
        "Sigap membantu guru menyiapkan ruang kelas, aktif dalam penggalangan dana sosial kemanusiaan, dan membimbing adik kelas dengan sabar.",
    },
    {
      indonesianCharacter: "Kebaikan Budi & Saling Memperbaiki",
      regionalLanguage: "TOLITOLI" as const,
      regionalTerm: "Mototompiaan",
      characterSource:
        "Ajaran leluhur Tolitoli yang menekankan pentingnya saling memaafkan, menjaga tutur kata halus, dan memperbaiki hubungan kekeluargaan.",
      implementation:
        "Menolak berkata kasar atau memaki, berani meminta maaf secara tulus saat bersalah, dan memberi nasihat perbaikan secara santun empat mata.",
    },
    {
      indonesianCharacter: "Musyawarah & Keakraban Rukun",
      regionalLanguage: "BUOL" as const,
      regionalTerm: "Pogogut",
      characterSource:
        "Adat kebiasaan masyarakat Buol dalam bermusyawarah mufakat di bawah naungan tetua adat guna mencapai ketenteraman bersama.",
      implementation:
        "Menghargai perbedaan pendapat saat diskusi kelompok kelas, mematuhi hasil keputusan bersama dengan ikhlas, dan tidak memaksakan kehendak pribadi.",
    },
    {
      indonesianCharacter: "Saling Menjaga Kehormatan & Tanggung Jawab",
      regionalLanguage: "SALUAN" as const,
      regionalTerm: "Molabot",
      characterSource:
        "Norma kehormatan suku Saluan (Banggai daratan) tentang kesetiaan memegang janji dan tanggung jawab menjaga marwah keluarga serta komunitas.",
      implementation:
        "Mengerjakan tugas piket kelas sesuai jadwal, menepati janji belajar bersama tepat waktu, dan jujur mengakui hasil kerja sendiri tanpa plagiasi.",
    },
    {
      indonesianCharacter: "Empati & Rasa Kasih Sayang Sesama",
      regionalLanguage: "MORI" as const,
      regionalTerm: "Metulungi",
      characterSource:
        "Falsafah hidup suku Mori (Morowali Utara) yang mengajarkan bahwa kemuliaan seseorang diukur dari keikhlasannya menolong sesama yang lemah.",
      implementation:
        "Memberikan bantuan kepada teman yang mengalami kesulitan perlengkapan sekolah, menemani teman yang merasa terasing di kelas, dan menghibur yang berduka.",
    },
    {
      indonesianCharacter: "Keteguhan Bersama dalam Membangun Negeri",
      regionalLanguage: "TAA" as const,
      regionalTerm: "Morambanga",
      characterSource:
        "Ungkapan kearifan lokal suku Taa (Tojo Una-Una) tentang kekompakan melangkah bersama dan bahu-membahu menjaga kelestarian alam kepulauan.",
      implementation:
        "Menjaga kebersihan dan kelestarian taman sekolah, menghemat penggunaan air dan listrik di sekolah, serta aktif merawat fasilitas umum kelas.",
    },
  ]

  for (const matrix of REGIONAL_MATRICES) {
    await (prisma as any).characterMatrix.create({
      data: {
        indonesianCharacter: matrix.indonesianCharacter,
        regionalLanguage: matrix.regionalLanguage,
        regionalTerm: matrix.regionalTerm,
        characterSource: matrix.characterSource,
        implementation: matrix.implementation,
        createdBy: adminUser.id,
      },
    })
  }

  // ========================================================================
  // 6. MATERI PEMBELAJARAN (3 materi awal lengkap paket kuis)
  // ========================================================================
  const materiBahasa = await prisma.learningMaterial.create({
    data: {
      id: id(),
      title: "Pengantar Bahasa Indonesia: Ejaan dan EYD V",
      slug: "pengantar-bahasa-indonesia-ejaan-eyd",
      category: Category.BAHASA_INDONESIA,
      description:
        "Mempelajari Ejaan yang Disempurnakan (EYD) V, tata bahasa, dan pengunaannya dalam kalimat Bahasa Indonesia yang baik dan benar sesuai KBBI.",
      content: `## Ejaan Bahasa Indonesia yang Disempurnakan (EYD V)

Bahasa Indonesia adalah identitas pemersatu bangsa yang dinamis dan terus berkembang seiring peradaban literasi modern. Pedoman Umum Ejaan Bahasa Indonesia yang Disempurnakan Edisi V (EYD V) diterbitkan oleh Badan Pengembangan dan Pembinaan Bahasa sebagai acuan resmi tata tulis yang baku dan berwibawa bagi seluruh penutur bahasa Indonesia.

Penerapan kaidah ejaan yang cermat bukan sekadar formalitas akademik, melainkan wujud penghormatan kita terhadap ketertiban nalar berbahasa dan kejelasan dalam menyampaikan gagasan.

### Prinsip Penulisan Huruf Kapital dan Kata Turunan

Dalam kaidah EYD V, terdapat beberapa pembaruan dan penegasan penting yang kerap menjadi tantangan bagi para pembelajar di bangku sekolah:

- Nama Geografi dan Unsur Wilayah: Huruf kapital digunakan pada awal nama tempat yang merupakan nama diri geografi spesifik, seperti Kota Palu, Danau Poso, Teluk Tomini, dan Lembah Bada.
- Kata Berimbuhan Gabung: Kata yang mendapat imbuhan awalan dan akhiran sekaligus wajib ditulis serangkai tanpa spasi, misalnya mempertanggungjawabkan dan menindaklanjuti.
- Bentuk Terikat dan Unsur Asing: Unsur terikat seperti pasca-, antar-, multi-, dan sub- ditulis serangkai dengan kata dasar yang mengikutinya, misalnya pascabencana dan antarsiswa.

Contoh Aturan:
- Penulisan Preposisi vs Awalan: Kata depan 'di' yang menunjukkan tempat atau arah ditulis terpisah (di sekolah, di Palu), sedangkan awalan 'di-' pembentuk kata kerja pasif wajib ditulis serangkai (dibaca, dipelajari, ditulis).
- Penulisan Partikel: Partikel 'pun' yang bermakna 'juga' ditulis terpisah (siswa pun antusias), sedangkan yang telah menjadi kata penghubung tetap ditulis serangkai (walaupun, meskipun, bagaimanapun).
- Penulisan Kata Ulang: Kata ulang ditulis penuh dengan tanda hubung tanpa spasi (buku-buku, kata-kata, bersama-sama).

### Catatan Penting
Kamus Besar Bahasa Indonesia (KBBI) Daring dan Pedoman EYD V dari Balai Bahasa Provinsi Sulawesi Tengah merupakan rujukan valid untuk memastikan kebakuan istilah daerah yang diserap ke dalam kosakata nasional.`,
      readingTime: 12,
      orderIndex: 1,
      isPublished: true,
      createdBy: guruUser.id,
    },
  })

  const materiKarakter = await prisma.learningMaterial.create({
    data: {
      id: id(),
      title: "Nilai-Nilai Karakter Bangsa bagi Siswa",
      slug: "nilai-nilai-karakter-bangsa",
      category: Category.KARAKTER,
      description:
        "Mengenal enam pilar pendidikan karakter: religiositas, integritas, nasionalisme, gotong royong, kemandirian, dan integritas sosial.",
      content: `## Membangun Karakter Luhur Generasi Bangsa

Pendidikan karakter merupakan fondasi utama dalam mencetak generasi penerus yang tidak hanya cerdas secara intelektual, tetapi juga berakhlak mulia, berintegritas tinggi, dan memiliki empati mendalam terhadap lingkungan sekitarnya. Karakter luhur adalah kompas moral yang membimbing tindakan setiap individu dalam kehidupan bermasyarakat.

Di tengah era globalisasi dan transformasi digital, generasi muda ditantang untuk tetap teguh memegang nilai-nilai luhur Pancasila dan kearifan budaya bangsa Indonesia.

### Enam Pilar Utama Penguatan Karakter Siswa

Kementerian Pendidikan dan Balai Bahasa merumuskan enam pilar karakter pokok yang wajib tercermin dalam sikap keseharian setiap pelajar:

- Religiositas dan Keimanan: Menjalankan ajaran agama dengan penuh keikhlasan serta senantiasa menghormati keberagaman keyakinan di lingkungan sekolah.
- Integritas dan Kejujuran: Bersikap tulus, tidak menyontek saat ujian, dan berani berkata benar meskipun menghadapi tantangan.
- Kemandirian Belajar: Memiliki inisiatif tinggi untuk mengasah keterampilan, tidak mudah bergantung pada orang lain, dan tekun memecahkan masalah.
- Gotong Royong: Menjunjung tinggi semangat kerja sama, tolong-menolong tanpa pamrih, dan aktif dalam kegiatan sosial kebaikan.
- Nasionalisme: Cinta tanah air, bangga menggunakan bahasa Indonesia, serta menghargai perjuangan para pahlawan bangsa.
- Tanggung Jawab Sosial: Memiliki kepedulian terhadap kelestarian alam dan menjaga kerukunan antarsesama warga.

Contoh Aturan:
- Penerapan Kejujuran Akademik: Selalu mencantumkan sumber rujukan saat menyusun tugas dan pantang meniru karya teman demi menjaga kehormatan diri.
- Disiplin Menghargai Waktu: Hadir tepat waktu di kelas, mengumpulkan tugas sebelum tenggat, dan membagi jadwal belajar serta istirahat secara seimbang.

### Catatan Penting
Karakter tidak dibentuk melalui kata-kata semata, melainkan dari pembiasaan tindakan nyata kecil yang dilakukan secara konsisten setiap hari di rumah, sekolah, dan lingkungan pergaulan.`,
      readingTime: 10,
      orderIndex: 2,
      isPublished: true,
      createdBy: guruUser.id,
    },
  })

  const materiBudaya = await prisma.learningMaterial.create({
    data: {
      id: id(),
      title: "Kearifan Lokal Budaya Sulawesi Tengah",
      slug: "kearifan-lokal-budaya-sulteng",
      category: Category.BUDAYA_SULTENG,
      description:
        "Mengenal budaya khas Sulawesi Tengah: tenun Donggala, tari, bahasa, makanan tradisional, dan Taman Nasional Lore Lindu.",
      content: `## Menjelajahi Kekayaan Adat & Kearifan Lokal Sulawesi Tengah

Provinsi Sulawesi Tengah merupakan surga peradaban di jantung Nusantara yang dianugerahi keindahan bentang alam luar biasa serta warisan kebudayaan yang kaya. Dari pesisir Teluk Palu, hamparan perbukitan Lembah Palu, perairan Danau Poso, hingga kemegahan megalitikum Lembah Napu dan Bada di kawasan Lore Lindu, bumi Tadulako menyimpan kearifan hidup yang tak ternilai harganya.

Mengenal dan melestarikan budaya lokal adalah kewajiban generasi muda agar jati diri kedaerahan tidak lekang tergerus arus modernisasi.

### Tiga Pusaka Budaya Kebanggaan Sulawesi Tengah

Kearifan lokal masyarakat Sulawesi Tengah tercermin dalam berbagai karya seni, peninggalan purbakala, dan tradisi lisan yang hidup berdampingan secara harmonis:

- Kain Tenun Donggala (Bomba): Tenunan tradisional khas Donggala yang dibuat dengan ketelitian jemari para penenun terampil. Motif bunga bomba, marun, dan emas melambangkan kemuliaan derajat budi pekerti dan keanggunan pemakainya.
- Situs Megalitikum Lore Lindu: Terletak di kawasan Cagar Biosfer Lore Lindu, patung-patung batu purba seperti Arca Palindo di Lembah Bada adalah bukti peradaban agung prasejarah ribuan tahun silam yang diakui dunia internasional UNESCO.
- Tradisi Kuliner Berkhasiat: Makanan khas seperti Kaledo (kaki lembu Donggala) berkuah asam jawa segar kaya rempah, Uve Mpoi, dan olahan Sagu Sinonggi yang sarat filosofi kebersamaan saat bersantap.

Contoh Aturan:
- Falsafah Sintuvu: Falsafah suku Kaili "Masintuvu Kita Maroso, Morambanga Kita Marisi" (Bersatu kita kuat, bersama kita teguh) mengajarkan prinsip musyawarah untuk mufakat dan solidaritas komunal dalam menghadapi setiap tantangan hidup.
- Bahasa Daerah sebagai Identitas: Menguasai Bahasa Kaili, Pamona, Banggai, Saluan, dan Buol di samping mahir berbahasa Indonesia adalah kekayaan bilingualisme yang patut dibanggakan.

### Catatan Penting
Pelestarian bahasa daerah dan sastra lisan Sulawesi Tengah kini menjadi prioritas Balai Bahasa Provinsi Sulawesi Tengah melalui program Revitalisasi Bahasa Daerah (RBD) agar tetap dituturkan oleh anak cucu kita.`,
      readingTime: 10,
      orderIndex: 3,
      isPublished: true,
      createdBy: guruUser.id,
    },
  })

  // ========================================================================
  // 7. PAKET KUIS DAN SOAL (setiap materi satu paket kuis, 5 soal)
  // ========================================================================
  async function createQuizWithQuestions({
    material,
    title,
    description,
    category,
    xpReward,
    questions,
  }: {
    material: any
    title: string
    description: string
    category: Category
    xpReward: number
    questions: Array<{
      question: string
      options: string[]
      correctIndex: number
      explanation?: string
      points?: number
    }>
  }) {
    const quiz = await prisma.quiz.create({
      data: {
        id: id(),
        title,
        description,
        category,
        materialId: material.id,
        timeLimit: 30,
        passingScore: 75,
        xpReward,
        isPublished: true,
        createdBy: guruUser.id,
      },
    })
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      await prisma.quizQuestion.create({
        data: {
          id: id(),
          quizId: quiz.id,
          question: q.question,
          options: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          explanation: q.explanation ?? "",
          points: q.points ?? 10,
          orderIndex: i + 1,
        },
      })
    }
    return quiz
  }

  await createQuizWithQuestions({
    material: materiBahasa,
    title: "Kuis Ejaan Bahasa Indonesia",
    description: "Uji pemahaman EYD V dan ejaan yang benar.",
    category: Category.BAHASA_INDONESIA,
    xpReward: 50,
    questions: [
      {
        question: "Pilihan berikut yang ejaannya BENAR menurut EYD V adalah?",
        options: ["komitmen", "komitmen", "commintmen", "kommitmen"],
        correctIndex: 1,
        explanation: "Kata yang benar menurut EYD adalah 'komitmen' (dari bahasa Inggris commitment).",
      },
      {
        question: "Kata yang ditulis dengan huruf besar di awal kalimat karena nama khusus adalah?",
        options: ["palu", "Palu", "PALu", "paLu"],
        correctIndex: 1,
        explanation: "Nama kota Palu ditulis dengan huruf besar awal karena merupakan nama khusus.",
      },
      {
        question: "Imbuhan yang tepat pada kata dasar 'baca' untuk bentuk pasif adalah?",
        options: ["membaca", "dibaca", "membacakan", "pembaca"],
        correctIndex: 1,
        explanation: "Imbuhan di- untuk bentuk pasif: 'dibaca'.",
      },
      {
        question: "Penulisan kata ganda yang benar adalah?",
        options: ["mata mata", "mata-mata", "matamata", "mata mata-"],
        correctIndex: 1,
        explanation: "Kata ganda ditulis penuh dengan hubung kali, contoh: mata-mata.",
      },
      {
        question: "Kalimat yang ejaannya benar menurut EYD V adalah?",
        options: ["Saya belajar bahasa Indonesia di Palu.", "saya belajar bahasa indonesia di palu.", "saya Belajar Bahasa Indonesia di Palu.", "SAYA belajar bahasa Indonesia di Palu."],
        correctIndex: 0,
        explanation: "Awal kalimat huruf besar, bahasa Indonesia dan Palu sesuai ejaan standar.",
      },
    ],
  })

  await createQuizWithQuestions({
    material: materiKarakter,
    title: "Kuis Pendidikan Karakter",
    description: "Uji pemahaman nilai-nilai karakter bangsa.",
    category: Category.KARAKTER,
    xpReward: 50,
    questions: [
      {
        question: "Nilai karakter yang melibatkan kejujuran dan keutuhan hati adalah?",
        options: ["Integritas", "Kegembiraan", "Kecanggihan", "Kemewahan"],
        correctIndex: 0,
        explanation: "Integritas adalah keutuhan moral dan kejujuran dalam bertindak.",
      },
      {
        question: "Sikap saling membantu antar sesama disebut?",
        options: ["Gotong royong", "Individualisme", "Kompetisi", "Kesombongan"],
        correctIndex: 0,
        explanation: "Gotong royong adalah sikap saling membantu dan bekerja sama.",
      },
      {
        question: "Menjaga ketepatan waktu dan aturan adalah ciri?",
        options: ["Disiplin", "Lalai", "Sombong", "Seleser"],
        correctIndex: 0,
        explanation: "Disiplin berarti taat pada aturan dan waktu yang ditetapkan.",
      },
      {
        question: "Menghormati agama dan beribadah sesuai ajarannya adalah?",
        options: ["Religius", "Sekular", "Apatis", "Sombong"],
        correctIndex: 0,
        explanation: "Sikap religius meliputi keimanan dan ketaatan beragama.",
      },
      {
        question: "Berusaha sebaik-baiknya dalam hal positif adalah?",
        options: ["Keras keras (martabat)", "Merah muda", "Malas", "Pesonanya"],
        correctIndex: 0,
        explanation: "Martabat/keras keras artinya berusaha maksimal dalam hal yang positif.",
      },
    ],
  })

  await createQuizWithQuestions({
    material: materiBudaya,
    title: "Kuis Budaya Sulawesi Tengah",
    description: "Uji pemahaman kearifan lokal Sulawesi Tengah.",
    category: Category.BUDAYA_SULTENG,
    xpReward: 50,
    questions: [
      {
        question: "Tenun khas Donggala dikenal sebagai identitas warisan pesona?",
        options: ["Tenun Donggala", "Tenun Seko", "Tenun Toraja", "Tenun Bali"],
        correctIndex: 0,
        explanation: "Tenun Donggala adalah tenun khas Kabupaten Donggala, Sulawesi Tengah.",
      },
      {
        question: "Makanan tradisional Sulawesi Tengah yang terbuat dari sagu adalah?",
        options: ["Kapurung", "Nasi goreng", "Mie ayam", "Roti"],
        correctIndex: 0,
        explanation: "Kapurung adalah makanan tradisional Sulteng yang terbuat dari sagu.",
      },
      {
        question: "Taman Nasional Lore Lindu terkenal dengan?",
        options: ["Arca megulith dan prasasti", "Pantai", "Gunung berapi", "Danau vulkanik"],
        correctIndex: 0,
        explanation: "Lore Lindu dikenal dengan situs arca megulith dan prasasti purba.",
      },
      {
        question: "Minuman tradisional Sulawesi Tengah yang terbuat dari gula aren adalah?",
        options: ["Gulo", "Es teh", "Kopi", "Teh"],
        correctIndex: 0,
        explanation: "Gulo adalah minuman tradisional dari gula aren/aren.",
      },
      {
        question: "Bahasa yang digunakan dalam perkantoran dan sekolah di Sulteng adalah?",
        options: ["Bahasa Indonesia", "Bahasa Inggris", "Jawa", "Sunda"],
        correctIndex: 0,
        explanation: "Bahasa Indonesia adalah bahasa resmi dan terpadu di Indonesia.",
      },
    ],
  })

  console.log("✅ Seeding selesai. Akun demo: andi/siswa123, guru/guru123, admin/admin123")
}

main()
  .catch((e) => {
    console.error("❌ Seeding gagal:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
