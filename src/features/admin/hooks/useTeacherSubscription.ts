import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeacherSubscriptionRequests,
  approveTeacherSubscriptionRequest,
  rejectTeacherSubscriptionRequest,
} from '../services/teacherSubscriptionServices';
import { ApproveTeacherRequestBody } from '../../../types/teacherSubscription';

export const useTeacherSubscriptionRequests = () => {
  return useQuery({
    queryKey: ['teacher-subscription-requests'],
    queryFn: getTeacherSubscriptionRequests,
  });
};

export const useApproveTeacherSubscriptionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApproveTeacherRequestBody }) =>
      approveTeacherSubscriptionRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-subscription-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

export const useRejectTeacherSubscriptionRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rejectTeacherSubscriptionRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-subscription-requests'] });
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};
