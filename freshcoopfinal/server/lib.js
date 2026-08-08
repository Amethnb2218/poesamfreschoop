import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export function createToken(userId, role, secret, expiryMs = 7 * 24 * 60 * 60 * 1000) {
  const payload = JSON.stringify({ uid: userId, role, exp: Date.now() + expiryMs });
  const sig = createHash('sha256').update(payload + secret).digest('hex');
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

export function verifyToken(token, secret) {
  if (!token || typeof token !== 'string') return null;
  const dot = token.lastIndexOf('.');
  if (dot === -1) return null;
  const payloadB64 = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let payload;
  try {
    payload = Buffer.from(payloadB64, 'base64url').toString('utf8');
  } catch { return null; }
  const expected = createHash('sha256').update(payload + secret).digest('hex');
  if (sig.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
  } catch { return null; }
  try {
    const data = JSON.parse(payload);
    if (!data.uid || !data.exp || Date.now() > data.exp) return null;
    return data;
  } catch { return null; }
}

export function normalizeStore(value, emptyStore) {
  const store = Object.fromEntries(Object.keys(emptyStore).map((key) => [key, Array.isArray(value?.[key]) ? value[key] : []]));
  return store;
}

export function dedupeOrders(orders) {
  const seen = new Set();
  return (Array.isArray(orders) ? orders : []).filter((order) => {
    if (!order || typeof order !== 'object') return false;
    const key = getOrderDuplicateKey(order);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getOrderDuplicateKey(order) {
  const quantity = Number(order.quantity || 0);
  const unitPrice = Number(order.unitPrice ?? order.productSnapshot?.price ?? 0);
  const totalPrice = Number(order.totalPrice ?? quantity * unitPrice);
  return [
    String(order.createdAt || order.updatedAt || '').slice(0, 10),
    order.productId || normalizeText(order.productSnapshot?.name),
    order.sellerId || '',
    order.clientId || '',
    quantity,
    order.unit || order.productSnapshot?.unit || '',
    unitPrice,
    totalPrice,
    order.status || '',
    order.paymentStatus || '',
    normalizeText(order.message || ''),
  ].join('|');
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();
}

export function preservePrivateUserFields(incoming, current) {
  if (!Array.isArray(incoming?.users)) return incoming;
  if (!current || !Array.isArray(current?.users)) return incoming;
  const currentById = new Map(current.users.map((user) => [user.id, user]));
  const currentByEmail = new Map(current.users.map((user) => [String(user.email || '').trim().toLowerCase(), user]));
  return {
    ...incoming,
    users: incoming.users.map((user) => {
      if (!user || typeof user !== 'object') return user;
      const previous = currentById.get(user.id) || currentByEmail.get(String(user.email || '').trim().toLowerCase());
      if (!previous) return user;
      if (previous.passwordHash && !user.passwordHash) {
        return { ...user, passwordHash: previous.passwordHash };
      }
      return user;
    }),
  };
}

export const DEFAULT_SERVER_MERGE_KEYS = ['notifications', 'activityProofs', 'messages', 'orders', 'paymentRecords', 'transactions', 'loanRepayments'];

export function mergeIncomingStore(incoming, current, mergeKeys = DEFAULT_SERVER_MERGE_KEYS) {
  if (!incoming || typeof incoming !== 'object') return incoming;
  if (!current || typeof current !== 'object') return incoming;

  const next = { ...incoming };

  for (const key of mergeKeys) {
    if (!Array.isArray(current[key])) continue;
    const incomingItems = Array.isArray(next[key]) ? next[key] : [];
    const incomingIds = new Set(incomingItems.map((item) => item?.id).filter(Boolean));
    const serverOnly = current[key].filter((item) => item && item.id && !incomingIds.has(item.id));
    next[key] = [...serverOnly, ...incomingItems];

    if (key === 'notifications') {
      next[key] = mergeNotificationsPreservingRead(next[key], current[key]);
    }
  }

  if (Array.isArray(current.loans)) {
    next.loans = mergeLoansByDecision(next.loans, current.loans);
  }

  return next;
}

export function mergeNotificationsPreservingRead(incomingNotifications, serverNotifications) {
  const serverById = new Map((Array.isArray(serverNotifications) ? serverNotifications : [])
    .filter((item) => item && item.id)
    .map((item) => [item.id, item]));

  return (Array.isArray(incomingNotifications) ? incomingNotifications : []).map((item) => {
    if (!item || typeof item !== 'object' || !item.id) return item;
    const serverItem = serverById.get(item.id);
    if (!serverItem) return item;

    const incomingRead = Boolean(item.read || item.readAt);
    const serverRead = Boolean(serverItem.read || serverItem.readAt);
    if (!incomingRead && !serverRead) return item;

    return {
      ...item,
      read: true,
      readAt: item.readAt || serverItem.readAt || '',
      resolvedAt: item.resolvedAt || serverItem.resolvedAt,
      resolvedBy: item.resolvedBy || serverItem.resolvedBy,
      resolvedStatus: item.resolvedStatus || serverItem.resolvedStatus,
    };
  });
}

const LOAN_STATUS_WEIGHT = { pending: 0, 'En attente': 0, rejected: 1, 'Refusé': 1, approved: 2, active: 3, 'Approuvé': 2, 'En cours': 3, overdue: 4, 'Retard': 4, repaid: 5, defaulted: 5, 'Remboursé': 5, 'Défaut': 5 };

export function mergeLoansByDecision(incomingLoans, serverLoans) {
  const incoming = Array.isArray(incomingLoans) ? incomingLoans : [];
  const server = Array.isArray(serverLoans) ? serverLoans : [];
  const incomingById = new Map(incoming.filter((loan) => loan && loan.id).map((loan) => [loan.id, loan]));
  const serverOnly = server.filter((loan) => loan?.id && !incomingById.has(loan.id));
  const merged = [...serverOnly, ...incoming];

  const serverById = new Map(server.filter((loan) => loan && loan.id).map((loan) => [loan.id, loan]));
  return merged.map((incomingLoan) => {
    if (!incomingLoan?.id) return incomingLoan;
    const serverLoan = serverById.get(incomingLoan.id);
    if (!serverLoan) return incomingLoan;

    const serverWeight = LOAN_STATUS_WEIGHT[serverLoan.status] ?? -1;
    const incomingWeight = LOAN_STATUS_WEIGHT[incomingLoan.status] ?? -1;
    const serverDecisionStamp = toTime(serverLoan.decidedAt);
    const incomingResetStamp = toTime(incomingLoan.statusResetAt || incomingLoan.resetAt);
    if (serverDecisionStamp && !incomingLoan.decidedAt && serverWeight > 0 && (!incomingResetStamp || incomingResetStamp <= serverDecisionStamp)) return serverLoan;
    if (incomingLoan.decidedAt && !serverLoan.decidedAt && incomingWeight > 0) return incomingLoan;

    const incomingStamp = getLoanDecisionStamp(incomingLoan);
    const serverStamp = getLoanDecisionStamp(serverLoan);
    if (serverStamp > incomingStamp) return serverLoan;
    if (incomingStamp > serverStamp) return incomingLoan;

    const serverProgress = getLoanProgressRank(serverLoan);
    const incomingProgress = getLoanProgressRank(incomingLoan);
    if (serverProgress > incomingProgress) return serverLoan;
    if (incomingProgress > serverProgress) return incomingLoan;

    if (serverWeight > incomingWeight) return serverLoan;
    return incomingLoan;
  });
}

function getLoanDecisionStamp(loan) {
  return Math.max(
    toTime(loan?.decidedAt),
    toTime(loan?.statusUpdatedAt),
    toTime(loan?.updatedAt),
  );
}

function toTime(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getLoanProgressRank(loan) {
  const tranches = Array.isArray(loan?.tranches) ? loan.tranches : [];
  const trancheRank = tranches.reduce((sum, tranche, index) => {
    const base = Number(tranche?.pct || 0) || (index === 0 ? 40 : 30);
    const status = String(tranche?.status || '');
    const proofStatus = String(tranche?.proofStatus || '');
    if (status === 'completed' || proofStatus === 'valide') return sum + base * 4;
    if (status === 'disbursed') return sum + base * 3;
    if (proofStatus === 'en_attente') return sum + base * 2;
    if (proofStatus === 'rejete') return sum + base;
    return sum;
  }, 0);
  const disbursedRank = Number(loan?.disbursedPct || 0) * 3;
  const paidRank = Number(loan?.repaidAmount || 0) > 0 ? 1000 : 0;
  return trancheRank + disbursedRank + paidRank;
}

export function checkRateLimit(buckets, ip, isAuthEndpoint = false, windowMs = 60000, maxRequests = 120, authMax = 10) {
  const now = Date.now();
  const key = isAuthEndpoint ? `auth:${ip}` : ip;
  const max = isAuthEndpoint ? authMax : maxRequests;
  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start > windowMs) {
    bucket = { start: now, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count++;
  return bucket.count <= max;
}
