import api from "../../../lib/axios";
import { ViolationsResponse } from "../../../types/Violations";

export const getMyViolations = async () : Promise<ViolationsResponse> =>{
    const response = await api.get(`/violations/me`);
    return response.data;
}
    