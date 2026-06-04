import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getAssignments, deleteAssignment, createAssignment, updateAssignment, getAssignmentById } from "../services/AssignmentServices"
import { Assignment } from "../types/assignment"
import { message } from "antd"

export const useGetAssignments = () => {
    return useQuery({
        queryKey: ["assignments"],
        queryFn: getAssignments,
    })
}

export const useGetAssignmentById = (id: string) => {
    return useQuery({
        queryKey: ["assignment", id],
        queryFn: () => getAssignmentById(id),
    })
}

export const useGetStudents = () => {
    return useQuery({
        queryKey: ["students"],
        queryFn: async () => {
            const { getStudents } = await import("../features/admin/services/StudentServices");
            return getStudents();
        },
    })
}

export const useGetSubjects = () => {
    return useQuery({
        queryKey: ["subjects"],
        queryFn: async () => {
            const { getSubjects } = await import("../features/admin/services/SubjectsServices");
            return getSubjects();
        },
    })
}

export const useDeleteAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAssignment,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            message.success(data.message || "Assignment deleted successfully");
        }
    });
};

export const useCreateAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAssignment,
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            message.success(data.message || "Assignment created successfully");
        },
        onError: (error: any) => {    
        const errorMessage = error.response?.data?.message || error.message || "An error occurred while creating the assignment";
        console.log(errorMessage);
        
        }
    });
};

export const useUpdateAssignment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: { id: string } & Partial<Assignment>) => updateAssignment(id, data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            message.success(data.message || "Assignment updated successfully");
        }
    });
};

