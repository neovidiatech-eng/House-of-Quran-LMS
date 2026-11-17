import api from "../../../lib/axios";

export interface Subject {
    name: string;
    code: string;
}

export interface StudentData {
    id?: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    sessions: string;
    hour_price: number,
    session_price: number,
    plan: string,
    session_duration_minutes:number
}

export interface StudentListResponse {
    message: string;
    status: number;
    lang: string;
    data: StudentData[];
}

export const getMyStudents = async () => {
    const response = await api.get<StudentListResponse>("/teachers/my-students");
    return response.data;
}