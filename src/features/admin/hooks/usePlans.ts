import { useQuery } from "@tanstack/react-query";
import { getPlans } from "../services/PlansServices";
import { Plan } from "../../../types/plan";

export const usePlans = () => {
    return useQuery<Plan[]>({
        queryKey: ['plans'],
        queryFn: getPlans,
    })
}