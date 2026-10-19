(function () {
  "use strict";
  var $ = function (i) { return document.getElementById(i); };
  if (!$("b-grid")) return;
  var WA = "https://wa.me/22879828669?text=";
  var DATA = window.GTSI_DATA || {}, PRIX = window.GTSI_PRIX || {};
  var BRANDS = ["MikroTik", "Cudy", "TP-Link", "Ubiquiti"];
  var TAGS = [
    ["PoE", /PoE/i], ["Wi-Fi", /Wi-Fi/i],
    ["Fibre optique", /fibre|SFP|optique|FTTH|pigtail/i],
    ["Extérieur / longue portée", /extérieur|longue portée|directionnelle|sectorielle|point à|CPE|mât|station de base/i],
    ["Câble Ethernet", /Cat 5e|Cat 6|RJ45|keystone|brassage/i],
    ["Sécurité", /VPN|pare-feu|biométrique|contrôle d'accès|serrure/i],
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
                   prix: PRIX[nom] || null, vedette: i < 3 });
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
  function fmt(p) { return Number(p).toLocaleString("fr-FR") + " FCFA"; }
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
  if (items.some(function (p) { return p.prix; })) $("b-prixwrap").hidden = false;

  function list() {
    var q = norm(S.q);
    var r = items.filter(function (p) {
      if (S.cat && p.cat !== S.cat) return false;
      if (S.marque && p.marque !== S.marque) return false;
      if (S.tag && p.tags.indexOf(S.tag) < 0) return false;
      if (S.min && (!p.prix || p.prix < S.min)) return false;
      if (S.max && (!p.prix || p.prix > S.max)) return false;
      return !q || norm(p.nom + " " + p.cat + " " + p.marque + " " + p.tags.join(" ")).indexOf(q) > -1;
    });
    r.sort(function (a, b) {
      if (S.sort === "az") return a.nom.localeCompare(b.nom, "fr");
      if (S.sort === "za") return b.nom.localeCompare(a.nom, "fr");
      if (S.sort === "pa" || S.sort === "pd") {
        var x = a.prix, y = b.prix;
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return S.sort === "pa" ? x - y : y - x;
      }
      return (b.vedette ? 1 : 0) - (a.vedette ? 1 : 0);
    });
    return r;
  }
  function card(p) {
    var n = esc(p.nom);
    return '<article class="product"><div class="product-img"><img src="assets/images/produits/' +
      slug(p.nom) + '.jpg" alt="" loading="lazy" onerror="this.remove()"></div>' +
      '<div class="product-body"><span class="cat">' + esc(p.cat) + "</span><h3>" + n + "</h3>" +
      (p.marque ? '<span class="badge">' + esc(p.marque) + "</span>" : "") +
      "<p>Exemple de catalogue : modèle et référence selon votre besoin.</p>" +
      '<p class="price">' + (p.prix ? fmt(p.prix) : "Prix sur demande") + "</p>" +
      '<p class="dispo">Disponibilité à confirmer</p>' +
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
   ["b-min", "input", "min"], ["b-max", "input", "max"]].forEach(function (c) {
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
  function detail(n) {
    var p = find(n);
    if (!p) return;
    var rec = items.filter(function (x) { return x.cat === p.cat && x.nom !== p.nom; }).slice(0, 4);
    $("b-dlg-body").innerHTML = "<h3>" + esc(p.nom) + '</h3><p class="cat">' + esc(p.cat) +
      (p.marque ? " · " + esc(p.marque) : "") + "</p>" +
      '<ul class="dlg-list"><li>Prix : ' + (p.prix ? fmt(p.prix) : "sur demande") + "</li>" +
      "<li>Disponibilité : à confirmer</li>" +
      "<li>Caractéristiques techniques : à renseigner d'après la fiche du fabricant</li>" +
      "<li>Compatibilités : à confirmer selon votre installation</li></ul>" +
      "<p>Exemple de catalogue. Indiquez la quantité souhaitée, y compris pour de grandes quantités.</p>" +
      '<div class="dlg-actions"><button class="btn" type="button" data-act="add" data-n="' + esc(p.nom) + '">Ajouter au devis</button>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener noreferrer" href="' + WA +
      encodeURIComponent("Bonjour GTSI, je souhaite un devis pour : " + p.nom + ". Merci de m'indiquer le prix et la disponibilité.") +
      '">WhatsApp</a><button class="btn secondary" type="button" data-act="close">Fermer</button></div>' +
      (rec.length ? '<h4 class="rec-title">Produits associés</h4><div class="rec">' +
        rec.map(function (x) {
          return '<button class="btn secondary btn-sm" type="button" data-act="det" data-n="' + esc(x.nom) + '">' + esc(x.nom) + "</button>";
        }).join("") + "</div>" : "");
    openD($("b-dlg"));
  }

  var cart = [];
  try { cart = JSON.parse(localStorage.getItem("gtsi_devis") || "[]"); } catch (e) { cart = []; }
  function save() { try { localStorage.setItem("gtsi_devis", JSON.stringify(cart)); } catch (e) {} }
  function link() {
    var who = $("b-who").value.trim();
    var m = "Bonjour GTSI, je souhaite un devis pour :\n" +
      cart.map(function (c) { return "- " + c.q + " x " + c.nom; }).join("\n");
    if (who) m += "\nNom / entreprise : " + who;
    m += "\nMerci de m'indiquer les prix et la disponibilité.";
    $("b-send").href = cart.length ? WA + encodeURIComponent(m) : "#";
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
})();
