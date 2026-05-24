import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAllWithdrawals, getTransactions, getTransactionStats, updateWithdrawalStatus } from "../services/TransactionServices"

export const useTransactions = (
    currencyId: string,
    page: number = 1,
    limit: number = 20,
    filters: {
        search?: string;
        status?: string;
        type?: string;
        fromDate?: string;
        toDate?: string;
    } = {},
) => {
    return useQuery({
        queryKey: ["transactions", currencyId, page, limit, filters],
        queryFn: () => getTransactions(currencyId, page, limit, filters),
        enabled: !!currencyId,
    })
}

export const useTransactionStats = (currencyId: string) => {
    return useQuery({
        queryKey: ["transaction-stats", currencyId],
        queryFn: () => getTransactionStats(currencyId),
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
