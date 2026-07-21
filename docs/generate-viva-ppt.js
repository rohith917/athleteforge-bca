/**
 * AthleteForge Viva Presentation — DBIMSCA BCA Final Year
 */
const path = require('path');
const pptxgen = require('pptxgenjs');

const OUT = path.join('C:\\Users\\jayat.ROHITH\\Downloads', 'AthleteForge_Viva_Presentation.pptx');

const C = {
  navy: '21295C',
  deep: '065A82',
  teal: '028090',
  mint: '02C39A',
  white: 'FFFFFF',
  off: 'F2F7F8',
  dark: '1A2B3C',
  gray: '5A6B7C',
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = 'ROHITH GOWDA V & PRAKRUTHI R';
pres.title = 'AthleteForge — Viva Presentation';
pres.subject = 'BCA Final Year Project — DBIMSCA';

function darkBg(slide) {
  slide.background = { color: C.navy };
}

function lightBg(slide) {
  slide.background = { color: C.off };
}

function titleBar(slide, text, light = true) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.85,
    fill: { color: light ? C.deep : C.teal },
  });
  slide.addText(text, {
    x: 0.5, y: 0.12, w: 9, h: 0.6,
    fontSize: 24, bold: true, color: C.white, fontFace: 'Georgia', margin: 0,
  });
}

function bullets(slide, items, x, y, w, h, color = C.dark, size = 15) {
  slide.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: true, breakLine: i < items.length - 1 },
    })),
    { x, y, w, h, fontSize: size, color, fontFace: 'Calibri', valign: 'top' }
  );
}

function statCard(slide, x, y, num, label) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 2.1, h: 1.35,
    fill: { color: C.white },
    line: { color: C.teal, width: 1 },
    rectRadius: 0.08,
  });
  slide.addText(num, {
    x, y: y + 0.15, w: 2.1, h: 0.7,
    fontSize: 28, bold: true, color: C.teal, align: 'center', margin: 0,
  });
  slide.addText(label, {
    x, y: y + 0.82, w: 2.1, h: 0.45,
    fontSize: 11, color: C.gray, align: 'center', margin: 0,
  });
}

// ── SLIDE 1: TITLE ──────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 4.6, w: 10, h: 1.025,
    fill: { color: C.teal },
  });
  s.addText('AthleteForge', {
    x: 0.5, y: 1.0, w: 9, h: 1.0,
    fontSize: 44, bold: true, color: C.white, fontFace: 'Georgia', align: 'center', margin: 0,
  });
  s.addText('Athlete Performance and Injury Tracking System', {
    x: 0.5, y: 2.0, w: 9, h: 0.6,
    fontSize: 18, color: C.mint, fontFace: 'Calibri', align: 'center', margin: 0,
  });
  s.addText([
    { text: 'BCA Final Year Project  |  2025-2026', options: { breakLine: true } },
    { text: 'DON BOSCO INSTITUTE OF MANAGEMENT STUDIES AND COMPUTER APPLICATIONS', options: { breakLine: true } },
    { text: 'Bangalore University (Jnanabharathi)', options: { breakLine: true } },
    { text: 'Submitted by: ROHITH GOWDA V & PRAKRUTHI R', options: { breakLine: true } },
    { text: 'Reg. No: U03CQ23S0045 & U03LK23S0100', options: { breakLine: true } },
    { text: 'Guide: Ms. Dakshayini L & Mr. Madhusudan N' },
  ], {
    x: 0.5, y: 3.0, w: 9, h: 1.5,
    fontSize: 12, color: 'CADCFC', fontFace: 'Calibri', align: 'center',
  });
}

