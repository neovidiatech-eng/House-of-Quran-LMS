import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createModerator,
    deleteModerator,
    getAllModerators,
    getModeratorById,
    updateModerator
} from "../services/ModeratorServices";
import { CreateModeratorInput, GetModeratorsParams, UpdateModeratorInput } from "../../../types/moderator";
import { message } from "antd";

export const useAllModerators = (params: GetModeratorsParams = {}) => {
    return useQuery({
        queryKey: ["moderators", params],
        queryFn: () => getAllModerators(params),
    });
};

export const useModeratorById = (id?: string) => {
    return useQuery({
        queryKey: ["moderator", id],
        queryFn: () => getModeratorById(id as string),
        enabled: !!id,
    });
};

export const useCreateModerator = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateModeratorInput) => createModerator(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["moderators"] });
            message.success(data?.message || "Moderator added successfully");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to create moderator";
            message.error(errorMessage);
        },
    });
};

export const useUpdateModerator = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateModeratorInput }) => updateModerator({ id, data }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["moderators"] });
            message.success(data?.message || "Moderator updated successfully");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to update moderator";
            message.error(errorMessage);
        },
    });
};

export const useDeleteModerator = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteModerator(id),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["moderators"] });
            message.success(data?.message || "Moderator deleted successfully");
        },
        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to delete moderator";
            message.error(errorMessage);
        },
    });
};