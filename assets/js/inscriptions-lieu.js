(() => {
  "use strict";
  const form = document.getElementById("gtsi-ad-form");
  if (!form) return;
  const f = n => form.elements[n];

  // [pays, indicatif, longueurs valides, retirer le 0 initial]
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

  const norm = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const words = s => (s.match(/[\p{L}]+/gu) || []);
  function real(word) {
    const w = norm(word).replace(/[^a-z]/g, "");
    if (w.length < 2 || !/[aeiouy]/.test(w)) return false;
    if (/(.)\1\1/.test(w) || /[^aeiouy]{6,}/.test(w)) return false;
    if (w.length >= 5) { const v = (w.match(/[aeiouy]/g) || []).length / w.length; if (v < 0.2 || v > 0.8) return false; }
    return true;
  }

  const fill = (sel, dial) => {
    sel.innerHTML = '<option value="">Choisir un pays</option>' +
      C.map(c => '<option value="' + c[0] + '">' + c[0] + (dial ? " (+" + c[1] + ")" : "") + "</option>").join("");
  };
  fill(f("pays"), false);
  fill(f("pays_tel"), true);

  function digits() {
    const pc = find(f("pays_tel").value);
    let d = f("tel_local").value.replace(/[\s.\-()]/g, "");
    if (pc && pc[3]) d = d.replace(/^0+/, "");
    return d;
  }
  function sync() {
    const pc = find(f("pays_tel").value), d = digits();
    f("indicatif").value = pc ? "+" + pc[1] : "";
    f("telephone").value = pc && d ? "+" + pc[1] + " " + d : "";
    f("adresse").value = [f("quartier").value.trim(), f("ville").value.trim(), f("pays").value].filter(Boolean).join(", ");
  }

  f("pays").addEventListener("change", () => {
    if (!f("pays_tel").value) f("pays_tel").value = f("pays").value;
    sync();
  });
  ["pays_tel", "tel_local", "ville", "quartier"].forEach(n => {
    f(n).addEventListener("input", sync);
    f(n).addEventListener("change", sync);
  });

  form.addEventListener("submit", ev => {
    sync();
    const e = [];
    const bad = (n, m) => e.push({ el: f(n), msg: m });

    const pays = f("pays").value;
    if (!pays) bad("pays", "Choisissez votre pays.");

    const ville = f("ville").value.trim();
    if (!ville) bad("ville", "La ville est obligatoire.");
    else if (!words(ville).length || !words(ville).every(real) || !/^[\p{L}][\p{L}\s'’.\-]+$/u.test(ville))
      bad("ville", "La ville « " + ville + " » ne semble pas réelle.");
    else if (pays === "Togo" && !TOGO.includes(norm(ville).replace(/\s+/g, " ")))
      bad("ville", "Ville « " + ville + " » inconnue au Togo. Vérifiez l'orthographe.");

    const q = f("quartier").value.trim();
    if (!q) bad("quartier", "Le quartier est obligatoire.");
    else if (!words(q).every(real) || !words(q).length) bad("quartier", "Le quartier « " + q + " » ne semble pas réel.");
    else if (ville && norm(q) === norm(ville)) bad("quartier", "Le quartier doit être différent de la ville.");

    const pc = find(f("pays_tel").value);
    if (!pc) bad("pays_tel", "Choisissez d'abord le pays du numéro.");
    const raw = f("tel_local").value.trim();
    if (!raw) bad("tel_local", "Le numéro de téléphone est obligatoire.");
    else if (!/^[\d\s.\-()]+$/.test(raw)) bad("tel_local", "Le numéro ne doit contenir que des chiffres.");
    else if (pc) {
      const d = digits();
      if (!pc[2].includes(d.length))
        bad("tel_local", "Numéro invalide pour " + pc[0] + " : " + pc[2].join(" ou ") + " chiffres attendus, sans l'indicatif +" + pc[1] + ".");
      else if (pc[1] === "228" && !TG.includes(d.slice(0, 2)))
        bad("tel_local", "Ce numéro ne correspond à aucun opérateur du Togo (débute par " + TG.join(", ") + ").");
      else if (/^(\d)\1+$/.test(d) || "01234567890123456789".includes(d) || "98765432109876543210".includes(d))
        bad("tel_local", "Ce numéro semble inventé.");
    }

    if (e.length) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      form.querySelectorAll(".gd-invalid").forEach(x => x.classList.remove("gd-invalid"));
      e.forEach(x => {
        x.el.classList.add("gd-invalid");
        const off = () => x.el.classList.remove("gd-invalid");
        x.el.addEventListener("input", off, { once: true });
        x.el.addEventListener("change", off, { once: true });
      });
      alert("🚨 Veuillez corriger :\n\n• " + e.map(x => x.msg).join("\n• "));
      e[0].el.focus();
    }
  }, true);

  sync();
})();
