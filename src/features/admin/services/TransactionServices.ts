import api from "../../../lib/axios"
import {
    TransactionStats,
    TransactionStatsResponse,
    WalletHistoryResponse,
    WithdrawalApiResponse,
} from "../../../types/transaction";

interface TransactionFilters {
    search?: string;
    status?: string;
    type?: string;
    month_start?: string;
    month_end?: string;
}

export const getTransactions = async (
    currencyId: string,
    page: number = 1,
    limit: number = 20,
    filters: TransactionFilters = {},
): Promise<WalletHistoryResponse> => {
    const response = await api.get("/transactions/", {
        params: {
            currencyId,
            page,
            limit,
            search: filters.search || undefined,
            status: filters.status && filters.status !== "all" ? filters.status : undefined,
            type: filters.type && filters.type !== "all" ? filters.type : undefined,
            month_start: filters.month_start || undefined,
            month_end: filters.month_end || undefined,
        },
    });
    return response.data;
}

export const getTransactionStats = async (
    currencyId: string,
    month_start: string,
    month_end: string,
): Promise<TransactionStats> => {
    const response = await api.get<TransactionStatsResponse>("/transactions/stats", {
        params: {
            currencyId,
            month_start,
            month_end,
        },
    });
    return response.data.data;
}

export const getAllWithdrawals = async (): Promise<WithdrawalApiResponse> => {
    const response = await api.get("/withdrawals/all");
    return response.data;
}

export const updateWithdrawalStatus = async (
    id: string,
    status: 'approve' | 'reject',
    adminNotes?: string,
): Promise<any> => {
    const body = adminNotes ? { adminNotes } : {};
    const response = await api.patch(`/withdrawals/${id}/${status}`, body);
    return response.data;
}

export const zeroing = async () => {
    const response = await api.get('/transactions/zero');
    return response.data;
}


