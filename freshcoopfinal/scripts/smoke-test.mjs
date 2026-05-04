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
  ['farmer registration pending approval', app.includes("/api/auth/register") && server.includes("status: (role || 'agriculteur') === 'agriculteur' ? 'En attente' : 'Actif'")],
  ['admin approval notification', server.includes("type: 'approval_request'") && server.includes("path: '/utilisateurs'") && app.includes("if (item.type === 'approval_request') return '/utilisateurs'")],
  ['inactive account lock', app.includes('getInactiveAccountMessage') && app.includes("status !== 'actif'")],
  ['partner-powered wording', app.includes('Partner-powered') || app.includes('partner-powered')],
  ['orders tab navigation', app.includes('orders-tabbar') && app.includes("tab=conversations") && app.includes("id={`order-${order.id}`}")],
  ['notification read persistence', app.includes('isNotificationRead') && app.includes('read: Boolean(item.read || item.readAt)') && server.includes('read: Boolean(item.read || item.readAt)')],
  ['receipt qr fallback', app.includes('getQrFallbackDataUrl') && app.includes('onerror="this.onerror=null;this.src=')],
  ['anti waste fixtures', app.includes('createAntiWasteFixtureProducts') && app.includes('Charger des lots fictifs')],
  ['product expiry date anti waste', app.includes('expiryDate') && app.includes('if (daysLeft > 2) continue')],
  ['anti waste cart add', app.includes('addProductToCart(readCartFromStorage(store.products), product, 1)')],
  ['authenticated footer', app.includes('AppFooter') && app.includes('app-footer')],
  ['public survey form', app.includes('PublicSurveyPage') && app.includes('/sondage') && app.includes('setSurveyLeads') && server.includes('surveyLeads: []')],
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
