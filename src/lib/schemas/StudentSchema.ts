import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getStudentSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })),
  email: z.string().email(t("validation.email")),
  phone_code: z.string().min(1, t("validation.required")),
  phone: z
    .string()
    .min(7, t("validation.min", { count: 7 }))
    .max(15, t("validation.max", { count: 15 }))
    .regex(/^[0-9]+$/, t("validation.invalidPhone")),
  gender: z.string().min(1, t("validation.required")),
  birthDate: z.string().optional().or(z.literal('')),
  plan: z.string().optional().or(z.literal('')),
  country: z.string().min(1, t("validation.required")),
  status: z.enum(['approved', 'pending', 'rejected']),
password: z
  .string()
  .min(8, t("validation.passwordMin", { count: 8 }))
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]+$/,
    t("validation.passwordComplex")
  ),
});

export type StudentFormData = z.infer<ReturnType<typeof getStudentSchema>>;
