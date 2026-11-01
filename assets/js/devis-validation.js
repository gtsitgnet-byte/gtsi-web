(() => {
  "use strict";
  const root = document.getElementById("gtsi-devis");
  if (!root) return;
  const $ = id => root.querySelector("#" + id);

  // [pays, indicatif, longueurs valides du numéro local, retirer le 0 initial]
  const C = [
    ["Togo", "228", [8]], ["Bénin", "229", [10]],
    ["Côte d'Ivoire", "225", [10]], ["Ghana", "233", [9], true],
    ["Nigeria", "234", [10], true], ["Burkina Faso", "226", [8]],
    ["Mali", "223", [8]], ["Sénégal", "221", [9]], ["Niger", "227", [8]],
    ["Cameroun", "237", [9]], ["Gabon", "241", [8]], ["Guinée", "224", [9]],
    ["France", "33", [9], true], ["Belgique", "32", [9]],
    ["Canada", "1", [10]], ["États-Unis", "1", [10]]
  ];
  const find = n => C.find(c => c[0] === n);

  const style = document.createElement("style");
  style.textContent = ".gd-invalid{border-color:#d92d20!important;background:#fff5f4!important;box-shadow:0 0 0 3px rgba(217,45,32,.18)!important}";
  document.head.appendChild(style);

  function fillSelect(sel, withDial) {
    sel.innerHTML = '<option value="">Choisir un pays</option>' +
      C.map(c => '<option value="' + c[0] + '">' + c[0] + (withDial ? " (+" + c[1] + ")" : "") + "</option>").join("");
  }
  fillSelect($("gd-country"), false);
  fillSelect($("gd-pcountry"), true);

  function sync() {
    const pc = find($("gd-pcountry").value);
    $("gd-dial").value = pc ? "+" + pc[1] : "";
    const digits = cleanDigits();
    $("gd-phone").value = pc && digits ? "+" + pc[1] + " " + digits : "";
    const country = $("gd-country").value, city = $("gd-city").value.trim(), q = $("gd-quarter").value.trim();
    $("gd-location").value = [q, city, country].filter(Boolean).join(", ");
  }

  function cleanDigits() {
    let d = $("gd-phone-local").value.replace(/[\s.\-()]/g, "");
    const pc = find($("gd-pcountry").value);
    if (pc && pc[3]) d = d.replace(/^0+/, "");
    return d;
  }

  $("gd-country").addEventListener("change", () => {
    if (!$("gd-pcountry").value) $("gd-pcountry").value = $("gd-country").value;
    sync();
  });
  ["gd-pcountry", "gd-phone-local", "gd-city", "gd-quarter"].forEach(id => {
    $(id).addEventListener("input", sync);
    $(id).addEventListener("change", sync);
  });

  const nameRe = /^[\p{L}][\p{L}'’.\-]+(\s+[\p{L}][\p{L}'’.\-]+)+$/u;
  const placeRe = /^[\p{L}][\p{L}\s'’.\-]{1,}$/u;
  const mailRe = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

  function check(n) {
    const e = [];
    const bad = (id, msg) => e.push({ el: $(id), msg });
    if (n === 1) {
      if (!$("gd-site").value) bad("gd-site", "Choisissez le type de site.");
      if (!$("gd-quantity").value) bad("gd-quantity", "Choisissez la quantité.");
    }
    if (n === 2) {
      if (!$("gd-country").value) bad("gd-country", "Choisissez votre pays.");
      const city = $("gd-city").value.trim();
      if (!city) bad("gd-city", "La ville est obligatoire.");
      else if (!placeRe.test(city)) bad("gd-city", "Ville invalide (lettres uniquement).");
      const q = $("gd-quarter").value.trim();
      if (!q) bad("gd-quarter", "Le quartier est obligatoire.");
      else if (q.length < 2) bad("gd-quarter", "Quartier invalide.");
      if (!$("gd-deadline").value) bad("gd-deadline", "Choisissez un délai.");
      if ($("gd-details").value.trim().length < 10)
        bad("gd-details", "Décrivez votre projet (au moins 10 caractères).");
    }
    if (n === 3) {
      const name = $("gd-name").value.trim();
      if (!name) bad("gd-name", "Le nom complet est obligatoire.");
      else if (!nameRe.test(name)) bad("gd-name", "Indiquez nom ET prénom (lettres uniquement).");
      const pc = find($("gd-pcountry").value);
      if (!pc) bad("gd-pcountry", "Choisissez d'abord le pays du numéro.");
      const raw = $("gd-phone-local").value.trim();
      if (!raw) bad("gd-phone-local", "Le numéro de téléphone est obligatoire.");
      else if (!/^[\d\s.\-()]+$/.test(raw)) bad("gd-phone-local", "Le numéro ne doit contenir que des chiffres.");
      else if (pc) {
        const d = cleanDigits();
        if (!pc[2].includes(d.length))
          bad("gd-phone-local", "Numéro invalide pour " + pc[0] + " : " + pc[2].join(" ou ") + " chiffres attendus (sans l'indicatif +" + pc[1] + ").");
        else if (/^(\d)\1+$/.test(d)) bad("gd-phone-local", "Numéro invalide.");
      }
      const mail = $("gd-email").value.trim();
      if (!mail) bad("gd-email", "L'adresse e-mail est obligatoire.");
      else if (!mailRe.test(mail)) bad("gd-email", "Adresse e-mail invalide.");
      if (!$("gd-contact").value) bad("gd-contact", "Choisissez votre contact préféré.");
      if (!$("gd-consent").checked) bad("gd-consent", "Vous devez accepter d'être recontacté.");
    }
    return e;
  }

  function show(errs) {
    root.querySelectorAll(".gd-invalid").forEach(x => x.classList.remove("gd-invalid"));
    errs.forEach(x => {
      x.el.classList.add("gd-invalid");
      x.el.addEventListener("input", () => x.el.classList.remove("gd-invalid"), { once: true });
      x.el.addEventListener("change", () => x.el.classList.remove("gd-invalid"), { once: true });
    });
    alert("🚨 Veuillez corriger :\n\n• " + errs.map(x => x.msg).join("\n• "));
    errs[0].el.focus();
  }

  document.addEventListener("click", ev => {
    const b = ev.target.closest && ev.target.closest("[data-gd-next]");
    if (!b || !root.contains(b)) return;
    sync();
    const errs = check(Number(root.querySelector("[id^=gd-step-]:not([hidden])").id.slice(-1)));
    if (errs.length) { ev.stopImmediatePropagation(); ev.preventDefault(); show(errs); }
  }, true);

  document.addEventListener("submit", ev => {
    if (ev.target !== $("gd-form")) return;
    sync();
    for (const n of [1, 2, 3]) {
      const errs = check(n);
      if (errs.length) {
        ev.stopImmediatePropagation(); ev.preventDefault();
        if (n !== 3) $("gd-step-" + n).hidden = false, [1, 2, 3].filter(i => i !== n).forEach(i => $("gd-step-" + i).hidden = true);
        show(errs);
        return;
      }
    }
  }, true);

  sync();
})();
