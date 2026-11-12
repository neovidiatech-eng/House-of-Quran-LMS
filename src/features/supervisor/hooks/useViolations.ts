import { useQuery } from "@tanstack/react-query"
import { getSupervisorViolations } from "../services/violationServices"

export const useViolations = () => {
    return useQuery({
        queryKey: ['supervisor-violations'],
        queryFn: getSupervisorViolations
    })
}