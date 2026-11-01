(() => {
  "use strict";
  const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxd7GGH6m8TqJJZmgf5P8vt-K8X3jPuauHHfkzHDsxwesErwWxV23kvnyd9ZHfqkLU1uQ/exec";
  const WA = "22879828669";
  const dlg = document.getElementById("b-cart");
  if (!dlg) return;
  const $ = id => document.getElementById(id);
  const who = $("b-who"), addr = $("b-address");
  const oldSend = $("b-send"), oldMail = $("b-email");
  if (!who || !addr || !oldSend || !oldMail) return;

  const st = document.createElement("style");
  st.textContent = ".gd-invalid{border-color:#d92d20!important;background:#fff5f4!important;box-shadow:0 0 0 3px rgba(217,45,32,.18)!important}#bc-extra label{display:block;margin-top:10px}#bc-extra select,#bc-extra input,#bc-extra textarea{width:100%;box-sizing:border-box}#bc-result{margin-top:14px;display:grid;gap:8px}";
  document.head.appendChild(st);

  const C = [
    ["Togo","228",[8]],["Bénin","229",[10]],["Côte d'Ivoire","225",[10]],
    ["Ghana","233",[9],true],["Nigeria","234",[10],true],["Burkina Faso","226",[8]],
    ["Mali","223",[8]],["Sénégal","221",[9]],["Niger","227",[8]],
    ["Cameroun","237",[9]],["Gabon","241",[8]],["Guinée","224",[9]],
    ["France","33",[9],true],["Belgique","32",[9]],["Canada","1",[10]],["États-Unis","1",[10]]
  ];
  const find = n => C.find(c => c[0] === n);
  const TG = ["70","71","72","79","90","91","92","93","96","97","98","99"];
  const TOGO = ["lome","aneho","atakpame","kpalime","sokode","kara","dapaong","tsevie","bassar","mango","notse","vogan","badou","kante","tchamba","sotouboua","niamtougou","cinkasse","amlame","tabligbo","aflao","agbodrafo","baguida","adetikope","kouve","elavagnon","blitta","pagouda","bafilo","anie","danyi","keve","hahotoe","afagnan"];
  const BAD = {"gmial.com":"gmail.com","gmai.com":"gmail.com","gmail.co":"gmail.com","gamil.com":"gmail.com","gnail.com":"gmail.com","hotmial.com":"hotmail.com","yahou.com":"yahoo.com","outlok.com":"outlook.com"};
  const DISP = ["mailinator.com","yopmail.com","tempmail.com","10minutemail.com","guerrillamail.com","trashmail.com"];

  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const words = s => (s.match(/[\p{L}]+/gu) || []);
  function real(word) {
    const w = norm(word).replace(/[^a-z]/g, "");
    if (w.length < 2 || !/[aeiouy]/.test(w)) return false;
    if (/(.)\1\1/.test(w) || /[^aeiouy]{6,}/.test(w)) return false;
    if (w.length >= 5) { const v = (w.match(/[aeiouy]/g) || []).length / w.length; if (v < 0.2 || v > 0.8) return false; }
    return true;
  }

  // Champs
  addr.style.display = "none"; addr.required = false;
  const al = dlg.querySelector('label[for="b-address"]');
  if (al) al.style.display = "none";
  const extra = document.createElement("div");
  extra.id = "bc-extra";
  extra.innerHTML =
    '<label for="bc-pays">Pays *</label><select id="bc-pays"></select>' +
    '<label for="bc-ville">Ville *</label><input id="bc-ville" autocomplete="address-level2" placeholder="Ex. : Lomé">' +
    '<label for="bc-quartier">Quartier *</label><input id="bc-quartier" placeholder="Ex. : Adidogomé">' +
    '<label for="bc-pays-tel">Pays du numéro *</label><select id="bc-pays-tel"></select>' +
    '<label for="bc-dial">Indicatif</label><input id="bc-dial" readonly placeholder="+...">' +
    '<label for="bc-tel">Téléphone / WhatsApp *</label><input id="bc-tel" type="tel" inputmode="numeric" autocomplete="off" placeholder="Numéro sans indicatif">' +
    '<label for="bc-mail">Adresse e-mail *</label><input id="bc-mail" type="email" autocomplete="email" placeholder="nom@exemple.com">' +
    '<label for="bc-note">Remarque (facultatif)</label><textarea id="bc-note" rows="2" placeholder="Grandes quantités, délai souhaité, précisions..."></textarea>';
  addr.insertAdjacentElement("afterend", extra);

  const fill = (sel, dial) => {
    sel.innerHTML = '<option value="">Choisir un pays</option>' +
      C.map(c => '<option value="' + c[0] + '">' + c[0] + (dial ? " (+" + c[1] + ")" : "") + "</option>").join("");
  };
  fill($("bc-pays"), false);
  fill($("bc-pays-tel"), true);

  function digits() {
    const pc = find($("bc-pays-tel").value);
    let d = $("bc-tel").value.replace(/[\s.\-()]/g, "");
    if (pc && pc[3]) d = d.replace(/^0+/, "");
    return d;
  }
  function sync() {
    const pc = find($("bc-pays-tel").value);
    $("bc-dial").value = pc ? "+" + pc[1] : "";
    addr.value = [$("bc-quartier").value.trim(), $("bc-ville").value.trim(), $("bc-pays").value].filter(Boolean).join(", ");
  }
  $("bc-pays").addEventListener("change", () => {
    if (!$("bc-pays-tel").value) $("bc-pays-tel").value = $("bc-pays").value;
    sync();
  });
  ["bc-pays-tel", "bc-tel", "bc-ville", "bc-quartier"].forEach(id => {
    $(id).addEventListener("input", sync);
    $(id).addEventListener("change", sync);
  });

  // Boutons
  const actions = oldSend.parentNode;
  oldSend.style.display = "none";
  oldMail.style.display = "none";
  const go = document.createElement("button");
  go.type = "button"; go.id = "bc-go"; go.className = "btn";
  go.textContent = "Valider ma demande";
  actions.insertBefore(go, oldSend);

  const result = document.createElement("div");
  result.id = "bc-result"; result.hidden = true;
  result.innerHTML =
    '<p id="bc-status" style="margin:0"></p>' +
    '<button id="bc-pdf" type="button" class="btn">1. 📄 Télécharger mon PDF</button>' +
    '<button id="bc-wa" type="button" class="btn btn-wa" disabled style="opacity:.5">2. 💬 Demander mon devis sur WhatsApp</button>';
  actions.parentNode.insertBefore(result, actions);

  // Données du panier
  const DET = () => window.GTSI_DETAILS || {};
  function items() {
    return [...dlg.querySelectorAll('#b-cart-list input[data-act="qty"]')].map(i => {
      const nom = i.getAttribute("data-n"), d = DET()[nom] || {};
      return { el: i, nom: nom, raw: i.value.trim(), q: parseInt(i.value, 10) || 1, marque: d.marque || "", ref: d.reference || "" };
    });
  }

  // Contrôles
  function check() {
    sync();
    const e = [], bad = (el, m) => e.push({ el: el, msg: m });
    const its = items();
    if (!its.length) { alert("🚨 Ajoutez au moins un article au devis."); return null; }
    its.forEach(x => {
      if (!/^\d+$/.test(x.raw) || x.q < 1 || x.q > 9999) bad(x.el, "Quantité invalide pour « " + x.nom.slice(0, 40) + " » (1 à 9999).");
    });

    const nm = who.value.trim();
    if (!nm) bad(who, "Le nom du client ou de l'entreprise est obligatoire.");
    else if (nm.length < 2 || !words(nm).some(w => real(w) || (w.length >= 2 && w === w.toUpperCase())))
      bad(who, "Le nom « " + nm + " » ne semble pas réel.");

    const pays = $("bc-pays").value;
    if (!pays) bad($("bc-pays"), "Choisissez votre pays.");
    const ville = $("bc-ville").value.trim();
    if (!ville) bad($("bc-ville"), "La ville est obligatoire.");
    else if (!words(ville).length || !words(ville).every(real) || !/^[\p{L}][\p{L}\s'’.\-]+$/u.test(ville))
      bad($("bc-ville"), "La ville « " + ville + " » ne semble pas réelle.");
    else if (pays === "Togo" && !TOGO.includes(norm(ville).replace(/\s+/g, " ")))
      bad($("bc-ville"), "Ville « " + ville + " » inconnue au Togo. Vérifiez l'orthographe.");
    const q = $("bc-quartier").value.trim();
    if (!q) bad($("bc-quartier"), "Le quartier est obligatoire.");
    else if (!words(q).length || !words(q).every(real)) bad($("bc-quartier"), "Le quartier « " + q + " » ne semble pas réel.");
    else if (ville && norm(q) === norm(ville)) bad($("bc-quartier"), "Le quartier doit être différent de la ville.");

    const pc = find($("bc-pays-tel").value);
    if (!pc) bad($("bc-pays-tel"), "Choisissez d'abord le pays du numéro.");
    const raw = $("bc-tel").value.trim();
    if (!raw) bad($("bc-tel"), "Le numéro de téléphone est obligatoire.");
    else if (!/^[\d\s.\-()]+$/.test(raw)) bad($("bc-tel"), "Le numéro ne doit contenir que des chiffres.");
    else if (pc) {
      const d = digits();
      if (!pc[2].includes(d.length))
        bad($("bc-tel"), "Numéro invalide pour " + pc[0] + " : " + pc[2].join(" ou ") + " chiffres attendus, sans l'indicatif +" + pc[1] + ".");
      else if (pc[1] === "228" && !TG.includes(d.slice(0, 2)))
        bad($("bc-tel"), "Ce numéro ne correspond à aucun opérateur du Togo (débute par " + TG.join(", ") + ").");
      else if (/^(\d)\1+$/.test(d) || "01234567890123456789".includes(d) || "98765432109876543210".includes(d))
        bad($("bc-tel"), "Ce numéro semble inventé.");
    }

    const m = $("bc-mail").value.trim().toLowerCase();
    if (!m) bad($("bc-mail"), "L'adresse e-mail est obligatoire.");
    else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(m)) bad($("bc-mail"), "Adresse e-mail invalide.");
    else {
      const p = m.split("@"), loc = p[0], dom = p[1];
      if (BAD[dom]) bad($("bc-mail"), "Vouliez-vous écrire @" + BAD[dom] + " ?");
      else if (DISP.includes(dom)) bad($("bc-mail"), "Les adresses jetables ne sont pas acceptées.");
      else if (loc.length < 3 || /^(test|aaa|abc|xxx|azerty|qwerty)/.test(loc)) bad($("bc-mail"), "Cette adresse e-mail ne semble pas réelle.");
    }

    dlg.querySelectorAll(".gd-invalid").forEach(x => x.classList.remove("gd-invalid"));
    if (e.length) {
      e.forEach(x => {
        x.el.classList.add("gd-invalid");
        const off = () => x.el.classList.remove("gd-invalid");
        x.el.addEventListener("input", off, { once: true });
        x.el.addEventListener("change", off, { once: true });
      });
      alert("🚨 Veuillez corriger :\n\n• " + e.map(x => x.msg).join("\n• "));
      e[0].el.focus();
      return null;
    }
    return its;
  }

  // Message et PDF
  function data(its) {
    const pc = find($("bc-pays-tel").value);
    return {
      its: its,
      nom: who.value.trim(),
      adresse: addr.value,
      tel: "+" + pc[1] + " " + digits(),
      mail: $("bc-mail").value.trim().toLowerCase(),
      note: $("bc-note").value.trim(),
      ville: $("bc-ville").value.trim(),
      date: new Date().toLocaleDateString("fr-FR")
    };
  }
  function line(x, i) {
    return (i + 1) + ". " + x.nom + (x.marque ? " (" + x.marque + (x.ref ? ", réf. " + x.ref : "") + ")" : (x.ref ? " (réf. " + x.ref + ")" : "")) + " - Qté : " + x.q;
  }
  function fullMessage(d) {
    const total = d.its.reduce((s, x) => s + x.q, 0);
    return "DEMANDE DE DEVIS (BOUTIQUE) - GTSI\nDate : " + d.date + "\n\nARTICLES\n" +
      d.its.map(line).join("\n") + "\nTotal : " + d.its.length + " référence(s), " + total + " unité(s)\n\n" +
      "Client : " + d.nom + "\nAdresse : " + d.adresse + "\nTéléphone : " + d.tel + "\nE-mail (vérifié) : " + d.mail +
      (d.note ? "\nRemarque : " + d.note : "") + "\n\nMerci de m'indiquer les prix et la disponibilité.";
  }
  const clean = t => String(t).replace(/[—–]/g, "-").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[^\x00-\xFF]/g, "");

  function buildPdf(d) {
    const doc = new window.jspdf.jsPDF({ unit: "mm", format: "a4" });
    doc.setFillColor(11, 31, 77); doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold"); doc.setFontSize(20); doc.text("GTSI", 15, 14);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9);
    doc.text("GlobalTech Security & Innovation", 15, 21);
    doc.text(d.date, 195, 14, { align: "right" });
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.text("Demande de devis - Boutique", 15, 42);
    doc.setDrawColor(210, 160, 50); doc.setLineWidth(0.8); doc.line(15, 46, 70, 46);

    let y = 56;
    const need = h => { if (y + h > 282) { doc.addPage(); y = 20; } };
    function row(label, value) {
      const parts = doc.splitTextToSize(clean(value), 125), h = parts.length * 6;
      need(h);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(11, 31, 77); doc.text(label, 15, y);
      doc.setFont("helvetica", "normal"); doc.setTextColor(20, 20, 20); doc.text(parts, 65, y);
      y += h + 2;
    }
    row("Client", d.nom);
    row("Adresse", d.adresse);
    row("Telephone", d.tel);
    row("E-mail", d.mail);
    if (d.note) row("Remarque", d.note);

    y += 4; need(14);
    doc.setFillColor(11, 31, 77); doc.rect(15, y - 5, 180, 8, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(10);
    doc.text("N°", 18, y); doc.text("Designation", 30, y); doc.text("Qte", 190, y, { align: "right" });
    y += 8;
    doc.setTextColor(20, 20, 20); doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    d.its.forEach((x, i) => {
      const txt = x.nom + (x.marque ? " - " + x.marque : "") + (x.ref ? " (Ref. " + x.ref + ")" : "");
      const parts = doc.splitTextToSize(clean(txt), 140), h = parts.length * 5 + 3;
      need(h);
      doc.text(String(i + 1), 18, y);
      doc.text(parts, 30, y);
      doc.text(String(x.q), 190, y, { align: "right" });
      y += h - 1;
      doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2); doc.line(15, y - 2, 195, y - 2);
    });
    const total = d.its.reduce((s, x) => s + x.q, 0);
    need(16); y += 4;
    doc.setFont("helvetica", "bold"); doc.setFontSize(11);
    doc.text("Total : " + d.its.length + " reference(s), " + total + " unite(s)", 15, y);
    y += 10; need(10);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(90, 90, 90);
    doc.text(doc.splitTextToSize("Aucun tarif automatique : GTSI confirmera les prix, la disponibilite et les delais.", 180), 15, y);
    return doc;
  }

  // Appel au script Google
  async function call(payload) {
    const r = await fetch(URL_SCRIPT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    return r.json();
  }

  let box = null;
  const closeBox = () => { if (box) { box.remove(); box = null; } };
  function openBox(mail, onOk) {
    closeBox();
    box = document.createElement("div");
    box.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
    box.innerHTML =
      '<div style="background:#fff;color:#111;border-radius:14px;padding:20px;max-width:340px;width:100%">' +
      '<h3 style="margin:0 0 8px">📧 Confirmez votre e-mail</h3>' +
      '<p style="margin:0 0 12px;font-size:14px">Un code à 6 chiffres a été envoyé à <b id="bc-m"></b>. Vérifiez aussi vos courriers indésirables.</p>' +
      '<input id="bc-code" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" style="width:100%;font-size:24px;letter-spacing:8px;text-align:center;padding:10px;border:2px solid #ccc;border-radius:10px;box-sizing:border-box">' +
      '<button id="bc-ok" type="button" class="btn" style="width:100%;margin-top:12px">Valider le code</button>' +
      '<button id="bc-resend" type="button" class="btn secondary" style="width:100%;margin-top:8px">Renvoyer le code</button>' +
      '<button id="bc-cancel" type="button" class="btn secondary" style="width:100%;margin-top:8px">Modifier mon e-mail</button></div>';
    dlg.appendChild(box); // dans le dialog, sinon il serait caché derrière
    const q = s => box.querySelector(s);
    q("#bc-m").textContent = mail;
    const code = q("#bc-code"), ok = q("#bc-ok"), resend = q("#bc-resend");
    code.focus();
    function cooldown() {
      let s = 60; resend.disabled = true;
      const t = setInterval(() => {
        s--;
        if (!box) { clearInterval(t); return; }
        resend.textContent = s > 0 ? "Renvoyer le code (" + s + " s)" : "Renvoyer le code";
        if (s <= 0) { resend.disabled = false; clearInterval(t); }
      }, 1000);
    }
    cooldown();
    q("#bc-cancel").onclick = () => { closeBox(); $("bc-mail").focus(); };
    resend.onclick = async () => {
      resend.disabled = true;
      try {
        const r = await call({ action: "send_code", email: mail });
        if (!r.ok) { alert("🚨 " + r.error); resend.disabled = false; return; }
        alert("✅ Nouveau code envoyé."); cooldown();
      } catch (x) { alert("🚨 Impossible d'envoyer le code."); resend.disabled = false; }
    };
    ok.onclick = async () => {
      const v = code.value.replace(/\D/g, "");
      if (v.length !== 6) { alert("🚨 Saisissez les 6 chiffres du code reçu."); return; }
      ok.disabled = true; ok.textContent = "Vérification...";
      try {
        const r = await call({ action: "verify_code", email: mail, code: v });
        if (!r.ok) { alert("🚨 " + r.error); ok.disabled = false; ok.textContent = "Valider le code"; return; }
        closeBox(); onOk(r.token);
      } catch (x) { alert("🚨 Vérification impossible."); ok.disabled = false; ok.textContent = "Valider le code"; }
    };
  }

  let doc = null, fichier = "", last = null, tokenOk = "", mailOk = "";

  async function finish(d, token) {
    go.disabled = true; go.textContent = "Envoi en cours...";
    try {
      doc = buildPdf(d);
      const slug = d.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9]+/g, "-");
      fichier = "Devis-Boutique-GTSI-" + slug + ".pdf";
      last = d;
      const r = await call({
        nom: d.nom, email: d.mail, token: token,
        message: fullMessage(d), filename: fichier,
        pdf: doc.output("datauristring").split(",")[1]
      });
      if (!r.ok) throw new Error(r.error || "échec");
      tokenOk = token; mailOk = d.mail;
      $("bc-status").textContent = "✅ Votre demande a été envoyée à GTSI par e-mail. Téléchargez maintenant votre PDF, puis envoyez-le sur WhatsApp (📎 → Document).";
      result.hidden = false;
      go.textContent = "✅ Demande envoyée";
      result.scrollIntoView({ behavior: "smooth", block: "center" });
    } catch (x) {
      alert("🚨 Envoi impossible : " + (x.message || "vérifiez votre connexion") + ".");
      go.disabled = false; go.textContent = "Valider ma demande";
    }
  }

  go.addEventListener("click", async () => {
    if (!window.jspdf) { alert("🚨 Le module PDF n'est pas chargé. Rechargez la page."); return; }
    const its = check();
    if (!its) return;
    const d = data(its);
    if (tokenOk && mailOk === d.mail) { finish(d, tokenOk); return; }
    go.disabled = true; go.textContent = "Envoi du code...";
    try {
      const r = await call({ action: "send_code", email: d.mail });
      if (!r.ok) { alert("🚨 " + r.error); return; }
      openBox(d.mail, token => finish(d, token));
    } catch (x) {
      alert("🚨 Impossible d'envoyer le code. Vérifiez votre connexion.");
    } finally {
      if (!result.hidden) return;
      go.disabled = false; go.textContent = "Valider ma demande";
    }
  });

  $("bc-pdf").addEventListener("click", () => {
    if (!doc) return;
    doc.save(fichier);
    $("bc-wa").disabled = false; $("bc-wa").style.opacity = "1";
    $("bc-status").textContent = "✅ PDF téléchargé. Appuyez sur l'étape 2, puis dans WhatsApp : 📎 → Document → " + fichier + ".";
  });
  $("bc-wa").addEventListener("click", () => {
    if (!last) return;
    const total = last.its.reduce((s, x) => s + x.q, 0);
    const msg = "Bonjour GTSI, je souhaite un devis pour " + last.its.length + " article(s) (" + total + " unité(s)). " +
      "Client : " + last.nom + ", " + last.ville + ". Voici le PDF ci-joint. Merci de m'indiquer les prix et la disponibilité.";
    window.location.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
  });

  // Si le panier change, la demande doit être renvoyée
  dlg.addEventListener("change", e => {
    if (e.target.getAttribute && e.target.getAttribute("data-act") === "qty") {
      go.disabled = false; go.textContent = "Valider ma demande"; result.hidden = true;
    }
  });
  dlg.addEventListener("click", e => {
    const a = e.target.closest && e.target.closest('[data-act="rm"],[data-act="clear"]');
    if (a) { go.disabled = false; go.textContent = "Valider ma demande"; result.hidden = true; }
  });
  sync();
})();
