import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ExpenseService } from "../services/ExpenseService";
import { CreateExpenseDto, UpdateExpenseDto } from "../../../types/expenses";

export const useExpenses = (
  currencyCode?: string,
  page: number = 1,
  limit: number = 10,
  filters: {
    search?: string;
    fromDate?: string;
    toDate?: string;
  } = {},
) => {
  return useQuery({
    queryKey: ["expenses", currencyCode, page, limit, filters],
    queryFn: () => ExpenseService.getExpenses(currencyCode, page, limit, filters),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseDto) => ExpenseService.createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseDto }) =>
      ExpenseService.updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ExpenseService.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useExpenseById = (id?: string) => {
  return useQuery({
    queryKey: ["expense", id],
    queryFn: () => ExpenseService.getExpenseById(id as string),
    enabled: !!id,
  });
};
