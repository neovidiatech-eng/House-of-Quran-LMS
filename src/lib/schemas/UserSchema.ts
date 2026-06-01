import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getUserSchema = (t: TFunc) => z.object({
  name: z.string().min(1, t("validation.required")),
  email: z.string().email(t("validation.email")),
  countryCode: z.string(),
  phone: z
    .string()
    .min(7, t("validation.min", { count: 7 }))
    .max(15, t("validation.max", { count: 15 }))
    .regex(/^[0-9]+$/, t("validation.invalidPhone")),
      role: z.string().min(1, t("validation.required")),
  password: z
  .string()
  .min(8, t("validation.passwordMin", { count: 8 }))
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]+$/,
    t("validation.passwordComplex")
  ),
  permissions: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

export type UserFormData = z.infer<ReturnType<typeof getUserSchema>>;