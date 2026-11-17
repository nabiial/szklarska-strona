const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

const CONSENT_TEXT = {
  pl: "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesłania oferty nieruchomości oraz zaproszenia na dni otwarte, a także kontaktu w tej sprawie drogą e-mailową lub telefoniczną.",
  en: "I consent to the processing of my personal data for the purpose of sending me the property offer and an invitation to the open days, and contacting me about this by email or telephone.",
  de: "Ich willige in die Verarbeitung meiner personenbezogenen Daten ein, damit mir das Immobilienangebot und eine Einladung zu den Besichtigungstagen zugesandt werden können und wir Sie hierzu per E-Mail oder telefonisch kontaktieren dürfen."
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function clean(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function getLanguage(request) {
  try {
    const pathname = new URL(request.headers.get("Referer") || request.url).pathname;
    if (pathname === "/en" || pathname.startsWith("/en/")) return "en";
    if (pathname === "/de" || pathname.startsWith("/de/")) return "de";
  } catch (_) {}
  return "pl";
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) {
    return jsonResponse({ error: "Invalid request origin." }, 403);
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 12000) return jsonResponse({ error: "Request is too large." }, 413);

  let body;
  try {
    const raw = await request.text();
    if (raw.length > 12000) return jsonResponse({ error: "Request is too large." }, 413);
    body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonResponse({ error: "Invalid request body." }, 400);
    }
  } catch (_) {
    return jsonResponse({ error: "Invalid request body." }, 400);
  }

  // Honeypot for simple automated spam submissions.
  if (clean(body.website, 200)) return jsonResponse({ ok: true });

  const fullName = clean(body.fullName, 120);
  const email = clean(body.email, 254).toLowerCase();
  const phone = clean(body.phone, 40);
  const message = clean(body.message, 5000);
  const consent = body.consent === "yes";

  if (fullName.length < 2) return jsonResponse({ error: "Please enter your name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "Please enter a valid email address." }, 400);
  }
  if (!consent) return jsonResponse({ error: "Required consent is missing." }, 400);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO || !env.CONTACT_FROM) {
    return jsonResponse({ error: "The email service is not configured yet." }, 503);
  }

  const lang = getLanguage(request);
  const receivedAt = new Date().toISOString();
  const subjectName = fullName.replace(/[\r\n]+/g, " ").slice(0, 100);
  const subject = "[Górna 22A] Nowe zapytanie od " + subjectName;

  const rows = [
    ["Imię i nazwisko", fullName],
    ["Adres e-mail", email],
    ["Telefon", phone || "Nie podano"],
    ["Dodatkowe uwagi", message || "Brak"],
    ["Wersja językowa", lang.toUpperCase()],
    ["Zgoda", "Tak"],
    ["Treść zaakceptowanej zgody", CONSENT_TEXT[lang]],
    ["Data otrzymania", receivedAt]
  ];

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:680px;color:#222;line-height:1.55">
      <h2>Nowe zapytanie ze strony Górna 22A</h2>
      <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
        ${rows.map(([label, value]) => `
          <tr>
            <th align="left" valign="top" style="width:220px;border-bottom:1px solid #ddd;text-align:left">${escapeHtml(label)}</th>
            <td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(value)}</td>
          </tr>
        `).join("")}
      </table>
      <p style="margin-top:20px;color:#666;font-size:12px">Aby odpowiedzieć osobie zainteresowanej, użyj przycisku „Odpowiedz” — adres klienta jest ustawiony jako Reply-To.</p>
    </div>
  `;

  const text = rows.map(([label, value]) => label + ":\n" + value).join("\n\n");

  try {
    const providerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + env.RESEND_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM,
        to: [env.CONTACT_TO],
        reply_to: email,
        subject,
        html,
        text
      })
    });

    if (!providerResponse.ok) {
      const providerError = await providerResponse.text();
      console.error("[Gorna 22] Resend rejected contact email:", providerResponse.status, providerError.slice(0, 1000));
      return jsonResponse({ error: "The message could not be sent. Please try again later." }, 502);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("[Gorna 22] Contact email request failed:", String(error));
    return jsonResponse({ error: "The message could not be sent. Please try again later." }, 502);
  }
}
