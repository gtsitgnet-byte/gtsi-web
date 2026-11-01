#!/usr/bin/env python3
import os, re, csv, json, time, html, unicodedata
import urllib.parse, urllib.request, urllib.error
from pathlib import Path

ROOT = Path.home() / "projects/web"
CATALOGUE = ROOT / "assets/js/catalogue.js"
BASE = ROOT / "assets/images/catalogue_gtsi"
API = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "GTSI-Catalogue/2.0 (commercial product image catalogue)"}
BASE.mkdir(parents=True, exist_ok=True)

# Termes anglais qui améliorent les recherches Wikimedia.
TRADUCTIONS = {
    "ordinateurs de bureau": "desktop computer",
    "ordinateurs portables": "laptop notebook computer",
    "stations de travail": "workstation computer",
    "serveurs professionnels": "rack server",
    "mini-pc": "mini PC",
    "écrans et moniteurs": "computer monitor",
    "claviers usb et sans fil": "computer keyboard",
    "souris filaires et sans fil": "computer mouse",
    "imprimantes laser": "laser printer",
    "imprimantes à jet d'encre": "inkjet printer",
    "imprimantes multifonctions": "multifunction printer",
    "scanners professionnels": "document scanner",
    "disques durs hdd": "hard disk drive",
    "ssd sata": "SATA solid state drive",
    "ssd nvme": "NVMe SSD",
    "mémoires ram": "computer RAM memory module",
    "cartes mères": "computer motherboard",
    "processeurs": "CPU processor",
    "cartes graphiques": "graphics card GPU",
    "boîtiers pc et alimentations": "computer case power supply",
    "routeurs professionnels": "professional network router",
    "routeurs wi-fi 6": "Wi-Fi 6 router",
    "routeurs wi-fi 7": "Wi-Fi 7 router",
    "points d'accès wi-fi": "wireless access point",
    "répéteurs wi-fi": "Wi-Fi range extender",
    "systèmes wi-fi mesh": "mesh Wi-Fi system",
    "switches non administrables": "unmanaged Ethernet switch",
    "switches administrables": "managed Ethernet switch",
    "switches poe et poe+": "PoE network switch",
    "switches poe++ compatibles": "PoE++ network switch",
    "routeurs mikrotik": "MikroTik router",
    "points d'accès mikrotik": "MikroTik wireless access point",
    "pare-feu matériels": "hardware network firewall",
    "passerelles vpn": "VPN gateway appliance",
    "routeurs 5g": "5G router",
    "téléphones ip": "VoIP IP phone",
    "modules sfp et sfp+": "SFP transceiver module",
    "antennes directionnelles wi-fi": "directional outdoor Wi-Fi antenna",
    "antennes sectorielles": "sector antenna wireless",
    "antennes omnidirectionnelles": "omnidirectional Wi-Fi antenna",
    "antennes cpe extérieures": "outdoor wireless CPE antenna",
    "câbles ethernet cat5e": "Cat5e Ethernet cable",
    "câbles ethernet cat6": "Cat6 Ethernet cable",
    "câbles cat6a": "Cat6A Ethernet cable",
    "câbles cat7": "Cat7 Ethernet cable",
    "câbles fibre optique monomodes": "single mode fiber optic cable",
    "câbles fibre optique multimodes": "multimode fiber optic cable",
    "jarretières optiques": "fiber optic patch cord",
    "connecteurs rj45": "RJ45 Ethernet connector",
    "panneaux de brassage": "Ethernet patch panel",
    "soudeuses de fibre optique": "fiber optic fusion splicer",
    "réflectomètres otdr": "fiber optic OTDR",
    "caméras ip": "IP security camera",
    "caméras dôme": "dome CCTV security camera",
    "caméras bullet": "bullet CCTV security camera",
    "caméras ptz motorisées": "PTZ security camera",
    "caméras wi-fi": "wireless Wi-Fi security camera",
    "caméras solaires": "solar powered security camera",
    "enregistreurs nvr": "NVR network video recorder",
    "enregistreurs dvr": "DVR CCTV recorder",
    "lecteurs biométriques": "biometric access control reader",
    "lecteurs de cartes rfid": "RFID card reader access control",
    "serrures électriques": "electric door lock",
    "ventouses électromagnétiques": "electromagnetic access control door lock",
    "onduleurs line-interactive": "line interactive UPS",
    "onduleurs online double conversion": "online double conversion UPS",
    "batteries lithium lifepo4": "LiFePO4 lithium battery",
    "panneaux solaires": "solar photovoltaic panel",
    "régulateurs solaires mppt": "MPPT solar charge controller",
    "onduleurs solaires hybrides": "hybrid solar inverter",
    "multimètres numériques": "digital multimeter",
    "pinces ampèremétriques": "digital clamp meter",
    "oscilloscopes": "digital oscilloscope",
    "stations de soudage électronique": "electronics soldering station",
    "pinces à sertir rj45": "RJ45 crimping tool",
    "webcams hd et 4k": "HD 4K webcam",
    "projecteurs vidéo": "video projector",
    "lecteurs de codes-barres": "barcode scanner",
    "terminaux de point de vente": "point of sale POS terminal",
    "coffres-forts électroniques": "electronic security safe",
    "coffres-forts ignifuges": "fireproof security safe",
    "destructeurs de documents": "paper shredder",
    "machines à compter les billets": "banknote money counting machine",
    "baies informatiques murales": "wall mount network rack cabinet",
    "baies informatiques sur pied": "floor standing server rack cabinet",
}

