// Generates /careers/<slug>.html from the shared template + the role table.
// Run from repo root: node scripts/build-careers.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'careers');

// -------------------- role data --------------------
const ROLES = [
  {
    slug: 'first-consultant',
    num: '01',
    title: 'First Consultant',
    chips: ['Consulting', 'Remote', 'Full-time', '2+ yrs experience'],
    leadChip: '2+ yrs experience',
    lede: 'Own client onboarding and day-to-day delivery as the bridge between client and team — make sure new engagements ship cleanly and grow into long-term accounts.',
    meta: 'Apply for the First Consultant role at Outbridge Inc — remote, 2+ yrs experience, US/EU hours. Own client onboarding and day-to-day delivery.',
    band: 'Consulting',
    about: `You're the operational owner on new and growing accounts. Once a client signs, you take the relationship from contract through the first 90 days, set up the playbooks, brief the team, and run the cadences that keep delivery on the rails.`,
    responsibilities: [
      'Run kickoffs and onboardings for new client engagements, end to end.',
      'Translate scope-of-work into operational playbooks, SLAs and saved replies.',
      'Brief the placed team, sit in on the first calls, and QA the first two weeks of output.',
      'Be the named point of contact for the client through the first 90 days.',
      'Surface scope creep, escalations and expansion opportunities — and route them properly.',
      'Hand off cleanly to long-term ownership once the engagement is humming.'
    ],
    requirements: [
      '2+ years in consulting, client services, account management or operations.',
      'A track record of running multiple engagements at once without dropping the thread.',
      'Strong written English — clients should read your notes and trust them.',
      'Comfort with help-desk and CRM tools (Zendesk, Intercom, HubSpot, Front, similar).',
      'Calm under pressure when an account is mid-launch.',
      'A second language (FR, ES, ZH, UR, HI, AR) is a bonus, not a requirement.'
    ]
  },
  {
    slug: 'experience-consultant',
    num: '02',
    title: 'Experience Consultant',
    chips: ['Consulting', 'Remote', 'Full-time', '4+ yrs experience'],
    leadChip: '4+ yrs experience',
    lede: 'Manage a portfolio of live client accounts — drive quality, retention and expansion across every team you supervise.',
    meta: 'Apply for the Experience Consultant role at Outbridge Inc — remote, 4+ yrs experience, US/EU hours. Own a portfolio of accounts and drive retention.',
    band: 'Consulting',
    about: `You carry a portfolio of 6–12 live accounts. You don't run the day-to-day yourself — the placed teams do — but you own quality, retention, escalations and growth across every one. You're the senior face the client trusts when something matters.`,
    responsibilities: [
      'Own a portfolio of live accounts: quality, SLAs, CSAT, retention, expansion.',
      'Run monthly business reviews with each client.',
      'Coach team leads on tone, escalation, and process discipline.',
      'Act as the senior escalation point for both clients and placed teams.',
      'Identify expansion opportunities and brief the consulting team to action them.',
      'Spot at-risk accounts early and run the recovery plan personally.'
    ],
    requirements: [
      '4+ years in account management, customer success or client services.',
      'Demonstrable retention / expansion numbers from prior roles.',
      'Senior written and verbal English. Comfortable in front of executives.',
      'Sound judgement on when to push back on scope and when to absorb it.',
      'Track record of coaching junior staff into reliable operators.',
      'Multilingual ability welcome but not required.'
    ]
  },
  {
    slug: 'principal-consultant',
    num: '03',
    title: 'Principal Consultant',
    chips: ['Consulting', 'Remote', 'Full-time', 'Senior / leadership'],
    leadChip: 'Senior / leadership',
    lede: 'Lead our largest accounts, shape engagement strategy across the consulting team, and mentor Experience and First Consultants.',
    meta: 'Apply for the Principal Consultant role at Outbridge Inc — senior / leadership, remote, US/EU hours. Own strategic accounts and mentor the team.',
    band: 'Consulting',
    about: `You're a senior leader inside the consulting org. You own our most strategic accounts directly, set the standard for how Outbridge engagements run, and mentor the Experience and First Consultants underneath you. You influence what the company sells and how it delivers.`,
    responsibilities: [
      'Personally own 2–4 of Outbridge\'s strategic accounts.',
      'Set the engagement playbooks the wider consulting team operates from.',
      'Mentor Experience and First Consultants — review their accounts, coach their judgement.',
      'Partner with sales on enterprise pitches and scoping.',
      'Drive cross-account post-mortems and feed lessons back into the playbooks.',
      'Represent Outbridge in client steering committees and quarterly reviews.'
    ],
    requirements: [
      '8+ years in consulting, customer success, or BPO engagement leadership.',
      'Comfortable owning a multi-million-dollar book of business.',
      'Demonstrable people-leadership track record.',
      'Excellent written and spoken English; second language a plus.',
      'Strategic judgement on commercial trade-offs.',
      'Operates as a peer to client executives — not as a vendor.'
    ]
  },
  {
    slug: 'virtual-assistant',
    num: '04',
    title: 'Virtual Assistant',
    chips: ['Operations', 'Remote', 'Full-time', 'EN required'],
    leadChip: 'EN required',
    lede: 'Support founders and executives with inbox, calendar, research, data entry and the day-to-day admin that keeps a business moving.',
    meta: 'Apply for the Virtual Assistant role at Outbridge Inc — remote, EN required, US/EU hours. Support founders with admin, inbox and operations.',
    band: 'Operations',
    about: `You're the executive partner who keeps a founder's day on track. Inbox triage, calendar tetris, prep notes before every meeting, follow-ups after, CRM hygiene, expense capture. The kind of work a founder will pay handsomely to never think about again.`,
    responsibilities: [
      'Triage and reply to inbox traffic on behalf of the client.',
      'Own the client\'s calendar — booking, rescheduling, reminders.',
      'Prep daily briefs, meeting agendas and post-meeting follow-ups.',
      'Keep CRM and project trackers clean and up to date.',
      'Run lightweight research and data entry to support decisions.',
      'Handle travel, expenses and vendor follow-ups.'
    ],
    requirements: [
      'Fluent written English — your replies represent the client.',
      'Discreet, organised, hard to fluster. Strong attention to detail.',
      'Comfortable with Google Workspace / Microsoft 365 and at least one CRM.',
      'US or EU working-hours availability.',
      'A second language is a plus.',
      'Prior VA or executive-assistant experience preferred.'
    ]
  },
  {
    slug: 'customer-support-agent',
    num: '05',
    title: 'Customer Support Agent',
    chips: ['Support', 'Remote', 'Full-time / Part-time', 'Bilingual a plus'],
    leadChip: 'Bilingual a plus',
    lede: 'Handle chat, email, phone and social support for our clients\' customers — on-brand, fast, friendly.',
    meta: 'Apply for the Customer Support Agent role at Outbridge Inc — remote, bilingual welcome, US/EU hours. Chat, email, phone and social support.',
    band: 'Support',
    about: `You're the voice of the customer-facing brand for whichever client you're placed on. You handle live chat, email tickets, the occasional phone call and social DMs — calmly, quickly, and on-brand. Your CSAT score is the number we watch.`,
    responsibilities: [
      'Reply to chat and email tickets within SLA, in the client\'s tone.',
      'Take inbound calls and handle escalations within your authorised scope.',
      'Keep the saved-reply library and FAQs up to date.',
      'Flag patterns in tickets that point to product or onboarding issues.',
      'Hit team SLAs on first response time, first-contact resolution and CSAT.',
      'Cover scheduled shifts reliably — predictable coverage matters.'
    ],
    requirements: [
      'Strong written English and a clear phone voice.',
      'Empathetic, patient, calm with frustrated customers.',
      'Comfort with Zendesk, Intercom, HubSpot, Freshdesk or similar.',
      'Predictable availability across US or EU business hours.',
      'A second language (FR, ES, ZH, UR, HI, AR) is a significant plus.',
      'Prior support experience preferred but not required.'
    ]
  },
  {
    slug: 'sales-agent',
    num: '06',
    title: 'Sales Agent',
    chips: ['Sales', 'Remote', 'Full-time', 'OTE + base'],
    leadChip: 'OTE + base',
    lede: 'Prospect, qualify and book meetings to keep our clients\' pipelines full. SDR or AE depending on the engagement.',
    meta: 'Apply for the Sales Agent role at Outbridge Inc — SDR or AE, remote, base + OTE, US/EU hours.',
    band: 'Sales',
    about: `You're placed on a client account to do outbound that books real meetings. SDR-style for early-stage clients, full-cycle AE on mature ones. Your numbers — meetings booked, conversion to opportunity, opportunity to close — are how we measure the engagement.`,
    responsibilities: [
      'Research target accounts and personalise outreach — not spray-and-pray.',
      'Run multi-channel sequences (email, LinkedIn, voice).',
      'Qualify inbound and outbound leads against the client\'s ICP.',
      'Book and confirm discovery calls; chase no-shows.',
      'For AE engagements: run discoveries, demos and close cycles.',
      'Keep CRM hygiene tight — accurate stages, accurate forecast.'
    ],
    requirements: [
      'Excellent written and spoken English; second language welcome.',
      'Prior SDR or AE experience with measurable conversion numbers.',
      'Comfort with sales tooling (HubSpot, Salesforce, Outreach, Salesloft, Apollo).',
      'Resilience and consistency — the work compounds across weeks.',
      'Clear understanding of what "qualified" means and the discipline to enforce it.',
      'Compensation: base + OTE, structure depends on the engagement.'
    ]
  },
  {
    slug: 'bpo-specialist',
    num: '07',
    title: 'BPO Specialist',
    chips: ['Operations', 'Remote', 'Full-time', 'Detail-oriented'],
    leadChip: 'Detail-oriented',
    lede: 'Run back-office processes — data, finance ops, content moderation, order management — to clear SLAs and tight error rates.',
    meta: 'Apply for the BPO Specialist role at Outbridge Inc — remote, full-time, US/EU hours. Run back-office processes to SLA.',
    band: 'Operations',
    about: `You're the operator that keeps a client's back office humming — data entry, reconciliations, invoice processing, content moderation, order management — depending on the engagement. SLA-driven, error-budget-driven, with a clear playbook to execute every day.`,
    responsibilities: [
      'Execute the assigned back-office process to documented SLAs.',
      'Maintain quality at or below the agreed error rate.',
      'Flag exceptions and route them through the right escalation lane.',
      'Suggest process improvements based on what you see day-to-day.',
      'Help maintain the operating manual for your queue.',
      'Cover scheduled shifts reliably — the queue depends on it.'
    ],
    requirements: [
      'Detail-oriented to a fault. Errors stick to you.',
      'Comfort with spreadsheets, basic SQL or no-code automation a plus.',
      'Strong written English. Multilingual ability welcome.',
      'Predictable shift availability.',
      'Prior BPO, ops, finance or data-entry experience preferred.',
      'Comfortable in a queue-based, SLA-driven environment.'
    ]
  }
];

