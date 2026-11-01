(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  if (!$("b-grid")) return;
  var WA = "https://wa.me/22879828669?text=";
  var DATA = window.GTSI_DATA || {}, PRIX = window.GTSI_PRIX || {};
  var IMAGE_MAP = {};
  var BRANDS = ["MikroTik", "Cudy", "TP-Link", "Ubiquiti"];
  var TAGS = [
    ["PoE", /PoE/i], ["Wi-Fi", /Wi-Fi/i],
    ["Fibre optique", /fibre|SFP|optique|FTTH|pigtail/i],
    ["Extérieur / longue portée", /extérieur|longue portée|directionnelle|sectorielle|point à|CPE|mât|station de base/i],
    ["Câble Ethernet", /Cat ?5e|Cat ?6|Cat ?7|RJ45|keystone|brassage|coaxia/i],
    ["Sécurité", /VPN|pare-feu|biométrique|contrôle d'accès|serrure|alarme|RFID|coffre|interphone|visiophone|détecteur/i],
    ["Énergie", /onduleur|batterie|solaire|stabilisateur|régulateur|parafoudre/i],
    ["Vidéosurveillance", /caméra|NVR|DVR|vidéosurveillance|alarme/i]
  ];
  var items = [];
  Object.keys(DATA).forEach(function (cat) {
    DATA[cat].forEach(function (nom, i) {
      var marque = "", tags = [];
      BRANDS.forEach(function (b) { if (nom.indexOf(b) > -1) marque = b; });
      TAGS.forEach(function (t) { if (t[1].test(nom)) tags.push(t[0]); });
      items.push({ cat: cat, nom: nom, marque: marque, tags: tags,
                   prix: PRIX[nom] || null, vedette: /(?:Lenovo|ThinkPad|IdeaPad|ThinkCentre|TP-Link|Ubiquiti|MikroTik|Cudy|Hewlett-Packard|HP\b|Dell|ASUS|Acer|Cisco|D-Link|Netgear|UniFi|Archer|RB5009|CPE510|TL-SG|U6 Plus)/i.test(nom) });
    });
  });
  function norm(s) {
    return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function slug(s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
  function uniq(a) { return a.filter(function (v, i) { return v && a.indexOf(v) === i; }); }
  function opts(id, arr, label) {
    $(id).innerHTML = '<option value="">' + label + "</option>" +
      arr.map(function (v) { return "<option>" + esc(v) + "</option>"; }).join("");
  }
  var S = { q: "", cat: "", marque: "", tag: "", sort: "vedette", min: 0, max: 0, n: 12 };
  var allTags = [];
  items.forEach(function (p) { allTags = allTags.concat(p.tags); });
  opts("b-cat", uniq(items.map(function (p) { return p.cat; })), "Toutes les catégories");
  opts("b-marque", uniq(items.map(function (p) { return p.marque; })), "Toutes les marques");
  opts("b-tag", uniq(allTags), "Toutes les caractéristiques");

  function list() {
    var q = norm(S.q);
    var r = items.filter(function (p) {
      if (S.cat && p.cat !== S.cat) return false;
      if (S.marque && p.marque !== S.marque) return false;
      if (S.tag && p.tags.indexOf(S.tag) < 0) return false;
      return !q || norm(p.nom + " " + p.cat + " " + p.marque + " " + p.tags.join(" ")).indexOf(q) > -1;
    });
    r.sort(function (a, b) {
      if (S.sort === "az") return a.nom.localeCompare(b.nom, "fr");
      if (S.sort === "za") return b.nom.localeCompare(a.nom, "fr");
      return (b.vedette ? 1 : 0) - (a.vedette ? 1 : 0);
    });
    return r;
  }
  var ICONS = [
    [/Ordinateurs/, '<rect x="6" y="8" width="36" height="24" rx="3"/><path d="M16 40h16M24 32v8"/>'],
    [/Réseaux/, '<circle cx="24" cy="12" r="4"/><circle cx="10" cy="36" r="4"/><circle cx="38" cy="36" r="4"/><path d="M24 16v8M24 24L12 33M24 24l12 9"/>'],
    [/Fibre/, '<path d="M6 34c8 0 8-20 18-20s10 20 18 20"/><circle cx="6" cy="34" r="3"/><circle cx="42" cy="34" r="3"/>'],
    [/Vidéosurveillance/, '<rect x="6" y="16" width="26" height="16" rx="3"/><path d="M32 22l10-6v16l-10-6"/>'],
    [/Alarmes/, '<rect x="10" y="22" width="28" height="20" rx="3"/><path d="M16 22v-6a8 8 0 0 1 16 0v6"/><circle cx="24" cy="32" r="2.5"/>'],
    [/Énergie/, '<path d="M26 4L10 26h12l-4 18 20-24H26z"/>'],
    [/Électronique/, '<rect x="14" y="14" width="20" height="20" rx="2"/><path d="M20 6v8M28 6v8M20 34v8M28 34v8M6 20h8M6 28h8M34 20h8M34 28h8"/>'],
    [/Accessoires/, '<path d="M8 28v-4a16 16 0 0 1 32 0v4"/><rect x="6" y="28" width="8" height="12" rx="3"/><rect x="34" y="28" width="8" height="12" rx="3"/>'],
    [/Coffres/, '<rect x="6" y="8" width="36" height="32" rx="3"/><circle cx="26" cy="24" r="7"/><path d="M26 24l4-4M12 40v4M36 40v4"/>']
  ];
  function icon(cat) {
    var d = '<rect x="8" y="8" width="32" height="32" rx="6"/>';
    ICONS.forEach(function (i) { if (i[0].test(cat)) d = i[1]; });
    return '<span class="pi" aria-hidden="true"><svg viewBox="0 0 48 48">' + d + '</svg></span>';
  }
  function cardModelName(name) {
    var patterns = [
      /^(Lenovo ThinkPad E16 Gen 3)/i,
      /^(HP Omnibook X Flip 14-KB0023dx)/i,
      /^(Dell Pro 16\s*[–-]\s*PC16250)/i,
      /^(HP ProBook 460 G11)/i,
      /^(HP 15-fd0182wm)/i,
      /^(HP Laptop15-fd2050wm)/i,
      /^(HP ZBook Studio 16 G10)/i,
      /^(HP ZBook Fury G8)/i,
      /^(ASUS Vivobook X515FA-EJ046)/i,
      /^(HP OmniBook 5 Flip 2-in-1 Laptop 14-fp0013dx)/i,
      /^(HP Pro 290 G9)/i,
      /^(HP ProOne 440 G9)/i,
      /^(HP Prodesk 400 G9)/i,
      /^(HP ProDesk 2 Tower G1i E)/i,
      /^(HP Pro 400 G9)/i,
      /^(HP Pavilion All in One 27-ca2008nl)/i,
      /^(HP All-in-One 27-cr0156nh)/i
    ];
    for (var i = 0; i < patterns.length; i++) {
      var m = name.match(patterns[i]);
      if (m) return m[1];
    }
    return name.split(/\s+[|–—]\s+/)[0].trim();
  }

  function card(p) {
    var n = esc(p.nom);
    var titreCarte = esc(cardModelName(p.nom));
    var image = IMAGE_MAP[p.nom] || "";
    return '<article class="product"><div class="product-img">' + icon(p.cat) +
      (image ? '<img src="' + esc(image) + '" alt="' + n + '" loading="lazy" onerror="this.remove()">' : '') + '</div>' +
      '<div class="product-body"><h3>' + titreCarte + "</h3>" +
      (p.marque ? '<span class="badge">' + esc(p.marque) + "</span>" : "") +
      '<div class="pbtns"><button class="btn secondary btn-sm" type="button" data-act="det" data-n="' + n + '">Détails</button>' +
      '<button class="btn btn-sm" type="button" data-act="add" data-n="' + n + '">Ajouter au devis</button></div></div></article>';
  }
  function render() {
    var r = list();
    $("b-grid").innerHTML = r.slice(0, S.n).map(card).join("");
    $("b-count").textContent = r.length + (r.length > 1 ? " articles" : " article");
    $("b-more").hidden = r.length <= S.n;
  }
  [["b-q", "input", "q"], ["b-cat", "change", "cat"], ["b-marque", "change", "marque"],
   ["b-tag", "change", "tag"], ["b-sort", "change", "sort"],
  ].forEach(function (c) {
    var el = $(c[0]);
    if (!el) return;
    el.addEventListener(c[1], function () {
      S[c[2]] = (c[2] === "min" || c[2] === "max") ? (parseInt(el.value, 10) || 0) : el.value;
      S.n = 12;
      render();
    });
  });

  function find(n) { return items.filter(function (p) { return p.nom === n; })[0]; }
  function openD(d) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  function closeD(d) { if (d.close) d.close(); else d.removeAttribute("open"); }
  var COMPAT = [
    [/PoE|injecteur|splitter|caméras? (IP|PoE)|points? d'accès/i, "PoE : vérifiez la norme (802.3af, 802.3at ou 802.3bt), la puissance disponible par port et la tension attendue. Un switch ou un injecteur PoE n'alimente pas tous les équipements."],
    [/fibre|SFP|QSFP|optique|pigtail|jarretière|OTDR|ODF/i, "Fibre optique : vérifiez le type de fibre (monomode ou multimode), la longueur d'onde, le type de connecteur et la compatibilité du module avec l'équipement."],
    [/antenne|CPE|point-à-|radio|Wi-Fi|4G|5G/i, "Radio : vérifiez la bande de fréquence (2,4 ou 5 GHz), la réglementation locale, la portée réelle selon les obstacles et la compatibilité entre les deux extrémités de la liaison."],
    [/onduleur|batterie|solaire|MPPT|groupe|station électrique|régulateur/i, "Énergie : vérifiez la tension et la capacité, la puissance (VA ou W) de ce que vous voulez protéger, l'autonomie souhaitée et la compatibilité entre onduleur et batteries."],
    [/caméra|NVR|DVR|XVR|BNC|balun|coaxia|vidéosurveillance/i, "Vidéosurveillance : vérifiez la compatibilité entre caméras et enregistreur (IP ou analogique HD), la résolution, le nombre de voies, le stockage et l'alimentation (PoE ou 12 V)."],
    [/Cat ?5e|Cat ?6|Cat ?7|RJ45|brassage|Ethernet/i, "Câblage : vérifiez la catégorie (débit et distance), le blindage et la compatibilité des connecteurs avec le câble."],
    [/RFID|biométrique|serrure|ventouse|contrôleur d'accès|reconnaissance faciale|badge/i, "Contrôle d'accès : vérifiez la tension d'alimentation, le type de serrure, le protocole du lecteur et la compatibilité avec le contrôleur."]
  ];
  function compatHtml(nom) {
    return COMPAT.filter(function (c) { return c[0].test(nom); })
      .map(function (c) { return '<p class="compat">' + esc(c[1]) + '</p>'; })
      .join("");
  }
  function detail(n) {
    var p = find(n);
    if (!p) return;
    var rec = items.filter(function (x) { return x.cat === p.cat && x.nom !== p.nom; }).slice(0, 4);
    var titreCourt = cardModelName(p.nom);
    var description = p.description || p.details || p.caracteristiques ||
      p.caractéristiques || p.specs || p.descriptionLongue || "";
    var texteCatalogue = p.nom.length > titreCourt.length
      ? p.nom.slice(titreCourt.length).replace(/^[\s|–—-]+/, "").trim()
      : "";
    if (!description) description = texteCatalogue;

    var reference = p.reference || p.modele || p.modèle || "";
    var contenu = description
      ? '<section class="gtsi-detail-section"><h4>Description et caractéristiques</h4><p>' +
          esc(description).replace(/\n/g, "<br>") + '</p></section>'
      : '<section class="gtsi-detail-section"><h4>Description</h4>' +
          '<p>Contactez GTSI pour obtenir la fiche technique complète de cette référence.</p></section>';

    $("b-dlg-body").innerHTML =
      '<div class="gtsi-detail-head"><p class="cat">' + esc(p.cat) + '</p>' +
      '<h3>' + esc(titreCourt) + '</h3>' +
      (p.marque ? '<p class="gtsi-detail-brand"><strong>Marque :</strong> ' + esc(p.marque) + '</p>' : '') +
      (reference ? '<p><strong>Référence :</strong> ' + esc(reference) + '</p>' : '') +
      '</div>' + contenu + compatHtml(p.nom) +
      '<div class="dlg-actions"><button class="btn" type="button" data-act="add" data-n="' + esc(p.nom) + '">Ajouter au devis</button>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="' + WA +
      encodeURIComponent("Bonjour GTSI, je souhaite un devis pour : " + p.nom + ". Merci de m'indiquer le prix et la disponibilité.") +
      '">Demander un devis sur WhatsApp</a>' +
      '<a class="btn secondary" href="#contact" data-act="close">Contacter GTSI</a>' +
      '<button class="btn secondary" type="button" data-act="close">Fermer</button></div>' +
      (rec.length ? '<h4 class="rec-title">Produits associés</h4><div class="rec">' +
        rec.map(function (x) {
          return '<button class="btn secondary btn-sm" type="button" data-act="det" data-n="' + esc(x.nom) + '">' + esc(x.nom) + '</button>';
        }).join("") + '</div>' : '');
    openD($("b-dlg"));
  }

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem("gtsi_devis") || "[]"); } catch (e) { cart = []; }
  function save() { try { localStorage.setItem("gtsi_devis", JSON.stringify(cart)); } catch (e) {} }
  function link() {
    var who = $("b-who").value.trim();
    var address = $("b-address").value.trim();
    var m = "Bonjour GTSI, je souhaite un devis pour :\n" +
      cart.map(function (c) { return "- " + c.q + " x " + c.nom; }).join("\n");
    if (who) m += "\nNom du client / entreprise : " + who;
    if (address) m += "\nAdresse complète : " + address;
    m += "\nMerci de m'indiquer les prix et la disponibilité.";
    $("b-send").href = cart.length ? WA + encodeURIComponent(m) : "#";
    var emailSubject = "Demande de devis GTSI";
    $("b-email").href = cart.length
      ? "mailto:gtsi.tg.net@gmail.com?subject=" +
        encodeURIComponent(emailSubject) + "&body=" + encodeURIComponent(m)
      : "#";
  }

  function drawCart() {
    var tot = 0;
    cart.forEach(function (c) { tot += c.q; });
    $("b-cart-count").textContent = tot;
    $("b-cart-list").innerHTML = cart.length ? cart.map(function (c) {
      return "<li><span>" + esc(c.nom) + '</span><span><input type="number" min="1" value="' + c.q +
        '" data-act="qty" data-n="' + esc(c.nom) + '" aria-label="Quantité"> ' +
        '<button class="btn secondary btn-sm" type="button" data-act="rm" data-n="' + esc(c.nom) + '">Retirer</button></span></li>';
    }).join("") : "<li>Votre liste est vide. Ajoutez des articles depuis le catalogue.</li>";
    link();
  }
  function add(n) {
    var f = cart.filter(function (c) { return c.nom === n; })[0];
    if (f) f.q++; else cart.push({ nom: n, q: 1 });
    save();
    drawCart();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-act]") : null;
    if (!t) return;
    var a = t.getAttribute("data-act"), n = t.getAttribute("data-n");
    if (a === "det") detail(n);
    else if (a === "add") {
      add(n);
      t.textContent = "Ajouté ✓";
      setTimeout(function () { t.textContent = "Ajouter au devis"; }, 1400);
    } else if (a === "rm") { cart = cart.filter(function (c) { return c.nom !== n; }); save(); drawCart(); }
    else if (a === "cart") { drawCart(); openD($("b-cart")); }
    else if (a === "close") closeD(t.closest("dialog"));
    else if (a === "clear") { cart = []; save(); drawCart(); }
    else if (a === "more") { S.n += 12; render(); }
  });
  // GTSI_ADRESSE_VALIDATION
  $("b-who").required = true;
  $("b-address").required = true;
  $("b-who").addEventListener("input", link);
  $("b-address").addEventListener("input", link);

  $("b-send").addEventListener("click", function (e) {
    var who = $("b-who");
    var address = $("b-address");

    if (!cart.length) {
      e.preventDefault();
      alert("Ajoutez au moins un article au devis.");
      return;
    }
    if (!who.value.trim()) {
      e.preventDefault();
      alert("Veuillez saisir le nom du client ou de l'entreprise.");
      who.focus();
      return;
    }
    if (!address.value.trim()) {
      e.preventDefault();
      alert("Veuillez saisir l'adresse complète du client.");
      address.focus();
      return;
    }
    link();
  });

  // GTSI_CONTACTS_EMAIL_PHONE
  $("b-email").addEventListener("click", function (e) {
    var who = $("b-who");
    var address = $("b-address");

    if (!cart.length) {
      e.preventDefault();
      alert("Ajoutez au moins un article au devis.");
      return;
    }
    if (!who.value.trim()) {
      e.preventDefault();
      alert("Veuillez saisir le nom du client ou de l'entreprise.");
      who.focus();
      return;
    }
    if (!address.value.trim()) {
      e.preventDefault();
      alert("Veuillez saisir l'adresse complète du client.");
      address.focus();
      return;
    }
    link();
  });

  $("b-cart-list").addEventListener("change", function (e) {
    if (e.target.getAttribute("data-act") !== "qty") return;
    var n = e.target.getAttribute("data-n");
    cart.forEach(function (c) { if (c.nom === n) c.q = Math.max(1, parseInt(e.target.value, 10) || 1); });
    save();
    drawCart();
  });
  $("b-who").addEventListener("input", link);
  render();
  drawCart();
  fetch("assets/images/catalogue_gtsi/image-map.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Carte des images indisponible");
      return response.json();
    })
    .then(function (map) {
      IMAGE_MAP = map || {};
      render();
    })
    .catch(function (error) {
      console.warn("GTSI : images du catalogue non chargées.", error);
    });
})();
