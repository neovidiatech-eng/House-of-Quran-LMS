
export type TransactionType = 'credit' | 'subscription' | 'debit' | 'expense' | 'payout';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  reason: string;
  createdAt: string;
  originalAmount: number;
  convertedAmount: number;
  currencyCode: string;
  exchangeRateUsed: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface WalletHistoryResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    transactions: Transaction[];
    pagination: Pagination;
  };
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'completed';
export type AuthProvider = 'local' | 'google' | 'facebook';

export interface WithdrawalTeacher {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  confirmAt: string | null;
  roleId: string;
  code_country: string;
  status: string;
  googleId: string | null;
  provider: AuthProvider;
  password?: string;
}

export interface CurrencyBody {
  name_en: string;
  name_ar: string;
  symbol: string;
  code: string;
  exchangeRate: number;
}

export interface TransactionStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  completedTransactions: number;
  pendingTransactions: number;
}

export interface TransactionStatsResponse {
  message: string;
  status: number;
  lang: string;
  data: TransactionStats;
}

export interface WithdrawalRequest {
  id: string;
  teacherId: string;
  amount: number;
  status: WithdrawalStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  teacher: WithdrawalTeacher;
}

export interface WithdrawalApiResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    withdrawals: WithdrawalRequest[];
  };
}
