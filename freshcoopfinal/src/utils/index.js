/**
 * Utility barrel file — re-exports all utility functions from the project.
 */

import { escapeHtml as _escapeHtml } from './format.js';

// ─── Helpers ────────────────────────────────────────────────────────────────
export {
  normalize,
  haversineKm,
  uid,
  buildVerificationCode,
  csvCell,
  updateForm,
  resolveUpdate,
  getCurrentRoute,
  sumBy,
} from './helpers.js';

// ─── Format ─────────────────────────────────────────────────────────────────
export {
  formatDate,
  formatNumber,
  formatMoney,
  formatCompact,
  escapeHtml,
  formatNotificationDate,
} from './format.js';

// ─── Download / Print ───────────────────────────────────────────────────────
export {
  downloadCsv,
  downloadJson,
  downloadHtml,
  downloadText,
  downloadDataUrl,
  printHtml,
} from './download.js';

// ─── Crypto / Files ─────────────────────────────────────────────────────────
export {
  sha256Js,
  filesToAttachments,
  fileToAttachment,
} from './crypto.js';

// ─── isPublicPath ───────────────────────────────────────────────────────────
// Hardcoded public paths to avoid circular dependency with constants
const PUBLIC_SITE_PATHS = [
  '/public',
  '/contact',
  '/sondage',
  '/questionnaire',
];

export function isPublicPath(path) {
  return PUBLIC_SITE_PATHS.includes(path);
}

// ─── roleLabel ──────────────────────────────────────────────────────────────
// Hardcoded roles to avoid circular dependency with constants
const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'agriculteur', label: 'Agriculteur' },
  { id: 'agentTerrain', label: 'Agent Terrain' },

  { id: 'client', label: 'Client' },
  { id: 'acheteurB2B', label: 'Acheteur B2B' },
  { id: 'partenaire', label: 'Partenaire finance' },
];

export function roleLabel(role) {
  return ROLES.find((item) => item.id === role)?.label || role;
}

// ─── renderDocumentShell ────────────────────────────────────────────────────
export function renderDocumentShell(title, body) {
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8" /><title>${_escapeHtml(title)}</title><style>
*{box-sizing:border-box}
body{font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:42px;color:#071b14;line-height:1.6;background:#f8faf9}
h1{font-size:28px;margin:0;color:#0d3320}
h2{font-size:17px;margin:24px 0 12px;color:#0d3320;border-bottom:2px solid #17a34a;padding-bottom:6px;display:inline-block}
.subtitle{margin:2px 0 0;font-size:13px;color:#4a7c5f}
.code{padding:8px 14px;background:#17a34a;color:#fff;display:inline-block;font-weight:bold;border-radius:4px;font-size:13px;margin:16px 0}
section{padding:16px 0}
table{width:100%;border-collapse:collapse;margin-top:10px;font-size:14px}
th,td{border:1px solid #d7e4dc;padding:10px 12px;text-align:left}
th{background:#0d3320;color:#fff;font-weight:600}
.finance-table{width:auto;min-width:400px}
.finance-table td:first-child{color:#4a7c5f}
.finance-table td:last-child{text-align:right}
.report-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px;border-bottom:3px solid #17a34a;margin-bottom:12px}
.header-brand{display:flex;align-items:center;gap:14px}
.logo-badge{width:48px;height:48px;background:#17a34a;border-radius:10px;display:flex;align-items:center;justify-content:center}
.logo-badge span{color:#fff;font-size:26px;font-weight:bold}
.gim-badge{text-align:right;padding:10px 16px;border:2px solid #f59e0b;border-radius:8px;background:#fffbeb}
.gim-badge strong{display:block;color:#b45309;font-size:16px}
.gim-badge span{display:block;font-size:11px;color:#92400e}
.badge-tag{display:inline-block;margin-top:4px;padding:2px 10px;background:#f59e0b;color:#fff;border-radius:3px;font-size:11px;font-weight:bold;text-transform:uppercase}
.kpi-row{display:flex;gap:12px;margin:10px 0}
.kpi-card{flex:1;padding:14px;border-radius:8px;text-align:center}
.kpi-card.green{background:#ecfdf5;border:1px solid #6ee7b7}
.kpi-card.gold{background:#fffbeb;border:1px solid #fcd34d}
.kpi-card.coral{background:#fef2f2;border:1px solid #fca5a5}
.kpi-card.blue{background:#eff6ff;border:1px solid #93c5fd}
.kpi-value{display:block;font-size:22px;font-weight:bold;color:#0d3320}
.kpi-label{display:block;font-size:11px;color:#4a7c5f;margin-top:4px}
.odd-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.odd-tag{padding:6px 14px;background:#ecfdf5;border:1px solid #17a34a;border-radius:20px;font-size:12px;font-weight:600;color:#0d3320}
.report-footer{margin-top:32px;padding-top:16px;border-top:2px solid #d7e4dc;text-align:center;font-size:12px;color:#4a7c5f}
.report-footer p{margin:4px 0}
@media print{body{background:#fff;padding:20px}.kpi-row{gap:6px}}
</style></head><body>${body}</body></html>`;
}
