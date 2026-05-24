import api from "../../../lib/axios";
import { AgendaResponse } from "../../../types/Agenda";

export const getStudentAgenda = async (startDate: string, endDate: string) => {
    const response = await api.get(`/calendar/student?startDate=${startDate}&endDate=${endDate}`)
    return response.data as AgendaResponse;
}
