// Vercel serverless function — POST /api/inquiry
// Receives the consultation form, validates input, sends email via Resend.
//
// Required env var (set in Vercel project settings → Environment Variables):
//   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
//
// Sender domain must be verified in Resend before this works in production.
// During domain verification, swap INQUIRY_FROM for 'onboarding@resend.dev'
// (note: that sender will only deliver to the Resend account email).

import { Resend } from 'resend';

const INQUIRY_TO = 'hello@outbridgeinc.com';
const INQUIRY_FROM = 'Outbridge Inquiries <inquiries@outbridgeinc.com>';

export default async function handler(req, res) {
  // Only POST is accepted
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  // Env var check — fail clearly rather than throwing
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return res.status(503).json({
      ok: false,
      error: 'Inquiry endpoint is not yet configured. Please email hello@outbridgeinc.com directly.',
    });
  }

  // Parse body. Vercel auto-parses JSON when content-type is application/json.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  body = body || {};

  const { name, company, email, phone, service, message, hp, source, linkedin, languages, role } = body;

  // Honeypot — bots fill hidden fields; silently succeed without sending
  if (hp && hp.toString().trim().length > 0) {
    return res.status(200).json({ ok: true });
  }

  // Validation
  const errors = [];
  if (!name || !name.toString().trim()) errors.push('Name is required.');
  if (!email || !email.toString().trim()) errors.push('Email is required.');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRe.test(email.toString().trim())) {
    errors.push('Email format looks invalid.');
  }
  if (errors.length) {
    return res.status(400).json({ ok: false, error: errors.join(' ') });
  }

  // Cap field lengths so an attacker can't paste an entire novel
  const cap = (s, n) => (s == null ? '' : s.toString().slice(0, n));
  const safe = {
    name: cap(name, 200).trim(),
    company: cap(company, 200).trim(),
    email: cap(email, 200).trim(),
    phone: cap(phone, 60).trim(),
    service: cap(service, 200).trim(),
    message: cap(message, 5000).trim(),
    source: cap(source, 80).trim() || 'contact-form',
    linkedin: cap(linkedin, 400).trim(),
    languages: cap(languages, 300).trim(),
    role: cap(role, 200).trim(),
  };

  const isCareer = safe.source.indexOf('careers') === 0 || safe.role.length > 0;
  const subject = `[${safe.source}] ${isCareer ? 'New application' : 'New inquiry'} — ${safe.name}${safe.company ? ' (' + safe.company + ')' : ''}${safe.role ? ' · ' + safe.role : ''}`;

  const optionalRow = (label, value, hrefBuilder) => {
    if (!value) return '';
    const content = hrefBuilder
      ? `<a href="${esc(hrefBuilder(value))}" style="color:#3D3DF2;">${esc(value)}</a>`
      : esc(value);
    return `<tr><td style="padding:6px 0;color:#43465C;">${label}</td><td style="padding:6px 0;">${content}</td></tr>`;
  };

  const html = `
    <div style="font-family:Hanken Grotesk,Helvetica,Arial,sans-serif;color:#0E0F1C;font-size:15px;line-height:1.55;">
      <h2 style="font-family:Bricolage Grotesque,Hanken Grotesk,sans-serif;font-weight:800;letter-spacing:-.02em;color:#0E0F1C;margin:0 0 18px;">${isCareer ? 'New application' : 'New inquiry'} from outbridgeinc.com</h2>
      <table style="border-collapse:collapse;width:100%;max-width:640px;">
        <tr><td style="padding:6px 0;color:#43465C;width:120px;">Name</td><td style="padding:6px 0;"><strong>${esc(safe.name)}</strong></td></tr>
        ${optionalRow('Company', safe.company)}
        <tr><td style="padding:6px 0;color:#43465C;">Email</td><td style="padding:6px 0;"><a href="mailto:${esc(safe.email)}" style="color:#3D3DF2;">${esc(safe.email)}</a></td></tr>
        <tr><td style="padding:6px 0;color:#43465C;">Phone</td><td style="padding:6px 0;">${safe.phone ? `<a href="tel:${esc(safe.phone)}" style="color:#3D3DF2;">${esc(safe.phone)}</a>` : '<span style="color:#83879B;">—</span>'}</td></tr>
        ${optionalRow('Role', safe.role)}
        ${optionalRow('LinkedIn / CV', safe.linkedin, v => v)}
        ${optionalRow('Languages', safe.languages)}
        ${optionalRow('Service', safe.service)}
        <tr><td style="padding:6px 0;color:#43465C;">Source</td><td style="padding:6px 0;">${esc(safe.source)}</td></tr>
      </table>
      <hr style="border:none;border-top:1px solid rgba(14,15,28,.12);margin:22px 0;" />
      <div style="color:#43465C;margin-bottom:8px;">Message</div>
      <div style="white-space:pre-wrap;color:#0E0F1C;">${esc(safe.message) || '<span style="color:#83879B;">(no message provided)</span>'}</div>
      <hr style="border:none;border-top:1px solid rgba(14,15,28,.12);margin:22px 0;" />
      <div style="color:#83879B;font-size:12px;">Reply directly to this email to respond to the prospect. Sent automatically by outbridgeinc.com.</div>
    </div>
  `;

  const textRows = [
    `${isCareer ? 'New application' : 'New inquiry'} from outbridgeinc.com`,
    ``,
    `Name:      ${safe.name}`,
  ];
  if (safe.company) textRows.push(`Company:   ${safe.company}`);
  textRows.push(`Email:     ${safe.email}`);
  textRows.push(`Phone:     ${safe.phone || '—'}`);
  if (safe.role) textRows.push(`Role:      ${safe.role}`);
  if (safe.linkedin) textRows.push(`LinkedIn:  ${safe.linkedin}`);
  if (safe.languages) textRows.push(`Languages: ${safe.languages}`);
  if (safe.service) textRows.push(`Service:   ${safe.service}`);
  textRows.push(`Source:    ${safe.source}`);
  textRows.push(``);
  textRows.push(`Message:`);
  textRows.push(safe.message || '(no message provided)');
  textRows.push(``);
  textRows.push(`— Sent automatically by outbridgeinc.com. Reply to respond.`);
  const text = textRows.join('\n');

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: INQUIRY_FROM,
      to: INQUIRY_TO,
      replyTo: safe.email,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Resend returned error:', error);
      return res.status(502).json({
        ok: false,
        error: 'We could not deliver your inquiry. Please email hello@outbridgeinc.com directly.',
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Inquiry send threw:', err);
    return res.status(500).json({
      ok: false,
      error: 'Unexpected server error. Please email hello@outbridgeinc.com directly.',
    });
  }
}

function esc(s) {
  return (s == null ? '' : s.toString())
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
