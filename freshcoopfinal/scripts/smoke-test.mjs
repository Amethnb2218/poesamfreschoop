import { readFile } from 'node:fs/promises';

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8');
const server = await readFile(new URL('../server/index.js', import.meta.url), 'utf8');

const checks = [
  ['route lots', app.includes("route.pathname === '/lots'")],
  ['public site', app.includes('PublicSitePage') && app.includes('/demo-jury')],
  ['hidden orders preference', app.includes('HIDDEN_ORDERS_KEY')],
  ['order masking toolbar', app.includes('OrderVisibilityToolbar')],
  ['agent terrain role', app.includes("agentTerrain") && app.includes('AgentWorkflowPanel')],
  ['market price regulation', app.includes('MARKET_PRICE_MAX_MARGIN') && app.includes('getPriceControl')],
  ['payment page', app.includes('PaymentPage') && app.includes('partner-powered')],
  ['demo jury loader', app.includes('createFrescoopDemoStore')],
  ['consent records model', app.includes('consentRecords')],
  ['audit logs model', app.includes('auditLogs')],
  ['partner-powered wording', app.includes('Partner-powered') || app.includes('partner-powered')],
  ['server lots persistence', server.includes('lots: []')],
  ['server consent persistence', server.includes('consentRecords: []')],
];

const failed = checks.filter(([, ok]) => !ok);

if (failed.length) {
  console.error('Smoke tests failed:');
  failed.forEach(([name]) => console.error(`- ${name}`));
  process.exit(1);
}

console.log(`Smoke tests passed (${checks.length}/${checks.length})`);