// ── SLIDE 2: AGENDA ────────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Presentation Outline');
  bullets(s, [
    'Problem Statement & Objectives',
    'Technology Stack & System Architecture',
    'Core Modules & Features',
    'Database Design',
    'AI Readiness Copilot',
    'System Testing (25 Test Cases)',
    'Live Demo & Deployment',
    'Future Scope & Conclusion',
  ], 0.7, 1.2, 4.2, 4.0);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.5, y: 1.4, w: 3.8, h: 3.5,
    fill: { color: C.deep },
    rectRadius: 0.1,
  });
  s.addText('10+', {
    x: 5.5, y: 1.8, w: 3.8, h: 0.9,
    fontSize: 52, bold: true, color: C.mint, align: 'center', margin: 0,
  });
  s.addText('Functional Modules', {
    x: 5.5, y: 2.7, w: 3.8, h: 0.5,
    fontSize: 16, color: C.white, align: 'center', margin: 0,
  });
  s.addText('3 Role Dashboards\n25 Tests Passed\nCloud Deployed', {
    x: 5.7, y: 3.4, w: 3.4, h: 1.2,
    fontSize: 13, color: 'CADCFC', align: 'center', fontFace: 'Calibri',
  });
}

// ── SLIDE 3: PROBLEM ───────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Problem Statement');
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.1, w: 4.3, h: 4.0,
    fill: { color: 'FFE8E8' },
    line: { color: 'B85042', width: 1 },
    rectRadius: 0.08,
  });
  s.addText('Existing System Problems', {
    x: 0.7, y: 1.25, w: 4, h: 0.4,
    fontSize: 16, bold: true, color: 'B85042', margin: 0,
  });
  bullets(s, [
    'Paper registers & Excel files',
    'No student self-service portal',
    'Manual charts and reports',
    'No injury recovery tracking',
    'No AI readiness analysis',
  ], 0.7, 1.7, 4.0, 3.2, '6D2E46', 14);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2, y: 1.1, w: 4.3, h: 4.0,
    fill: { color: 'E8F8F5' },
    line: { color: C.teal, width: 1 },
    rectRadius: 0.08,
  });
  s.addText('Our Solution — AthleteForge', {
    x: 5.4, y: 1.25, w: 4, h: 0.4,
    fontSize: 16, bold: true, color: C.deep, margin: 0,
  });
  bullets(s, [
    'Centralized web database',
    'Admin, Coach & Student dashboards',
    'Automated Chart.js analytics',
    'Digital injury & recovery workflow',
    'AI copilot + PDF/Excel reports',
  ], 5.4, 1.7, 4.0, 3.2, C.dark, 14);
}

// ── SLIDE 4: OBJECTIVES ────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Aims & Objectives');
  bullets(s, [
    'Develop secure multi-role authentication (Admin, Coach, Student)',
    'Implement CRUD for athletes, performance, injuries, competitions, attendance, weight',
    'Build interactive dashboards with Chart.js KPI cards and trend charts',
    'Integrate AI readiness scoring and conversational coaching copilot',
    'Generate PDF and Excel reports for administrative records',
    'Deploy on Render.com cloud for 24/7 public access',
  ], 0.6, 1.1, 5.8, 4.2);
  s.addShape(pres.shapes.OVAL, {
    x: 7.0, y: 1.5, w: 2.4, h: 2.4,
    fill: { color: C.teal },
  });
  s.addText('Full\nStack\nWeb\nApp', {
    x: 7.0, y: 2.0, w: 2.4, h: 1.5,
    fontSize: 18, bold: true, color: C.white, align: 'center', margin: 0,
  });
}

// ── SLIDE 5: TECH STACK ────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Technology Stack');
  const stacks = [
    ['Frontend', 'React 18 + Vite\nBootstrap 5\nChart.js + Axios'],
    ['Backend', 'Django 4.2\nDjango REST Framework\nGunicorn + WhiteNoise'],
    ['Database', 'MySQL 8.0 (Local)\nPostgreSQL (Render Cloud)\nDjango ORM'],
    ['AI & Reports', 'Rule-based AI Engine\nGroq / Gemini LLM\nReportLab + OpenPyXL'],
  ];
  stacks.forEach(([title, body], i) => {
    const x = 0.5 + (i % 2) * 4.8;
    const y = 1.1 + Math.floor(i / 2) * 2.1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 4.4, h: 1.85,
      fill: { color: C.white },
      line: { color: C.teal, width: 1 },
      rectRadius: 0.08,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 4.4, h: 0.45,
      fill: { color: C.deep },
    });
    s.addText(title, {
      x: x + 0.15, y: y + 0.08, w: 4.1, h: 0.35,
      fontSize: 14, bold: true, color: C.white, margin: 0,
    });
    s.addText(body, {
      x: x + 0.15, y: y + 0.55, w: 4.1, h: 1.2,
      fontSize: 13, color: C.dark, fontFace: 'Calibri',
    });
  });
}

