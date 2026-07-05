import { LegalShell, LegalSection } from "@/components/common/LegalShell";

export const metadata = { title: "Kebijakan Privasi · EduNomad" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Kebijakan Privasi" updated="1 Juli 2026">
      <p>
        Kebijakan ini menjelaskan data apa yang EduNomad kumpulkan, bagaimana kami menggunakannya, dan hak
        kamu atas data tersebut. Dengan menggunakan platform ini, kamu menyetujui praktik di bawah.
      </p>

      <LegalSection heading="Data yang kami kumpulkan">
        <p>
          Data akun (nama, email, peran), profil (headline, bio, foto, skill, pengalaman, tautan), serta
          data aktivitas proyek (lamaran, kontribusi, diskusi, ulasan). Kata sandi dikelola oleh penyedia
          autentikasi kami dan tidak pernah disimpan oleh EduNomad.
        </p>
      </LegalSection>

      <LegalSection heading="Bagaimana data digunakan">
        <p>
          Untuk menjalankan fitur inti — mencocokkan proyek, menampilkan profil dan portofolio, menerbitkan
          sertifikat, dan mengirim notifikasi. Kami tidak menjual data pribadimu.
        </p>
      </LegalSection>

      <LegalSection heading="Siapa yang dapat melihat data">
        <p>
          Profil dan sertifikat terverifikasi dapat dilihat oleh pengguna terautentikasi lain untuk tujuan
          kolaborasi dan rekrutmen. Diskusi proyek hanya terlihat oleh anggota proyek terkait.
        </p>
      </LegalSection>

      <LegalSection heading="Hak kamu">
        <p>
          Kamu dapat memperbarui profil kapan saja lewat <strong>Edit Profil</strong>, atau meminta
          penghapusan akun dengan menghubungi{" "}
          <a href="mailto:privacy@edunomad.id" className="font-medium text-[#5f8c00] hover:underline">
            privacy@edunomad.id
          </a>
          .
        </p>
      </LegalSection>
    </LegalShell>
  );
}
