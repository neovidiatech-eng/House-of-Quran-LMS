import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRequests, changeRequestStatus } from "../services/RequestsServices";
import { message } from "antd";

export const useRequests = () => {
    return useQuery({
        queryKey: ["requests"],
        queryFn: () => getRequests(),
    });
};

export const useChangeRequestStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status, adminNotes }: { id: string; status: "approve" | "reject", adminNotes: string }) =>
            changeRequestStatus(id, status, adminNotes),

        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["requests"] });
            message.success(data.message || "Request status updated successfully");
        }
    });
};

