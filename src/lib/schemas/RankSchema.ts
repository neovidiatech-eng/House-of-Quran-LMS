import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getRankSchema = (t: TFunc) =>
  z.object({
    name_ar: z.string().min(1, t("validation.required") || "هذا الحقل مطلوب"),
    name_en: z.string().min(1, t("validation.required") || "English name is required"),
    description_ar: z.string().optional().default(""),
    description_en: z.string().optional().default(""),
    color: z.string().min(1, t("validation.required") || "Color is required"),
    icon: z.string().nullable().optional(),
    minSessions: z.coerce.number().min(0, t("validation.required") || "Required"),
    minPoints: z.coerce.number().min(0, t("validation.required") || "Required"),
    active: z.boolean().optional().default(true),
  });

export type RankFormData = z.infer<ReturnType<typeof getRankSchema>>;

export const getAssignRankSchema = (t: TFunc) =>
  z.object({
    studentId: z.string().min(1, t("validation.required") || "Please select a student"),
    rankId: z.string().min(1, t("validation.required") || "Please select a rank"),
  });

export type AssignRankFormData = z.infer<ReturnType<typeof getAssignRankSchema>>;
