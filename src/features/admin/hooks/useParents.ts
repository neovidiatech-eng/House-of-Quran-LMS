import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createParent, deleteParent, getAllParents, getParentById, updateParentStatus } from '../services/parentServices';
import { ParentFormData } from '../../../lib/schemas/ParentSchema';
import { Parent } from '../../../types/parentsAdmin';

export const useCreateParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParentFormData) => createParent(data),
    onSuccess: () => {
      // Invalidate the parents list query so it refetches
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
};

export const useGetParents = () =>{
  return useQuery({
    queryKey: ['parents'],
    queryFn: getAllParents
  })
}

export const useUpdateParentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, data }: { parentId: string; data: Parent }) => updateParentStatus(parentId, data),
    onSuccess: () => {
      // Invalidate the parents list query so it refetches
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    }
  });
};

  export const useDeleteParent = () => {
    const queryClient = useQueryClient();
  
    return useMutation({
      mutationFn: (parentId: string) => deleteParent(parentId),
      onSuccess: () => {
        // Invalidate the parents list query so it refetches
        queryClient.invalidateQueries({ queryKey: ['parents'] });
      } 
    });
  }

  export const useGetParentById = (parentId: string) => {
    return useQuery({
      queryKey: ['parent', parentId],
      queryFn: () => getParentById(parentId)
    })
  }