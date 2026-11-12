import api from "../../../lib/axios";

export interface LateDiscountRulesResponse {
  message: string;
  status: number;
  lang: string;
  data:StudentAttendance
}

// export interface LateDiscountRule {
//   lateMinutes: number;
//   discountPercentage: number;
// }

export interface StudentAttendance{
    paidSessionCount:number;
    studentCanJoin:boolean;
}

export const getStudenAttendance = async (): Promise<StudentAttendance> => {
    const response = await api.get<StudentAttendance>('/settings/');
    return response.data;
}

export const addStudentAttendance = async (studentAttendance: StudentAttendance): Promise<void> => {
  const response = await api.patch('/settings/', studentAttendance);
  return response.data;
}

