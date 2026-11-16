import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllRanks,
  createRank,
  assignRankToStudent,
  updateRank,
  deleteRank,
} from "../services/RankServices";
import {
  GetRanksParams,
  CreateRankPayload,
  AssignRankPayload,
  UpdateRankPayload,
} from "../../../types/rank";

export const useRanks = (params?: GetRanksParams) => {
  return useQuery({
    queryKey: ['ranks', params],
    queryFn: () => getAllRanks(params),
  });
};

export const useCreateRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRankPayload) => createRank(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] });
    },
  });
};

export const useAssignRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignRankPayload) => assignRankToStudent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

export const useUpdateRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRankPayload }) =>
      updateRank(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] });
    },
  });
};

export const useDeleteRank = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ranks'] });
    },
  });
};
