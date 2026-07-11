// Canonical demo dataset — the baseline that "Reset Demo" restores. Used by both
// the reset service (runtime) and the CLI seed. Keep this the single source of
// truth for the demo's UMKM accounts and their RECRUITING projects.

export const DEMO_PASSWORD = "TestPass123!";

// The 5 demo UMKM whose projects are wiped + re-seeded on reset.
export const DEMO_UMKMS: { email: string; name: string; headline: string }[] = [
  { email: "kedaikopisenja@edunomad.com", name: "Kedai Kopi Senja", headline: "Coffee shop & roastery — Jakarta" },
  { email: "laundrykilatbersih@edunomad.com", name: "Laundry Kilat Bersih", headline: "Jasa laundry kiloan & satuan — Surabaya" },
  { email: "tokobangunansejahtera@edunomad.com", name: "Toko Bangunan Sejahtera", headline: "Toko material & bangunan — Medan" },
  { email: "saloncantikayu@edunomad.com", name: "Salon Cantik Ayu", headline: "Salon & perawatan kecantikan — Bandung" },
  { email: "tokorotimanis@edunomad.com", name: "Toko Roti Manis", headline: "Bakery & kue ulang tahun — Yogyakarta" },
];

export const DEMO_UMKM_EMAILS = DEMO_UMKMS.map((u) => u.email);

// Senior leads + junior applicants referenced below (created by seed-expo; looked
// up by email at seed time and skipped gracefully if absent).
export const DEMO_SENIOR_EMAILS = [
  "senior06@edunomad.com",
  "senior07@edunomad.com",
  "senior08@edunomad.com",
];
export const DEMO_JUNIOR_EMAILS = Array.from(
  { length: 12 },
  (_, i) => `junior${String(i + 1).padStart(2, "0")}@edunomad.com`
);

const FE = ["React", "JavaScript", "TypeScript"];
const BE = ["Node.js", "Express.js", "PostgreSQL"];
const DS = ["UI Design", "Figma", "UX Research"];

export interface DemoProjectSpec {
  umkm: string;
  title: string;
  category: string;
  description: string;
  deliverables: string;
  roles: { name: string; skills: string[] }[];
  lead?: string; // senior email — omit for an open (no-mentor) vacancy
  applicants?: number[]; // junior numbers (1-based) — PENDING applicants to role 0
}

export const DEMO_MOTIVATIONS = [
  "Saya tertarik dengan proyek ini dan yakin keahlian saya cocok untuk perannya.",
  "Saya ingin menambah pengalaman nyata dan berkontribusi pada proyek ini.",
  "Proyek ini sesuai dengan minat dan skill yang sedang saya kembangkan.",
];

export const DEMO_PROJECTS: DemoProjectSpec[] = [
  {
    umkm: "kedaikopisenja@edunomad.com",
    title: "Website Pemesanan Kopi & Program Loyalitas",
    category: "Web Development",
    description:
      "Website pemesanan kopi online untuk Kedai Kopi Senja lengkap dengan katalog menu, keranjang, dan program poin loyalitas untuk pelanggan tetap.",
    deliverables: "Website responsif (menu, keranjang, checkout, poin loyalitas) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior06@edunomad.com",
    applicants: [1, 2, 11],
  },
  {
    umkm: "kedaikopisenja@edunomad.com",
    title: "Desain Menu & Identitas Visual Kedai Kopi",
    category: "UI/UX Design",
    description:
      "Perancangan identitas visual dan desain menu digital serta cetak untuk Kedai Kopi Senja agar tampil lebih modern dan konsisten.",
    deliverables: "Logo, palet warna, desain menu (digital & cetak), dan panduan brand ringkas.",
    roles: [{ name: "UI/UX Designer", skills: DS }],
  },
  {
    umkm: "laundrykilatbersih@edunomad.com",
    title: "Aplikasi Order & Lacak Status Laundry",
    category: "Mobile Development",
    description:
      "Aplikasi untuk pelanggan Laundry Kilat Bersih: buat order, pilih layanan, dan lacak status cucian dari masuk hingga siap diambil.",
    deliverables: "Aplikasi (order, pilih layanan, tracking status, notifikasi) + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }],
    lead: "senior07@edunomad.com",
    applicants: [3, 7, 12],
  },
  {
    umkm: "laundrykilatbersih@edunomad.com",
    title: "Sistem Manajemen Pesanan & Kasir Laundry",
    category: "Web Development",
    description:
      "Sistem internal untuk mengelola pesanan, pelanggan, dan transaksi kasir di outlet Laundry Kilat Bersih.",
    deliverables: "Web admin (pesanan, pelanggan, kasir, laporan harian) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
  },
  {
    umkm: "tokobangunansejahtera@edunomad.com",
    title: "Katalog Produk & Cek Stok Online",
    category: "Web Development",
    description:
      "Website katalog material bangunan Toko Bangunan Sejahtera dengan pencarian produk, cek harga, dan ketersediaan stok real-time.",
    deliverables: "Web katalog (pencarian, detail produk, cek stok) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
  },
  {
    umkm: "tokobangunansejahtera@edunomad.com",
    title: "Dashboard Rekap Penjualan & Stok",
    category: "Data & Analytics",
    description:
      "Dashboard analitik untuk memantau penjualan harian, produk terlaris, dan level stok toko bangunan.",
    deliverables: "Dashboard grafik penjualan & stok + laporan bulanan.",
    roles: [{ name: "Backend / Data", skills: BE }],
    lead: "senior08@edunomad.com",
    applicants: [4, 9],
  },
  {
    umkm: "saloncantikayu@edunomad.com",
    title: "Website Booking Perawatan & Jadwal Salon",
    category: "Web Development",
    description:
      "Website reservasi online Salon Cantik Ayu: pilih layanan, pilih kapster, tentukan jadwal, dan konfirmasi otomatis.",
    deliverables: "Web booking (layanan, kapster, jadwal, admin) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
  },
  {
    umkm: "saloncantikayu@edunomad.com",
    title: "Kampanye Konten Instagram Salon",
    category: "Digital Marketing",
    description:
      "Pembuatan konten visual dan strategi posting untuk meningkatkan jangkauan Instagram Salon Cantik Ayu.",
    deliverables: "Template konten, katalog layanan digital, dan kalender posting sebulan.",
    roles: [{ name: "Content Designer", skills: DS }],
  },
  {
    umkm: "tokorotimanis@edunomad.com",
    title: "Toko Online Kue & Roti dengan Pre-Order",
    category: "Web Development",
    description:
      "Toko online Toko Roti Manis: katalog kue & roti, keranjang, checkout, dan fitur pre-order kue ulang tahun.",
    deliverables: "Web e-commerce (katalog, keranjang, checkout, pre-order) + API + dokumentasi.",
    roles: [{ name: "Frontend Developer", skills: FE }, { name: "Backend Developer", skills: BE }],
    lead: "senior07@edunomad.com",
    applicants: [5, 6, 10],
  },
  {
    umkm: "tokorotimanis@edunomad.com",
    title: "Redesain UI Website Toko Roti",
    category: "UI/UX Design",
    description:
      "Perancangan ulang tampilan website Toko Roti Manis agar lebih menggugah selera dan mudah digunakan di ponsel.",
    deliverables: "Wireframe + desain UI halaman utama, katalog, dan pemesanan.",
    roles: [{ name: "UI/UX Designer", skills: DS }],
  },
];
