import { useQuery } from "@tanstack/react-query"
import { getSupervisorStudentsModerators } from "../services/studentsModeratorsServices"

export const useStudentsModerators = (options?: any) => {
    return useQuery<any, any>({
        queryKey: ['supervisor-students-moderators'],
        queryFn: getSupervisorStudentsModerators,
        ...options
    })
}