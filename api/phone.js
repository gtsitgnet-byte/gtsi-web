const ALLOWED_ORIGIN = "https://gtsitgnet-byte.github.io";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée." });
  }

  if (req.headers.origin && req.headers.origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ error: "Origine non autorisée." });
  }

  const apiKey = process.env.ABSTRACT_PHONE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Configuration téléphone manquante." });
  }

  const phone = typeof req.body?.phone === "string"
    ? req.body.phone.trim()
    : "";

  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return res.status(400).json({ error: "Numéro international invalide." });
  }

  try {
    const url = new URL("https://phonevalidation.abstractapi.com/v1/");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("phone", phone);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Le service de vérification téléphonique est indisponible."
      });
    }

    return res.status(200).json({
      valid: data.valid === true,
      phone: data.phone || phone,
      country: data.country?.name || data.country_name || null,
      countryCode: data.country?.code || data.country_code || null,
      carrier: data.carrier || null,
      type: data.type || data.line_type || null,
      internationalFormat:
        data.format?.international || data.international_format || null
    });
  } catch (error) {
    return res.status(502).json({
      error: "Impossible de contacter le service téléphonique."
    });
  }
};
