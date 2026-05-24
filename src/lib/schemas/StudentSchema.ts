import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getStudentSchema = (t: TFunc) => z.object({
  name: z.string().min(3, t("validation.min", { count: 3 })),
  email: z.string().email(t("validation.email")),
  phone_code: z.string().min(1, t("validation.required")),
  phone: z.string().min(1, t("validation.required")),
  gender: z.string().min(1, t("validation.required")),
  birthDate: z.string().optional().or(z.literal('')),
  plan: z.string().optional().or(z.literal('')),
  country: z.string().min(1, t("validation.required")),
  status: z.enum(['approved', 'pending', 'rejected']),
  password: z.string().min(6, t("validation.min", { count: 6 })).optional().or(z.literal('')),
  timezone: z.string().optional(),
}).superRefine((data, ctx) => {
  const { phone_code, phone } = data;

  if (!phone) return;

  // Egypt
  if (phone_code === "+20") {
    if (!/^01[0125][0-9]{8}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // Saudi Arabia
  else if (phone_code === "+966") {
    if (!/^5[0-9]{8}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // UAE
  else if (phone_code === "+971") {
    if (!/^5[0124568][0-9]{7}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // Kuwait
  else if (phone_code === "+965") {
    if (!/^[569][0-9]{7}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
  // Fallback for other countries
  else {
    if (!/^[0-9]{7,15}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t("validation.invalidPhone"),
        path: ["phone"],
      });
    }
  }
});

export type StudentFormData = z.infer<ReturnType<typeof getStudentSchema>>;