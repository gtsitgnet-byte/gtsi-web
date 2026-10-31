(() => {
  "use strict";
  const root = document.getElementById("gtsi-devis");
  if (!root) return;
  const $ = id => root.querySelector("#" + id);
  const WA = "22879828669";

  const clean = t => t.replace(/[—–]/g, "-").replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"').replace(/[^\x00-\xFF]/g, "");

  const wrap = document.createElement("div");
  wrap.className = "gd-actions";
  wrap.innerHTML = '<button id="gd-pdf" class="gd-btn gold" type="button">📄 Envoyer en PDF sur WhatsApp</button>';
  $("gd-copy-status").insertAdjacentElement("afterend", wrap);

  function shortMsg() {
    const lieu = ($("gd-city").value || "").trim();
    return "Bonjour GTSI, je souhaite un devis : " +
      $("gd-summary-service").textContent + " (" + $("gd-summary-tier").textContent + ")" +
      ", " + $("gd-summary-site").textContent + (lieu ? ", " + lieu : "") + ".";
  }

  function build() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const text = clean($("gd-request").value);
    const today = new Date().toLocaleDateString("fr-FR");

    doc.setFillColor(11, 31, 77);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(20);
    doc.text("GTSI", 15, 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("GlobalTech Security & Innovation", 15, 21);
    doc.text(today, 195, 14, { align: "right" });

    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text("Demande de devis", 15, 42);
    doc.setDrawColor(210, 160, 50); doc.setLineWidth(0.8);
    doc.line(15, 46, 60, 46);

    let y = 56;
    doc.setFontSize(11);
    const lines = text.split("\n").slice(1);
    for (const line of lines) {
      if (!line.trim()) { y += 4; continue; }
      const i = line.indexOf(" : ");
      let label = "", value = line;
      if (i > 0 && i < 40) { label = line.slice(0, i); value = line.slice(i + 3); }
      const parts = doc.splitTextToSize(value, label ? 120 : 180);
      const h = parts.length * 6;
      if (y + h > 280) { doc.addPage(); y = 20; }
      if (label) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(11, 31, 77);
        doc.text(label, 15, y);
      }
      doc.setFont("helvetica", "normal"); doc.setTextColor(20, 20, 20);
      doc.text(parts, label ? 70 : 15, y);
      y += h + 2;
    }
    return doc;
  }
  window.gdBuildPdf = build;

  // "Continuer sur WhatsApp" : simple message de sollicitation
  const wa = $("gd-whatsapp");
  if (wa) wa.addEventListener("click", () => {
    wa.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(
      shortMsg() + " Pouvez-vous me recontacter ?");
  });

  $("gd-pdf").addEventListener("click", async () => {
    const status = $("gd-copy-status");
    if (!window.jspdf) { alert("🚨 Le module PDF n'est pas chargé. Rechargez la page."); return; }
    try {
      const doc = build();
      const nom = ($("gd-name").value || "client").trim()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-");
      const fichier = "Devis-GTSI-" + nom + "-" + new Date().toISOString().slice(0, 10) + ".pdf";
      const file = new File([doc.output("blob")], fichier, { type: "application/pdf" });
      const texte = shortMsg() + " Détails dans le PDF.";
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text: texte, title: "Demande de devis GTSI" });
        status.textContent = "Dans le menu, choisissez WhatsApp puis le contact GTSI.";
      } else {
        doc.save(fichier);
        status.textContent = "PDF téléchargé. WhatsApp s'ouvre : joignez le PDF puis envoyez.";
        window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(texte), "_blank");
      }
    } catch (e) {
      if (e.name !== "AbortError") alert("🚨 Impossible de créer le PDF : " + e.message);
    }
  });
})();
