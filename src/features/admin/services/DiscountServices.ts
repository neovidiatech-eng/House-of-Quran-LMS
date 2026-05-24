import api from "../../../lib/axios";

export interface LateDiscountRulesResponse {
  message: string;
  status: number;
  lang: string;
  data: {
    lateDiscountRules: LateDiscountRule[];
  };
}

export interface LateDiscountRule {
  lateMinutes: number;
  discountPercentage: number;
}

export const getLateDiscountRules = async (): Promise<LateDiscountRule[]> => {
    const response = await api.get<LateDiscountRulesResponse>('/settings/late-discount');
    return response.data.data.lateDiscountRules;
}

export const addLateDiscountRule = async (rule: LateDiscountRule): Promise<void> => {
  const response = await api.patch('/settings/late-discount', rule);
  return response.data;
}