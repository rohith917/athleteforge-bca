/**
 * AthleteForge — Project Write-Up Presentation (6–7 slides)
 * DBIMSCA BCA format per college outline
 */
const path = require('path');
const pptxgen = require('pptxgenjs');

const OUT = path.join(
  'C:\\Users\\jayat.ROHITH\\Downloads',
  'AthleteForge_Project_WriteUp_Presentation.pptx',
);

const C = {
  navy: '0A0A0A',
  lime: 'B8FF3C',
  accent: 'FF3D3D',
  white: 'FFFFFF',
  off: 'F4F4F4',
  dark: '1A1A1A',
  gray: '6B7280',
  card: 'FFFFFF',
};

const META = {
  title: 'AthleteForge',
  subtitle: 'Athlete Performance and Injury Tracking System',
  category: 'Web Application',
  students: 'ROHITH GOWDA V & PRAKRUTHI R',
  reg: 'U03CQ23S0045 & U03LK23S0100',
  institute: 'DON BOSCO INSTITUTE OF MANAGEMENT STUDIES AND COMPUTER APPLICATIONS',
  university: 'Bangalore University (Jnanabharathi)',
  guide: 'Ms. Dakshayini L & Mr. Madhusudan N',
  period: '2025–2026',
  live: 'https://athleteforge-bca.onrender.com',
};

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.author = META.students;
pres.title = `${META.title} — Project Write-Up`;
pres.subject = 'BCA Final Year Project Presentation';

function darkBg(slide) {
  slide.background = { color: C.navy };
}

function lightBg(slide) {
  slide.background = { color: C.off };
}

function titleBar(slide, text, dark = false) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 10,
    h: 0.82,
    fill: { color: dark ? C.accent : C.navy },
  });
  slide.addText(text, {
    x: 0.45,
    y: 0.1,
    w: 9.1,
    h: 0.55,
    fontSize: 22,
    bold: true,
    color: C.white,
    fontFace: 'Georgia',
    margin: 0,
  });
}

function sectionTag(slide, text, x, y) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x,
    y,
    w: 1.55,
    h: 0.32,
    fill: { color: C.lime },
  });
  slide.addText(text, {
    x,
    y: y + 0.04,
    w: 1.55,
    h: 0.28,
    fontSize: 9,
    bold: true,
    color: C.navy,
    align: 'center',
    margin: 0,
  });
}

function bullets(slide, items, x, y, w, h, color = C.dark, size = 13) {
  slide.addText(
    items.map((t, i) => ({
      text: t,
      options: { bullet: true, breakLine: i < items.length - 1 },
    })),
    { x, y, w, h, fontSize: size, color, fontFace: 'Calibri', valign: 'top' },
  );
}

function flowBox(slide, x, y, w, h, label, fill) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x,
    y,
    w,
    h,
    fill: { color: fill },
    line: { color: C.navy, width: 1 },
    rectRadius: 0.06,
  });
  slide.addText(label, {
    x,
    y: y + 0.12,
    w,
    h: h - 0.2,
    fontSize: 10,
    bold: true,
    color: C.navy,
    align: 'center',
    valign: 'middle',
    margin: 0,
  });
}

// ── SLIDE 1: Title & Category ───────────────────────────────
{
  const s = pres.addSlide();
  darkBg(s);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: 0.18,
    h: 5.625,
    fill: { color: C.lime },
  });
  s.addText('1. Title of the Project', {
    x: 0.55,
    y: 0.45,
    w: 4,
    h: 0.35,
    fontSize: 11,
    color: C.lime,
    fontFace: 'Calibri',
    margin: 0,
  });
  s.addText(META.title, {
    x: 0.55,
    y: 0.95,
    w: 8.8,
    h: 0.95,
    fontSize: 40,
    bold: true,
    color: C.white,
    fontFace: 'Georgia',
    margin: 0,
  });
  s.addText(META.subtitle, {
    x: 0.55,
    y: 1.85,
    w: 8.5,
    h: 0.55,
    fontSize: 17,
    color: 'CCCCCC',
    fontFace: 'Calibri',
    margin: 0,
  });
  sectionTag(s, '2. CATEGORY', 0.55, 2.55);
  s.addText(`Category: ${META.category}`, {
    x: 0.55,
    y: 3.05,
    w: 4.5,
    h: 0.4,
    fontSize: 16,
    bold: true,
    color: C.lime,
    margin: 0,
  });
  s.addText('(Not a mobile app — browser-based responsive web system)', {
    x: 0.55,
    y: 3.45,
    w: 5.5,
    h: 0.35,
    fontSize: 11,
    italic: true,
    color: C.gray,
    margin: 0,
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.8,
    y: 2.45,
    w: 3.6,
    h: 2.6,
    fill: { color: '151515' },
    line: { color: C.lime, width: 1 },
    rectRadius: 0.08,
  });
  s.addText([
    { text: META.institute, options: { breakLine: true } },
    { text: META.university, options: { breakLine: true } },
    { text: `Academic Year: ${META.period}`, options: { breakLine: true } },
    { text: `Submitted by: ${META.students}`, options: { breakLine: true } },
    { text: `Reg. No: ${META.reg}`, options: { breakLine: true } },
    { text: `Guide: ${META.guide}` },
  ], {
    x: 6.0,
    y: 2.65,
    w: 3.2,
    h: 2.2,
    fontSize: 10,
    color: 'DDDDDD',
    fontFace: 'Calibri',
  });
}

