// FresCoop Credit & Repayment System
// 4 layers of security: instant deduction, progressive rate, solidarity caution, guarantee fund

const PROGRESSIVE_RATES = [
  { max: 75000, rate: 0 },      // < 75K: pause, minimum vital protected
  { max: 150000, rate: 0.15 },  // 75K-150K: light rate
  { max: 300000, rate: 0.25 },  // 150K-300K: normal repayment
  { max: Infinity, rate: 0.30 },// > 300K: accelerated
];

const GUARANTEE_FUND_RATE = 0.02; // 2% of each transaction goes to guarantee fund
const SOLIDARITY_GROUP_SIZE = 5;
const LOAN_CLOSED_STATUSES = new Set(['Refusé', 'Remboursé', 'Annulé', 'repaid', 'rejected', 'cancelled']);
const LOAN_BLOCKING_STATUSES = new Set(['En attente', 'Approuvé', 'En cours', 'Retard', 'Défaut', 'active', 'pending', 'approved', 'overdue', 'defaulted']);

export function calculateDeductionRate(monthlyRevenue) {
  for (const bracket of PROGRESSIVE_RATES) {
    if (monthlyRevenue <= bracket.max) return bracket.rate;
  }
  return 0.30;
}

export function processPayment(amount, seller, store) {
  const loan = getActiveLoan(seller.id, store);
  if (!loan) {
    return { sellerReceives: amount, deducted: 0, guaranteeFund: 0 };
  }

  const rate = calculateDeductionRate(getMonthlyRevenue(seller.id, store));
  const deducted = Math.round(amount * rate);
  const guaranteeFund = Math.round(amount * GUARANTEE_FUND_RATE);
  const sellerReceives = amount - deducted - guaranteeFund;

  return {
    sellerReceives,
    deducted,
    guaranteeFund,
    rate,
    loanId: loan.id,
    remainingBalance: Math.max(0, Number(loan.remainingBalance || loan.amount || 0) - deducted),
  };
}

export function getActiveLoan(userId, store) {
  const loans = store.loans || [];
  return loans.find(l => {
    const ownerId = l.userId || l.farmerId;
    if (ownerId !== userId) return false;
    if (LOAN_CLOSED_STATUSES.has(l.status)) return false;
    if (!LOAN_BLOCKING_STATUSES.has(l.status)) return false;
    if (l.status === 'En attente' || l.status === 'pending') return false;
    const total = Number(l.amount || 0);
    const repaid = Number(l.repaidAmount || 0);
    const remaining = Number.isFinite(Number(l.remainingBalance))
      ? Number(l.remainingBalance)
      : Math.max(0, total - repaid);
    return remaining > 0;
  });
}

export function getBlockingLoan(userId, store) {
  const loans = store.loans || [];
  return loans.find(l => {
    const ownerId = l.userId || l.farmerId;
    if (ownerId !== userId) return false;
    if (LOAN_CLOSED_STATUSES.has(l.status)) return false;
    if (!LOAN_BLOCKING_STATUSES.has(l.status)) return false;
    if (l.status === 'En attente' || l.status === 'pending') return true;
    const total = Number(l.amount || 0);
    const repaid = Number(l.repaidAmount || 0);
    const remaining = Number.isFinite(Number(l.remainingBalance))
      ? Number(l.remainingBalance)
      : Math.max(0, total - repaid);
    return remaining > 0;
  });
}

export function getMonthlyRevenue(userId, store) {
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 3600 * 1000;
  const payments = (store.payments || []).filter(
    p => p.sellerId === userId && p.status === 'Paye' && new Date(p.createdAt).getTime() > thirtyDaysAgo
  );
  return payments.reduce((sum, p) => sum + (p.amount || 0), 0);
}

