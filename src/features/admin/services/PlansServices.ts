import api from "../../../lib/axios";
import {PlanBody } from "../../../types/plan";

// get plans
export const getPlans = async (): Promise<any[]> => {
  try {
    const response = await api.get("/subscription/plans");
    return response.data.data;
  } catch (error) {
    console.error("Get plans failed:", error);
    throw error;
  }
};

// create plan
export const createPlan = async (data: PlanBody) => {
  try {
    const response = await api.post("/subscription/plans", data);
    return response.data;
  } catch (error) {
    console.error("Create plan failed:", error);
    throw error;
  }
};

//delete plans
export const deletePlans = async (id: string) => {
  try {
    const res = await api.delete(`/subscription/plans/${id}`);
    return res.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// update plan
export const updatePlan = async (id: string, data: Partial<PlanBody>) => {
  try {
    const res = await api.patch(`/subscription/plans/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Update plan failed:", error);
    throw error;
  }
};


