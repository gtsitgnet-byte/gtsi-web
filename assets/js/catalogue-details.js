/* Fiches publiques GTSI */
(function (d) {
  var f = {
  "MikroTik RB5009UPr+S+OUT": {
    "marque": "MikroTik",
    "reference": "RB5009UPr+S+OUT",
    "description": "Le MikroTik RB5009UPr+S+IN est un routeur professionnel conçu pour gérer le trafic réseau et alimenter des équipements compatibles grâce à ses fonctions PoE. Il convient aux PME, baies informatiques et installations réseau centralisées.\n\nConnectivité : 7 ports Ethernet Gigabit, 1 port Ethernet 2,5 Gigabit, 1 emplacement SFP+ jusqu'à 10 Gbit/s et USB 3.0. Il dispose d'un processeur ARM quadricœur, de 1 Go de RAM, de 1 Go de stockage NAND et de RouterOS v7.\n\nFonctions : routage, NAT, pare-feu, DHCP, VPN, VLAN et alimentation PoE-out sur les ports compatibles, selon la configuration électrique et les limites du matériel.\n\nUsages : passerelle Internet, segmentation réseau, connexion de switches et alimentation d'équipements compatibles lorsque les besoins électriques le permettent.\n\nCompatibilité et précautions : contrôler la tension, la norme PoE, la consommation des équipements et la puissance totale disponible. Le budget PoE dépend de l'alimentation utilisée. Ce modèle ne possède pas de Wi-Fi intégré."
  },
  "MikroTik RB4011iGS+RM": {
    "marque": "MikroTik",
    "reference": "RB4011iGS+RM",
    "description": "Routeur professionnel rackable pour PME et réseaux multi-segments. 10 ports Ethernet Gigabit, 1 cage SFP+ 10G, processeur quadricœur AL21400 et 1 Go de RAM. RouterOS permet le routage, le pare-feu, NAT, VPN, DHCP, QoS et la segmentation VLAN selon la configuration. Usages : interconnexion de réseaux, accès Internet, VPN site à site et gestion de plusieurs sous-réseaux. Le port Ether10 fournit du PoE-out passif : vérifier tension et compatibilité avant de connecter un appareil. Prix sur demande de devis WhatsApp."
  },
  "MikroTik L009UiGS-RM": {
    "marque": "MikroTik",
    "reference": "L009UiGS-RM",
    "description": "Routeur RouterOS v7 pour petits réseaux professionnels. 8 ports Ethernet Gigabit, 1 port SFP compatible 2,5G, processeur IPQ-5018 double cœur à 800 MHz, 512 Mo de RAM et 128 Mo de mémoire NAND. Prend en charge le routage, le pare-feu, NAT, VPN, DHCP et VLAN selon configuration. PoE-out passif sur Ether8 ; l’entrée PoE prend en charge 802.3af/at. Usages : bureaux, petites entreprises et réseaux segmentés. Attention : le PoE-out est passif, il faut vérifier la tension acceptée par l’équipement alimenté. Prix sur demande de devis WhatsApp."
  },
  "MikroTik hAP ax²": {
    "description": "Routeur Wi‑Fi 6 dual‑band pour usages intensifs.",
    "marque": "MikroTik"
  },
  "MikroTik RB5009UG+S+IN": {
    "marque": "MikroTik",
    "reference": "RB5009UG+S+IN",
    "description": "Le MikroTik RB5009UG+S+IN est un routeur professionnel compact destiné aux PME, bureaux et infrastructures réseau exigeantes. Il centralise l'accès Internet et permet de gérer les communications entre plusieurs sous-réseaux.\n\nConnectivité : 7 ports Ethernet Gigabit, 1 port Ethernet 2,5 Gigabit, 1 emplacement SFP+ jusqu'à 10 Gbit/s et 1 port USB 3.0. Il dispose d'un processeur ARM quadricœur à 1,4 GHz, de 1 Go de RAM, de 1 Go de stockage NAND et de RouterOS v7.\n\nFonctions : routage IP, NAT, pare-feu, DHCP, VPN et segmentation VLAN selon la configuration. Le port SFP+ permet une liaison haut débit avec un switch ou un équipement compatible.\n\nUsages : passerelle Internet d'entreprise, interconnexion de VLAN, gestion de plusieurs réseaux et liaison montante 10G.\n\nCompatibilité et précautions : vérifier les modules SFP+, les alimentations et les paramètres réseau avant installation. Ce modèle ne possède pas de Wi-Fi intégré. Les performances dépendent des règles de sécurité, des VPN et du trafic."
  }
};
  Object.keys(f).forEach(function (k) { d[k] = Object.assign({}, d[k] || {}, f[k]); });
})(window.GTSI_DETAILS = window.GTSI_DETAILS || {});
