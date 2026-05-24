import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createCourse, deleteCourse, getCourses, updateCourse } from "../services/Course"

export const useCourses =() =>{
    return useQuery({
        queryKey: ['courses'],
        queryFn: getCourses,
    })
}

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCourse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        }
    })
}

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: { id: string, courseData: FormData }) => updateCourse(data.id, data.courseData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        }
    })
}

export const useDeleteCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCourse(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        }
    })
}

