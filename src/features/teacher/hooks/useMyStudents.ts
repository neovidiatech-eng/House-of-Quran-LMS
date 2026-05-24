import { useQuery } from "@tanstack/react-query"
import { getMyStudents } from "../services/MyStusentsServices"

export const useMyStudents = () => {
    return useQuery({
        queryKey:['my-students'],
        queryFn:getMyStudents
    })
}