import { z } from "zod";

export const getRegisterSchema = (t: (key: string, options?: any) => string) =>
  z.object({
    name: z.string().min(3, t("validation.min", { count: 3 })),
    email: z.string().email(t("validation.email")),
    codeCountry: z.string().min(1, t("validation.required")),
    phone: z
      .string()
      .min(7, t("validation.min", { count: 7 }))
      .max(15, t("validation.max", { count: 15 }))
      .regex(/^[0-9]+$/, t("validation.invalidPhone")),
    birth_date: z
      .string()
      .refine((val) => val !== "", { message: t("validation.required") }),
    gender: z.string().min(1, t("validation.required")),
    country: z.string().min(1, t("validation.required")),
    password: z.string().min(8, t("validation.min", { count: 8 })),
    plan_id: z.string().min(1, t("validation.required")),
    timezone: z.string().optional(),
  });

export type RegisterInput = z.infer<ReturnType<typeof getRegisterSchema>>;
