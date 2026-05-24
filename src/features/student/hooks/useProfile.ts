import { useQuery } from "@tanstack/react-query"
import { getStudentDashboard, getStudentProfile } from "../services/ProfileServices"
import { StudentProfileResponse } from "../../../types/profile"

export const useProfile = () => {
    return useQuery<StudentProfileResponse>({
        queryKey: ["profile"],
        queryFn: getStudentProfile,
    })
}

export const useStudentDashboard = () =>{
    return useQuery({
    queryKey:["dashoard"],
    queryFn:getStudentDashboard
    })
}