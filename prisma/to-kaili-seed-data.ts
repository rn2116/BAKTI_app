export interface SeedRegionalMatrix {
  indonesianCharacter: string
  regionalLanguage: "KAILI"
  regionalTerm: string
  characterSource: string
  implementation: string
}

export interface SeedToKailiMaterial {
  title: string
  slug: string
  description: string
  readingTime: number
  orderIndex: number
  referenceSource: string
  content: string
}

const BOOK_SOURCE =
  "Kumpulan Ungkapan Bijak To Kaili — Dr. H. Suaib Djafar, M.Si (Pemerhati Bahasa & Kearifan Lokal Sulawesi Tengah)"

/**
 * 63 Ungkapan Bijak To Kaili — Rujukan:
 * "Kumpulan Ungkapan Bijak To Kaili" karya Dr. H. Suaib Djafar, M.Si
 * Terindeks penuh pada Kamus Besar Kearifan Lokal Sulawesi Tengah.
 */
export const TO_KAILI_63_SAYINGS: SeedRegionalMatrix[] = [
  // Kelompok 1: Persaudaraan, Kasih Sayang & Empati (1–15)
  {
    indonesianCharacter: "Persaudaraan, Empati & Toleransi",
    regionalLanguage: "KAILI",
    regionalTerm: "Mosipeili, Mosimpotove, Mosimpoasi, Nosarara Nosabatutu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Saling menengok saat sakit, menyayangi dan mengasihi sesama tanpa membedakan latar belakang, serta menjaga persatuan komunitas.",
  },
  {
    indonesianCharacter: "Kepedulian Sosial & Kemanusiaan",
    regionalLanguage: "KAILI",
    regionalTerm:
      "Ane Murasai Dua Karomu Danatuvu, Ane Komiu Mbarasai Duatonantanina, Komiu Manusia",
    characterSource: BOOK_SOURCE,
    implementation:
      "Turut merasakan kesusahan sesama atau warga terdampak musibah, aktif berbagi bantuan kemanusiaan, dan menumbuhkan kepekaan hati nurani.",
  },
  {
    indonesianCharacter: "Ikatan Kekeluargaan Sejati",
    regionalLanguage: "KAILI",
    regionalTerm: "Nosarara Nosabatutu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Memandang seluruh warga sebagai saudara sekandung yang saling menjaga kehormatan, keamanan, dan kerukunan hidup bertetangga.",
  },
  {
    indonesianCharacter: "Saling Mengasihi dalam Kebersamaan",
    regionalLanguage: "KAILI",
    regionalTerm: "Mosimpotove Ante Mosimpoasi",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menunjukkan kepedulian nyata kepada teman yang kesulitan dan membiasakan sikap lembut dalam setiap interaksi harian.",
  },
  {
    indonesianCharacter: "Saling Mengunjungi & Mempererat Silaturahmi",
    regionalLanguage: "KAILI",
    regionalTerm: "Mosipeili Ri Posi",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga silaturahmi dengan keluarga, tetangga, dan rekan belajar baik saat suka maupun duka agar tali persaudaraan tetap hangat.",
  },
  {
    indonesianCharacter: "Ketulusan Memaafkan Kesalahan",
    regionalLanguage: "KAILI",
    regionalTerm: "Mompakabelo Ranga",
    characterSource: BOOK_SOURCE,
    implementation:
      "Berlapang dada memaafkan kekhilafan sesama, tidak menyimpan dendam, dan memperbaiki hubungan komunikasi yang sempat renggang.",
  },
  {
    indonesianCharacter: "Kesetiaan Menjaga Kehormatan Saudara",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Mopakasiri Toposampesuvu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga nama baik keluarga dan sesama peserta didik dengan tidak menyebarkan aib atau pergunjingan di media sosial.",
  },
  {
    indonesianCharacter: "Empati terhadap Kaum Lemah",
    regionalLanguage: "KAILI",
    regionalTerm: "Metulungi Tona Madodo",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mengulurkan tangan lebih dahulu kepada warga lanjut usia, penyandang disabilitas, dan masyarakat prasejahtera di sekitar.",
  },
  {
    indonesianCharacter: "Kerukunan Lintas Suku & Golongan",
    regionalLanguage: "KAILI",
    regionalTerm: "Todea Kaili Masintuvu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Hidup berdampingan secara damai dengan seluruh pendatang dan warga dari berbagai daerah di Sulawesi Tengah.",
  },
  {
    indonesianCharacter: "Berbagi Rezeki dengan Ikhlas",
    regionalLanguage: "KAILI",
    regionalTerm: "Mombagi Kasananga Ante Todea",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menyisihkan sebagian rezeki atau ilmu pengetahuan secara sukarela bagi mereka yang lebih membutuhkan.",
  },
  {
    indonesianCharacter: "Menghargai Kehadiran Sesama",
    regionalLanguage: "KAILI",
    regionalTerm: "Mpoviana Ranga Matana",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menyambut tamu dan teman baru dengan senyuman hangat, sapaan santun, serta sikap hormat tanpa memandang status.",
  },
  {
    indonesianCharacter: "Kebersamaan dalam Suka dan Duka",
    regionalLanguage: "KAILI",
    regionalTerm: "Mosangu Ri Karana, Mosangu Ri Kasusa",
    characterSource: BOOK_SOURCE,
    implementation:
      "Hadir membantu tetangga atau teman saat tertimpa musibah dan turut bersyukur atas capaian positif orang lain.",
  },
  {
    indonesianCharacter: "Kasih Sayang Orang Tua & Guru",
    regionalLanguage: "KAILI",
    regionalTerm: "Potove Nu Totua Ante Guru",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menghormati nasihat orang tua dan pendidik dengan penuh ketulusan serta mendoakan keselamatan mereka.",
  },
  {
    indonesianCharacter: "Keharmonisan Hidup Bermasyarakat",
    regionalLanguage: "KAILI",
    regionalTerm: "Naama Ngata Sababu Nosarara",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga ketertiban lingkungan permukiman maupun tempat belajar dengan semangat kekeluargaan dan saling percaya.",
  },
  {
    indonesianCharacter: "Menghindari Perselisihan Sia-Sia",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Mosigau Ranga",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menyelesaikan perbedaan pendapat melalui dialog yang tenang, objektif, dan berorientasi pada solusi bersama.",
  },

  // Kelompok 2: Gotong Royong, Kebersamaan & Membangun Negeri (16–31)
  {
    indonesianCharacter: "Gotong Royong & Kebersamaan",
    regionalLanguage: "KAILI",
    regionalTerm:
      "Moenju Mosangu, Meangga Mosangu, Mompakavoe Maggali Palu Manyama Todeana",
    characterSource: BOOK_SOURCE,
    implementation:
      "Bekerja bakti membersihkan lingkungan sekolah, kampung, dan fasilitas umum secara bersama-sama demi kenyamanan masyarakat luas.",
  },
  {
    indonesianCharacter: "Nasionalisme & Kerja Sama Membangun Negeri",
    regionalLanguage: "KAILI",
    regionalTerm: "Mosangu Morambanga Mombangu Ngata",
    characterSource: BOOK_SOURCE,
    implementation:
      "Bersatu padu dalam kegiatan kemasyarakatan, mengharumkan nama daerah melalui prestasi nyata, dan aktif membangun lingkungan.",
  },
  {
    indonesianCharacter: "Persatuan Memperkuat Komunitas",
    regionalLanguage: "KAILI",
    regionalTerm: "Masintuvu Kita Maroso, Morambanga Kita Marisi",
    characterSource: BOOK_SOURCE,
    implementation:
      "Membangun kekompakan tim dalam proyek pembelajaran atau organisasi masyarakat sehingga tugas berat terasa ringan.",
  },
  {
    indonesianCharacter: "Bahu-Membahu dalam Pekerjaan",
    regionalLanguage: "KAILI",
    regionalTerm: "Nosintuvu Ri Pombangu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Membagi peran kerja secara adil dalam kerja kelompok tanpa membebankan pekerjaan hanya pada satu orang.",
  },
  {
    indonesianCharacter: "Musyawarah Menentukan Mufakat",
    regionalLanguage: "KAILI",
    regionalTerm: "Libu Nuada Ante Todea",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mengutamakan musyawarah mufakat sebelum mengambil keputusan penting yang menyangkut kepentingan banyak orang.",
  },
  {
    indonesianCharacter: "Menjaga Alam Lembah Palu",
    regionalLanguage: "KAILI",
    regionalTerm: "Mompakabelo Ngata Ante Pombangu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menanam pohon, memilah sampah, dan menjaga kebersihan sungai serta teluk sebagai tanggung jawab bersama.",
  },
  {
    indonesianCharacter: "Kekompakan Melangkah Bersama",
    regionalLanguage: "KAILI",
    regionalTerm: "Moenju Mosangu Ri Dala Mabelo",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mendukung inisiatif kebaikan di lingkungan belajar maupun komunitas agar berjalan selaras dan berkelanjutan.",
  },
  {
    indonesianCharacter: "Solidaritas Gotong Royong Tradisional",
    regionalLanguage: "KAILI",
    regionalTerm: "Nosialu Ri Poviaka",
    characterSource: BOOK_SOURCE,
    implementation:
      "Saling membantu menyelesaikan tugas sosial atau hajatan warga secara bergiliran dengan semangat sukarela.",
  },
  {
    indonesianCharacter: "Mengutamakan Kepentingan Umum",
    regionalLanguage: "KAILI",
    regionalTerm: "Kagau Nu Todea Lebi Masagena",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mendahulukan kemaslahatan bersama di atas kepentingan pribadi saat mengelola fasilitas atau kegiatan publik.",
  },
  {
    indonesianCharacter: "Ketekunan Membangun Masa Depan",
    regionalLanguage: "KAILI",
    regionalTerm: "Maroso Kamao Ri Pombangu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Bekerja keras dengan semangat pantang menyerah untuk memajukan kualitas diri, keluarga, dan daerah.",
  },
  {
    indonesianCharacter: "Menjaga Kebersihan Lingkungan Bersama",
    regionalLanguage: "KAILI",
    regionalTerm: "Mompakavoe Ngata Ante Banua",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga kerapian ruang belajar, rumah, dan fasilitas umum tanpa menunggu perintah orang lain.",
  },
  {
    indonesianCharacter: "Kesetaraan dalam Berkontribusi",
    regionalLanguage: "KAILI",
    regionalTerm: "Sangu Ada Sangu Poviaka",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menghargai setiap sumbangsih tenaga, pikiran, maupun gagasan kecil dari setiap anggota kelompok.",
  },
  {
    indonesianCharacter: "Kemandirian Masyarakat yang Saling Menopang",
    regionalLanguage: "KAILI",
    regionalTerm: "Matuvu Ante Morambanga",
    characterSource: BOOK_SOURCE,
    implementation:
      "Melatih kemandirian belajar sekaligus tetap terbuka berkolaborasi dengan teman dan komunitas.",
  },
  {
    indonesianCharacter: "Semangat Pembaruan & Kemajuan Daerah",
    regionalLanguage: "KAILI",
    regionalTerm: "Mombangu Ngata Ri Zaman Baaru",
    characterSource: BOOK_SOURCE,
    implementation:
      "Memanfaatkan teknologi informasi secara bijak dan produktif untuk memperkenalkan potensi Sulawesi Tengah.",
  },
  {
    indonesianCharacter: "Keselarasan Pemimpin & Rakyat",
    regionalLanguage: "KAILI",
    regionalTerm: "Tadulako Mosangu Ante Todea",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjalankan amanah kepemimpinan di organisasi sekolah atau masyarakat dengan mendengar aspirasi seluruh anggota.",
  },
  {
    indonesianCharacter: "Kewajiban Merawat Warisan Leluhur",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Lupa Pombangu Nu Totua",
    characterSource: BOOK_SOURCE,
    implementation:
      "Memelihara peninggalan sejarah, prasasti, dan nilai kearifan lokal agar tetap relevan bagi generasi penerus.",
  },

  // Kelompok 3: Integritas, Kejujuran Moral & Ketaatan Adat (32–47)
  {
    indonesianCharacter: "Religius & Taat Norma Adat",
    regionalLanguage: "KAILI",
    regionalTerm: "Maroso Agama, Maroso Ada, Naama Ngata",
    characterSource: BOOK_SOURCE,
    implementation:
      "Rajin beribadah sesuai keyakinan, menghormati orang tua, dan menaati tata krama adat demi ketenteraman bersama.",
  },
  {
    indonesianCharacter: "Integritas & Kejujuran Moral",
    regionalLanguage: "KAILI",
    regionalTerm:
      "Nariatona Nakanano Nasesa Haram Kalebara Nuapa Anurakande Nikitana Ripombunguna Asaladakonuapa Nipoviaka",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga kejujuran saat ujian dan tugas, menjauhi kecurangan serta pengambilan hak orang lain, dan mencari prestasi secara halal.",
  },
  {
    indonesianCharacter: "Kesesuaian Ucapan dan Perbuatan",
    regionalLanguage: "KAILI",
    regionalTerm: "Sangu Pau Sangu Poviaka",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menepati setiap janji yang diucapkan dan tidak mengobral pernyataan tanpa pembuktian tindakan nyata.",
  },
  {
    indonesianCharacter: "Amanah Memegang Kepercayaan",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Mpopakabaga Amanah",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga kepercayaan teman, guru, dan pimpinan saat diberi tanggung jawab mengelola tugas maupun keuangan organisasi.",
  },
  {
    indonesianCharacter: "Kejujuran Meski Tanpa Pengawasan",
    regionalLanguage: "KAILI",
    regionalTerm: "Mabelo Ranga Ri Lino Ante Ri Petu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Tetap bersikap jujur selama ujian daring maupun saat bekerja sendiri tanpa pengawas di ruangan.",
  },
  {
    indonesianCharacter: "Menjauhi Hak Orang Lain",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Mampakaala Barang Nu Tona",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mengembalikan barang temuan kepada pemiliknya dan selalu meminta izin sebelum meminjam milik orang lain.",
  },
  {
    indonesianCharacter: "Keteguhan Prinsip Kebenaran",
    regionalLanguage: "KAILI",
    regionalTerm: "Maroso Ri Dala Matutu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Berani menyampaikan kebenaran secara santun dan menolak ajakan berbuat curang atau plagiasi.",
  },
  {
    indonesianCharacter: "Keadilan Adat bagi Semua",
    regionalLanguage: "KAILI",
    regionalTerm: "Ada Matutu Ante Todea",
    characterSource: BOOK_SOURCE,
    implementation:
      "Bersikap adil saat menilai teman atau membagi tugas tanpa pilih kasih maupun memihak secara tidak objektif.",
  },
  {
    indonesianCharacter: "Tanggung Jawab atas Kesalahan",
    regionalLanguage: "KAILI",
    regionalTerm: "Berani Ngaku Sala, Berani Mpakabelo",
    characterSource: BOOK_SOURCE,
    implementation:
      "Tidak melempar kesalahan kepada orang lain dan segera memperbaiki kekeliruan yang telah dilakukan.",
  },
  {
    indonesianCharacter: "Disiplin Waktu dan Tata Tertib",
    regionalLanguage: "KAILI",
    regionalTerm: "Matoro Waktu Ante Poviaka",
    characterSource: BOOK_SOURCE,
    implementation:
      "Hadir tepat waktu dalam pertemuan dan menyelesaikan seluruh tugas pembelajaran sebelum batas waktu.",
  },
  {
    indonesianCharacter: "Kesederhanaan & Bersyukur",
    regionalLanguage: "KAILI",
    regionalTerm: "Syukuru Ri Apa Nu Nikaa",
    characterSource: BOOK_SOURCE,
    implementation:
      "Hidup bersahaja, tidak memamerkan kemewahan, dan mensyukuri setiap nikmat yang telah dianugerahkan.",
  },
  {
    indonesianCharacter: "Kewaspadaan terhadap Sifat Tamak",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Laba Ranga",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mengendalikan hawa nafsu agar tidak serakah dalam mencari keuntungan maupun pengakuan.",
  },
  {
    indonesianCharacter: "Kehati-hatian Menjaga Nama Baik",
    regionalLanguage: "KAILI",
    regionalTerm: "Jaga Diri Ante Adat",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga perilaku di ruang publik maupun ruang digital sesuai norma kesopanan masyarakat Sulawesi Tengah.",
  },
  {
    indonesianCharacter: "Kebersihan Niat dalam Bekerja",
    regionalLanguage: "KAILI",
    regionalTerm: "Nia Mabelo Mpakadadi Baraka",
    characterSource: BOOK_SOURCE,
    implementation:
      "Memulai setiap aktivitas belajar atau bekerja dengan niat tulus memberi manfaat bagi sesama.",
  },
  {
    indonesianCharacter: "Keberanian Moral Membela Kebenaran",
    regionalLanguage: "KAILI",
    regionalTerm: "Tadulako Ri Kebenaran",
    characterSource: BOOK_SOURCE,
    implementation:
      "Melindungi teman yang lemah dan meluruskan informasi keliru secara santun berbasis fakta.",
  },
  {
    indonesianCharacter: "Keseimbangan Dunia dan Pengabdian",
    regionalLanguage: "KAILI",
    regionalTerm: "Agama Tuntunan, Ada Pagar Ngata",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjadikan ajaran agama dan norma adat luhur sebagai pedoman mengambil keputusan dalam kehidupan modern.",
  },

  // Kelompok 4: Cinta Bahasa Ibu, Kesantunan Tutur & Kearifan Hidup (48–63)
  {
    indonesianCharacter: "Cinta Bahasa Ibu & Jati Diri Daerah",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Rapakalipo Basa Kaili",
    characterSource: BOOK_SOURCE,
    implementation:
      "Bangga mempelajari dan menuturkan bahasa daerah Kaili dengan santun di keluarga serta kegiatan literasi.",
  },
  {
    indonesianCharacter: "Kesantunan Berbicara kepada Orang Tua",
    regionalLanguage: "KAILI",
    regionalTerm: "Basa Halusu Ri Totua",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menggunakan pilihan kata yang halus, nada suara rendah, dan sikap tubuh hormat saat berbicara kepada orang yang lebih tua.",
  },
  {
    indonesianCharacter: "Berpikir Sebelum Berucap",
    regionalLanguage: "KAILI",
    regionalTerm: "Kira-kira Dolu Ante Pau",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menimbang dampak ucapan agar tidak menyinggung perasaan atau menyakiti hati lawan bicara, baik lisan maupun tulisan.",
  },
  {
    indonesianCharacter: "Menghargai Kekuatan Kata-Kata",
    regionalLanguage: "KAILI",
    regionalTerm: "Pau Mabelo Mpakasalama",
    characterSource: BOOK_SOURCE,
    implementation:
      "Membiasakan menyampaikan kalimat penyemangat, apresiasi, dan kritik membangun dalam diskusi.",
  },
  {
    indonesianCharacter: "Menghindari Ujaran Kasar & Fitnah",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Mpopau Bau Kasaa",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menolak menyebarkan kabar bohong (hoaks), ejekan, atau ujaran kebencian di percakapan sehari-hari.",
  },
  {
    indonesianCharacter: "Kegemaran Menuntut Ilmu Sepanjang Hayat",
    regionalLanguage: "KAILI",
    regionalTerm: "Tuntutu Ilmu Sampe Tuvo",
    characterSource: BOOK_SOURCE,
    implementation:
      "Terus membaca buku, berdiskusi ilmiah, dan belajar keterampilan baru tanpa mengenal batas usia.",
  },
  {
    indonesianCharacter: "Kerendahan Hati Orang Berilmu",
    regionalLanguage: "KAILI",
    regionalTerm: "Makin Pintara Makin Tundu",
    characterSource: BOOK_SOURCE,
    implementation:
      "Semakin tinggi ilmu dan prestasi yang diraih, semakin rendah hati dan siap membimbing orang lain.",
  },
  {
    indonesianCharacter: "Kebijaksanaan Mendengarkan Orang Lain",
    regionalLanguage: "KAILI",
    regionalTerm: "Denge Dolu Pau Nu Tona",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjadi pendengar yang baik dan tidak memotong pembicaraan orang lain saat berdiskusi.",
  },
  {
    indonesianCharacter: "Kesabaran Menghadapi Ujian Hidup",
    regionalLanguage: "KAILI",
    regionalTerm: "Sabara Ri Dala Ujia",
    characterSource: BOOK_SOURCE,
    implementation:
      "Tetap tenang, berpikir jernih, dan tidak mudah putus asa ketika menemui kesulitan dalam belajar atau bekerja.",
  },
  {
    indonesianCharacter: "Keramahan Menyambut Tamu",
    regionalLanguage: "KAILI",
    regionalTerm: "Ranga Mabelo Ri Tomai",
    characterSource: BOOK_SOURCE,
    implementation:
      "Memuliakan tamu dengan tutur kata ramah, senyum tulus, dan pelayanan terbaik sesuai tradisi Sulawesi Tengah.",
  },
  {
    indonesianCharacter: "Ketekunan Meraih Cita-Cita",
    regionalLanguage: "KAILI",
    regionalTerm: "Nemo Malojo Ri Usaha",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mengerjakan latihan dan proyek secara tuntas, tidak cepat bosan atau bermalas-malasan di tengah jalan.",
  },
  {
    indonesianCharacter: "Keseimbangan Bahasa Indonesia & Daerah",
    regionalLanguage: "KAILI",
    regionalTerm: "Mahir Basa Indonesia, Lestarikan Basa Daerah",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menggunakan bahasa Indonesia yang baku sesuai EYD V di forum resmi sekaligus melestarikan bahasa ibu di ranah keluarga.",
  },
  {
    indonesianCharacter: "Menghargai Nasihat Tetua Kampung",
    regionalLanguage: "KAILI",
    regionalTerm: "Pau Totua Pedomana Tuvo",
    characterSource: BOOK_SOURCE,
    implementation:
      "Mencatat dan merenungkan petuah kearifan lokal dari para sesepuh sebagai bekal menghadapi tantangan zaman.",
  },
  {
    indonesianCharacter: "Keikhlasan Memberi Manfaat",
    regionalLanguage: "KAILI",
    regionalTerm: "Mpakabelo Tuvo Nu Todea",
    characterSource: BOOK_SOURCE,
    implementation:
      "Berorientasi pada kebermanfaatan karya dan kontribusi nyata bagi lingkungan sekitar.",
  },
  {
    indonesianCharacter: "Kewaspadaan dalam Pergaulan",
    regionalLanguage: "KAILI",
    regionalTerm: "Pilihi Ranga Mabelo",
    characterSource: BOOK_SOURCE,
    implementation:
      "Cermat memilih lingkungan pergaulan dan konten digital yang mendorong pertumbuhan akhlak mulia.",
  },
  {
    indonesianCharacter: "Harapan & Doa untuk Kemakmuran Negeri",
    regionalLanguage: "KAILI",
    regionalTerm: "Manyama Todeana, Selamat Ngatana",
    characterSource: BOOK_SOURCE,
    implementation:
      "Menjaga optimisme dan terus berdoa serta berkarya demi kesejahteraan seluruh masyarakat Sulawesi Tengah.",
  },
]

