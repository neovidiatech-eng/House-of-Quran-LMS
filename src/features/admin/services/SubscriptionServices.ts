import api from "../../../lib/axios";
import { SubscriptionData } from "../../../types/subscription";

export const getSubscription = async (): Promise<SubscriptionData[]> => {
    const response = await api.get("/subscription/");
    return response.data.data || response.data;
};


export const renewSubscription = async ( studentId: string, plan_id: string) => {
  const response = await api.post( `/subscription/renew/${studentId}`,{plan_id});
  return response.data;
};