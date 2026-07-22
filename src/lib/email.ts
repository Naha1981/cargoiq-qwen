export type NotifyPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function notifyWaitingTimeFound(payload: NotifyPayload) {
  const apiKey = process.env.BREVO_API_KEY;

  if (!apiKey) {
    console.warn("[Email:Brevo] BREVO_API_KEY not set. Skipping email send.");
    return { sent: false, reason: "BREVO_API_KEY_MISSING" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "CargoIQ",
          email: process.env.BREVO_SENDER_EMAIL || "no-reply@cargoiq.io",
        },
        to: [{ email: payload.to }],
        subject: payload.subject,
        htmlContent: payload.html,
        textContent: payload.text,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[Email:Brevo] Send failed:", response.status, err);
      return { sent: false, reason: "BREVO_API_ERROR", detail: response.status };
    }

    const result = await response.json();
    console.log("[Email:Brevo] Sent successfully:", result.messageId);
    return { sent: true, messageId: result.messageId };
  } catch (error) {
    console.error("[Email:Brevo] Unexpected error:", error);
    return { sent: false, reason: "UNKNOWN_ERROR" };
  }
}
