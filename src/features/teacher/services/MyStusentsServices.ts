import api from "../../../lib/axios";

export interface Subject {
    name: string;
    code: string;
}

export interface StudentData {
    studentId?: string; // Made optional just in case
    id?: string;
    user_id?: string;
    userId?: string;
    user?: { id: string };
    name: string;
    code: string;
    email: string;
    phone: string;
    subject: Subject;
    sessions: string;
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