// Règles de rôle portées depuis freshcoopfinal/src/App.jsx (isBuyerRole,
// isSellerRole, getPrimaryNavLinks). On garde les mêmes identifiants pour
// rester compatible avec les comptes créés via le site.

export type Role =
  | 'admin'
  | 'agriculteur'
  | 'agentTerrain'
  | 'transporteur'
  | 'client'
  | 'acheteurB2B'
  | 'partenaire';

export function isSellerRole(role?: string): boolean {
  return role === 'agriculteur';
}

export function isBuyerRole(role?: string): boolean {
  return role === 'client' || role === 'acheteurB2B';
}

export function isFieldAgentRole(role?: string): boolean {
  return role === 'agentTerrain';
}

export function isTransporterRole(role?: string): boolean {
  return role === 'transporteur';
}

export function isAdminRole(role?: string): boolean {
  return role === 'admin';
}

export function isPartnerRole(role?: string): boolean {
  return role === 'partenaire';
}

// Tab identifiers que l'app peut afficher
export type MobileTab = 'index' | 'market' | 'cart' | 'lots' | 'products' | 'operations' | 'impact' | 'profile';

// Un sous-ensemble des liens primaires du site — adapté pour une nav mobile (5 tabs max)
export function getMobileTabs(role?: string): MobileTab[] {
  if (isAdminRole(role)) return ['index', 'products', 'lots', 'operations', 'profile'];
  if (isSellerRole(role)) return ['index', 'products', 'lots', 'impact', 'profile'];
  if (isFieldAgentRole(role)) return ['index', 'lots', 'operations', 'products', 'profile'];
  if (isTransporterRole(role)) return ['index', 'operations', 'lots', 'profile'];
  if (isPartnerRole(role)) return ['index', 'impact', 'lots', 'profile'];
  // buyers (client, acheteurB2B) et tout autre rôle → parcours achat
  return ['index', 'market', 'cart', 'lots', 'profile'];
}

export function roleLabel(role?: string): string {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'agriculteur':
      return 'Agriculteur';
    case 'agentTerrain':
      return 'Agent terrain';
    case 'transporteur':
      return 'Transporteur';
    case 'client':
      return 'Client';
    case 'acheteurB2B':
      return 'Acheteur B2B';
    case 'partenaire':
      return 'Partenaire finance';
    default:
      return 'Membre';
  }
}

// Filtrages de données par rôle — dérivés du site (ex. ligne 1771 App.jsx)
export function scopeProducts<T extends { ownerId?: string }>(
  products: T[],
  role: string | undefined,
  userId: string,
): T[] {
  if (isAdminRole(role) || isFieldAgentRole(role)) return products;
  if (isSellerRole(role)) return products.filter((p) => p.ownerId === userId);
  // Les acheteurs/clients voient le marché complet depuis l'onglet Marché.
  return products;
}

export function scopeLots<T extends { ownerId?: string; sellerId?: string }>(
  lots: T[],
  role: string | undefined,
  userId: string,
): T[] {
  if (isAdminRole(role)) return lots;
  if (isSellerRole(role)) {
    return lots.filter((l) => l.ownerId === userId || l.sellerId === userId);
  }
  return lots;
}

export function scopeHubs<T extends { ownerId?: string }>(
  hubs: T[],
  role: string | undefined,
  userId: string,
): T[] {
  if (isAdminRole(role)) return hubs;
  // Ligne 1491 App.jsx: admin voit tout, sinon ses propres hubs
  return hubs.filter((h) => h.ownerId === userId);
}

export function scopeOrdersForUser<T extends Record<string, any>>(
  orders: T[],
  role: string | undefined,
  userId: string,
  email: string,
): T[] {
  if (isAdminRole(role) || isFieldAgentRole(role)) return orders;
  if (isSellerRole(role)) {
    return orders.filter((o) => o.sellerId === userId || o.product?.ownerId === userId);
  }
  if (isTransporterRole(role)) {
    return orders.filter(
      (o) => o.assignedAgentId === userId || o.transporterId === userId,
    );
  }
  // Buyers: leurs commandes (compat tous formats site + mobile)
  const em = email.toLowerCase();
  return orders.filter(
    (o) =>
      o.userId === userId ||
      o.buyerId === userId ||
      o.clientId === userId ||
      (o.buyerEmail && String(o.buyerEmail).toLowerCase() === em) ||
      (o.customer?.email && String(o.customer.email).toLowerCase() === em),
  );
}
