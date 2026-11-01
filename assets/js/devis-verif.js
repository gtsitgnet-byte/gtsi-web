(() => {
  "use strict";
  const root = document.getElementById("gtsi-devis");
  if (!root) return;
  const $ = id => root.querySelector("#" + id);

  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // Mots courts autorisés dans la description
  const OK = ["pc","tv","ip","hd","wifi","wi","fi","nvr","dvr","ptz","vpn","lan","wan","poe","cctv","4g","5g","nb","m2","m"];

  function real(word) {
    const w = norm(word).replace(/[^a-z]/g, "");
    if (w.length < 2) return false;
    if (!/[aeiouy]/.test(w)) return false;
    if (/(.)\1\1/.test(w)) return false;
    if (/[^aeiouy]{6,}/.test(w)) return false;
    if (w.length >= 5) {
      const v = (w.match(/[aeiouy]/g) || []).length / w.length;
      if (v < 0.2 || v > 0.8) return false;
    }
    return true;
  }
  const words = s => (s.match(/[\p{L}]+/gu) || []);

  const TOGO = ["lome","aneho","atakpame","kpalime","sokode","kara","dapaong","tsevie","bassar","mango","notse","vogan","badou","kante","tchamba","sotouboua","niamtougou","cinkasse","amlame","tabligbo","aflao","agbodrafo","baguida","adetikope","kouve","elavagnon","blitta","pagouda","guerin-kouka","bafilo","tabligbo","anie","danyi","kevé","keve","dzodze","gbatope","kpagouda","tohoun","hahotoe","afagnan"];

  const PREFIX = { "228": ["70","71","72","79","90","91","92","93","96","97","98","99"] };
  const BAD_DOMAINS = {
    "gmial.com":"gmail.com","gmai.com":"gmail.com","gmail.co":"gmail.com","gmaill.com":"gmail.com",
    "gamil.com":"gmail.com","gnail.com":"gmail.com","hotmial.com":"hotmail.com","hotmai.com":"hotmail.com",
    "yahou.com":"yahoo.com","yaho.com":"yahoo.com","outlok.com":"outlook.com"
  };
  const DISPOSABLE = ["mailinator.com","yopmail.com","tempmail.com","10minutemail.com","guerrillamail.com","trashmail.com"];

  function extra(n) {
    const e = [];
    const bad = (id, msg) => e.push({ el: $(id), msg });

    if (n === 2) {
      const country = $("gd-country").value;
      const city = $("gd-city").value.trim();
      const q = $("gd-quarter").value.trim();
      if (city) {
        if (!words(city).every(real)) bad("gd-city", "La ville « " + city + " » ne semble pas réelle.");
        else if (country === "Togo" && !TOGO.includes(norm(city).replace(/\s+/g, " ")))
          bad("gd-city", "Ville « " + city + " » inconnue au Togo. Vérifiez l'orthographe.");
      }
      if (q) {
        if (!words(q).every(real)) bad("gd-quarter", "Le quartier « " + q + " » ne semble pas réel.");
        else if (norm(q) === norm(city)) bad("gd-quarter", "Le quartier doit être différent de la ville.");
      }
      const d = $("gd-details").value.trim();
      const w = words(d);
      const good = w.filter(x => real(x) || OK.includes(norm(x)));
      if (w.length < 3) bad("gd-details", "Décrivez votre projet avec au moins 3 mots.");
      else if (good.length / w.length < 0.7) bad("gd-details", "La description contient des mots qui n'ont pas de sens.");
    }

    if (n === 3) {
      const name = $("gd-name").value.trim();
      const parts = words(name);
      if (name && (parts.length < 2 || !parts.every(real)))
        bad("gd-name", "Le nom « " + name + " » ne semble pas réel. Écrivez votre vrai nom et prénom.");

      const mail = $("gd-email").value.trim().toLowerCase();
      if (mail && mail.includes("@")) {
        const [local, dom] = mail.split("@");
        if (BAD_DOMAINS[dom]) bad("gd-email", "Vouliez-vous écrire @" + BAD_DOMAINS[dom] + " ?");
        else if (DISPOSABLE.includes(dom)) bad("gd-email", "Les adresses jetables ne sont pas acceptées.");
        else if (local.length < 3 || /^(.)\1+$/.test(local) || /^(test|aaa|abc|xxx|azerty|qwerty)/.test(local))
          bad("gd-email", "Cette adresse e-mail ne semble pas réelle.");
      }

      const pc = $("gd-pcountry").value;
      const dial = ($("gd-dial").value || "").replace("+", "");
      const num = ($("gd-phone-local").value || "").replace(/\D/g, "").replace(/^0+/, "");
      if (num) {
        if (PREFIX[dial] && !PREFIX[dial].includes(num.slice(0, 2)))
          bad("gd-phone-local", "Ce numéro ne correspond à aucun opérateur de " + pc + " (débute par " + PREFIX[dial].join(", ") + ").");
        else if ("0123456789012345678901".includes(num) || "9876543210987654321".includes(num) || /^(\d{2})\1+$/.test(num) || /^(\d{4})\1$/.test(num))
          bad("gd-phone-local", "Ce numéro semble inventé.");
      }
    }
    return e;
  }

  function show(errs) {
    root.querySelectorAll(".gd-invalid").forEach(x => x.classList.remove("gd-invalid"));
    errs.forEach(x => {
      x.el.classList.add("gd-invalid");
      const off = () => x.el.classList.remove("gd-invalid");
      x.el.addEventListener("input", off, { once: true });
      x.el.addEventListener("change", off, { once: true });
    });
    alert("🚨 Informations non crédibles :\n\n• " + errs.map(x => x.msg).join("\n• ") +
      "\n\nMerci de saisir des informations réelles.");
    errs[0].el.focus();
  }

  document.addEventListener("click", ev => {
    const b = ev.target.closest && ev.target.closest("[data-gd-next]");
    if (!b || !root.contains(b)) return;
    const vis = root.querySelector("[id^=gd-step-]:not([hidden])");
    const errs = extra(Number(vis.id.slice(-1)));
    if (errs.length) { ev.stopImmediatePropagation(); ev.preventDefault(); show(errs); }
  }, true);

  document.addEventListener("submit", ev => {
    if (ev.target !== $("gd-form")) return;
    for (const n of [2, 3]) {
      const errs = extra(n);
      if (errs.length) {
        ev.stopImmediatePropagation(); ev.preventDefault();
        [1, 2, 3].forEach(i => $("gd-step-" + i).hidden = i !== n);
        show(errs);
        return;
      }
    }
  }, true);
})();
