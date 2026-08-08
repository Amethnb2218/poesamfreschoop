export function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildVerificationCode(prefix) {
  return `${prefix}-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function updateForm(setter, key, value) {
  setter((current) => ({ ...current, [key]: value }));
}

export function resolveUpdate(current, updater) {
  return typeof updater === 'function' ? updater(current) : updater;
}

export function getCurrentRoute() {
  return { pathname: window.location.pathname, search: window.location.search };
}

export function sumBy(items, key) {
  return items.reduce((total, item) => total + (Number(item[key]) || 0), 0);
}
