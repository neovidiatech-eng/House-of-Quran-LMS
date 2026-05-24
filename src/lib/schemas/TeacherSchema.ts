import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getTeacherSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })),
  email: z.string().email(t("validation.email")),
  phone: z.string().min(8, t("validation.min", { count: 8 })),

  password: z.string().optional().refine((val) => !val || val.length >= 6, {
    message: t("validation.min", { count: 6 }),
  }),

  hourlyRate: z.coerce.number().min(0, t("validation.required")),

  currency: z.string().min(1, t("validation.required")),
  gender: z.enum(['male', 'female']),
  status: z.enum(['active', 'inactive']),

  // Changed from a fixed object to a dynamic array of GUIDs
  subjects: z.array(z.string()).min(1, t("validation.required")),
  meeting_link: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().url(t("validation.url")).optional()
  ),
  timezone: z.string().optional(),
});

export type TeacherFormData = z.infer<ReturnType<typeof getTeacherSchema>>;
