export function formatDate(value) {
  if (!value) return 'Non renseigne';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}

export function formatNumber(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(value || 0));
}

export function formatMoney(value) {
  return `${formatNumber(value)} FCFA`;
}

export function formatCompact(value) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1, notation: 'compact', compactDisplay: 'short' }).format(Number(value || 0));
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

export function formatNotificationDate(value) {
  if (!value) return '';
  const d = new Date(value);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return "À l'instant";
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)} min`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
  return d.toLocaleDateString('fr-FR');
}
