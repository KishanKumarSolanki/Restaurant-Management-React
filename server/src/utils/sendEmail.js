import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, html, text }) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

  // SMTP configure nahi hai -> console me print (development)
  if (!SMTP_HOST) {
    console.log('\n[email - SMTP configured nahi hai, console me dikha raha hoon]');
    console.log(`To: ${to}\nSubject: ${subject}\n${text || html}\n`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  await transporter.sendMail({ from: MAIL_FROM || SMTP_USER, to, subject, html, text });
}
