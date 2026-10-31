(() => {
  "use strict";
  const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwEoeyrKevDy4qKVuDFiMoyJLwW0l5WctNWiZLprXT52u8JREI-df1I-Luq3wHx_7dj/exec";
  const WA = "22879828669";
  const root = document.getElementById("gtsi-devis");
  if (!root) return;
  const $ = id => root.querySelector("#" + id);

  const old = $("gd-pdf");
  if (!old) return;
  const btn1 = old.cloneNode(true);
  btn1.textContent = "1. 📄 Télécharger mon PDF";
  old.replaceWith(btn1);

  const btn2 = document.createElement("button");
  btn2.type = "button";
  btn2.className = "gd-btn gold";
  btn2.id = "gd-wa-devis";
  btn2.textContent = "2. 💬 Demander mon devis sur WhatsApp";
  btn2.disabled = true;
  btn2.style.opacity = ".5";
  btn1.parentNode.appendChild(btn2);

  let fichier = "";

  btn1.addEventListener("click", () => {
    const status = $("gd-copy-status");
    if (!window.jspdf || !window.gdBuildPdf) {
      alert("🚨 Le module PDF n'est pas chargé. Rechargez la page.");
      return;
    }
    try {
      const doc = window.gdBuildPdf();
      const nom = ($("gd-name").value || "client").trim();
      const slug = nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-");
      fichier = "Devis-GTSI-" + slug + ".pdf";
      doc.save(fichier);

      try {
        fetch(URL_SCRIPT, {
          method: "POST", mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            nom: nom, email: window.gdEmail, token: window.gdToken, message: $("gd-request").value, filename: fichier,
            pdf: doc.output("datauristring").split(",")[1]
          })
        });
      } catch (e) {}

      btn2.disabled = false;
      btn2.style.opacity = "1";
      status.textContent = "✅ PDF téléchargé. Appuyez maintenant sur l'étape 2.";
    } catch (e) {
      alert("🚨 Impossible de créer le PDF : " + e.message);
    }
  });

  btn2.addEventListener("click", () => {
    const lieu = ($("gd-city").value || "").trim();
    const msg = "Bonjour GTSI, je souhaite un devis : " +
      $("gd-summary-service").textContent + " (" + $("gd-summary-tier").textContent + "), " +
      $("gd-summary-site").textContent + (lieu ? ", " + lieu : "") +
      ". Voici le PDF ci-joint de ma demande.";
    window.location.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  });
})();
