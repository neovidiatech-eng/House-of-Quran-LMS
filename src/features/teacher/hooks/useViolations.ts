import { useQuery } from "@tanstack/react-query"
import { getMyViolations } from "../services/violationServices"

export const useGetMyViolations = () => {
    return useQuery({
        queryKey: ["my-violations"],
        queryFn: getMyViolations,
        
    })
}