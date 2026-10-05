/* eslint-disable */
// Seed script: run with `npm run db:seed`
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Convenience helpers for dates
const D = (y, m, d) => new Date(y, m - 1, d);

const people = [
  // ---- Generation 1 : Patriarch & Matriarch ----
  {
    key: "haji_omar",
    firstName: "Haji Omar",
    lastName: "bin Abdullah",
    gender: "MALE",
    status: "DECEASED",
    birthDate: D(1928, 3, 14),
    deathDate: D(2015, 8, 2),
    birthPlace: "Kampung Bharu, Negeri Sembilan",
    occupation: "Peneroka kampung / Peladang getah",
    bio: "Bapa kepada keluarga besar kami. Berhijrah dari kampung ke bandar pada usia 21 tahun.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Omar&backgroundColor=b6e3f4",
    phone: null,
  },
  {
    key: "hajjah_siti",
    firstName: "Hajjah Siti",
    lastName: "binti Mahmud",
    gender: "FEMALE",
    status: "DECEASED",
    birthDate: D(1934, 7, 21),
    deathDate: D(2019, 12, 11),
    birthPlace: "Kuala Pilah, Negeri Sembilan",
    occupation: "Suri rumah / Penjahit",
    bio: "Ibu yang menyatukan keluarga. Terkenal dengan kuih dodol warisan keluarga.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti&backgroundColor=ffdfbf",
  },
  // ---- Generation 2 : Anak-anak sulung ----
  {
    key: "abu",
    firstName: "Abu",
    lastName: "bin Omar",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(1958, 5, 2),
    birthPlace: "Kuala Lumpur",
    occupation: "Pensyarah universiti",
    bio: "Anak sulung. Mengajar sejarah di Universiti Malaya selama 30 tahun.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Abu&backgroundColor=c0aede",
    email: "abu.omar@example.my",
    phone: "+6012-345 6789",
  },
  {
    key: "aminah",
    firstName: "Aminah",
    lastName: "binti Omar",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1961, 9, 30),
    birthPlace: "Kuala Lumpur",
    occupation: "Jururawat",
    bio: "Anak kedua. Bekerja di Hospital Kuala Lumpur.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aminah&backgroundColor=d1f7c4",
    email: "aminah.omar@example.my",
  },
  {
    key: "razak",
    firstName: "Razak",
    lastName: "bin Omar",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(1964, 1, 15),
    birthPlace: "Kuala Lumpur",
    occupation: "Jurutera awam",
    bio: "Anak ketiga. Menetap di Johor Bahru sejak 1995.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Razak&backgroundColor=ffd5dc",
    email: "razak.omar@example.my",
    phone: "+6016-112 3344",
  },
  {
    key: "fatimah_jr",
    firstName: "Fatimah",
    lastName: "binti Omar",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1968, 11, 8),
    birthPlace: "Kuala Lumpur",
    occupation: "Guru besar",
    bio: "Anak bongsu generasi kedua. Guru besar di Sekolah Kebangsaan Taman Tun.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatimah&backgroundColor=b6e3f4",
    email: "fatimah.omar@example.my",
  },
  // ---- Generation 2 : Pasangan (menantu) ----
  {
    key: "rohani",
    firstName: "Rohani",
    lastName: "binti Hassan",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1963, 4, 19),
    birthPlace: "Ipoh, Perak",
    occupation: "Akauntan",
    bio: "Isteri kepada Abu. Menetap di Petaling Jaya.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohani&backgroundColor=ffdfbf",
    email: "rohani.hassan@example.my",
  },
  {
    key: "ismail",
    firstName: "Ismail",
    lastName: "bin Yusof",
    gender: "MALE",
    status: "DECEASED",
    birthDate: D(1957, 6, 5),
    deathDate: D(2021, 3, 18),
    birthPlace: "Melaka",
    occupation: "Kontraktor binaan",
    bio: "Suami kepada Aminah. Meninggal dunia pada 2021.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ismail&backgroundColor=c0aede",
  },
  {
    key: "laila",
    firstName: "Laila",
    lastName: "binti Ahmad",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1967, 8, 27),
    birthPlace: "Johor Bahru",
    occupation: "Pemilik kedai runcit",
    bio: "Isteri kepada Razak.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laila&backgroundColor=d1f7c4",
  },
  {
    key: "hafiz_spouse_male",
    firstName: "Hafizuddin",
    lastName: "bin Mahmud",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(1966, 2, 11),
    birthPlace: "Shah Alam",
    occupation: "Doktor pakar",
    bio: "Suami kepada Fatimah.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hafizuddin&backgroundColor=ffd5dc",
  },
  // ---- Generation 3 ----
  {
    key: "zara",
    firstName: "Zara",
    lastName: "binti Abu",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1990, 7, 12),
    birthPlace: "Petaling Jaya",
    occupation: "Pereka grafik",
    bio: "Cucu sulung. Bekerja di agensi pengiklanan di KL.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zara&backgroundColor=b6e3f4",
    email: "zara.abu@example.my",
    phone: "+6011-1234 5678",
  },
  {
    key: "imran",
    firstName: "Imran",
    lastName: "bin Abu",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(1993, 12, 3),
    birthPlace: "Petaling Jaya",
    occupation: "Pemaju perisian",
    bio: "Bekerja sebagai jurutera perisian di sebuah syarikat teknologi.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Imran&backgroundColor=c0aede",
    email: "imran.abu@example.my",
  },
  {
    key: "khadijah",
    firstName: "Khadijah",
    lastName: "binti Ismail",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1991, 10, 25),
    birthPlace: "Kuala Lumpur",
    occupation: "Guru tadika",
    bio: "Mewarisi sifat penyayang ibunya.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Khadijah&backgroundColor=ffdfbf",
    email: "khadijah.ismail@example.my",
  },
  {
    key: "umar",
    firstName: "Umar",
    lastName: "bin Razak",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(1995, 3, 9),
    birthPlace: "Johor Bahru",
    occupation: "Pelajar kedoktoran",
    bio: "Sedang menyambung pengajian di luar negara.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Umar&backgroundColor=ffd5dc",
    email: "umar.razak@example.my",
  },
  {
    key: "hana",
    firstName: "Hana",
    lastName: "binti Razak",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(1998, 6, 17),
    birthPlace: "Johor Bahru",
    occupation: "Juruteknik veterinar",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hana&backgroundColor=d1f7c4",
    email: "hana.razak@example.my",
  },
  {
    key: "yusuf",
    firstName: "Yusuf",
    lastName: "bin Hafizuddin",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(1996, 9, 1),
    birthPlace: "Shah Alam",
    occupation: "Atlet profesional",
    bio: "Gemar sukan dan membantu kerja-kerja komuniti.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yusuf&backgroundColor=b6e3f4",
    email: "yusuf.hafizuddin@example.my",
  },
  {
    key: "aisha",
    firstName: "Aisha",
    lastName: "binti Hafizuddin",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(2000, 4, 22),
    birthPlace: "Shah Alam",
    occupation: "Pelajar",
    bio: "Pelajar tahun akhir bidang komunikasi.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aisha&backgroundColor=c0aede",
    email: "aisha.hafizuddin@example.my",
  },
  // ---- Generation 4 : Kanak-kanak (semua umur) ----
  {
    key: "adam",
    firstName: "Adam",
    lastName: "bin Imran",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(2021, 2, 14),
    birthPlace: "Kuala Lumpur",
    occupation: "Pelajar tadika",
    bio: "Cicit pertama generasi keempat.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Adam&backgroundColor=ffdfbf",
  },
  {
    key: "maryam",
    firstName: "Maryam",
    lastName: "binti Imran",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(2023, 8, 5),
    birthPlace: "Kuala Lumpur",
    bio: "Cicit perempuan yang comel.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maryam&backgroundColor=ffd5dc",
  },
  {
    key: "zaki",
    firstName: "Zaki",
    lastName: "bin Umar",
    gender: "MALE",
    status: "ALIVE",
    birthDate: D(2024, 1, 20),
    birthPlace: "Johor Bahru",
    bio: "Bayi terbaru dalam keluarga.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki&backgroundColor=d1f7c4",
  },
  {
    key: "nurul",
    firstName: "Nurul",
    lastName: "binti Yusuf",
    gender: "FEMALE",
    status: "ALIVE",
    birthDate: D(2022, 11, 11),
    birthPlace: "Shah Alam",
    occupation: "Pelajar taska",
    bio: "Suka melukis.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nurul&backgroundColor=b6e3f4",
  },
];

