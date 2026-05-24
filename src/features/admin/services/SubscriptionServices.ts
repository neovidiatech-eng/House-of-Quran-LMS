import api from "../../../lib/axios";
import { SubscriptionData } from "../../../types/subscription";

export const getSubscription = async (): Promise<SubscriptionData[]> => {
    const response = await api.get("/subscription/");
    return response.data.data || response.data;
};