export function createLoan(userId, amount, store) {
  const now = new Date().toISOString();
  const id = `loan_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const loan = {
    id,
    userId,
    farmerId: userId,
    amount,
    remainingBalance: amount,
    repaidAmount: 0,
    status: 'En cours',
    disbursedPct: 40,
    tranches: buildLoanTranches(now),
    deductions: [],
    createdAt: now,
    statusUpdatedAt: now,
    estimatedRepaymentMonths: null,
  };

  if (!store.loans) store.loans = [];
  store.loans.push(loan);

  if (!store.guaranteeFund) store.guaranteeFund = { balance: 0, transactions: [] };

  return loan;
}

function buildLoanTranches(now) {
  return [
    { id: 1, pct: 40, status: 'disbursed', label: 'Achat intrants', proofStatus: '', proofSubmittedAt: '', disbursedAt: now },
    { id: 2, pct: 30, status: 'locked', label: 'Exploitation', proofStatus: '', proofSubmittedAt: '' },
    { id: 3, pct: 30, status: 'locked', label: 'Récolte et livraison', proofStatus: '', proofSubmittedAt: '' },
  ];
}

export function applyDeduction(loanId, amount, paymentId, store) {
  const loan = (store.loans || []).find(l => l.id === loanId);
  if (!loan) return null;

  loan.remainingBalance = Math.max(0, loan.remainingBalance - amount);
  loan.repaidAmount = Math.max(Number(loan.repaidAmount || 0), Number(loan.amount || 0) - loan.remainingBalance);
  if (!Array.isArray(loan.deductions)) loan.deductions = [];
  loan.deductions.push({
    amount,
    paymentId,
    date: new Date().toISOString(),
    remainingAfter: loan.remainingBalance,
  });
  loan.statusUpdatedAt = new Date().toISOString();

  if (loan.remainingBalance <= 0) {
    loan.status = 'Remboursé';
    loan.repaidAt = new Date().toISOString();
  }

  return loan;
}

export function addToGuaranteeFund(amount, paymentId, store) {
  if (!store.guaranteeFund) store.guaranteeFund = { balance: 0, transactions: [] };
  store.guaranteeFund.balance += amount;
  store.guaranteeFund.transactions.push({
    amount,
    paymentId,
    date: new Date().toISOString(),
  });
}

export function getSolidarityGroup(userId, store) {
  const groups = store.solidarityGroups || [];
  return groups.find(g => g.members.includes(userId));
}

export function createSolidarityGroup(memberIds, store) {
  if (memberIds.length !== SOLIDARITY_GROUP_SIZE) {
    throw new Error(`Un groupe solidaire doit avoir exactement ${SOLIDARITY_GROUP_SIZE} membres`);
  }
  const id = `group_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const group = {
    id,
    members: memberIds,
    createdAt: new Date().toISOString(),
    status: 'active',
  };

  if (!store.solidarityGroups) store.solidarityGroups = [];
  store.solidarityGroups.push(group);
  return group;
}

export function getLoanSummary(userId, store) {
  const loan = getActiveLoan(userId, store);
  if (!loan) return null;

  const monthlyRevenue = getMonthlyRevenue(userId, store);
  const rate = calculateDeductionRate(monthlyRevenue);
  const monthlyDeduction = monthlyRevenue * rate;
  const monthsRemaining = monthlyDeduction > 0
    ? Math.ceil(loan.remainingBalance / monthlyDeduction)
    : null;

  return {
    loanId: loan.id,
    originalAmount: loan.amount,
    remainingBalance: loan.remainingBalance,
    percentRepaid: Math.round((1 - loan.remainingBalance / loan.amount) * 100),
    currentRate: rate,
    monthlyRevenue,
    estimatedMonthsRemaining: monthsRemaining,
    totalDeducted: (loan.deductions || []).reduce((s, d) => s + d.amount, 0),
    deductionCount: (loan.deductions || []).length,
    group: getSolidarityGroup(userId, store),
  };
}

export function getCreditSystemStats(store) {
  const loans = store.loans || [];
  const active = loans.filter(l => ['active', 'Approuvé', 'En cours'].includes(l.status));
  const repaid = loans.filter(l => ['repaid', 'Remboursé'].includes(l.status));
  const defaulted = loans.filter(l => ['defaulted', 'Défaut'].includes(l.status));
  const fund = store.guaranteeFund || { balance: 0 };

  return {
    totalLoans: loans.length,
    activeLoans: active.length,
    repaidLoans: repaid.length,
    defaultedLoans: defaulted.length,
    totalLent: loans.reduce((s, l) => s + l.amount, 0),
    totalRepaid: repaid.reduce((s, l) => s + l.amount, 0),
    defaultRate: loans.length > 0 ? (defaulted.length / loans.length * 100).toFixed(1) + '%' : '0%',
    guaranteeFundBalance: fund.balance,
    avgRepaymentMonths: repaid.length > 0
      ? (repaid.reduce((s, l) => {
          const start = new Date(l.createdAt).getTime();
          const end = new Date(l.repaidAt).getTime();
          return s + (end - start) / (30 * 24 * 3600 * 1000);
        }, 0) / repaid.length).toFixed(1)
      : null,
  };
}
