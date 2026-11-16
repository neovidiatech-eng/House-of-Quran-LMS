import {useQuery} from "@tanstack/react-query";
import {fetchCitiesByCountry} from "../services/TeacherRegister";

export function useGetCities(countryCode:string){
    return useQuery({
        queryKey:["cities" ,countryCode],
        queryFn:()=>fetchCitiesByCountry(countryCode),
        enabled:!!countryCode,
        
    })
}