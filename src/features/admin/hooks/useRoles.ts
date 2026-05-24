import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPermissionsToRole, addRole, deleteRole, getRoles, revokePermissionsToRole, searchRoles, updateRole } from "../services/RolesServices";

export const useRoles = () => {
    return useQuery({
        queryKey: ["roles"],
        queryFn: getRoles,
    });
}


export const useSearchRoles = (search: string) => {
    return useQuery({
        queryKey: ["roles", search],
        queryFn: () => searchRoles(search),
        enabled: true
    });
}

export const useAddRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });

}

export const useUpdateRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

export const useAddPermissionsToRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addPermissionsToRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

export const useRevokePermissionsToRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: revokePermissionsToRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });
}

export const useDeleteRole = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteRole,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["roles"] });
        },
    });

}       