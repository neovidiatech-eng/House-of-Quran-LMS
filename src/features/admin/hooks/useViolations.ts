import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getViolations, createViolation, issueViolation, getTeacherViolationsHistory, getAllViolationsHistory, deleteViolationItem, getModeratorViolations, createModeratorViolations, deleteModeratorViolation } from "../services/ViolationsServices"
import { CreateViolationPayload, IssueViolationPayload, ViolationType } from "../../../types/Violations"
import { IssueModeratorViolationPayload } from "../../../types/moderatorViolations"

export const useViolations = () => {
    return useQuery({
        queryKey: ['violations'],
        queryFn: getViolations,
    })
}

export const useTeacherViolationsHistory = (teacherId: string | undefined) => {
    return useQuery({
        queryKey: ['teacher-violations-history', teacherId],
        queryFn: () => getTeacherViolationsHistory(teacherId!),
        enabled: !!teacherId,
    })
}

export const useAllViolationsHistory = (page: number, limit: number, type?: ViolationType) => {
    return useQuery({
        queryKey: ['all-violations-history', page, limit, type],
        queryFn: () => getAllViolationsHistory(page, limit, type),
    })
}

export const useCreateViolation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateViolationPayload) => createViolation(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['violations'] });
        },
    });
};

export const useIssueViolation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: IssueViolationPayload) => issueViolation(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['violations'] });
            queryClient.invalidateQueries({ queryKey: ['issued-violations'] });
            queryClient.invalidateQueries({ queryKey: ['teacher-violations-history'] });
        },
    });
};

export const useDeleteViolationItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteViolationItem(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['violations'] });
        },
    });
};


export const useGetModeratorViolations = () =>{
    return useQuery({
        queryKey:['moderator-violations'],
        queryFn: getModeratorViolations,
    })
}

export const useCreateModeratorViolations = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: IssueModeratorViolationPayload) => createModeratorViolations(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderator-violations'] });
        },
    });
};

export const useDeleteModeratorViolation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteModeratorViolation(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['moderator-violations'] });
        },
    });
};
