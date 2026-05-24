import { useQuery } from "@tanstack/react-query"
import { getTeacherAgenda } from "../services/TeacherAgendeServices"

export const useTeacherAgenda = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ['teacher-agenda', startDate, endDate],
        queryFn: () => getTeacherAgenda(startDate, endDate),
    })
}