import { LegalShell, LegalSection } from "@/components/common/LegalShell";

export const metadata = { title: "Bantuan · EduNomad" };

export default function HelpPage() {
  return (
    <LegalShell title="Pusat Bantuan">
      <p>
        EduNomad menghubungkan Mahasiswa, Mentor, dan UMKM lewat proyek nyata untuk pengalaman kerja,
        mentorship, dan portofolio yang terverifikasi. Berikut jawaban atas pertanyaan yang sering muncul.
      </p>

      <LegalSection heading="Bagaimana cara bergabung ke proyek?">
        <p>
          Mahasiswa menelusuri <strong>Cari Proyek</strong>, lalu melamar peran yang tersedia. Setelah
          mentor menerima lamaranmu, proyek muncul di <strong>Proyek Saya</strong> dan kamu bisa masuk ke
          workspace serta diskusi tim.
        </p>
      </LegalSection>

      <LegalSection heading="Berapa proyek aktif yang boleh saya ikuti?">
        <p>
          Mahasiswa hanya boleh memiliki <strong>satu proyek aktif</strong> dalam satu waktu, tetapi boleh
          mengajukan lamaran ke banyak proyek. Mentor dan UMKM maksimal <strong>lima proyek aktif</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="Apa itu Sertifikat?">
        <p>
          Setiap kontribusi yang selesai dan diverifikasi mentor menghasilkan sertifikat terverifikasi yang
          bisa dibagikan sebagai bukti pengalaman. Lihat semuanya di menu <strong>Sertifikat</strong> dan
          verifikasi keasliannya lewat halaman verifikasi publik.
        </p>
      </LegalSection>

      <LegalSection heading="Masih butuh bantuan?">
        <p>
          Hubungi tim kami di{" "}
          <a href="mailto:support@edunomad.id" className="font-medium text-[#5f8c00] hover:underline">
            support@edunomad.id
          </a>
          . Kami akan membalas secepatnya.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
