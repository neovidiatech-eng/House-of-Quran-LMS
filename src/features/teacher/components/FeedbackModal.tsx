import { Modal, Rate, Button, Switch } from 'antd';
import { Star, MessageSquare, UserCheck, ShieldCheck } from 'lucide-react';
import { SendReviewSchedulePayload } from '../../../types/scheduales';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFeedbackSchema, FeedbackFormData } from '../../../lib/schemas/FeedbackSchema';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSendReview } from '../hooks/useTeacherRequest';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle: string;
}

export default function FeedbackModal({ visible, onClose, sessionId, sessionTitle }: FeedbackModalProps) {
  const { t } = useLanguage();
  const { mutate: sendReview, isPending } = useSendReview();

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FeedbackFormData>({
    resolver: zodResolver(getFeedbackSchema(t)) as Resolver<FeedbackFormData>,
    defaultValues: {
      rating: 5,
      teacherAttended: true,
      studentAttended: true,
      comment: '',
    }
  });

  const onSubmit = (values: FeedbackFormData) => {
    const feedbackData: SendReviewSchedulePayload = {
      comment: values.comment,
      rating: values.rating,
      teacherAttended: values.teacherAttended,
      studentAttended: values.studentAttended,
    };

    sendReview({ id: sessionId, data: feedbackData }, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3 pb-3 border-b border-gray-50">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-blue-600">
            <Star size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Session Feedback</h3>
            <p className="text-xs font-medium text-slate-400">Share your feedback for: {sessionTitle}</p>
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={480}
      className="premium-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 text-start">
        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-8 flex flex-col items-center gap-4">
          <span className="text-sm font-bold text-slate-600 uppercase tracking-widest">Rate the Session</span>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Rate
                value={field.value}
                onChange={field.onChange}
                className="text-3xl text-amber-400"
              />
            )}
          />
          {errors.rating && <p className="text-red-500 text-[10px] font-black uppercase">{errors.rating.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-500 bg-primary-50 p-2 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700">Teacher Attended</span>
            </div>
            <Controller
              name="teacherAttended"
              control={control}
              render={({ field }) => (
                <Switch size="small" checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-emerald-500 bg-emerald-50 p-2 rounded-lg">
                <UserCheck size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700">Student Attended</span>
            </div>
            <Controller
              name="studentAttended"
              control={control}
              render={({ field }) => (
                <Switch size="small" checked={field.value} onChange={field.onChange} />
              )}
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 mb-2">
            <MessageSquare size={14} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-700">Additional Comments</span>
          </label>
          <textarea
            {...register('comment')}
            placeholder="How was the session? Any specific notes or points for improvement?"
            rows={4}
            className="w-full p-4 rounded-xl border border-slate-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all resize-none"
          />
          {errors.comment && <p className="text-red-500 text-[10px] font-black mt-1 uppercase">{errors.comment.message}</p>}
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
          <Button onClick={onClose} className="h-11 px-6 rounded-xl font-bold text-slate-600 hover:text-slate-800 transition-colors">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            className="h-11 px-10 rounded-xl font-bold bg-primary border-none shadow-lg shadow-blue-200 hover:bg-primary-700 hover:shadow-xl transition-all"
          >
            Send Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
}