const BENEFITS = [
  'Fully remote, schedules aligned to US or EU hours.',
  'NDAs and confidentiality on every engagement — your work is protected.',
  'A dedicated lead and a team that has your back, even on tough accounts.',
  'Clear scope, clear SLAs, clear expectations. No mystery work.'
];

// -------------------- template --------------------
const template = (role) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${role.title} — Careers at Outbridge Inc</title>
<meta name="description" content="${role.meta}" />
<link rel="canonical" href="https://outbridgeinc.com/careers/${role.slug}" />

<meta property="og:type" content="website" />
<meta property="og:title" content="${role.title} — Careers at Outbridge Inc" />
<meta property="og:description" content="${role.meta}" />
<meta property="og:url" content="https://outbridgeinc.com/careers/${role.slug}" />
<meta property="og:image" content="https://outbridgeinc.com/assets/favicon-512.png" />
<meta property="og:site_name" content="Outbridge Inc" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${role.title} — Careers at Outbridge Inc" />
<meta name="twitter:description" content="${role.meta}" />
<meta name="twitter:image" content="https://outbridgeinc.com/assets/favicon-512.png" />

<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="../assets/favicon-32.png" />
<link rel="icon" type="image/png" sizes="256x256" href="../assets/favicon-256.png" />
<link rel="apple-touch-icon" href="../assets/favicon-256.png" />
<meta name="theme-color" content="#0E0F1C" />

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=Hanken+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="../assets/site.css" />

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "${role.title}",
  "description": "${role.meta}",
  "datePosted": "2026-06-01",
  "employmentType": "FULL_TIME",
  "hiringOrganization": {"@type": "Organization", "name": "Outbridge Inc", "sameAs": "https://outbridgeinc.com"},
  "jobLocationType": "TELECOMMUTE",
  "applicantLocationRequirements": {"@type": "Country", "name": ["United States", "European Union", "United Kingdom"]}
}
</script>
</head>
<body>

