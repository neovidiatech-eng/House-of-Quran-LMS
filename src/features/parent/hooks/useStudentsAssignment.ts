import { useQuery } from "@tanstack/react-query"
import { getAssignments } from "../services/AssignmentsStudentsServices"
import { AssignmentsResponse } from "../../../types/assignment"

export const useGetAssignments = () => {
    return useQuery<AssignmentsResponse>({
        queryKey: ["assignments"],
        queryFn: getAssignments,
    })
}