// ── SLIDE 2: Description / Introduction (SRS) ───────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, '3. Description / Introduction to the Project (SRS)');
  s.addText('Software Requirements Specification — Overview', {
    x: 0.55,
    y: 0.95,
    w: 8.5,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  bullets(
    s,
    [
      'Purpose: Centralized web system to track athlete performance, injuries, attendance, competitions, and weight for sports academies.',
      'Problem: Manual registers and Excel sheets cause data loss, no student portal, and delayed injury decisions.',
      'Users: Admin (system control), Coach (team management), Student/Athlete (personal dashboard).',
      'Scope: Secure login, role-based dashboards, CRUD modules, Chart.js analytics, AI readiness insights, PDF/Excel reports.',
      'Deployment: Cloud-hosted on Render.com — live demo available 24/7.',
    ],
    0.55,
    1.35,
    5.9,
    3.8,
    C.dark,
    13,
  );
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.7,
    y: 1.2,
    w: 2.9,
    h: 3.9,
    fill: { color: C.navy },
    rectRadius: 0.1,
  });
  s.addText('Key SRS Goals', {
    x: 6.85,
    y: 1.35,
    w: 2.6,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: C.lime,
    margin: 0,
  });
  bullets(
    s,
    [
      'Multi-role authentication',
      'Real-time dashboards',
      'Injury recovery workflow',
      'AI coaching copilot',
      'Automated reports',
    ],
    6.85,
    1.8,
    2.5,
    3.0,
    C.white,
    11,
  );
}

// ── SLIDE 3: Development Tools ──────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, '4. Development Tools  |  9. Introduction to Development Tools');
  const tools = [
    [
      'Front-End Tools',
      'React 18 — component-based UI\nVite — fast build tool\nBootstrap 5 — responsive layout\nChart.js — performance charts\nAxios — API communication',
    ],
    [
      'Back-End Tools',
      'Python 3 + Django 4.2\nDjango REST Framework — REST API\nSession + Token authentication\nPostgreSQL (cloud) / MySQL (local)\nGunicorn + WhiteNoise — production server',
    ],
    [
      'Supporting Tools',
      'Git & GitHub — version control\nRender.com — cloud deployment\nReportLab / OpenPyXL — PDF & Excel\nVS Code — development IDE\nPostman — API testing',
    ],
    [
      'AI & Reports',
      'Forge AI — rule-based analytics\nOptional Groq / Gemini LLM\nCSRF protection + role permissions\nDjango ORM — database layer',
    ],
  ];
  tools.forEach(([title, body], i) => {
    const x = 0.45 + (i % 2) * 4.85;
    const y = 1.0 + Math.floor(i / 2) * 2.15;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 4.55,
      h: 1.95,
      fill: { color: C.card },
      line: { color: C.navy, width: 1 },
      rectRadius: 0.08,
    });
    s.addShape(pres.shapes.RECTANGLE, {
      x,
      y,
      w: 4.55,
      h: 0.42,
      fill: { color: i % 2 === 0 ? C.navy : C.accent },
    });
    s.addText(title, {
      x: x + 0.12,
      y: y + 0.07,
      w: 4.3,
      h: 0.3,
      fontSize: 13,
      bold: true,
      color: C.white,
      margin: 0,
    });
    s.addText(body, {
      x: x + 0.12,
      y: y + 0.5,
      w: 4.3,
      h: 1.35,
      fontSize: 11,
      color: C.dark,
      fontFace: 'Calibri',
    });
  });
}

