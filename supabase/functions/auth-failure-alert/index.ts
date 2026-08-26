import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.2";

const allowedOrigins = new Set([
  "https://jobpick20.com",
  "https://www.jobpick20.com",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://jobpick20.com",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function emptyResponse(request: Request, status = 204) {
  return new Response(null, { status, headers: corsHeaders(request) });
}

async function hmacSha256(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isPlausibleEmail(value: string) {
  return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return emptyResponse(request);
  if (request.method !== "POST") return emptyResponse(request, 405);

  try {
    const payload = await request.json();
    const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
    if (!isPlausibleEmail(email)) return emptyResponse(request);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const alertRecipient = Deno.env.get("AUTH_ALERT_RECIPIENT");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!resendApiKey || !alertRecipient || !supabaseUrl || !serviceRoleKey) {
      console.error("auth alert function configuration is incomplete");
      return emptyResponse(request, 503);
    }

    // The HMAC key remains server-side. The database receives only a non-reversible identifier.
    const subjectHash = await hmacSha256(email, resendApiKey);
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: failureRows, error: failureError } = await admin.rpc("record_jobpick_auth_failure", {
      p_subject_hash: subjectHash,
    });
    if (failureError) throw failureError;

    const failure = Array.isArray(failureRows) ? failureRows[0] : null;
    if (!failure?.should_alert) return emptyResponse(request);

    // Claim a global cooldown before delivering. This blocks email amplification by unauthenticated callers.
    const { data: alertClaimed, error: claimError } = await admin.rpc("claim_jobpick_auth_failure_alert");
    if (claimError) throw claimError;
    if (!alertClaimed) return emptyResponse(request);

    const sender = Deno.env.get("RESEND_FROM") || "JobPick Security <onboarding@resend.dev>";
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [alertRecipient],
        subject: "JobPick security alert: repeated failed password sign-ins",
        html: [
          "<h2>JobPick security alert</h2>",
          "<p>JobPick detected at least five failed direct password sign-ins for one account identifier within 15 minutes.</p>",
          "<p>This alert intentionally excludes the account email address, password, IP address, and other personal data. Review the privacy-safe Auth warning/error aggregate in Supabase if further investigation is needed.</p>",
          "<p>A global one-hour notification cooldown is active to prevent alert flooding.</p>",
        ].join(""),
      }),
    });

    if (!resendResponse.ok) {
      console.error("transactional email provider rejected security alert", resendResponse.status);
      return emptyResponse(request, 502);
    }

    return emptyResponse(request);
  } catch (error) {
    // Deliberately avoid logging request values, account identifiers, or secrets.
    console.error("auth alert processing failed", error instanceof Error ? error.message : "unknown error");
    return emptyResponse(request, 500);
  }
});
