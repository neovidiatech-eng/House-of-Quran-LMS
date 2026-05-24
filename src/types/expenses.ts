export interface Currency {
  id: string;
  name_en: string;
  name_ar: string;
  symbol: string;
  code: string;
  default: boolean;
  createdAt: string;
  updatedAt: string;
  exchangeRate: number;
}

export interface Expense {
  id: string;
  title: string;
  currencyId: string;
  amount: number;
  payment_type: string;
  type: "salary" | "amenities" | "general" | "management" | "marketing" | "Monthly" | "other" | string;
  status: "paid" | "pending" | "failed" | string;
  date: string;
  createdAt: string;
  updatedAt: string;
  currency: Currency;
  originalAmount: number;
  originalCurrency: Currency;
  convertedAmount: number;
  exchangeRate: number;
  convertedCurrency: Currency;
}

export interface ExpensesPagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ExpensesData {
  totalExpenses: number;
  expenses: Expense[];
  pagination: ExpensesPagination;
}

export interface ExpensesResponse {
  message: string;
  status: number;
  lang: string;
  data: ExpensesData;
}

export interface CreateExpenseDto {
  title: string;
  currencyId: string;
  amount: number;
  payment_type: string;
  type: string;
  status: string;
  date: string;
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> { }