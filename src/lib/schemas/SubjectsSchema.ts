import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getSubjectSchema = (t: TFunc) => z.object({
  name_ar: z.string().min(2, t("validation.min", { count: 2 })),
  name_en: z.string().min(2, t("validation.min", { count: 2 })).optional().or(z.literal('')),
  active: z.boolean().default(true),
  color: z.string().default('green'),
});


export type SubjectFormData = z.infer<ReturnType<typeof getSubjectSchema>>;