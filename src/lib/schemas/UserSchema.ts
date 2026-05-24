import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getUserSchema = (t: TFunc) => z.object({
  name: z.string().min(1, t("validation.required")),
  email: z.string().email(t("validation.email")),
  countryCode: z.string(),
  phone: z.string().min(1, t("validation.required")),
  role: z.string().min(1, t("validation.required")),
  password: z.string().min(6, t("validation.min", { count: 6 })),
  permissions: z.array(z.string()).optional(),
  timezone: z.string().optional(),
});

export type UserFormData = z.infer<ReturnType<typeof getUserSchema>>;