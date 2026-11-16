import { useQuery } from "@tanstack/react-query";
import { getFeedback } from "../services/feedbackService";


export const useFeedback=(page:number, limit:number, search?:string)=>{
    return useQuery({
        queryKey:['feedback', page, limit, search],
        queryFn:()=>getFeedback(page, limit, search),
    })
}