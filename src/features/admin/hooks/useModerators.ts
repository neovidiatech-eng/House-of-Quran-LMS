import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query"
import { acceptModeratorRequest, changeModeratorStatus, deleteModerator, getModeratorRequests, rejectModeratorRequest, updateModerator } from "../services/ModerarorsServices"
import { getModeratorById } from "../services/ModeratorServices"
import { ChangeModeratorStatusInput, UpdateModeratorInput } from "../../../types/moderator"

export const useModeratorsRequests = () => {
    return useQuery({
        queryKey: ['moderator-requests'],
        queryFn: () => getModeratorRequests(),
    })
}

export const useAcceptModeratorRequest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ userId, studentIds }: { userId: string; studentIds?: string[] }) =>
            acceptModeratorRequest(userId, studentIds ?? []),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderator-requests'] })
        }
    })
}

export const useRejectModeratorRequest = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (userId: string) => rejectModeratorRequest(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderator-requests'] })
        }
    })
}

export const useGetModeratorById = (moderatorId: string) => {
    return useQuery({
        queryKey: ['moderator', moderatorId],
        queryFn: () => getModeratorById(moderatorId),
        enabled: !!moderatorId,
    })
}

export const useUpdateModerator = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ moderatorId, data }: { moderatorId: string, data: UpdateModeratorInput }) => updateModerator(moderatorId, data),
        onSuccess: (_, { moderatorId }) => {
            queryClient.invalidateQueries({ queryKey: ['moderator', moderatorId] })
        }
    })
}

export const useDeleteModerator = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (moderatorId: string) => deleteModerator(moderatorId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderator-requests'] })
        }
    })
}

export const useChangeModeratorStatus = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (payload: ChangeModeratorStatusInput) => changeModeratorStatus(payload),
        onSuccess: (_, payload) => {
            queryClient.invalidateQueries({ queryKey: ['moderator', payload.id] })
        }
    })
}