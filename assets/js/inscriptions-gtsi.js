(() => {
  "use strict";
  const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbxd7GGH6m8TqJJZmgf5P8vt-K8X3jPuauHHfkzHDsxwesErwWxV23kvnyd9ZHfqkLU1uQ/exec";
  const WA = "22879828669";
  const form = document.getElementById("gtsi-ad-form");
  if (!form) return;
  const f = n => form.elements[n];

  const st = document.createElement("style");
  st.textContent = ".gd-invalid{border-color:#d92d20!important;background:#fff5f4!important;box-shadow:0 0 0 3px rgba(217,45,32,.18)!important}";
  document.head.appendChild(st);

  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const words = s => (s.match(/[\p{L}]+/gu) || []);
  const OK = ["pc","tv","ip","hd","wifi","vpn","lan","poe","cctv","vip","sarl","sa","ong"];
  function real(word) {
    const w = norm(word).replace(/[^a-z]/g, "");
    if (OK.includes(w)) return true;
    if (w.length < 2 || !/[aeiouy]/.test(w)) return false;
    if (/(.)\1\1/.test(w) || /[^aeiouy]{6,}/.test(w)) return false;
    if (w.length >= 5) { const v = (w.match(/[aeiouy]/g) || []).length / w.length; if (v < 0.2 || v > 0.8) return false; }
    return true;
  }
  const BAD = { "gmial.com":"gmail.com","gmai.com":"gmail.com","gmail.co":"gmail.com","gamil.com":"gmail.com","gnail.com":"gmail.com","hotmial.com":"hotmail.com","yahou.com":"yahoo.com","outlok.com":"outlook.com" };
  const DISP = ["mailinator.com","yopmail.com","tempmail.com","10minutemail.com","guerrillamail.com","trashmail.com"];
  const TG = ["70","71","72","79","90","91","92","93","96","97","98","99"];

  function phoneClean() {
    let p = f("telephone").value.replace(/[\s.\-()]/g, "");
    if (p.startsWith("00")) p = "+" + p.slice(2);
    return p;
  }

  function check() {
    const e = [];
    const bad = (n, m) => e.push({ el: f(n), msg: m });

    const org = f("organisation").value.trim();
    if (!org) bad("organisation", "Le nom de la structure est obligatoire.");
    else if (org.length < 3 || !words(org).some(w => real(w) || (w.length >= 2 && w === w.toUpperCase())))
      bad("organisation", "Le nom « " + org + " » ne semble pas réel.");

    if (!f("categorie").value) bad("categorie", "Choisissez le type d'activité.");

    const d = f("description").value.trim(), w = words(d);
    if (!d) bad("description", "La description est obligatoire.");
    else if (w.length < 4) bad("description", "Décrivez votre activité avec au moins 4 mots.");
    else if (w.filter(real).length / w.length < 0.7) bad("description", "La description contient des mots qui n'ont pas de sens.");

    const ad = f("adresse").value.trim(), aw = words(ad);
    if (!ad) bad("adresse", "L'adresse est obligatoire.");
    else if (aw.length < 2) bad("adresse", "Adresse invalide. Exemple : Adidogomé, Lomé.");

    const tel = f("telephone").value.trim(), p = phoneClean();
    if (!tel) bad("telephone", "Le téléphone est obligatoire.");
    else if (!/^\+\d{8,15}$/.test(p)) bad("telephone", "Commencez par l'indicatif du pays. Exemple : +228 90 12 34 56.");
    else if (p.startsWith("+228") && (p.length !== 12 || !TG.includes(p.slice(4, 6))))
      bad("telephone", "Numéro togolais invalide : 8 chiffres, débutant par " + TG.join(", ") + ".");
    else if (/(\d)\1{6,}/.test(p) || "01234567890123456789".includes(p.slice(-8)))
      bad("telephone", "Ce numéro semble inventé.");

    if (!f("duree").value) bad("duree", "Choisissez la durée de publication.");

    const r = f("responsable").value.trim();
    if (r && (words(r).length < 2 || !words(r).every(real)))
      bad("responsable", "Le nom du responsable ne semble pas réel (nom et prénom).");

    const m = f("email").value.trim().toLowerCase();
    if (!m) bad("email", "L'adresse e-mail est obligatoire.");
    else if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(m)) bad("email", "Adresse e-mail invalide.");
    else {
      const [loc, dom] = m.split("@");
      if (BAD[dom]) bad("email", "Vouliez-vous écrire @" + BAD[dom] + " ?");
      else if (DISP.includes(dom)) bad("email", "Les adresses jetables ne sont pas acceptées.");
      else if (loc.length < 3 || /^(test|aaa|abc|xxx|azerty|qwerty)/.test(loc)) bad("email", "Cette adresse e-mail ne semble pas réelle.");
    }
    return e;
  }

  function show(errs) {
    form.querySelectorAll(".gd-invalid").forEach(x => x.classList.remove("gd-invalid"));
    errs.forEach(x => {
      x.el.classList.add("gd-invalid");
      const off = () => x.el.classList.remove("gd-invalid");
      x.el.addEventListener("input", off, { once: true });
      x.el.addEventListener("change", off, { once: true });
    });
    alert("🚨 Veuillez corriger :\n\n• " + errs.map(x => x.msg).join("\n• "));
    errs[0].el.focus();
  }

  async function call(payload) {
    const r = await fetch(URL_SCRIPT, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    return r.json();
  }

  let box = null;
  const closeBox = () => { if (box) { box.remove(); box = null; } };

  function openBox(mail, onVerified) {
    closeBox();
    box = document.createElement("div");
    box.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
    box.innerHTML =
      '<div style="background:#fff;color:#111;border-radius:14px;padding:20px;max-width:340px;width:100%">' +
      '<h3 style="margin:0 0 8px">📧 Confirmez votre e-mail</h3>' +
      '<p style="margin:0 0 12px;font-size:14px">Un code à 6 chiffres a été envoyé à <b id="ga-mail"></b>. Vérifiez aussi vos courriers indésirables.</p>' +
      '<input id="ga-code" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" style="width:100%;font-size:24px;letter-spacing:8px;text-align:center;padding:10px;border:2px solid #ccc;border-radius:10px;box-sizing:border-box">' +
      '<button id="ga-ok" type="button" class="btn" style="width:100%;margin-top:12px">Valider le code</button>' +
      '<button id="ga-resend" type="button" class="btn secondary" style="width:100%;margin-top:8px">Renvoyer le code</button>' +
      '<button id="ga-cancel" type="button" class="btn secondary" style="width:100%;margin-top:8px">Modifier mon e-mail</button></div>';
    document.body.appendChild(box);
    box.querySelector("#ga-mail").textContent = mail;
    const code = box.querySelector("#ga-code"), ok = box.querySelector("#ga-ok"), resend = box.querySelector("#ga-resend");
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

    box.querySelector("#ga-cancel").onclick = () => { closeBox(); f("email").focus(); };
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
        closeBox();
        onVerified(r.token);
      } catch (x) { alert("🚨 Vérification impossible."); ok.disabled = false; ok.textContent = "Valider le code"; }
    };
  }

  async function finish(mail, token) {
    const btn = form.querySelector('[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "Envoi en cours...";
    const data = {
      organisation: f("organisation").value.trim(),
      categorie: f("categorie").value,
      description: f("description").value.trim(),
      adresse: f("adresse").value.trim(),
      telephone: phoneClean(),
      duree: f("duree").value,
      responsable: f("responsable").value.trim()
    };
    try {
      const r = await call({ action: "send_ad", email: mail, token: token, data: data });
      if (!r.ok) throw new Error(r.error);
      const msg = "Bonjour GTSI, je souhaite publier mon annonce.\n" +
        "Structure : " + data.organisation + " (" + data.categorie + ")\n" +
        "Durée : " + data.duree + "\n" +
        "Téléphone : " + data.telephone + "\n" +
        "Ma demande est bien envoyée par e-mail. Je vous transmets mon logo et mes photos ici.";
      alert("✅ Votre demande a bien été envoyée. WhatsApp va s'ouvrir pour envoyer votre logo et vos photos.");
      window.location.href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    } catch (x) {
      alert("🚨 Envoi impossible : " + (x.message || "vérifiez votre connexion") + ".");
      btn.disabled = false; btn.textContent = label;
    }
  }

  form.addEventListener("submit", async ev => {
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const errs = check();
    if (errs.length) { show(errs); return; }
    const mail = f("email").value.trim().toLowerCase();
    const btn = form.querySelector('[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = "Envoi du code...";
    try {
      const r = await call({ action: "send_code", email: mail });
      if (!r.ok) { alert("🚨 " + r.error); return; }
      openBox(mail, token => finish(mail, token));
    } catch (x) {
      alert("🚨 Impossible d'envoyer le code. Vérifiez votre connexion.");
    } finally {
      btn.disabled = false; btn.textContent = label;
    }
  }, true);
})();