// ── SLIDE 4: Modules & Process Diagram ─────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, '5. Modules of the Project (with Process Diagram)');
  const mods = [
    ['Auth & Roles', 'Login, register, admin/coach/student access'],
    ['Athletes', 'Profiles, photos, sport & team data'],
    ['Performance', 'Speed, strength, endurance metrics'],
    ['Injuries', 'Severity, recovery, return-to-play'],
    ['Attendance', 'Daily marking & compliance reports'],
    ['Competitions', 'Events, medals, results'],
    ['Weight / BMI', 'Body composition tracking'],
    ['AI + Reports', 'Readiness score, copilot, PDF/Excel'],
  ];
  mods.forEach(([t, d], i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.35 + col * 2.4;
    const y = 0.95 + row * 1.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.2,
      h: 1.35,
      fill: { color: C.card },
      line: { color: C.lime, width: 1 },
      rectRadius: 0.06,
    });
    s.addText(t, {
      x: x + 0.08,
      y: y + 0.1,
      w: 2.05,
      h: 0.35,
      fontSize: 11,
      bold: true,
      color: C.navy,
      margin: 0,
    });
    s.addText(d, {
      x: x + 0.08,
      y: y + 0.45,
      w: 2.05,
      h: 0.8,
      fontSize: 9,
      color: C.gray,
      fontFace: 'Calibri',
    });
  });
  s.addText('Process Flow Diagram', {
    x: 0.45,
    y: 4.15,
    w: 3,
    h: 0.3,
    fontSize: 11,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  const boxes = [
    ['User Login', C.lime],
    ['Dashboard', 'E8E8E8'],
    ['Module Action\n(CRUD / Report)', 'E8E8E8'],
    ['Django REST API', C.accent],
    ['PostgreSQL DB', C.navy],
    ['Charts & AI Output', C.lime],
  ];
  boxes.forEach(([label, fill], i) => {
    const x = 0.4 + i * 1.55;
    flowBox(s, x, 4.5, 1.35, 0.72, label, fill);
    if (i < boxes.length - 1) {
      s.addText('→', {
        x: x + 1.32,
        y: 4.68,
        w: 0.25,
        h: 0.3,
        fontSize: 14,
        bold: true,
        color: C.navy,
        margin: 0,
      });
    }
  });
}

// ── SLIDE 5: Database Model ─────────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, '6. Database Model — ER Diagram & Sample Tables');
  s.addText('Entity Relationships (simplified ER)', {
    x: 0.5,
    y: 0.95,
    w: 4.5,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  const entities = [
    ['User / UserProfile', '1 — role, athlete link'],
    ['Athlete', 'Central entity'],
    ['Performance', 'N per athlete'],
    ['Injury', 'N per athlete'],
    ['Attendance', 'N per athlete'],
    ['Competition', '1 — many results'],
  ];
  entities.forEach(([name, rel], i) => {
    const y = 1.35 + i * 0.55;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 0.5,
      y,
      w: 4.3,
      h: 0.45,
      fill: { color: i === 1 ? C.lime : C.card },
      line: { color: C.navy, width: 1 },
      rectRadius: 0.05,
    });
    s.addText(`${name}  →  ${rel}`, {
      x: 0.65,
      y: y + 0.08,
      w: 4,
      h: 0.3,
      fontSize: 10,
      color: C.navy,
      margin: 0,
    });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.2,
    y: 0.95,
    w: 4.5,
    h: 4.35,
    fill: { color: C.card },
    line: { color: C.navy, width: 1 },
    rectRadius: 0.08,
  });
  s.addText('Sample Tables Created', {
    x: 5.4,
    y: 1.1,
    w: 4.1,
    h: 0.35,
    fontSize: 13,
    bold: true,
    color: C.navy,
    margin: 0,
  });
  const tableRows = [
    'athletes — id, name, sport, team, status, DOB',
    'performance — athlete_id, 5 metric scores, date',
    'injuries — type, body_part, severity, recovery_status',
    'attendance — athlete_id, date, status (Present/Absent)',
    'competitions — name, venue, level, date',
    'competition_results — athlete, medal, position',
    'weight_tracking — weight_kg, BMI, body_fat %',
    'user_profiles — role (admin/coach/student)',
  ];
  bullets(s, tableRows, 5.4, 1.5, 4.1, 3.6, C.dark, 10);
}