// ── SLIDE 6: ARCHITECTURE ──────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Three-Tier Architecture');
  const tiers = [
    ['Presentation Tier', 'React 18 SPA — Bootstrap 5 — Chart.js'],
    ['Application Tier', 'Django REST API — Session Auth — CSRF'],
    ['Data Tier', 'MySQL / PostgreSQL — Django ORM'],
  ];
  tiers.forEach(([t, d], i) => {
    const y = 1.2 + i * 1.25;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 1.5, y, w: 7, h: 0.95,
      fill: { color: i === 1 ? C.teal : C.white },
      line: { color: C.deep, width: 1 },
      rectRadius: 0.06,
    });
    s.addText(t, {
      x: 1.7, y: y + 0.08, w: 2.5, h: 0.35,
      fontSize: 13, bold: true, color: i === 1 ? C.white : C.deep, margin: 0,
    });
    s.addText(d, {
      x: 4.2, y: y + 0.2, w: 4.1, h: 0.55,
      fontSize: 12, color: i === 1 ? C.white : C.gray, margin: 0,
    });
    if (i < 2) {
      s.addText('▼', {
        x: 4.8, y: y + 0.95, w: 0.5, h: 0.3,
        fontSize: 16, color: C.teal, align: 'center', margin: 0,
      });
    }
  });
  s.addText('Flow: Browser → React → REST API (/api/) → Django → Database → JSON → Charts', {
    x: 0.5, y: 4.8, w: 9, h: 0.5,
    fontSize: 11, italic: true, color: C.gray, align: 'center',
  });
}

// ── SLIDE 7: MODULES ───────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Core Modules');
  const mods = [
    ['Athlete\nManagement', 'CRUD, photos, sport & team'],
    ['Performance\nTracking', '5 metrics + trend charts'],
    ['Injury\nTracking', 'Severity + recovery status'],
    ['Competition\n& Medals', 'Events + results'],
    ['Attendance', 'Bulk marking + reports'],
    ['Weight & BMI', 'Auto BMI calculation'],
    ['Reports', 'PDF & Excel export'],
    ['AI Copilot', 'Readiness + chat + voice'],
  ];
  mods.forEach(([t, d], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.4 + col * 2.4;
    const y = 1.05 + row * 2.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: 2.2, h: 1.85,
      fill: { color: C.white },
      line: { color: C.mint, width: 1 },
      rectRadius: 0.08,
    });
    s.addText(t, {
      x, y: y + 0.15, w: 2.2, h: 0.7,
      fontSize: 12, bold: true, color: C.deep, align: 'center', margin: 0,
    });
    s.addText(d, {
      x: x + 0.1, y: y + 0.95, w: 2.0, h: 0.7,
      fontSize: 10, color: C.gray, align: 'center', margin: 0,
    });
  });
}

// ── SLIDE 8: ROLES ─────────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Role-Based Dashboards');
  const roles = [
    ['ADMIN', 'User management\nSystem statistics\nFull module access\nTech Command Hub'],
    ['COACH', 'Team analytics\nPerformance entry\nInjury & attendance\nReports download'],
    ['STUDENT', 'Personal dashboard\nPerformance radar\nInjury status view\nAI training tips'],
  ];
  roles.forEach(([r, d], i) => {
    const x = 0.5 + i * 3.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y: 1.2, w: 2.9, h: 3.8,
      fill: { color: C.white },
      line: { color: C.teal, width: 2 },
      rectRadius: 0.1,
    });
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.85, y: 1.45, w: 1.2, h: 1.2,
      fill: { color: C.deep },
    });
    s.addText(r, {
      x: x + 0.85, y: 1.75, w: 1.2, h: 0.5,
      fontSize: 11, bold: true, color: C.white, align: 'center', margin: 0,
    });
    s.addText(d, {
      x: x + 0.2, y: 2.85, w: 2.5, h: 1.8,
      fontSize: 12, color: C.dark, align: 'center', fontFace: 'Calibri',
    });
  });
}

