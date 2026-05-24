import { useQuery } from '@tanstack/react-query';
import { getParentChildren } from '../services/parentServices';
import { ParentChildrenResponse } from '../../../types/parent';

export const useParentChildren = () => {
  return useQuery<ParentChildrenResponse, Error>({
    queryKey: ['parent-children'],
    queryFn: getParentChildren,
  });
};
