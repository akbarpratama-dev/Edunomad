import PDFDocument from "pdfkit";
import QRCode from "qrcode";

// Data required to render an artifact certificate (Workflow 13 — Artifact Contents).
export interface ArtifactPdfData {
  artifactCode: string;
  beginnerName: string;
  umkmName: string;
  seniorName: string;
  projectTitle: string;
  contributionSummary: string;
  technologies: string[];
  feedback: string | null;
  issuedAt: Date;
  verificationUrl: string;
}

const NAVY = "#201f31";
const INK = "#0b0b0b";
const MUTED = "#6b6b6b";
const GREEN = "#5f8c00";
const BORDER = "#e7e3d8";

// Renders a single-page A4 certificate to an in-memory Buffer (no temp files),
// with a QR code linking to the public verification URL.
export async function generateArtifactPdf(data: ArtifactPdfData): Promise<Buffer> {
  const qrPng = await QRCode.toBuffer(data.verificationUrl, { width: 130, margin: 1 });

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = doc.page.width; // 595.28
    const M = 40;
    const innerW = W - M * 2;

    // Outer frame
    doc.lineWidth(1).strokeColor(BORDER).rect(M, M, innerW, doc.page.height - M * 2).stroke();
    doc.lineWidth(4).strokeColor(NAVY).moveTo(M, M).lineTo(M + innerW, M).stroke();

    // Brand
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text("EduNomad", M, M + 28, {
      width: innerW,
      align: "center",
    });
    doc
      .fillColor(GREEN)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("SERTIFIKAT KONTRIBUSI PROYEK", M, M + 50, {
        width: innerW,
        align: "center",
        characterSpacing: 2,
      });

    // Recipient
    doc.fillColor(MUTED).font("Helvetica").fontSize(11).text("Diberikan kepada", M, M + 90, {
      width: innerW,
      align: "center",
    });
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(30).text(data.beginnerName, M, M + 108, {
      width: innerW,
      align: "center",
    });

    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(11)
      .text("atas kontribusi nyata pada proyek", M, M + 152, { width: innerW, align: "center" });
    doc
      .fillColor(NAVY)
      .font("Helvetica-Bold")
      .fontSize(16)
      .text(data.projectTitle, M, M + 170, { width: innerW, align: "center" });

    // Meta row (UMKM + Mentor)
    let y = M + 210;
    doc.font("Helvetica").fontSize(10);
    doc.fillColor(MUTED).text("UMKM", M + 30, y);
    doc.fillColor(INK).font("Helvetica-Bold").text(data.umkmName, M + 30, y + 14);
    doc.fillColor(MUTED).font("Helvetica").text("Mentor", M + innerW / 2, y);
    doc.fillColor(INK).font("Helvetica-Bold").text(data.seniorName, M + innerW / 2, y + 14);

    // Contribution summary
    y += 50;
    doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(9).text("RINGKASAN KONTRIBUSI", M + 30, y, {
      characterSpacing: 1,
    });
    doc
      .fillColor(INK)
      .font("Helvetica")
      .fontSize(10.5)
      .text(data.contributionSummary, M + 30, y + 16, { width: innerW - 60, align: "left" });

    // Technologies
    y = doc.y + 14;
    if (data.technologies.length > 0) {
      doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(9).text("TEKNOLOGI", M + 30, y, {
        characterSpacing: 1,
      });
      doc
        .fillColor(INK)
        .font("Helvetica")
        .fontSize(10.5)
        .text(data.technologies.join("  ·  "), M + 30, y + 16, { width: innerW - 60 });
      y = doc.y + 14;
    }

    // Mentor feedback
    if (data.feedback) {
      doc.fillColor(GREEN).font("Helvetica-Bold").fontSize(9).text("CATATAN MENTOR", M + 30, y, {
        characterSpacing: 1,
      });
      doc
        .fillColor(MUTED)
        .font("Helvetica-Oblique")
        .fontSize(10.5)
        .text(`"${data.feedback}"`, M + 30, y + 16, { width: innerW - 60 });
    }

    // Footer band — fixed near the bottom
    const footY = doc.page.height - M - 150;
    doc.lineWidth(1).strokeColor(BORDER).moveTo(M + 30, footY).lineTo(M + innerW - 30, footY).stroke();

    // QR (right)
    doc.image(qrPng, M + innerW - 30 - 90, footY + 20, { width: 90 });
    doc.fillColor(MUTED).font("Helvetica").fontSize(7).text("Pindai untuk verifikasi", M + innerW - 30 - 90, footY + 114, {
      width: 90,
      align: "center",
    });

    // Left footer: code, date, verification
    doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("Kode Verifikasi", M + 30, footY + 20);
    doc.fillColor(NAVY).font("Helvetica-Bold").fontSize(15).text(data.artifactCode, M + 30, footY + 32);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(
        `Diterbitkan ${data.issuedAt.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`,
        M + 30,
        footY + 56
      );
    doc.fillColor(GREEN).fontSize(8).text(data.verificationUrl, M + 30, footY + 72, { width: innerW - 160 });

    // Signature
    doc.fillColor(INK).font("Helvetica-Bold").fontSize(11).text(data.seniorName, M + 30, footY + 96);
    doc.fillColor(MUTED).font("Helvetica").fontSize(9).text("Mentor / Penanggung Jawab Proyek", M + 30, footY + 110);

    doc.end();
  });
}
