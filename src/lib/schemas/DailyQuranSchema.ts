import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getDailyQuranSchema = (t: TFunc) =>
  z.object({
    studentId: z.string().min(1, t("validation.required")),
    surah: z.string().min(1, t("validation.required")),
    startPage: z.coerce.number().min(1, t("validation.required")),
    endPage: z.coerce.number().min(1, t("validation.required")),
    dueDate: z.string().min(1, t("validation.required")),
    status: z.enum(["pending", "completed", "reviewed", "rejected"]),
  });

export type DailyQuranFormData = z.infer<
  ReturnType<typeof getDailyQuranSchema>
>;