def normaliser(s):
    s = unicodedata.normalize("NFKD", str(s))
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()

def api(params):
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=35) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code not in (429, 500, 502, 503, 504) or attempt == 5:
                raise
            try:
                delay = int(e.headers.get("Retry-After", ""))
            except (TypeError, ValueError):
                delay = min(3 * (2 ** attempt), 30)
            print(f"  [ATTENTE API] HTTP {e.code}, nouvel essai dans {delay}s")
            time.sleep(max(1, min(delay, 60)))
        except (urllib.error.URLError, TimeoutError, OSError):
            if attempt == 5:
                raise
            delay = min(3 * (2 ** attempt), 30)
            print(f"  [RÉESSAI RÉSEAU] dans {delay}s")
            time.sleep(delay)

def champ(meta, nom):
    v = meta.get(nom, {})
    return html.unescape(re.sub(r"<[^>]*>", " ", str(v.get("value", "")))).strip()

def licence_autorisee(meta):
    lic = champ(meta, "LicenseShortName").lower()
    url = champ(meta, "LicenseUrl").lower()
    if any(x in lic for x in ("noncommercial", "non-commercial", "nc-", "nd-", "all rights reserved")):
        return False
    if "public domain" in lic or "cc0" in lic or "cc0" in url:
        return True
    if "cc by" in lic or "creativecommons.org/licenses/by/" in url:
        return True
    if "cc by-sa" in lic or "creativecommons.org/licenses/by-sa/" in url:
        return True
    return False

def recherche(termes):
    data = api({
        "action": "query", "format": "json",
        "generator": "search", "gsrnamespace": 6,
        "gsrsearch": termes, "gsrlimit": 20,
        "prop": "imageinfo", "iiprop": "url|mime|extmetadata",
        "iiurlwidth": 900,
    })
    pages = data.get("query", {}).get("pages", {})
    return sorted(pages.values(), key=lambda p: p.get("title", ""))

def score(page, nom, recherche_texte):
    titre = normaliser(page.get("title", ""))
    cible = normaliser(nom)
    mots = [w for w in cible.split() if len(w) > 2]
    anglais = normaliser(recherche_texte)
    mots += [w for w in anglais.split() if len(w) > 3 and w not in mots]
    if not mots:
        return 0
    presents = sum(1 for w in set(mots) if w in titre)
    return presents / min(len(set(mots)), 5)

