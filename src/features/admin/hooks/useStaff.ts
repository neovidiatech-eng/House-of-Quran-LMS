import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getStaff,
    addStaff,
    deleteStaff,
    updateStaff,
    searchStaff,
    getStaffbyId
} from "../services/StaffServices";
import { CreateStaffPayload, UpdateStaffPayload } from "../../../types/sttuf";
import { message } from "antd";

export const useStaff = (search: string = "") => {
    return useQuery({
        queryKey: ["staff", search],
        queryFn: () => search ? searchStaff(search) : getStaff(),
    });
};

export const useStaffById = (id: string) => {
    return useQuery({
        queryKey: ["staff", id],
        queryFn: () => getStaffbyId(id)
    })
}

export const useAddStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (staff: CreateStaffPayload) => addStaff(staff),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            message.success(data.message || 'Staff Added Successfully');
        },
    });
};

export const useUpdateStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, staff }: { id: string; staff: UpdateStaffPayload }) =>
            updateStaff({ id, staff }),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            message.success(data.message || 'Staff Updated Successfully');
        },
    });
};

export const useDeleteStaff = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteStaff(id),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            message.success(data.message || 'Staff Deleted Successfully');
        },
    });
};

