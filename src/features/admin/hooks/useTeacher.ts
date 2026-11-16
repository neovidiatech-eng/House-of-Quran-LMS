import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createTeacher, deleteTeacher, getTeacher, GetTeachersParams, getTeacherById, searchTeacher, updateTeacher, getTeacherStudentsForAdmin, assignStudentHourPrice } from "../services/TeacherServices"
import { CreateTeacherInput, TeachersData, UpdateTeacherInput } from "../../../types/teachers"
import { message } from "antd"

export const useTeacher = (paramsOrSearch?: string | GetTeachersParams) => {
    const isString = typeof paramsOrSearch === 'string';
    const search = isString ? paramsOrSearch : undefined;
    const params = isString ? undefined : paramsOrSearch;
    return useQuery<TeachersData>({
        queryKey: ["teachers", paramsOrSearch],
        queryFn: () => search ? searchTeacher(search) : getTeacher(params),
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

export const useTeacherStudentsForAdmin = (teacherId?: string) => {
    return useQuery({
        queryKey: ["teacher-students", teacherId],
        queryFn: () => getTeacherStudentsForAdmin(teacherId!),
        enabled: !!teacherId,
    })
}

export const useAssignStudentHourPrice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ teacherId, studentId, hour_price }: { teacherId: string, studentId: string, hour_price: number | string }) => assignStudentHourPrice(teacherId, studentId, hour_price),
        onSuccess: (data: any, variables) => {
            queryClient.invalidateQueries({ queryKey: ["teacher-students", variables.teacherId] });
            queryClient.invalidateQueries({ queryKey: ["teachers", variables.teacherId] });
            message.success(data.message || 'Hour Price Assigned Successfully');
        }
    });
}
