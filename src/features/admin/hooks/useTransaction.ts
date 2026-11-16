import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllWithdrawals, getTransactions, getTransactionStats, updateWithdrawalStatus, zeroing } from "../services/TransactionServices"

export const useTransactions = (
    currencyId: string,
    page: number = 1,
    limit: number = 20,
    filters: {
        search?: string;
        status?: string;
        type?: string;
        month_start?: string;
        month_end?: string;
    } = {},
    enabled: boolean = true,
) => {
    return useQuery({
        queryKey: ["transactions", currencyId, page, limit, filters],
        queryFn: () => getTransactions(currencyId, page, limit, filters),
        enabled: !!currencyId && enabled,
    })
}

export const useTransactionStats = (currencyId: string, month_start: string, month_end: string) => {
    return useQuery({
        queryKey: ["transaction-stats", currencyId, month_start, month_end],
        queryFn: () => getTransactionStats(currencyId, month_start, month_end),
        enabled: !!currencyId,
    })
}

export const useWithdrawals = () => {
    return useQuery({
        queryKey: ["withdrawals"],
        queryFn: getAllWithdrawals,
    })
}

export const useUpdateWithdrawal = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, adminNotes }: { id: string; status: 'approve' | 'reject'; adminNotes?: string }) =>
            updateWithdrawalStatus(id, status, adminNotes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
        },
    });
}

export const useZeroing = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: zeroing,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["transaction-stats"] });
        },
    });
}
