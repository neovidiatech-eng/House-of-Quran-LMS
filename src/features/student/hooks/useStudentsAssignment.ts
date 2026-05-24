import { useQuery } from "@tanstack/react-query"
import { getAssignments } from "../services/AssignmentsStudentsServices"
import { HomeworkResponse } from "../../../types/assignment"

export const useGetAssignments = () => {
    return useQuery<HomeworkResponse>({
        queryKey: ["assignments"],
        queryFn: getAssignments,
    })
}