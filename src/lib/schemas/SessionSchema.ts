import { z } from 'zod';
import { DayOfWeek } from '../../types/scheduales';

type TFunc = (key: string, options?: any) => string;

const getBaseSession = (t: TFunc) => z.object({
  student: z.union([
    z.string().min(1, t("validation.required")),
    z.array(z.string()).min(1, t("validation.required"))
  ]),
  teacher: z.string().min(1, t("validation.required")),
  subject: z.string().min(1, t("validation.required")),
  title: z.string().optional(),
  description: z.string().optional(),
  // type: z.enum(['full', 'half']),
  notification_Time: z.string().optional(),
  meetingLink: z.string().min(1, t("validation.required")).url(t("validation.email")),
  notes: z.string().optional(),
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