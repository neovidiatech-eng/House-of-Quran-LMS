import { z } from 'zod';
import { DayOfWeek } from '../../types/scheduales';

type TFunc = (key: string, options?: any) => string;

const getBaseSession = (t: TFunc) => z.object({
  student: z.string().min(1, t("validation.required")),
  teacher: z.string().min(1, t("validation.required")),
  subject: z.string().min(1, t("validation.required")),
  title: z.string().min(3, t("validation.min", { count: 3 })),
  description: z.string().min(5, t("validation.required")),
  // type: z.enum(['full', 'half']),
  notification_Time: z.string(),
  meetingLink: z.string().min(1, t("validation.required")).url(t("validation.email")),
  notes: z.string().min(10, t("validation.min", { count: 10 })),
});

export const getSessionSchema = (t: TFunc) => getBaseSession(t).extend({
  sessionDate: z.string().min(1, t("validation.required")),
  duration: z.string().min(1, t("validation.required")),
  startTime: z.string().min(1, t("validation.required")),
  endTime: z.string().min(1, t("validation.required")),
}).refine((data) => data.endTime > data.startTime, {
  message: t("validation.required"), // Ideally 'end time must be after start time'
  path: ["endTime"],
});

export const getMultipleSessionsSchema = (t: TFunc) => getBaseSession(t).extend({
  monthYear: z.string().min(1, t("validation.required")),
  duration: z.string().min(1, t("validation.required")),
  startTime: z.string().min(1, t("validation.required")),
  batchStartDate: z.string().min(1, t("validation.required")),
  batchEndDate: z.string().min(1, t("validation.required")),
});

export type SessionFormData = z.infer<ReturnType<typeof getSessionSchema>>;
export type MultipleSessionsFormData = z.infer<ReturnType<typeof getMultipleSessionsSchema>>;

export interface MultipleSessionsPayload {
  formData: MultipleSessionsFormData;
  sessions: Array<{
    date: string;
    day: string;
    time: string;
  }>;
  selectedDays: DayOfWeek[];
}