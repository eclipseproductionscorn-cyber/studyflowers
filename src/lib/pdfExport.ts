// Simple PDF export for notes using browser print
export const exportNoteToPDF = (title: string, content: string, subject: string | null, color: string) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
  .header { border-bottom: 3px solid ${color}; padding-bottom: 12px; margin-bottom: 24px; }
  .header h1 { font-size: 24px; margin: 0 0 8px; color: #111; }
  .meta { font-size: 13px; color: #666; }
  .subject { display: inline-block; background: ${color}22; color: ${color}; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .content { font-size: 15px; white-space: pre-wrap; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #eee; font-size: 11px; color: #999; text-align: center; }
  @media print { body { margin: 20px; } }
</style>
</head><body>
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      ${subject ? `<span class="subject">${subject}</span> • ` : ""}
      Exportado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
    </div>
  </div>
  <div class="content">${content || "Sem conteúdo"}</div>
  <div class="footer">Gerado pelo StudyFlow — Caderno Digital</div>
</body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 300);
};

export const exportAllNotesToPDF = (notes: { title: string; content: string; subject: string | null; color: string }[]) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const notesHtml = notes.map((n) => `
    <div class="note">
      <h2 style="border-left: 4px solid ${n.color}; padding-left: 12px; margin-bottom: 4px;">${n.title}</h2>
      ${n.subject ? `<span class="subject" style="background: ${n.color}22; color: ${n.color};">${n.subject}</span>` : ""}
      <div class="content">${n.content || "Sem conteúdo"}</div>
    </div>
  `).join("");

  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><title>Caderno Digital - Todas as Notas</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
  h1 { text-align: center; margin-bottom: 30px; }
  .note { margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #eee; page-break-inside: avoid; }
  .note h2 { font-size: 18px; margin: 0 0 8px; }
  .subject { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
  .content { font-size: 14px; white-space: pre-wrap; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
  @media print { body { margin: 20px; } }
</style>
</head><body>
  <h1>📓 Caderno Digital</h1>
  <p style="text-align:center;color:#666;margin-bottom:30px;">${notes.length} notas • Exportado em ${new Date().toLocaleDateString("pt-BR")}</p>
  ${notesHtml}
  <div class="footer">Gerado pelo StudyFlow — Caderno Digital</div>
</body></html>`;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => { printWindow.print(); }, 300);
};
