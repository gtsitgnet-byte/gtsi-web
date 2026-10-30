/* GTSI — Antennes et points d'accès extérieurs TP-Link
   Caractéristiques basées sur la documentation fabricant.
   Les images seront associées après vérification des fichiers officiels.
*/
(function () {
  "use strict";

  var categorie = "Antennes Wi-Fi professionnelles";

  var produits = [
    "TP-Link CPE210",
    "TP-Link CPE220",
    "TP-Link CPE510",
    "TP-Link CPE605",
    "TP-Link CPE610",
    "TP-Link CPE710",
    "TP-Link EAP110-Outdoor",
    "TP-Link EAP225-Outdoor",
    "TP-Link EAP610-Outdoor",
    "TP-Link EAP650-Outdoor"
  ];

  var details = {
    "TP-Link CPE210": {
      description: "CPE extérieur 2,4 GHz, débit sans fil annoncé jusqu'à 300 Mbit/s et antenne directionnelle de 9 dBi. Pour les liaisons extérieures et les réseaux point à point."
    },
    "TP-Link CPE220": {
      description: "CPE extérieur 2,4 GHz, débit sans fil annoncé jusqu'à 300 Mbit/s et antenne directionnelle de 12 dBi. Pour les liaisons entre bâtiments."
    },
    "TP-Link CPE510": {
      description: "CPE extérieur 5 GHz, débit sans fil annoncé jusqu'à 300 Mbit/s et antenne directionnelle de 13 dBi. Adapté aux liaisons sans fil extérieures."
    },
    "TP-Link CPE605": {
      description: "CPE extérieur 5 GHz, débit sans fil annoncé jusqu'à 150 Mbit/s et antenne directionnelle de 23 dBi. Pour les liaisons directionnelles à longue portée."
    },
    "TP-Link CPE610": {
      description: "CPE extérieur 5 GHz, débit sans fil annoncé jusqu'à 300 Mbit/s et antenne directionnelle de 23 dBi. Pour les liaisons extérieures entre sites."
    },
    "TP-Link CPE710": {
      description: "CPE extérieur 5 GHz, Wi-Fi 802.11ac, débit sans fil annoncé jusqu'à 867 Mbit/s et antenne directionnelle de 23 dBi."
    },
    "TP-Link EAP110-Outdoor": {
      description: "Point d'accès extérieur Wi-Fi 2,4 GHz N300, avec port Ethernet 10/100 Mbit/s. Pour étendre la couverture Wi-Fi dans les espaces extérieurs."
    },
    "TP-Link EAP225-Outdoor": {
      description: "Point d'accès extérieur double bande Wi-Fi 5 AC1200, avec port Gigabit Ethernet. Pour les cours, terrasses, hôtels et espaces professionnels."
    },
    "TP-Link EAP610-Outdoor": {
      description: "Point d'accès extérieur double bande Wi-Fi 6 AX1800, avec port Gigabit Ethernet. Débit théorique annoncé jusqu'à 1 201 Mbit/s en 5 GHz et 574 Mbit/s en 2,4 GHz."
    },
    "TP-Link EAP650-Outdoor": {
      description: "Point d'accès extérieur double bande Wi-Fi 6 AX3000, avec port Gigabit Ethernet. Débit théorique annoncé jusqu'à 2 402 Mbit/s en 5 GHz et 574 Mbit/s en 2,4 GHz."
    }
  };

  window.GTSI_DATA = window.GTSI_DATA || {};
  window.GTSI_DETAILS = window.GTSI_DETAILS || {};
  window.GTSI_PRIX = window.GTSI_PRIX || {};

  if (!window.GTSI_DATA[categorie]) {
    window.GTSI_DATA[categorie] = [];
  }

  produits.forEach(function (nom) {
    if (window.GTSI_DATA[categorie].indexOf(nom) === -1) {
      window.GTSI_DATA[categorie].push(nom);
    }

    if (!window.GTSI_DETAILS[nom]) {
      window.GTSI_DETAILS[nom] = details[nom];
    }
  });
})();
