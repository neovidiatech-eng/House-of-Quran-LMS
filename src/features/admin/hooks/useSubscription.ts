import { useQuery } from "@tanstack/react-query"
import { getSubscription } from "../services/SubscriptionServices";

export const useSubscription = () => {
    return useQuery({
        queryKey: ["subscription"],
        queryFn: getSubscription,
    });
}