<header id="top" class="on-dark-head">
  <div class="container">
    <nav class="nav">
      <a class="brand" href="../index.html">Outbridge<span class="inc">Inc</span></a>
      <div class="nav-links">
        <a href="../index.html">Home</a>
        <a href="../services.html">Services</a>
        <a href="../about.html">About</a>
        <a href="../compliance.html">Compliance</a>
        <a href="../newsletter.html">Newsletter</a>
        <a href="../contact.html">Contact</a>
        <a href="../careers.html" class="active">Careers</a>
      </div>
      <div class="nav-cta"><a class="btn btn-accent" href="../contact.html">Book a consultation</a></div>
    </nav>
  </div>
</header>

<section class="page-hero">
  <div class="container">
    <div>
      <div class="crumb"><a href="../careers.html">Careers</a> &nbsp;·&nbsp; <span class="now">${role.band}</span></div>
      <h1>${role.title}</h1>
      <p class="lede">${role.lede}</p>
      <div class="role-meta hero-chips" style="margin-top:18px;">${role.chips.map(c => c === role.leadChip ? `<span class="lead">${c}</span>` : `<span>${c}</span>`).join('')}</div>
      <div class="ph-rule"></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:48px;">
  <div class="container">
    <div class="role-grid">
      <div class="role-body">
        <h2>About the role</h2>
        <p>${role.about}</p>

        <h2>What you'll do</h2>
        <ul class="role-list">
