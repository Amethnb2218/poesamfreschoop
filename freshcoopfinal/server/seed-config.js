import { createHash } from 'node:crypto';

const DEFAULT_ADMIN_PASSWORD_HASH = '62a1a5600217bfc84fa5ac26faf898b366581f3b1512624444654b795b108a92';
const DEFAULT_DEMO_PASSWORD_HASH = 'd3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791';
const DEFAULT_MOBILE_DEMO_PASSWORD_HASH = '0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d';

const DEFAULT_ADMIN_EMAILS = [
  'amethsl2218@gmail.com',
  'richef360@gmail.com',
  'dsenghor96@gmail.com',
  'nyacine183@gmail.com',
  'seydinalimamoulayeyade@gmail.com',
  'diagnealia03@gmail.com',
  'manediop945@gmail.com',
  'papalioune03@gmail.com',
  'niangramatoulaye165@gmail.com',
];

export function getAdminPasswordHash() {
  return process.env.FRESCOOP_ADMIN_PASSWORD_HASH || DEFAULT_ADMIN_PASSWORD_HASH;
}

export function getDemoPasswordHash() {
  return process.env.FRESCOOP_DEMO_PASSWORD_HASH || DEFAULT_DEMO_PASSWORD_HASH;
}

export function getMobileDemoPasswordHash() {
  return process.env.FRESCOOP_MOBILE_DEMO_PASSWORD_HASH || DEFAULT_MOBILE_DEMO_PASSWORD_HASH;
}

export function getAdminEmails() {
  if (process.env.FRESCOOP_ADMIN_EMAILS) {
    return process.env.FRESCOOP_ADMIN_EMAILS.split(',').map(e => e.trim()).filter(Boolean);
  }
  return DEFAULT_ADMIN_EMAILS;
}

export function buildSeededAdmins() {
  const emails = getAdminEmails();
  const hash = getAdminPasswordHash();
  return emails.map((email, index) => {
    const name = email.split('@')[0];
    const slug = name.replace(/[^a-z0-9]/gi, '').toLowerCase();
    return {
      id: index === 0 ? 'usr-admin-uemoa' : `usr-admin-${slug}`,
      createdAt: '2026-04-28T00:00:00.000Z',
      name: index === 0 ? 'Admin FresCoop' : `Admin ${name.charAt(0).toUpperCase() + name.slice(1)}`,
      email,
      phone: '',
      role: 'admin',
      status: 'Actif',
      organization: 'FresCoop',
      region: '',
      bio: '',
      passwordHash: hash,
    };
  });
}

export function buildSeededDemoUser() {
  return {
    id: 'usr-demo',
    createdAt: '2026-05-02T00:00:00.000Z',
    name: 'Visiteur Demo',
    email: 'demovisiteur@gmail.com',
    phone: '',
    role: 'agriculteur',
    status: 'Actif',
    organization: 'FresCoop Demo',
    region: 'Dakar',
    bio: 'Compte de démonstration pour découvrir FresCoop.',
    passwordHash: getDemoPasswordHash(),
  };
}