def extraire_produits():
    source = CATALOGUE.read_text(encoding="utf-8")
    blocs = re.findall(r'"([^"]+)"\s*:\s*\[(.*?)\]', source, re.S)
    resultat = []
    for categorie, contenu in blocs:
        for nom in re.findall(r'"([^"]+)"', contenu):
            resultat.append((categorie, nom))
    return resultat

def extension(mime, url):
    if mime == "image/jpeg": return ".jpg"
    if mime == "image/png": return ".png"
    if mime == "image/webp": return ".webp"
    if mime == "image/gif": return ".gif"
    path_ext = Path(urllib.parse.urlparse(url).path).suffix.lower()
    return path_ext if path_ext in (".jpg", ".jpeg", ".png", ".webp", ".gif") else ""

def telecharger(url, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(5):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=50) as r:
                content_type = r.headers.get("Content-Type", "").split(";")[0].lower()
                if not content_type.startswith("image/"):
                    raise ValueError("La ressource téléchargée n'est pas une image")
                data = r.read()
            if len(data) < 4000:
                raise ValueError("Image trop petite ou invalide")
            tmp = path.with_suffix(path.suffix + ".tmp")
            tmp.write_bytes(data)
            tmp.replace(path)
            return
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            if attempt == 4:
                raise
            delay = min(3 * (2 ** attempt), 30)
            print(f"  [RÉESSAI TÉLÉCHARGEMENT] {e} — attente {delay}s")
            time.sleep(delay)

def lire_csv(path):
    if not path.exists():
        return {}
    try:
        with path.open("r", newline="", encoding="utf-8-sig") as f:
            return {
                row.get("produit", ""): row
                for row in csv.DictReader(f)
                if row.get("produit")
            }
    except (OSError, csv.Error) as e:
        raise SystemExit(f"CSV illisible ({path}) : {e}")

def ecrire_csv(path, rows, champs):
    tmp = path.with_suffix(path.suffix + ".tmp")
    with tmp.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=champs, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    tmp.replace(path)

