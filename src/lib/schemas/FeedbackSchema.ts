import { z } from "zod";

type TFunc = (key: string) => string;

export const getFeedbackSchema = (t: TFunc) => z.object({
  rating: z.number().min(1, t("validation.required")).max(5),
  comment: z.string().min(3, t("validation.required")),
  teacherAttended: z.boolean(),
  studentAttended: z.boolean(),
});

export type FeedbackFormData = z.infer<ReturnType<typeof getFeedbackSchema>>;