// ── SLIDE 6: Interface Design ───────────────────────────────
{
  const s = pres.addSlide();
  lightBg(s);
  titleBar(s, '7. Interface Design — Purpose of Each Screen');
  const screens = [
    ['Landing Page', 'Project overview, AI demo, registration CTA'],
    ['Login / Register', 'Secure access for all user roles'],
    ['Admin Dashboard', 'User management, system stats, oversight'],
    ['Coach Dashboard', 'Team analytics, KPIs, injury heatmap'],
    ['Student Dashboard', 'Personal performance, readiness, medals'],
    ['Performance Page', 'Record & view 5-metric training scores'],
    ['Injuries Page', 'Track injuries and recovery workflow'],
    ['Attendance Page', 'Mark sessions and view compliance'],
    ['Reports Page', 'Download PDF & Excel for records'],
    ['AI Copilot Widget', 'Chat/voice coaching on readiness & plans'],
  ];
  screens.forEach(([name, purpose], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 0.45 + col * 4.85;
    const y = 0.95 + row * 0.88;
    s.addShape(pres.shapes.RECTANGLE, {
      x,
      y,
      w: 4.55,
      h: 0.75,
      fill: { color: row % 2 === 0 ? C.card : 'ECECEC' },
      line: { color: 'DDDDDD', width: 0.5 },
    });
    s.addText(name, {
      x: x + 0.12,
      y: y + 0.08,
      w: 1.65,
      h: 0.55,
      fontSize: 11,
      bold: true,
      color: C.navy,
      margin: 0,
    });
    s.addText(purpose, {
      x: x + 1.75,
      y: y + 0.12,
      w: 2.65,
      h: 0.5,
      fontSize: 10,
      color: C.gray,
      fontFace: 'Calibri',
      margin: 0,
    });
  });
}

// ── SLIDE 7: Area of Use, Enhancements & Conclusion ───────
{
  const s = pres.addSlide();
  darkBg(s);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0,
    y: 5.1,
    w: 10,
    h: 0.525,
    fill: { color: C.lime },
  });
  s.addText('8. Area of Use  |  Enhancements  |  10. Conclusion', {
    x: 0.5,
    y: 0.45,
    w: 9,
    h: 0.5,
    fontSize: 22,
    bold: true,
    color: C.white,
    fontFace: 'Georgia',
    margin: 0,
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5,
    y: 1.15,
    w: 4.4,
    h: 3.55,
    fill: { color: '151515' },
    line: { color: C.lime, width: 1 },
    rectRadius: 0.08,
  });
  s.addText('Area of Use', {
    x: 0.7,
    y: 1.3,
    w: 4,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: C.lime,
    margin: 0,
  });
  bullets(
    s,
    [
      'School & college sports departments',
      'Athletics academies & coaching centres',
      'University inter-college tournaments',
      'Fitness clubs with structured training',
      'Sports science labs & BCA project demos',
    ],
    0.7,
    1.7,
    4.0,
    2.7,
    'DDDDDD',
    12,
  );
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 1.15,
    w: 4.4,
    h: 1.55,
    fill: { color: '151515' },
    line: { color: C.accent, width: 1 },
    rectRadius: 0.08,
  });
  s.addText('Future Enhancements', {
    x: 5.3,
    y: 1.3,
    w: 4,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: C.accent,
    margin: 0,
  });
  bullets(
    s,
    [
      'Wearable device integration (heart rate, GPS)',
      'Mobile app (React Native)',
      'Video analysis for technique correction',
      'SMS/email alerts for injury risk',
    ],
    5.3,
    1.7,
    4.0,
    1.0,
    'DDDDDD',
    11,
  );
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.1,
    y: 2.9,
    w: 4.4,
    h: 1.8,
    fill: { color: C.accent },
    rectRadius: 0.08,
  });
  s.addText('Conclusion', {
    x: 5.3,
    y: 3.05,
    w: 4,
    h: 0.35,
    fontSize: 14,
    bold: true,
    color: C.white,
    margin: 0,
  });
  s.addText(
    'AthleteForge successfully demonstrates a full-stack BCA web application with secure multi-role access, database-driven modules, interactive dashboards, AI insights, and cloud deployment — ready for academic evaluation and real-world sports data management.',
    {
      x: 5.3,
      y: 3.45,
      w: 4.0,
      h: 1.1,
      fontSize: 11,
      color: C.white,
      fontFace: 'Calibri',
    },
  );
  s.addText(`Live Demo: ${META.live}  |  Thank You`, {
    x: 0.5,
    y: 5.22,
    w: 9,
    h: 0.35,
    fontSize: 12,
    bold: true,
    color: C.navy,
    align: 'center',
    margin: 0,
  });
}

pres.writeFile({ fileName: OUT }).then(() => {
  console.log('Created:', OUT);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});