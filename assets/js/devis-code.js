(() => {
  "use strict";
  const URL_SCRIPT = "https://script.google.com/macros/s/AKfycbwEoeyrKevDy4qKVuDFiMoyJLwW0l5WctNWiZLprXT52u8JREI-df1I-Luq3wHx_7dj/exec";
  const root = document.getElementById("gtsi-devis");
  if (!root) return;
  const $ = id => root.querySelector("#" + id);

  let verified = "";
  window.gdEmail = "";
  window.gdToken = "";

  async function call(payload) {
    const r = await fetch(URL_SCRIPT, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return r.json();
  }

  let box = null;
  function closeBox() { if (box) { box.remove(); box = null; } }

  function openBox(mail) {
    closeBox();
    box = document.createElement("div");
    box.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px";
    box.innerHTML =
      '<div style="background:#fff;color:#111;border-radius:14px;padding:20px;max-width:340px;width:100%;font-family:inherit">' +
      '<h3 style="margin:0 0 8px">📧 Confirmez votre e-mail</h3>' +
      '<p style="margin:0 0 12px;font-size:14px">Un code à 6 chiffres a été envoyé à <b id="gc-mail"></b>. Vérifiez aussi vos courriers indésirables.</p>' +
      '<input id="gc-code" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" style="width:100%;font-size:24px;letter-spacing:8px;text-align:center;padding:10px;border:2px solid #ccc;border-radius:10px;box-sizing:border-box">' +
      '<button id="gc-ok" type="button" class="gd-btn gold" style="width:100%;margin-top:12px">Valider le code</button>' +
      '<button id="gc-resend" type="button" class="gd-btn light" style="width:100%;margin-top:8px">Renvoyer le code</button>' +
      '<button id="gc-cancel" type="button" class="gd-btn light" style="width:100%;margin-top:8px">Modifier mon e-mail</button>' +
      '</div>';
    document.body.appendChild(box);
    box.querySelector("#gc-mail").textContent = mail;
    const code = box.querySelector("#gc-code");
    const ok = box.querySelector("#gc-ok");
    const resend = box.querySelector("#gc-resend");
    code.focus();

    function cooldown() {
      let s = 60;
      resend.disabled = true;
      const t = setInterval(() => {
        s--;
        if (!box) { clearInterval(t); return; }
        resend.textContent = s > 0 ? "Renvoyer le code (" + s + " s)" : "Renvoyer le code";
        if (s <= 0) { resend.disabled = false; clearInterval(t); }
      }, 1000);
    }
    cooldown();

    box.querySelector("#gc-cancel").onclick = () => { closeBox(); $("gd-email").focus(); };

    resend.onclick = async () => {
      resend.disabled = true;
      try {
        const r = await call({ action: "send_code", email: mail });
        if (!r.ok) { alert("🚨 " + r.error); resend.disabled = false; return; }
        alert("✅ Nouveau code envoyé.");
        cooldown();
      } catch (e) {
        alert("🚨 Impossible d'envoyer le code. Vérifiez votre connexion.");
        resend.disabled = false;
      }
    };

    ok.onclick = async () => {
      const v = code.value.replace(/\D/g, "");
      if (v.length !== 6) { alert("🚨 Saisissez les 6 chiffres du code reçu."); return; }
      ok.disabled = true; ok.textContent = "Vérification...";
      try {
        const r = await call({ action: "verify_code", email: mail, code: v });
        if (!r.ok) { alert("🚨 " + r.error); ok.disabled = false; ok.textContent = "Valider le code"; return; }
        verified = mail;
        window.gdEmail = mail;
        window.gdToken = r.token;
        closeBox();
        $("gd-form").requestSubmit();
      } catch (e) {
        alert("🚨 Vérification impossible. Vérifiez votre connexion.");
        ok.disabled = false; ok.textContent = "Valider le code";
      }
    };
  }

  document.addEventListener("submit", async ev => {
    if (ev.target !== $("gd-form")) return;
    const mail = $("gd-email").value.trim().toLowerCase();
    if (verified === mail && window.gdToken) return; // déjà vérifié
    ev.stopImmediatePropagation();
    ev.preventDefault();
    const btn = ev.target.querySelector('[type="submit"]');
    const label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Envoi du code..."; }
    try {
      const r = await call({ action: "send_code", email: mail });
      if (!r.ok) { alert("🚨 " + r.error); return; }
      openBox(mail);
    } catch (e) {
      alert("🚨 Impossible d'envoyer le code. Vérifiez votre connexion.");
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = label; }
    }
  }, true);
})();
