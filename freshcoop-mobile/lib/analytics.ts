// Port fidèle des règles métier du site (App.jsx) pour l'anti-gaspi et la
// bancabilité. Mêmes seuils, mêmes libellés, même calcul de score.

export type AntiWasteAlert = {
  productId: string;
  productName: string;
  sellerName: string;
  sellerId?: string;
  region: string;
  quantityKg: number;
  daysLeft: number;
  urgency: 'critical' | 'high' | 'medium';
  urgencyLabel: string;
  currentUnitPrice: number;
  suggestedPrice: number;
  suggestedDiscountPct: number;
  currentValue: number;
  unit: string;
};

export function estimateShelfLife(key: string): number {
  const text = String(key || '').toLowerCase();
  if (/tomate|laitue|salade|concombre|feuille|menthe|persil/.test(text)) return 5;
  if (/mangue|papaye|banane|fruit/.test(text)) return 8;
  if (/oignon|pomme de terre|patate|ail|carotte/.test(text)) return 30;
  if (/riz|mil|sorgho|cereal|cereale/.test(text)) return 120;
  if (/lait|yaourt|fromage/.test(text)) return 6;
  if (/poisson|viande/.test(text)) return 3;
  return 10;
}

export function buildAntiWasteAlerts(store: any): AntiWasteAlert[] {
  const products = store?.products || [];
  const users = store?.users || [];
  const now = Date.now();
  const alerts: AntiWasteAlert[] = [];
  for (const product of products) {
    const createdAt = new Date(product.createdAt || now).getTime();
    const explicitExpiry = product.expiryDate
      ? new Date(`${product.expiryDate}T23:59:59`).getTime()
      : Number.NaN;
    const shelfLifeDays = Number(
      product.shelfLifeDays ||
        product.daysToExpire ||
        estimateShelfLife(product.category || product.name),
    );
    const expireAt = Number.isFinite(explicitExpiry)
      ? explicitExpiry
      : createdAt + shelfLifeDays * 86400000;
    const daysLeft = Math.round((expireAt - now) / 86400000);
    const qty = Number(product.quantity || 0);
    if (qty <= 0) continue;
    if (daysLeft > 2) continue;
    const seller = users.find((u: any) => u.id === product.ownerId);
    const urgency: 'critical' | 'high' | 'medium' =
      daysLeft <= 1 ? 'critical' : daysLeft <= 3 ? 'high' : 'medium';
    const discount = urgency === 'critical' ? 40 : urgency === 'high' ? 25 : 15;
    const unitPrice = Number(product.price || 0);
    alerts.push({
      productId: product.id,
      productName: product.name,
      sellerName: seller?.name || 'Producteur',
      sellerId: product.ownerId,
      region: product.zone || seller?.region || '',
      quantityKg: qty,
      daysLeft: Math.max(0, daysLeft),
      urgency,
      urgencyLabel:
        urgency === 'critical'
          ? 'Critique · 24h'
          : urgency === 'high'
          ? 'Élevé · 2-3j'
          : 'Surveillance',
      currentUnitPrice: unitPrice,
      suggestedPrice: Math.round(unitPrice * (1 - discount / 100)),
      suggestedDiscountPct: discount,
      currentValue: unitPrice * qty,
      unit: product.unit || 'kg',
    });
  }
  return alerts.sort((a, b) => a.daysLeft - b.daysLeft);
}

export type BancabilityScore = {
  total: number; // 0..100
  volumes: number;
  consistency: number;
  diversity: number;
  attestations: number;
  recommendation: string;
};

export function computeBancabilityScore(store: any, userId: string): BancabilityScore {
  const transactions = (store?.transactions || []).filter(
    (t: any) => t.userId === userId || t.ownerId === userId,
  );
  const proofs = (store?.proofs || []).filter(
    (p: any) => p.ownerId === userId || p.userId === userId,
  );
  const attestations = (store?.attestations || []).filter(
    (a: any) => a.ownerId === userId || a.userId === userId,
  );
  const products = (store?.products || []).filter((p: any) => p.ownerId === userId);

  const totalVolume = transactions.reduce(
    (acc: number, t: any) => acc + Number(t.amount || 0),
    0,
  );
  const volumes = Math.min(30, Math.round(totalVolume / 50000));
  const consistency = Math.min(25, proofs.length * 4);
  const diversity = Math.min(20, new Set(products.map((p: any) => p.category)).size * 5);
  const attestationsScore = Math.min(25, attestations.length * 6);
  const total = Math.min(100, volumes + consistency + diversity + attestationsScore);

  const recommendation =
    total >= 70
      ? 'Profil éligible à un crédit partenaire. Dossier exportable disponible.'
      : total >= 40
      ? 'Continuez à enregistrer vos ventes et preuves pour débloquer un financement.'
      : 'Ajoutez des transactions et attestations pour construire votre profil crédit.';

  return { total, volumes, consistency, diversity, attestations: attestationsScore, recommendation };
}
