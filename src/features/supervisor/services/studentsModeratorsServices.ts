import api from "../../../lib/axios";

export const getSupervisorStudentsModerators = async () => {
    const response = await api.get('/moderator/students');
    return response.data;
}