// ── SLIDE 9: DATABASE ────────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Database Design');
  bullets(s, [
    'athletes — central profile table (sport, team, status, photo)',
    'user_profiles — links auth_user to role and athlete_id',
    'performance — 5 fitness metrics per training session',
    'injuries — body part, severity, recovery_status, medical notes',
    'competitions + competition_results — events and medals',
    'attendance — Present/Absent/Late/Excused per session',
    'weight_tracking — auto BMI on save: weight / height(m)²',
  ], 0.5, 1.1, 5.5, 4.0, C.dark, 14);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.3, y: 1.3, w: 3.2, h: 3.6,
    fill: { color: C.navy },
    rectRadius: 0.1,
  });
  s.addText('athletes', {
    x: 6.5, y: 1.5, w: 2.8, h: 0.4,
    fontSize: 14, bold: true, color: C.mint, align: 'center', margin: 0,
  });
  ['performance', 'injuries', 'attendance', 'weight_tracking', 'comp_results'].forEach((t, i) => {
    s.addText(t, {
      x: 6.7, y: 2.0 + i * 0.45, w: 2.4, h: 0.35,
      fontSize: 11, color: C.white, align: 'center', margin: 0,
    });
  });
  s.addText('One-to-Many\nForeign Keys', {
    x: 6.5, y: 4.3, w: 2.8, h: 0.5,
    fontSize: 10, italic: true, color: 'CADCFC', align: 'center',
  });
}

// ── SLIDE 10: AI ─────────────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'AI Readiness Copilot');
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.1, w: 4.5, h: 4.0,
    fill: { color: C.white },
    line: { color: C.teal, width: 1 },
    rectRadius: 0.08,
  });
  s.addText('Hybrid AI Architecture', {
    x: 0.7, y: 1.25, w: 4.1, h: 0.4,
    fontSize: 15, bold: true, color: C.deep, margin: 0,
  });
  bullets(s, [
    'Rule-based engine (always active)',
    'Readiness score 0–100',
    'Injury risk alerts',
    'Training recommendations',
    'Optional Groq / Gemini LLM',
    'Voice input & text-to-speech tips',
  ], 0.7, 1.7, 4.2, 3.2, C.dark, 13);

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.3, y: 1.1, w: 4.2, h: 4.0,
    fill: { color: C.deep },
    rectRadius: 0.08,
  });
  s.addText('API Endpoints', {
    x: 5.5, y: 1.25, w: 3.8, h: 0.4,
    fontSize: 14, bold: true, color: C.mint, margin: 0,
  });
  bullets(s, [
    'POST /api/ai/copilot/',
    'GET /api/ai/insights/',
    'GET /api/ai/demo/ (public)',
    'GET /api/ai/status/',
  ], 5.5, 1.75, 3.8, 2.5, C.white, 13);
  s.addText('AICopilotWidget + TechCommandHub + VoiceCoachTip', {
    x: 5.5, y: 4.2, w: 3.8, h: 0.6,
    fontSize: 10, italic: true, color: 'CADCFC', align: 'center',
  });
}

// ── SLIDE 11: TESTING ────────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'System Testing');
  statCard(s, 0.6, 1.2, '25', 'Test Cases');
  statCard(s, 2.9, 1.2, '25', 'Passed');
  statCard(s, 5.2, 1.2, '0', 'Failed');
  statCard(s, 7.5, 1.2, '4', 'Test Types');
  bullets(s, [
    'Functional — login, CRUD, reports, AI copilot',
    'Integration — React + API + database pipeline',
    'Performance — dashboard load under 3 seconds',
    'User Acceptance — viva demo scenarios verified',
    'Security — CSRF protection, 401 unauthorized blocked',
    'Cloud — Render deployment accessible (TC24 Pass)',
  ], 0.6, 2.8, 8.8, 2.2, C.dark, 14);
}

