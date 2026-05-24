import { useQuery } from "@tanstack/react-query"
import { getStudentAgenda } from "../services/AgendaServices"

export const useStudentAgenda = (startDate: string, endDate: string) => {
    return useQuery({
        queryKey: ['student-agenda', startDate, endDate],
        queryFn: () => getStudentAgenda(startDate, endDate),
    })
}