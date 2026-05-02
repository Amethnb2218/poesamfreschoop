import { API_BASE } from './api';

// Reproduit getImageSource() du site web: accepte string, {dataUrl}, {url}, {src}.
export function getImageSource(image: any): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.dataUrl || image.url || image.src || '';
}

// Un produit peut avoir product.images[] (nouveau) ou product.image (legacy).
export function getProductImage(product: any): string | null {
  const raw = Array.isArray(product?.images) && product.images.length
    ? getImageSource(product.images[0])
    : getImageSource(product?.image);
  if (!raw) return null;
  return resolveUrl(raw);
}

// URL relative (/sector-images/xxx.jpg) → préfixe avec l'API; dataURL inchangé.
export function resolveUrl(input: string): string {
  if (!input) return input;
  if (input.startsWith('data:')) return input;
  if (input.startsWith('http://') || input.startsWith('https://')) return input;
  if (input.startsWith('/')) return `${API_BASE}${input}`;
  return input;
}
