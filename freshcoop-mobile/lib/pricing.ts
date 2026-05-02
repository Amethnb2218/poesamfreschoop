// Analyse IA simple du prix saisi par l'agriculteur vs marché.

export type PriceInsight = {
  tone: 'ok' | 'warn' | 'danger' | 'info';
  title: string;
  body: string;
  marketAverage?: number;
  sampleSize?: number;
};

export function analyzePrice(
  products: any[],
  category: string,
  name: string,
  unit: string,
  price: number,
): PriceInsight | null {
  if (!price || !category) return null;
  const normName = String(name || '').toLowerCase();
  const candidates = products.filter((p: any) => {
    if ((p.category || '').toLowerCase() !== category.toLowerCase()) return false;
    if ((p.unit || 'kg') !== unit) return false;
    if (normName) {
      const pn = String(p.name || '').toLowerCase();
      if (!pn.includes(normName) && !normName.includes(pn)) return false;
    }
    return Number(p.price) > 0;
  });
  if (candidates.length < 2) {
    return {
      tone: 'info',
      title: 'Pas assez de références',
      body:
        "Aucun produit comparable publié récemment. Votre prix fera office de référence pour ce produit.",
    };
  }
  const prices = candidates.map((p: any) => Number(p.price));
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const diff = ((price - avg) / avg) * 100;

  if (diff > 25) {
    return {
      tone: 'danger',
      title: 'Prix très élevé',
      body: `Votre prix est ${Math.round(diff)}% au-dessus de la moyenne marché (${Math.round(
        avg,
      ).toLocaleString('fr-FR')} FCFA/${unit}). Risque de faible demande.`,
      marketAverage: avg,
      sampleSize: candidates.length,
    };
  }
  if (diff > 10) {
    return {
      tone: 'warn',
      title: 'Prix au-dessus du marché',
      body: `+${Math.round(diff)}% vs moyenne (${Math.round(avg).toLocaleString(
        'fr-FR',
      )} FCFA/${unit}). Ajustez vers le marché pour capter plus d'acheteurs.`,
      marketAverage: avg,
      sampleSize: candidates.length,
    };
  }
  if (diff < -15) {
    return {
      tone: 'info',
      title: 'Prix cassé',
      body: `${Math.round(Math.abs(diff))}% sous la moyenne marché (${Math.round(
        avg,
      ).toLocaleString('fr-FR')} FCFA/${unit}). Vous pourriez augmenter de 10-15% sans perdre d'acheteurs.`,
      marketAverage: avg,
      sampleSize: candidates.length,
    };
  }
  return {
    tone: 'ok',
    title: 'Prix aligné marché',
    body: `Votre prix est cohérent avec la moyenne de ${Math.round(avg).toLocaleString(
      'fr-FR',
    )} FCFA/${unit} sur ${candidates.length} produits similaires.`,
    marketAverage: avg,
    sampleSize: candidates.length,
  };
}
