import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDailyQuranRecitation,
  deleteDailyQuranRecitation,
  getDailyQuranRecitationById,
  getDailyQuranRecitations,
  updateDailyQuranRecitation,
  UpdateDailyQuranPayload,
} from "../services/DailyQuranServices";

export const useDailyQuranRecitations = () => {
  return useQuery({
    queryKey: ["daily-quran-recitations"],
    queryFn: getDailyQuranRecitations,
  });
};

export const useDailyQuranRecitationById = (id: string, enabled: boolean) => {
  return useQuery({
    queryKey: ["daily-quran-recitation", id],
    queryFn: () => getDailyQuranRecitationById(id),
    enabled,
  });
};

export const useCreateDailyQuranRecitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDailyQuranRecitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-quran-recitations"] });
    },
  });
};

export const useUpdateDailyQuranRecitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateDailyQuranPayload }) =>
      updateDailyQuranRecitation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-quran-recitations"] });
    },
  });
};

export const useDeleteDailyQuranRecitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDailyQuranRecitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-quran-recitations"] });
    },
  });
};
