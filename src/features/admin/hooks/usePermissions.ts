import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    getPermissions,
    addPermission,
    deletePermission,
    updatePermission
} from "../services/PermissionServices";
import { CreatePermissionPayload } from "../../../types/permission";

export const usePermissions = () => {
    return useQuery({
        queryKey: ["permissions"],
        queryFn: () => getPermissions(),
    });
};

export const useAddPermission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (permission: CreatePermissionPayload) => addPermission(permission),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
    });
};

export const useUpdatePermission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, permission }: { id: string; permission: Partial<CreatePermissionPayload> }) =>
            updatePermission({ id, permission }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
    });
};

export const useDeletePermission = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePermission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["permissions"] });
        },
    });
};