${role.responsibilities.map(r => `          <li>${r}</li>`).join('\n')}
        </ul>

        <h2>What we're looking for</h2>
        <ul class="role-list">
${role.requirements.map(r => `          <li>${r}</li>`).join('\n')}
        </ul>

        <h2>What you get</h2>
        <ul class="role-list">
${BENEFITS.map(r => `          <li>${r}</li>`).join('\n')}
        </ul>
      </div>

      <aside class="role-apply">
        <div class="apply-card">
          <span class="eyebrow">Apply now</span>
          <h3>Send your application</h3>
          <p>Most candidates hear back within 5 business days. Direct route — your application lands with our hiring lead, not a black hole.</p>
          <form data-api-form action="/api/inquiry" method="POST" novalidate>
            <div class="form-body">
              <div class="field"><label for="ap-name">Full name</label><input id="ap-name" name="name" type="text" autocomplete="name" required /></div>
              <div class="field"><label for="ap-email">Email</label><input id="ap-email" name="email" type="email" autocomplete="email" required /></div>
              <div class="field"><label for="ap-phone">Phone</label><input id="ap-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required /></div>
              <div class="field"><label for="ap-linkedin">LinkedIn or CV URL</label><input id="ap-linkedin" name="linkedin" type="url" placeholder="https://linkedin.com/in/..." /></div>
              <div class="field"><label for="ap-langs">Languages you work in</label><input id="ap-langs" name="languages" type="text" placeholder="English, Spanish, ..." /></div>
              <div class="field"><label for="ap-msg">Why this role</label><textarea id="ap-msg" name="message" placeholder="A few lines on your experience and what draws you to this role..." required></textarea></div>
              <div class="field hp-field" aria-hidden="true"><label for="ap-hp">Website</label><input id="ap-hp" name="hp" type="text" tabindex="-1" autocomplete="off" /></div>
              <input type="hidden" name="role" value="${role.title}" />
              <input type="hidden" name="source" value="careers-${role.slug}" />
              <input type="hidden" name="service" value="Career — ${role.title}" />
              <button class="btn btn-accent" type="submit">Submit application
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              </button>
              <p class="form-note">By submitting you confirm you're happy for us to contact you about this role.</p>
              <div class="form-err" role="alert"></div>
            </div>
            <div class="form-ok">
              <div class="ok-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg></div>
              <h3>Application received.</h3>
              <p>Thanks — our hiring lead will be in touch within 5 business days.</p>
            </div>
          </form>
        </div>
      </aside>
    </div>
  </div>
