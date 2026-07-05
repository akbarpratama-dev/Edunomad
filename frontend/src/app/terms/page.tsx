import { LegalShell, LegalSection } from "@/components/common/LegalShell";

export const metadata = { title: "Ketentuan Layanan · EduNomad" };

export default function TermsPage() {
  return (
    <LegalShell title="Ketentuan Layanan" updated="1 Juli 2026">
      <p>
        Dengan membuat akun dan menggunakan EduNomad, kamu menyetujui ketentuan berikut. Bacalah dengan
        saksama.
      </p>

      <LegalSection heading="Tujuan platform">
        <p>
          EduNomad adalah platform kolaborasi proyek untuk pengalaman kerja nyata, mentorship, dan
          portofolio terverifikasi. Platform ini bukan marketplace freelance, papan lowongan, jejaring
          sosial, maupun LMS.
        </p>
      </LegalSection>

      <LegalSection heading="Tanggung jawab pengguna">
        <p>
          Kamu bertanggung jawab menjaga kerahasiaan akun, memberikan informasi yang benar, serta
          berkontribusi secara jujur. Penyalahgunaan, plagiarisme, atau perilaku tidak profesional dapat
          menyebabkan penangguhan akun.
        </p>
      </LegalSection>

      <LegalSection heading="Kontribusi & sertifikat">
        <p>
          Sertifikat hanya diterbitkan atas kontribusi yang telah diverifikasi mentor. Memalsukan
          kontribusi atau memanipulasi proses verifikasi dilarang keras.
        </p>
      </LegalSection>

      <LegalSection heading="Perubahan ketentuan">
        <p>
          Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan berlaku sejak dipublikasikan di
          halaman ini. Pertanyaan? Hubungi{" "}
          <a href="mailto:support@edunomad.id" className="font-medium text-[#5f8c00] hover:underline">
            support@edunomad.id
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
