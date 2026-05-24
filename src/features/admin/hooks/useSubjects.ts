import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addSubject, deleteSubject, getSubjects, searchSubject, updateSubject } from "../services/SubjectsServices"
import { Subject } from "../../../types/subject";

export const useSubjects = () => {
    return useQuery({
        queryKey: ["subjects"],
        queryFn: () => getSubjects(),
    });
};

export const useSearchSubject = (search: string) => {
    return useQuery({
        queryKey: ["subjects", search],
        queryFn: () => searchSubject(search),
    });
};

export const useAddSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addSubject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });
};

export const useUpdateSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string, data: Partial<Subject> }) => updateSubject(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });
};

export const useDeleteSubject = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSubject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
        },
    });
};