// Pasangan (spouse) relationships
const spouses = [
  ["haji_omar", "hajjah_siti"],
  ["abu", "rohani"],
  ["aminah", "ismail"],
  ["razak", "laila"],
  ["fatimah_jr", "hafiz_spouse_male"],
];

// Parent -> child relationships
const parentChild = [
  // Gen 1 -> Gen 2
  ["haji_omar", "abu"],
  ["hajjah_siti", "abu"],
  ["haji_omar", "aminah"],
  ["hajjah_siti", "aminah"],
  ["haji_omar", "razak"],
  ["hajjah_siti", "razak"],
  ["haji_omar", "fatimah_jr"],
  ["hajjah_siti", "fatimah_jr"],
  // Gen 2 -> Gen 3
  ["abu", "zara"],
  ["rohani", "zara"],
  ["abu", "imran"],
  ["rohani", "imran"],
  ["aminah", "khadijah"],
  ["ismail", "khadijah"],
  ["razak", "umar"],
  ["laila", "umar"],
  ["razak", "hana"],
  ["laila", "hana"],
  ["fatimah_jr", "yusuf"],
  ["hafiz_spouse_male", "yusuf"],
  ["fatimah_jr", "aisha"],
  ["hafiz_spouse_male", "aisha"],
  // Gen 3 -> Gen 4
  ["imran", "adam"],
  ["imran", "maryam"],
  ["umar", "zaki"],
  ["yusuf", "nurul"],
];

