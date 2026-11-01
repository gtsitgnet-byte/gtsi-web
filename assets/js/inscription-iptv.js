/* GTSI IPTV WORLD - validation des commandes */
(function () {
  "use strict";

  const countries = [
    ["Togo", "228", 8, 8],
    ["Bénin", "229", 8, 8],
    ["Côte d'Ivoire", "225", 10, 10],
    ["Ghana", "233", 9, 10],
    ["Nigeria", "234", 10, 11],
    ["Burkina Faso", "226", 8, 8],
    ["Mali", "223", 8, 8],
    ["Sénégal", "221", 9, 9],
    ["Niger", "227", 8, 8],
    ["Cameroun", "237", 9, 9],
    ["Gabon", "241", 9, 9],
    ["Guinée", "224", 9, 9],
    ["France", "33", 9, 10],
    ["Belgique", "32", 9, 10],
    ["Canada", "1", 10, 10],
    ["États-Unis", "1", 10, 10]
  ];

  const country = document.getElementById("iptv-country");
  if (!country) return;

  const code = document.getElementById("iptv-code");
  const form = document.getElementById("iptv-order-form");
  const order = document.getElementById("iptv-order");
  const confirmBox = document.getElementById("iptv-confirm");
  const phone = document.getElementById("iptv-phone");
  const email = document.getElementById("iptv-email");
  const city = document.getElementById("iptv-city");
  const summary = document.getElementById("iptv-summary");

  if (!code || !form || !order || !confirmBox ||
      !phone || !email || !city || !summary) {
    console.error("GTSI IPTV : un élément du formulaire est manquant.");
    return;
  }

  function soundAlert() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      const audio = new Audio();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.18;
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.35);
      oscillator.onended = function () {
        audio.close();
      };
    } catch (error) {
      console.warn("Son d'alerte indisponible.", error);
    }
  }

  function reject(message, field) {
    soundAlert();
    alert(message);
    if (field) {
      field.focus();
      field.setAttribute("aria-invalid", "true");
    }
  }

  [country, code, phone, email, city].forEach(function (field) {
    field.addEventListener("input", function () {
      field.removeAttribute("aria-invalid");
    });
    field.addEventListener("change", function () {
      field.removeAttribute("aria-invalid");
    });
  });

  countries.forEach(function (item) {
    const a = document.createElement("option");
    a.value = item[0];
    a.textContent = item[0];
    country.appendChild(a);

    const b = document.createElement("option");
    b.value = item[1];
    b.textContent = "+" + item[1] + " — " + item[0];
    code.appendChild(b);
  });

  country.addEventListener("change", function () {
    const selected = countries.find(function (item) {
      return item[0] === country.value;
    });
    if (selected) code.value = selected[1];
  });

  document.getElementById("iptv-choose").addEventListener("click", function () {
    order.hidden = false;
    order.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    confirmBox.hidden = true;

    if (!country.value) {
      reject("Veuillez sélectionner votre pays.", country);
      return;
    }

    if (!city.value.trim()) {
      reject("Veuillez saisir votre ville.", city);
      return;
    }

    const selected = countries.find(function (item) {
      return item[0] === country.value;
    });

    if (!selected || code.value !== selected[1]) {
      reject("L'indicatif téléphonique ne correspond pas au pays choisi.", code);
      return;
    }

    const digits = phone.value.replace(/\D/g, "");
    if (digits.length < selected[2] || digits.length > selected[3]) {
      reject(
        "Le numéro saisi ne respecte pas la longueur attendue pour " +
        country.value + ". Vérifiez le numéro fourni par votre opérateur.",
        phone
      );
      return;
    }

    const cleanEmail = email.value.trim();
    const emailPattern = /^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?)+$/i;

    if (!emailPattern.test(cleanEmail) || cleanEmail.length > 254) {
      reject("Adresse e-mail invalide. Veuillez saisir une adresse correcte.", email);
      return;
    }

    summary.textContent =
      "Offre : GTSI IPTV WORLD — Accès à vie" +
      " | Prix : 50 000 FCFA" +
      " | Pays : " + country.value +
      " | Ville : " + city.value.trim() +
      " | Téléphone : +" + code.value + " " + digits +
      " | E-mail : " + cleanEmail;

    confirmBox.hidden = false;
    confirmBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  document.getElementById("iptv-edit").addEventListener("click", function () {
    confirmBox.hidden = true;
    phone.focus();
  });

  document.getElementById("iptv-confirm-button").addEventListener("click", function () {
    const digits = phone.value.replace(/\D/g, "");
    const message =
      "Bonjour GTSI, je souhaite commander l'offre GTSI IPTV WORLD." +
      "\nOffre : Accès à vie" +
      "\nPrix : 50 000 FCFA" +
      "\nPays : " + country.value +
      "\nVille : " + city.value.trim() +
      "\nTéléphone : +" + code.value + " " + digits +
      "\nE-mail : " + email.value.trim() +
      "\nMerci de m'indiquer la suite de la procédure.";

    window.location.href =
      "https://wa.me/22879828669?text=" + encodeURIComponent(message);
  });
})();
