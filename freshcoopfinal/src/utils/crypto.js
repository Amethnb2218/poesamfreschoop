import { API_BASE, MAX_FILE_SIZE } from '../config/constants.js';
import { uid } from './helpers.js';

export function sha256Js(message) {
  // Rotate right
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  // Ch function
  const ch = (x, y, z) => (x & y) ^ (~x & z);
  // Maj function
  const maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);
  // Sigma functions
  const sig0 = (x) => rotr(x, 2) ^ rotr(x, 13) ^ rotr(x, 22);
  const sig1 = (x) => rotr(x, 6) ^ rotr(x, 11) ^ rotr(x, 25);
  const gamma0 = (x) => rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
  const gamma1 = (x) => rotr(x, 17) ^ rotr(x, 19) ^ (x >>> 10);

  // Initial hash values
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  // Pre-processing
  const msgBytes = new TextEncoder().encode(message);
  const bitLen = msgBytes.length * 8;
  const padded = new Uint8Array(Math.ceil((msgBytes.length + 9) / 64) * 64);
  padded.set(msgBytes, 0);
  padded[msgBytes.length] = 0x80;

  // Write length in bits as big-endian 64-bit
  const paddedView = new DataView(padded.buffer);
  paddedView.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);
  paddedView.setUint32(padded.length - 4, bitLen >>> 0, false);

  // Process chunks
  for (let i = 0; i < padded.length; i += 64) {
    const w = new Uint32Array(64);

    // First 16 words
    for (let j = 0; j < 16; j++) {
      w[j] = new DataView(padded.buffer, i + j * 4, 4).getUint32(0, false);
    }

    // Extend to 64 words
    for (let j = 16; j < 64; j++) {
      w[j] = (gamma1(w[j - 2]) + w[j - 7] + gamma0(w[j - 15]) + w[j - 16]) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3;
    let e = h4, f = h5, g = h6, h = h7;

    for (let j = 0; j < 64; j++) {
      const t1 = (h + sig1(e) + ch(e, f, g) + k[j] + w[j]) >>> 0;
      const t2 = (sig0(a) + maj(a, b, c)) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  // Final hash as hex string
  const toHex = (n) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(h0) + toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4) + toHex(h5) + toHex(h6) + toHex(h7);
}

export async function filesToAttachments(files) {
  return Promise.all((files || []).map(fileToAttachment));
}

export async function fileToAttachment(file) {
  if (!file) return null;
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Fichier trop lourd: ${file.name}. Limite 2 Mo.`);
  }
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Lecture impossible: ${file.name}`));
    reader.readAsDataURL(file);
  });
  try {
    const res = await fetch(API_BASE + '/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: dataUrl, folder: 'frescoop' }),
    });
    const result = await res.json();
    if (result.ok && result.url) {
      return { id: uid('file'), name: file.name, type: file.type || 'application/octet-stream', size: file.size, url: result.url, uploadedAt: new Date().toISOString() };
    }
  } catch { /* Cloudinary indisponible — fallback base64 */ }
  return { id: uid('file'), name: file.name, type: file.type || 'application/octet-stream', size: file.size, dataUrl, uploadedAt: new Date().toISOString() };
}