const documents = [
  {
    title: "Sijil Kelahiran - Haji Omar bin Abdullah",
    type: "BIRTH_CERTIFICATE",
    personKey: "haji_omar",
    issuedDate: D(1928, 3, 18),
    issuedBy: "Pejabat Pendaftaran Kuala Pilah",
    documentId: "BC-1928-0314",
    notes: "Salinan sijil kelahiran asal dalam simpanan keluarga.",
  },
  {
    title: "Sijil Kematian - Haji Omar bin Abdullah",
    type: "DEATH_CERTIFICATE",
    personKey: "haji_omar",
    issuedDate: D(2015, 8, 4),
    issuedBy: "Jabatan Pendaftaran Negara",
    documentId: "DC-2015-8823",
    notes: "Didaftarkan oleh Abu bin Omar.",
  },
  {
    title: "Sijil Perkahwinan - Omar & Siti",
    type: "MARRIAGE_CERTIFICATE",
    personKey: "hajjah_siti",
    issuedDate: D(1955, 6, 10),
    issuedBy: "Jabatan Agama Islam Negeri Sembilan",
    documentId: "MC-1955-1147",
    notes: "Diperolehi dari masjid kampung.",
  },
  {
    title: "Sijil Kelahiran - Abu bin Omar",
    type: "BIRTH_CERTIFICATE",
    personKey: "abu",
    issuedDate: D(1958, 5, 3),
    issuedBy: "Pejabat Pendaftaran Kuala Lumpur",
    documentId: "BC-1958-0502",
  },
  {
    title: "Sijil Perkahwinan - Abu & Rohani",
    type: "MARRIAGE_CERTIFICATE",
    personKey: "rohani",
    issuedDate: D(1987, 12, 19),
    issuedBy: "Jabatan Agama Islam Wilayah Persekutuan",
    documentId: "MC-1987-3390",
  },
  {
    title: "Kad Pengenalan - Aminah binti Omar",
    type: "IDENTITY_CARD",
    personKey: "aminah",
    issuedDate: D(1978, 9, 30),
    issuedBy: "Jabatan Pendaftaran Negara",
    documentId: "780930-14-5678",
  },
  {
    title: "Sijil Kematian - Ismail bin Yusof",
    type: "DEATH_CERTIFICATE",
    personKey: "ismail",
    issuedDate: D(2021, 3, 20),
    issuedBy: "Jabatan Pendaftaran Negara",
    documentId: "DC-2021-4471",
    notes: "Dimajmumkan di Tanah Perkuburan Islam Bukit Kiara.",
  },
  {
    title: "Sijil Kelahiran - Zara binti Abu",
    type: "BIRTH_CERTIFICATE",
    personKey: "zara",
    issuedDate: D(1990, 7, 13),
    issuedBy: "Pejabat Pendaftaran Petaling Jaya",
    documentId: "900712-47-1122",
  },
  {
    title: "Sijil Kelahiran - Imran bin Abu",
    type: "BIRTH_CERTIFICATE",
    personKey: "imran",
    issuedDate: D(1993, 12, 4),
    issuedBy: "Pejabat Pendaftaran Petaling Jaya",
    documentId: "931203-14-8834",
  },
  {
    title: "Sijil Diploma - Imran bin Abu",
    type: "LETTER",
    personKey: "imran",
    issuedDate: D(2016, 11, 5),
    issuedBy: "Universiti Teknologi Malaysia",
    documentId: "DIP-2016-CS-441",
    notes: "Ijazah Sarjana Muda Sains Komputer.",
  },
  {
    title: "Sijil Kelahiran - Khadijah binti Ismail",
    type: "BIRTH_CERTIFICATE",
    personKey: "khadijah",
    issuedDate: D(1991, 10, 26),
    issuedBy: "Pejabat Pendaftaran Kuala Lumpur",
    documentId: "911025-60-9921",
  },
  {
    title: "Sijil Kelahiran - Umar bin Razak",
    type: "BIRTH_CERTIFICATE",
    personKey: "umar",
    issuedDate: D(1995, 3, 10),
    issuedBy: "Pejabat Pendaftaran Johor Bahru",
    documentId: "950309-01-3345",
  },
  {
    title: "Sijil Kelahiran - Hana binti Razak",
    type: "BIRTH_CERTIFICATE",
    personKey: "hana",
    issuedDate: D(1998, 6, 18),
    issuedBy: "Pejabat Pendaftaran Johor Bahru",
    documentId: "980617-72-4456",
  },
  {
    title: "Sijil Kelahiran - Yusuf bin Hafizuddin",
    type: "BIRTH_CERTIFICATE",
    personKey: "yusuf",
    issuedDate: D(1996, 9, 2),
    issuedBy: "Pejabat Pendaftaran Shah Alam",
    documentId: "960901-08-7765",
  },
  {
    title: "Sijil Kelahiran - Aisha binti Hafizuddin",
    type: "BIRTH_CERTIFICATE",
    personKey: "aisha",
    issuedDate: D(2000, 4, 23),
    issuedBy: "Pejabat Pendaftaran Shah Alam",
    documentId: "000422-56-2210",
  },
  {
    title: "Sijil Kelahiran - Adam bin Imran",
    type: "BIRTH_CERTIFICATE",
    personKey: "adam",
    issuedDate: D(2021, 2, 15),
    issuedBy: "Pejabat Pendaftaran Wilayah Persekutuan",
    documentId: "210214-08-5567",
    notes: "Cicit pertama dalam keluarga.",
  },
  {
    title: "Sijil Kelahiran - Maryam binti Imran",
    type: "BIRTH_CERTIFICATE",
    personKey: "maryam",
    issuedDate: D(2023, 8, 6),
    issuedBy: "Pejabat Pendaftaran Wilayah Persekutuan",
    documentId: "230805-60-8890",
  },
  {
    title: "Sijil Kelahiran - Zaki bin Umar",
    type: "BIRTH_CERTIFICATE",
    personKey: "zaki",
    issuedDate: D(2024, 1, 21),
    issuedBy: "Pejabat Pendaftaran Johor Bahru",
    documentId: "240120-01-1123",
  },
  {
    title: "Sijil Kelahiran - Nurul binti Yusuf",
    type: "BIRTH_CERTIFICATE",
    personKey: "nurul",
    issuedDate: D(2022, 11, 12),
    issuedBy: "Pejabat Pendaftaran Shah Alam",
    documentId: "221111-60-4432",
  },
  {
    title: "Gambar Keluarga Besar Raya 2019",
    type: "PHOTO",
    personKey: "hajjah_siti",
    issuedDate: D(2019, 6, 5),
    issuedBy: "Abu bin Omar",
    notes: "Gambar keluarga besar terakhir sebelum Tok Wan meninggal dunia.",
  },
  {
    title: "Surat Berwasiat - Haji Omar",
    type: "LETTER",
    personKey: "haji_omar",
    issuedDate: D(2013, 5, 1),
    issuedBy: "Messrs Karim & Co.",
    documentId: "WILL-2013-118",
    notes: "Disahkan oleh peguam Keluarga.",
  },
  {
    title: "Geran Tanah Kampung Bharu",
    type: "OTHER",
    personKey: "hajjah_siti",
    issuedDate: D(1975, 2, 14),
    issuedBy: "Pejabat Tanah Kuala Pilah",
    documentId: "HS(D)-1188/75",
    notes: "Tanah pusaka keluarga seluas 2.4 ekar.",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate
  await prisma.document.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.person.deleteMany();
  await prisma.user.deleteMany();

  // Demo auth users
  const hashed = await bcrypt.hash("password123", 10);
  await prisma.user.createMany({
    data: [
      { email: "admin@familytree.my", name: "Abu bin Omar", password: hashed, role: "admin" },
      { email: "member@familytree.my", name: "Zara binti Abu", password: hashed, role: "member" },
    ],
  });

  const idMap = new Map();

  for (const p of people) {
    const trimmed = { ...p, key: undefined };
    const person = await prisma.person.create({ data: trimmed });
    idMap.set(p.key, person.id);
  }

  for (const [a, b] of spouses) {
    await prisma.relationship.create({
      data: {
        type: "SPOUSE",
        fromId: idMap.get(a),
        toId: idMap.get(b),
      },
    });
  }

  for (const [parent, child] of parentChild) {
    await prisma.relationship.create({
      data: {
        type: "PARENT_CHILD",
        fromId: idMap.get(parent),
        toId: idMap.get(child),
      },
    });
  }

  for (const d of documents) {
    const { personKey, ...rest } = d;
    await prisma.document.create({
      data: { ...rest, personId: idMap.get(personKey) || null },
    });
  }

  console.log(`✅ Seeded ${people.length} people, ${spouses.length + parentChild.length} relationships, ${documents.length} documents, 2 users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
