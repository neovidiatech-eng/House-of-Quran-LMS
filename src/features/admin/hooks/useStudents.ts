import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createStudent, deleteStudent, getStudentById, getStudents, GetStudentsParams, updateStudent } from "../services/StudentServices";
import { Student } from "../../../types/student";
import { StudentFormData } from "../../../lib/schemas/StudentSchema";
import { message } from "antd";

export const useStudents = (params: GetStudentsParams = {}) => {
    return useQuery({
        queryKey: ["students", params],
        queryFn: () => getStudents(params),
    });
}
export const useStudentById = (id?: string) => {
    return useQuery({
        queryKey: ["student", id],
        queryFn: () => getStudentById(id as string),
        enabled: !!id,
    });
}
export const useUpdateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: StudentFormData | Partial<Student> }) => updateStudent(id, data),
        onSuccess: (data: any, variables) => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["student", variables.id] });
            message.success(data.message || 'Student Updated Successfully');
        }
    });
}
export const useDeleteStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteStudent(id),
        onSuccess: (data: any, id) => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            queryClient.invalidateQueries({ queryKey: ["student", id] });
            message.success(data.message || 'Student Deleted Successfully');
        }
    });
}
export const useCreateStudent = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: StudentFormData | Partial<Student>) => createStudent(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            message.success(data.message || 'Student Added Successfully');
        }
    });
}
