import api from "../../../lib/axios";

export const getSupervisorViolations = async () => {
    const response = await api.get('/violations/moderator/me');
    return response.data;
}