export const TO_KAILI_THEMATIC_MATERIALS: SeedToKailiMaterial[] = [
  {
    title: "Seri 1 To Kaili: Persaudaraan, Kasih Sayang & Empati Sosial",
    slug: "seri-1-persaudaraan-empati-to-kaili",
    description:
      "Menelaah ungkapan bijak To Kaili bertema persaudaraan (Nosarara Nosabatutu), kasih sayang, dan kepekaan kemanusiaan dari buku Dr. H. Suaib Djafar, M.Si.",
    readingTime: 8,
    orderIndex: 4,
    referenceSource: "Kumpulan Ungkapan Bijak To Kaili — Dr. H. Suaib Djafar, M.Si",
    content: `## Seri 1: Persaudaraan, Kasih Sayang, dan Empati To Kaili

Masyarakat Kaili di Lembah Palu, Sigi, Donggala, dan Parigi Moutong mewarisi kekayaan sastra lisan berupa ungkapan bijak yang menjadi kompas moral kehidupan sosial. Dalam karya *Kumpulan Ungkapan Bijak To Kaili* susunan Dr. H. Suaib Djafar, M.Si., ikatan persaudaraan menempati kedudukan paling mulia dalam menjaga harmoni masyarakat.

### Ungkapan Pokok Persaudaraan & Empati

- Mosipeili, Mosimpotove, Mosimpoasi, Nosarara Nosabatutu: Empat serangkai nilai luhur yang berarti saling menengok saat kesusahan, saling menyayangi dengan tulus, saling mengasihi tanpa pamrih, serta bersatu sebagai satu saudara kandung.
- Ane Murasai Dua Karomu Danatuvu, Ane Komiu Mbarasai Duatonantanina, Komiu Manusia: Jika engkau hanya merasakan derita dirimu sendiri, engkau baru sekadar makhluk hidup; namun jika engkau turut merasakan penderitaan sesamamu, barulah engkau disebut manusia sejati.
- Mosangu Ri Karana, Mosangu Ri Kasusa: Kebersamaan bukan hanya hadir saat perayaan suka cita, melainkan teruji ketika saudara atau tetangga mengalami musibah.

> Falsafah Lokal: Dalam kehidupan bermasyarakat modern di Sulawesi Tengah, semboyan **Nosarara Nosabatutu** mengajarkan kita menolak perundungan, diskriminasi latar belakang, serta ujaran kebencian baik di ruang kelas maupun di ruang digital.

### Penerapan Konteks Sosial Masa Kini

Setiap peserta dapat menghidupkan ajaran empati To Kaili melalui langkah-langkah sederhana namun konsisten:

1. Saling Menjenguk dan Peduli: Menanyakan kabar teman atau rekan kerja yang berhalangan hadir karena sakit serta menggalang dukungan kemanusiaan bagi warga terdampak bencana alam.
2. Komunikasi Penuh Kasih: Menghindari komentar yang merendahkan martabat orang lain dan membiasakan sapaan ramah di lingkungan instansi maupun masyarakat.
3. Menjaga Marwah Saudara: Tidak menyebarluaskan aib atau pergunjingan, melainkan menyelesaikan kesalahpahaman secara empat mata dengan penuh rasa hormat.

### Catatan Penting
Seluruh 15 lema ungkapan bijak tema persaudaraan dan empati To Kaili juga tersedia pada menu **Kamus Besar Kearifan Lokal Sulawesi Tengah** untuk latihan pelafalan audio dan kartu kilas.`,
  },
  {
    title: "Seri 2 To Kaili: Gotong Royong, Musyawarah & Membangun Negeri",
    slug: "seri-2-gotong-royong-membangun-negeri-to-kaili",
    description:
      "Memahami etos kerja kolektif, musyawarah Libu Nuada, dan semangat membangun daerah dari ungkapan bijak To Kaili karya Dr. H. Suaib Djafar, M.Si.",
    readingTime: 8,
    orderIndex: 5,
    referenceSource: "Kumpulan Ungkapan Bijak To Kaili — Dr. H. Suaib Djafar, M.Si",
    content: `## Seri 2: Gotong Royong, Musyawarah, dan Membangun Negeri

Kemajuan sebuah negeri (*ngata*) menurut kearifan lokal masyarakat Kaili tidak bertumpu pada kehebatan satu individu semata, melainkan pada kesatuan langkah dan kekompakan seluruh warga. Pemikiran ini terangkum kuat dalam ungkapan-ungkapan kerja sama yang dihimpun oleh Dr. H. Suaib Djafar, M.Si.

### Ungkapan Pokok Gotong Royong & Pembangunan Daerah

- Moenju Mosangu, Meangga Mosangu, Mompakavoe Maggali Palu Manyama Todeana: Melangkah bersama dan bekerja seirama untuk membersihkan, merawat, dan memakmurkan Lembah Palu demi kesejahteraan seluruh masyarakat.
- Mosangu Morambanga Mombangu Ngata: Bersatu padu serta bahu-membahu membangun kampung halaman dan negeri tercinta dengan semangat kebangsaan.
- Masintuvu Kita Maroso, Morambanga Kita Marisi: Apabila kita bersatu, kita menjadi kuat; apabila kita melangkah bersama, kita menjadi teguh menghadapi berbagai tantangan zaman.

> Contoh Aturan Musyawarah: Tradisi **Libu Nuada** menekankan bahwa keputusan yang menyangkut kepentingan orang banyak wajib dibicarakan secara terbuka, mendengar pendapat yang beragam, lalu dilaksanakan bersama dengan penuh keikhlasan.

### Kontribusi Nyata Warga dan Peserta

1. Kerja Bakti dan Kelestarian Lingkungan: Turut serta menjaga kebersihan fasilitas umum, merawat penghijauan, serta menjaga kebersihan pesisir Teluk Palu dan sumber air bersih.
2. Kolaborasi Produktif: Membagi peran secara adil dalam tugas kelompok atau proyek komunitas agar hasil karya berkualitas dan selesai tepat waktu.
3. Inovasi untuk Daerah: Menggunakan kecakapan literasi digital dan bahasa Indonesia yang baku untuk mempromosikan potensi wisata, ekonomi kreatif, dan kearifan lokal Sulawesi Tengah secara positif.

### Catatan Penting
Anda dapat menelusuri variasi lema gotong royong dan kerja sama daerah dari sembilan lebih bahasa di Sulawesi Tengah melalui **Kamus Besar Kearifan Lokal Sulawesi Tengah**.`,
  },
  {
    title: "Seri 3 To Kaili: Integritas Moral, Kejujuran & Ketaatan Adat",
    slug: "seri-3-integritas-ketaatan-adat-to-kaili",
    description:
      "Mendalami keteguhan prinsip kejujuran, menjauhi kecurangan, serta keselarasan agama dan adat To Kaili karya Dr. H. Suaib Djafar, M.Si.",
    readingTime: 9,
    orderIndex: 6,
    referenceSource: "Kumpulan Ungkapan Bijak To Kaili — Dr. H. Suaib Djafar, M.Si",
    content: `## Seri 3: Integritas Moral, Kejujuran, dan Ketaatan Adat

Kejujuran dan kepatuhan terhadap norma merupakan tiang penyangga keamanan sebuah wilayah. Tanpa integritas moral, kepandaian intelektual justru berisiko merusak tatanan masyarakat. Buku *Kumpulan Ungkapan Bijak To Kaili* karya Dr. H. Suaib Djafar, M.Si. menyoroti hal ini melalui petuah yang sangat tegas.

### Ungkapan Pokok Integritas & Norma Adat

- Nariatona Nakanano Nasesa Haram Kalebara Nuapa Anurakande Nikitana Ripombunguna Asaladakonuapa Nipoviaka: Harta maupun makanan yang diperoleh dari jalan curang atau haram hanya merusak jiwa raga, sedangkan rezeki yang halal serta jujur akan menuntun pada keberkahan di setiap perbuatan.
- Maroso Agama, Maroso Ada, Naama Ngata: Ketika warga teguh menjalankan tuntunan agama dan kuat menjaga norma adat istiadat yang luhur, niscaya negeri akan aman, tenteram, dan sejahtera.
- Sangu Pau Sangu Poviaka: Keselarasan antara ucapan dan perbuatan nyata adalah ukuran utama kehormatan seseorang di tengah masyarakat.

> Catatan Penting Kejujuran Akademik: Dalam pelaksanaan evaluasi pada LMS Bahasa & Karakter, peserta didorong menjunjung prinsip kejujuran diri sendiri (*Mode Ujian Jujur*) sebagai perwujudan nyata petuah **Sangu Pau Sangu Poviaka**.

### Implementasi Integritas di Era Digital

1. Anti-Plagiasi dan Kejujuran Karya: Selalu mencantumkan sumber rujukan asli penulis dan tidak menyalin karya orang lain tanpa izin.
2. Amanah dalam Tugas: Menjaga kepercayaan ketika dipercaya mengemban jabatan, mengelola anggaran kegiatan, ataupun menjaga rahasia lembaga.
3. Disiplin dan Tanggung Jawab: Mengakui kekeliruan secara kesatria apabila berbuat salah dan segera memperbaikinya tanpa menyalahkan pihak lain.

### Catatan Penting
Seluruh ungkapan bijak tema integritas moral To Kaili siap diuji pemahamannya pada paket **Uji Karakter: Kumpulan Ungkapan Bijak To Kaili**.`,
  },
  {
    title: "Seri 4 To Kaili: Cinta Bahasa Ibu & Kesantunan Tutur Kata",
    slug: "seri-4-cinta-bahasa-ibu-to-kaili",
    description:
      "Menjaga kelestarian bahasa ibu (Nemo Rapakalipo Basa Kaili) dan etika kesantunan tutur kata selaras kaidah EYD V dan KBBI.",
    readingTime: 7,
    orderIndex: 7,
    referenceSource: "Kumpulan Ungkapan Bijak To Kaili — Dr. H. Suaib Djafar, M.Si",
    content: `## Seri 4: Cinta Bahasa Ibu dan Kesantunan Tutur Kata

Bahasa adalah cerminan budi pekerti penuturnya. Semboyan Trigatra Bangun Bahasa mengamanatkan agar masyarakat mengutamakan bahasa Indonesia, melestarikan bahasa daerah, dan menguasai bahasa asing. Dalam khazanah To Kaili yang dihimpun oleh Dr. H. Suaib Djafar, M.Si., pesan menjaga bahasa ibu dan kesantunan tutur terpatri sangat kuat.

### Ungkapan Pokok Cinta Bahasa Ibu & Tata Krama Tutur

- Nemo Rapakalipo Basa Kaili: Jangan sekali-kali melupakan bahasa Kaili sebagai bahasa ibu dan warisan jati diri leluhur di bumi Sulawesi Tengah.
- Basa Halusu Ri Totua: Menggunakan pilihan kata halus, sapaan hormat, dan intonasi santun ketika berbicara kepada orang tua, guru, serta sesepuh masyarakat.
- Kira-kira Dolu Ante Pau: Berpikir matang sebelum berucap atau menuliskan komentar agar kalimat yang keluar membawa kedamaian serta kebaikan.

> Tips Literasi Berimbang: Penguasaan **Bahasa Indonesia baku sesuai EYD V dan KBBI** di ranah pendidikan dan pemerintahan berjalan beriringan dengan pelestarian **Bahasa Daerah** di lingkungan keluarga serta ruang komunitas.

### Kebiasaan Positif Penutur Santun

1. Memilih Kata Bermartabat: Menjauhi caci maki, hoaks, dan sarkasme yang melukai perasaan orang lain.
2. Mendengar Sebelum Menanggapi: Memberikan kesempatan kepada lawan bicara untuk menuntaskan gagasan sebelum menyampaikan tanggapan secara objektif.
3. Mempraktikkan Pelafalan Daerah: Memanfaatkan fitur audio pelafalan dan kartu kilas pada Kamus Besar untuk mengenali kosakata luhur dari seluruh kabupaten dan kota di Sulawesi Tengah.

### Catatan Penting
Lanjutkan perjalanan Anda dengan menjelajahi **Kamus Besar Kearifan Lokal Sulawesi Tengah** atau langsung menguji pemahaman pada kuis evaluasi To Kaili.`,
  },
]
