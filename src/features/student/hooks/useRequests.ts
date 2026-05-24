import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRequest, getStudentRequest } from "../services/RequestsServices";
import { CreateRequestParams } from "../../../types/requests";
import { message } from "antd";

export const useCreateRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CreateRequestParams) => createRequest(request),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            message.success(data.message || "Request created successfully");
        }
    });
};

export const useGetStudentRequest = () => {
    return useQuery({
        queryKey: ["requests"],
        queryFn: () => getStudentRequest(),
    });
};

