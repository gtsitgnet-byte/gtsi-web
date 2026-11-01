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

  const apiKey = process.env.ABSTRACT_EMAIL_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Configuration e-mail manquante." });
  }

  const email = typeof req.body?.email === "string"
    ? req.body.email.trim()
    : "";

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Adresse e-mail invalide." });
  }

  try {
    const url = new URL("https://emailreputation.abstractapi.com/v1/");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("email", email);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(502).json({
        error: "Le service de vérification e-mail est indisponible."
      });
    }

    const delivery = data.email_deliverability || {};
    const quality = data.email_quality || {};

    return res.status(200).json({
      email: data.email_address || email,
      validFormat: delivery.is_format_valid === true,
      deliverable: delivery.status === "deliverable",
      status: delivery.status || "unknown",
      smtpValid: delivery.is_smtp_valid === true,
      mxValid: delivery.is_mx_valid === true,
      disposable: quality.is_disposable ?? null,
      qualityScore: quality.score ?? null
    });
  } catch (error) {
    return res.status(502).json({
      error: "Impossible de contacter le service e-mail."
    });
  }
};
