import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTeacher, deleteTeacher, getTeacher, getTeacherById, searchTeacher, updateTeacher } from "../services/TeacherServices"
import { CreateTeacherInput , TeachersData, UpdateTeacherInput } from "../../../types/teachers"
import { message } from "antd"

export const useTeacher = (search?: string) => {
    return useQuery<TeachersData>({
        queryKey: ["teachers", search],
        queryFn: () => search ? searchTeacher(search) : getTeacher(),
    })
}
export const useTeacherById = (id?: string) => {
    return useQuery({
        queryKey: ["teachers", id],
        queryFn: () => getTeacherById(id!),
        enabled: !!id,
    })
}
export const useUpdateTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTeacherInput }) => updateTeacher(id, data),
        onSuccess: (data: any, variables) => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teachers", variables.id] });
            message.success(data.message || 'Teacher Updated Successfully');
        }
    });
}

export const useDeleteTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTeacher(id),
        onSuccess: (data: any, id) => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            queryClient.invalidateQueries({ queryKey: ["teachers", id] });
            message.success(data.message || 'Teacher Deleted Successfully');
        }
    });
}

export const useCreateTeacher = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateTeacherInput) => createTeacher(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            message.success(data.message || 'Teacher Added Successfully');
        }
    });
}

