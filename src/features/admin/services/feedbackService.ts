import api from "../../../lib/axios";
import { FeedbackResponse } from "../../../types/feedback";


export const getFeedback = async(page:number, limit:number, search?:string):Promise<FeedbackResponse>=>{
    const params: any = { page, limit };
    if (search) params.search = search;
    const response = await api.get<FeedbackResponse>('/feedback/', { params });
    return response.data;
}