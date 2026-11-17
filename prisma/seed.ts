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
]

async function main() {
  // ========================================================================
  // 1. BERSIHKAN DATA LAMA (urutan terbalik dependensi foreign key)
  // ========================================================================
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
      content:
        "<h2>Ejaan yang Disempurnakan V (EYD V)</h2><p>EYD V adalah ejaan resmi Bahasa Indonesia yang berlaku saat ini. Beberapa aturan penting meliputi penulisan huruf besar, kata ganda, imbuhan, dan gabungan kata.</p><h3>Contoh Aturan</h3><ul><li>Kata benda diawali huruf besar jika nama khusus, misalnya: Palu, Donggala, Lore Lindu.</li><li>Imbuhan di- dan ke-...-an ditulis langsung dengan kata dasar, misalnya: <i>dibaca</i>, <i>kemewahan</i>.</li><li>Kata ganda ditulis penuh dengan hubung kali, misalnya: <i>buku-buku</i>, <i>mata-mata</i>.</li></ul>",
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
      content:
        "<h2>Pendidikan Karakter</h2><p>Pendidikan karakter adalah upaya untuk menanamkan nilai-nilai luhur kepada peserta didik agar menjadi insan yang berakhlak mulia.</p><h3>Enam Pilar Karakter</h3><ol><li>Religius: taat dalam beragama dan menghormati agama lain.</li><li>Jujur: berkomunikasi dan bertindak dengan jujur.</li><li>Disiplin: taat pada aturan dan waktu.</li><li>Keras keras (martabat): berusaha keras dalam hal positif.</li><li>Gotong royong: saling membantu dan gotong royong.</li><li>Kepedulian sosial: peduli dengan sesama.</li></ol>",
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
      content:
        "<h2>Budaya Sulawesi Tengah</h2><p>Sulawesi Tengah memiliki keragaman budaya yang kaya, mulai dari tenun khas Donggala hingga megulith di Lore Lindu.</p><h3>Sarana Budaya</h3><ul><li><b>Tenun Donggala:</b> tenun khas dengan motif tenun marun dan emas, identitas warisan pesona Sulawesi Tengah.</li><li><b>Taman Nasional Lore Lindu:</b> merupakan situs warisan dunia dengan prasasti dan arca megulith.</li><li><b>Makanan tradisional:</b> sinonggi, gulo, dan kapurung.</li></ul>",
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
