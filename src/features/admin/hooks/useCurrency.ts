import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addCurrency, deleteCurrency, getCurrencies, getCurrencyById, searchCurrency, updateCurrency } from "../services/CurrencyServices"
import { CurrenciesData, Currency } from "../../../types/currency";

export const useCurrency = (search?: string) => {
    return useQuery<CurrenciesData>({
        queryKey: ["currencies", search],
        queryFn: () => search ? searchCurrency(search) : getCurrencies(),
    });
}
export const useCurrencyById = (id: string | undefined) => {
    return useQuery({
        queryKey: ["currencies", id],
        queryFn: () => getCurrencyById(id!),
        enabled: !!id,
    });
}

export const useAddCurrency = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addCurrency,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currencies"] })
        },
    })
}
export const useUpdateCurrency = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Currency> }) =>
            updateCurrency(id, data),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currencies"] });
        },
        onError: (error) => {
            console.error("Update failed:", error);
        }
    });
};

export const useDeleteCurrency = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCurrency,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currencies"] })
        },
    })
}