def sauver_map():
    tmp = map_path.with_suffix(".json.tmp")
    tmp.write_text(
        json.dumps(image_map, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    tmp.replace(map_path)

def sauver_csv():
    ecrire_csv(BASE / "licences_et_sources.csv",
               list(sources.values()), champs_sources)
    ecrire_csv(BASE / "rapport_controle.csv",
               list(rapport.values()), champs_rapport)

produits = extraire_produits()
if not produits:
    raise SystemExit("ERREUR : aucun produit extrait de catalogue.js")

map_path = BASE / "image-map.json"
image_map = json.loads(map_path.read_text(encoding="utf-8")) if map_path.exists() else {}

sources = lire_csv(BASE / "licences_et_sources.csv")
rapport = lire_csv(BASE / "rapport_controle.csv")

champs_sources = [
    "produit", "categorie", "fichier", "titre_source",
    "auteur", "licence", "page_source", "url_licence"
]
champs_rapport = [
    "produit", "categorie", "statut", "score_titre", "fichier", "raison"
]

# Préserver les rapports existants et signaler les images sans source enregistrée.
for categorie, nom in produits:
    if nom in image_map:
        ancien = rapport.get(nom, {})
        if nom not in sources:
            rapport[nom] = {
                "produit": nom, "categorie": categorie,
                "statut": "IMAGE EXISTANTE - SOURCE/LICENCE À VÉRIFIER",
                "score_titre": "", "fichier": image_map[nom],
                "raison": "Association conservée ; vérifier la provenance et la licence."
            }
        elif not ancien:
            rapport[nom] = {
                "produit": nom, "categorie": categorie,
                "statut": "IMAGE ASSOCIÉE - CONTRÔLE VISUEL REQUIS",
                "score_titre": "", "fichier": image_map[nom], "raison": ""
            }
    elif nom not in rapport:
        rapport[nom] = {
            "produit": nom, "categorie": categorie,
            "statut": "EN ATTENTE", "score_titre": "", "fichier": "", "raison": ""
        }

sauver_csv()
total = len(produits)
deja = len(image_map)
nouveaux = 0
print(f"Catalogue : {total} produits | Images associées au départ : {deja}")
print("Mode reprise : les associations existantes sont conservées.")

for i, (categorie, nom) in enumerate(produits, 1):
    if nom in image_map:
        continue

    traduction = TRADUCTIONS.get(nom.lower(), nom)
    print(f"\n[{i}/{total}] {nom}")

    try:
        candidats = recherche(traduction)
        candidats.sort(
            key=lambda p: score(p, nom, traduction), reverse=True
        )
        choisi = None
        meilleur_score = 0

        for page in candidats:
            infos = (page.get("imageinfo") or [{}])[0]
            meta = infos.get("extmetadata", {})
            mime = infos.get("mime", "")
            s = score(page, nom, traduction)

            if s < 0.20 or not licence_autorisee(meta):
                continue
            if mime not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
                continue

            url = infos.get("thumburl") or infos.get("url")
            ext = extension(mime, url or "")
            if not url or not ext:
                continue

            choisi = (page, infos, meta, url, ext)
            meilleur_score = s
            break

        if not choisi:
            rapport[nom] = {
                "produit": nom, "categorie": categorie,
                "statut": "À RECHERCHER MANUELLEMENT",
                "score_titre": "", "fichier": "",
                "raison": "Aucune image pertinente avec licence commerciale détectée."
            }
            print("  [À VÉRIFIER] Aucun résultat sûr")
            sauver_csv()
            time.sleep(0.8)
            continue

        page, infos, meta, url, ext = choisi
        slug = re.sub(r"[^a-z0-9]+", "-", normaliser(nom)).strip("-")[:75]
        dossier = BASE / re.sub(
            r"[^a-z0-9]+", "_", normaliser(categorie)
        ).strip("_")
        dest = dossier / f"{slug}{ext}"

        # Ne pas écraser un fichier déjà présent par une nouvelle image.
        if dest.exists():
            dest = dossier / f"{slug}-commons{ext}"
        telecharger(url, dest)

        chemin_web = dest.relative_to(ROOT).as_posix()
        image_map[nom] = chemin_web
        sources[nom] = {
            "produit": nom,
            "categorie": categorie,
            "fichier": chemin_web,
            "titre_source": page.get("title", "").replace("File:", ""),
            "auteur": champ(meta, "Artist") or champ(meta, "Credit"),
            "licence": champ(meta, "LicenseShortName"),
            "page_source": infos.get("descriptionurl", ""),
            "url_licence": champ(meta, "LicenseUrl")
        }
        rapport[nom] = {
            "produit": nom,
            "categorie": categorie,
            "statut": "IMAGE TROUVÉE - À CONTRÔLER VISUELLEMENT",
            "score_titre": round(meilleur_score, 2),
            "fichier": chemin_web,
            "raison": "Vérifier que la photo représente bien le produit et respecter les conditions de licence."
        }

        # Sauvegarde immédiate après chaque téléchargement réussi.
        sauver_map()
        sauver_csv()
        nouveaux += 1
        print(f"  [OK] {chemin_web}")
        time.sleep(1.2)

    except Exception as e:
        rapport[nom] = {
            "produit": nom,
            "categorie": categorie,
            "statut": "ERREUR / À VÉRIFIER",
            "score_titre": "",
            "fichier": "",
            "raison": str(e)[:500]
        }
        sauver_csv()
        print(f"  [ERREUR] {e}")
        time.sleep(1.0)

sauver_map()
sauver_csv()

print("\n========== BILAN GTSI ==========")
print(f"Produits dans le catalogue : {total}")
print(f"Images associées : {len(image_map)}")
print(f"Nouvelles images téléchargées durant cette exécution : {nouveaux}")
print(f"Produits restant sans association : {sum(1 for _, n in produits if n not in image_map)}")
print(f"Carte JSON : {map_path}")
print(f"Sources/licences : {BASE / 'licences_et_sources.csv'}")
print(f"Rapport : {BASE / 'rapport_controle.csv'}")
print("Les nouvelles images restent à contrôler visuellement avant publication.")
