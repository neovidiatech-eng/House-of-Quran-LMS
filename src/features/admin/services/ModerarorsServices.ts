import api from "../../../lib/axios"
import {
    ChangeModeratorStatusInput,
    ModeratorRequest,
    ModeratorRequestsResponse,
    SingleModeratorResponse,
    UpdateModeratorInput,
} from "../../../types/moderator"


export const getModeratorRequests = async (): Promise<ModeratorRequestsResponse> => {
    const response = await api.get('/moderator/requests')
    return response.data
}

export const acceptModeratorRequest = async (userId: string, studentIds: string[] = []): Promise<ModeratorRequest> => {
    const response = await api.patch(`/moderator/requests/${userId}/approve`, { studentIds })
    return response.data
}

export const rejectModeratorRequest = async (userId: string): Promise<ModeratorRequest> => {
    const response = await api.delete(`/moderator/requests/${userId}/reject`)
    return response.data
}

export const getModeratorById = async (moderatorId: string): Promise<SingleModeratorResponse> => {
    const response = await api.get(`/moderator/${moderatorId}`)
    return response.data
}

// PUT /moderator/:moderatorId — Update Moderator (name, status, …)
export const updateModerator = async (
    moderatorId: string,
    data: UpdateModeratorInput
): Promise<SingleModeratorResponse> => {
    const response = await api.put(`/moderator/${moderatorId}`, data)
    return response.data
}

// DELETE /moderator/:moderatorId — Delete Moderator
export const deleteModerator = async (moderatorId: string): Promise<void> => {
    await api.delete(`/moderator/${moderatorId}`)
}

// PATCH /moderator/change-status — Change Moderator Status (Active / Inactive)
export const changeModeratorStatus = async (
    payload: ChangeModeratorStatusInput
): Promise<SingleModeratorResponse> => {
    const response = await api.patch('/moderator/change-status', payload)
    return response.data
}