// ── SLIDE 12: DEMO ───────────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  s.addText('Live Demo', {
    x: 0.5, y: 0.5, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: C.white, fontFace: 'Georgia', margin: 0,
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.4, w: 9, h: 2.0,
    fill: { color: C.teal },
    rectRadius: 0.08,
  });
  s.addText('https://athleteforge-bca.onrender.com', {
    x: 0.5, y: 1.8, w: 9, h: 0.6,
    fontSize: 20, bold: true, color: C.white, align: 'center', margin: 0,
  });
  s.addText('(Wait 30–60 sec on first load — free tier cold start)', {
    x: 0.5, y: 2.5, w: 9, h: 0.4,
    fontSize: 11, italic: true, color: 'CADCFC', align: 'center',
  });

  const logins = [
    ['Admin', 'admin', 'admin123'],
    ['Coach', 'coach', 'coach123'],
    ['Student', 'rahul.sharma@email.com', 'student123'],
  ];
  logins.forEach(([role, user, pass], i) => {
    const y = 3.6 + i * 0.55;
    s.addText(`${role}:  ${user}  /  ${pass}`, {
      x: 1.0, y, w: 8, h: 0.45,
      fontSize: 14, color: C.white, fontFace: 'Consolas',
    });
  });
  s.addText('Local demo: START_DEMO.bat → http://localhost:5173', {
    x: 0.5, y: 5.0, w: 9, h: 0.4,
    fontSize: 12, color: C.mint, align: 'center',
  });
}

// ── SLIDE 13: DEPLOYMENT ─────────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Cloud Deployment — Render.com');
  bullets(s, [
    'Platform: Render.com (Singapore region, free tier)',
    'Service: athleteforge-bca — Python web + Gunicorn',
    'Database: Render PostgreSQL (athleteforge-db)',
    'Build: build.sh — pip install, npm build, migrate, seed',
    'Start: start.sh — Gunicorn 2 workers, 120s timeout',
    'Same-origin: Django serves React SPA + API from one URL',
    'Health check: GET /api/health/',
    'GitHub: github.com/rohith917/athleteforge-bca',
  ], 0.5, 1.1, 6.0, 4.2, C.dark, 14);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.8, y: 1.5, w: 2.5, h: 3.0,
    fill: { color: C.deep },
    rectRadius: 0.1,
  });
  s.addText('Build\n↓\nDeploy\n↓\nLive', {
    x: 6.8, y: 2.0, w: 2.5, h: 2.0,
    fontSize: 16, bold: true, color: C.white, align: 'center', margin: 0,
  });
}

// ── SLIDE 14: FUTURE SCOPE ───────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, 'Future Scope');
  bullets(s, [
    'Wearable device integration (heart rate, GPS trackers)',
    'Native mobile app using React Native',
    'Machine learning injury prediction models',
    'Computer vision for training video analysis',
    'Multi-academy tenancy with data isolation',
    'Kannada / Hindi multilingual interface',
    'Integration with sports federation databases',
  ], 0.6, 1.1, 5.5, 4.0);
  s.addText('From Academic Project → Commercial Platform', {
    x: 6.2, y: 2.5, w: 3.3, h: 1.0,
    fontSize: 14, bold: true, italic: true, color: C.teal, align: 'center',
  });
}

// ── SLIDE 15: CONCLUSION ─────────────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  s.addText('Conclusion', {
    x: 0.5, y: 0.6, w: 9, h: 0.7,
    fontSize: 32, bold: true, color: C.white, fontFace: 'Georgia', margin: 0,
  });
  bullets(s, [
    'AthleteForge successfully meets all BCA project objectives',
    'Full-stack React + Django + MySQL/PostgreSQL implementation',
    '10+ modules with 3 role-based dashboards',
    '25/25 test cases passed — stable for viva demo',
    'Cloud deployed and publicly accessible',
    'AI copilot adds modern sports analytics capability',
  ], 0.8, 1.5, 8.4, 3.0, 'CADCFC', 16);
  s.addText('Thank You', {
    x: 0.5, y: 4.5, w: 9, h: 0.8,
    fontSize: 36, bold: true, color: C.mint, align: 'center', margin: 0,
  });
  s.addText('Questions?', {
    x: 0.5, y: 5.1, w: 9, h: 0.4,
    fontSize: 16, color: C.white, align: 'center',
  });
}

// ── WRITE FILE ───────────────────────────────────────────────
pres.writeFile({ fileName: OUT }).then(() => {
  console.log('PPT saved:', OUT);
}).catch(err => {
  console.error(err);
  process.exit(1);
});