</section>

<section class="sec dark">
  <div class="container">
    <div class="sec-head reveal">
      <span class="eyebrow on-dark">How hiring works</span>
      <h2>A fair, fast <em>process</em>.</h2>
      <p class="sub">Clear steps, quick responses, no endless rounds.</p>
    </div>
    <div class="steps stagger">
      <div class="step reveal"><div class="n">01</div><h3>Apply</h3><p>Submit through this page. We'll confirm receipt.</p></div>
      <div class="step reveal"><div class="n">02</div><h3>Intro call</h3><p>30 minutes with our hiring lead. We learn about you.</p></div>
      <div class="step reveal"><div class="n">03</div><h3>Skills check</h3><p>A short, role-specific exercise. Real work, no trick questions.</p></div>
      <div class="step reveal"><div class="n">04</div><h3>Offer</h3><p>If it's a fit, we move quickly. No multi-month waits.</p></div>
    </div>
  </div>
</section>

<footer>
  <div class="container">
    <div class="foot-top">
      <div class="foot-brand">
        <div class="mark">Outbridge<span class="inc">Inc</span></div>
        <p>Vetted virtual assistants, customer support, sales agents and full BPO services — secure, multilingual and aligned to your hours.</p>
        <div class="foot-langs"><span>EN</span><span>FR</span><span>ES</span><span>ZH</span><span>UR</span><span>HI</span><span>AR</span></div>
        <div class="foot-social">
          <a href="https://linkedin.com/company/outbridgeinc" target="_blank" rel="noopener" aria-label="Outbridge Inc on LinkedIn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a href="https://facebook.com/outbridgeinc" target="_blank" rel="noopener" aria-label="Outbridge Inc on Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
          <a href="https://instagram.com/outbridgeinc" target="_blank" rel="noopener" aria-label="Outbridge Inc on Instagram"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
        </div>
      </div>
      <div class="foot-col">
        <h4>Services</h4>
        <a href="../services.html#va">Virtual Assistants</a>
        <a href="../services.html#support">Customer Support</a>
        <a href="../services.html#sales">Sales Agents</a>
        <a href="../services.html#bpo">BPO Services</a>
        <a href="../contact.html">Consultations</a>
      </div>
      <div class="foot-col">
        <h4>Company</h4>
        <a href="../about.html">About</a>
        <a href="../careers.html">Careers</a>
        <a href="../newsletter.html">Newsletter</a>
        <a href="../compliance.html">Compliance</a>
      </div>
      <div class="foot-col">
        <h4>Get in touch</h4>
        <a href="../contact.html">Book a consultation</a>
        <a href="mailto:hello@outbridgeinc.com">hello@outbridgeinc.com</a>
        <a href="mailto:careers@outbridgeinc.com">careers@outbridgeinc.com</a>
        <span class="x">Santa Clara, California</span>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Outbridge Inc. All rights reserved.</span>
      <span class="foot-legal"><a href="../compliance.html#terms">Terms of service</a><span>·</span><a href="../compliance.html#privacy">Privacy policy</a></span>
      <span>Secure · Confidential · Multilingual · US &amp; EU coverage</span>
    </div>
  </div>
</footer>

<script src="../assets/site.js" defer></script>
</body>
</html>
`;

// -------------------- run --------------------
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
for (const role of ROLES) {
  const filePath = path.join(outDir, `${role.slug}.html`);
  fs.writeFileSync(filePath, template(role), 'utf8');
  console.log('wrote', path.relative(root, filePath));
}
console.log(`done — ${ROLES.length} role pages generated`);
