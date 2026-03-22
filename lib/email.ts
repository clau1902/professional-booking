import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Handpicked <notifications@handpicked.app>";

// ─── Templates ────────────────────────────────────────────────────────────────

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { font-family: Georgia, serif; background: #faf9f6; margin: 0; padding: 40px 20px; color: #1a1a1a; }
    .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e5e2dc; overflow: hidden; }
    .header { background: #b85c38; padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 22px; margin: 0; font-weight: 600; letter-spacing: 0.5px; }
    .body { padding: 36px 32px; }
    .body p { line-height: 1.7; margin: 0 0 16px; color: #444; }
    .detail-box { background: #faf9f6; border-radius: 12px; padding: 20px 24px; margin: 24px 0; border: 1px solid #e5e2dc; }
    .detail-box table { width: 100%; border-collapse: collapse; }
    .detail-box td { padding: 6px 0; font-size: 14px; }
    .detail-box td:first-child { color: #888; width: 40%; }
    .detail-box td:last-child { font-weight: 600; color: #1a1a1a; }
    .cta { display: inline-block; background: #b85c38; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; margin: 8px 0; }
    .footer { padding: 20px 32px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #e5e2dc; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Handpicked</h1></div>
    <div class="body">
      <h2 style="margin:0 0 16px;font-size:22px;">${title}</h2>
      ${body}
    </div>
    <div class="footer">© Handpicked · You're receiving this because you have an account with us.</div>
  </div>
</body>
</html>`;
}

function detailBox(rows: Record<string, string>) {
  const cells = Object.entries(rows)
    .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
    .join("");
  return `<div class="detail-box"><table>${cells}</table></div>`;
}

// ─── Email senders ────────────────────────────────────────────────────────────

export async function sendBookingRequestedToCustomer({
  to, customerName, professionalName, serviceName, date, totalPrice, appUrl,
}: {
  to: string; customerName: string; professionalName: string;
  serviceName: string; date: Date; totalPrice: number; appUrl: string;
}) {
  const html = baseTemplate(
    "Your booking request was sent!",
    `<p>Hi ${customerName}, your payment was successful and your booking request has been sent to <strong>${professionalName}</strong>. They'll confirm within 2 hours.</p>
    ${detailBox({
      "Service":    serviceName,
      "Professional": professionalName,
      "Date":       date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      "Time":       date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      "Amount paid": `$${totalPrice.toFixed(2)}`,
      "Status":     "Awaiting confirmation",
    })}
    <a href="${appUrl}/dashboard" class="cta">View my bookings</a>`
  );
  return resend.emails.send({ from: FROM, to, subject: `Booking request sent to ${professionalName}`, html });
}

export async function sendBookingRequestedToProfessional({
  to, professionalName, customerName, serviceName, date, notes, appUrl,
}: {
  to: string; professionalName: string; customerName: string;
  serviceName: string; date: Date; notes?: string | null; appUrl: string;
}) {
  const details: Record<string, string> = {
    "Customer":  customerName,
    "Service":   serviceName,
    "Date":      date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    "Time":      date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
  if (notes) details["Notes"] = notes;

  const html = baseTemplate(
    "You have a new booking request",
    `<p>Hi ${professionalName}, <strong>${customerName}</strong> has requested to book you. Please confirm or decline within 2 hours.</p>
    ${detailBox(details)}
    <a href="${appUrl}/dashboard" class="cta">Review request</a>`
  );
  return resend.emails.send({ from: FROM, to, subject: `New booking request from ${customerName}`, html });
}

export async function sendBookingConfirmedToCustomer({
  to, customerName, professionalName, serviceName, date, appUrl,
}: {
  to: string; customerName: string; professionalName: string;
  serviceName: string; date: Date; appUrl: string;
}) {
  const html = baseTemplate(
    "Your booking is confirmed!",
    `<p>Great news, ${customerName}! <strong>${professionalName}</strong> has confirmed your booking.</p>
    ${detailBox({
      "Service":      serviceName,
      "Professional": professionalName,
      "Date":         date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
      "Time":         date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      "Status":       "Confirmed ✓",
    })}
    <a href="${appUrl}/dashboard" class="cta">View booking</a>`
  );
  return resend.emails.send({ from: FROM, to, subject: `Booking confirmed with ${professionalName}`, html });
}

export async function sendBookingCompletedToCustomer({
  to, customerName, professionalName, serviceName, professionalId, appUrl,
}: {
  to: string; customerName: string; professionalName: string;
  serviceName: string; professionalId: string; appUrl: string;
}) {
  const html = baseTemplate(
    "Session complete — leave a review!",
    `<p>Hi ${customerName}, your <strong>${serviceName}</strong> session with <strong>${professionalName}</strong> is complete. We hope it went well!</p>
    <p>Your feedback helps others find great professionals. It only takes 30 seconds.</p>
    <a href="${appUrl}/dashboard" class="cta">Leave a review</a>`
  );
  return resend.emails.send({ from: FROM, to, subject: `How was your session with ${professionalName}?`, html });
}

export async function sendBookingCancelledToCustomer({
  to, customerName, professionalName, serviceName, date, appUrl,
}: {
  to: string; customerName: string; professionalName: string;
  serviceName: string; date: Date; appUrl: string;
}) {
  const html = baseTemplate(
    "Your booking was cancelled",
    `<p>Hi ${customerName}, unfortunately your <strong>${serviceName}</strong> booking with <strong>${professionalName}</strong> on ${date.toLocaleDateString("en-US", { month: "long", day: "numeric" })} has been cancelled.</p>
    <p>You can browse other professionals and book again anytime.</p>
    <a href="${appUrl}/professionals" class="cta">Browse professionals</a>`
  );
  return resend.emails.send({ from: FROM, to, subject: `Booking cancelled — ${serviceName} with ${professionalName}`, html });
}
