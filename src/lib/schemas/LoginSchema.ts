import { z } from "zod";

export const getLoginSchema = (t: (key: string, options?: any) => string) => z.object({
  email: z.string()
    .min(1, t("validation.required"))
    .refine((val) => {
      const clean = val.trim();
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
      const isPhone = /^\+?[0-9]{7,15}$/.test(clean.replace(/[\s\-()]/g, ''));
      return isEmail || isPhone;
    }, {
      message: t("validation.emailOrPhoneInvalid") || t("validation.email"),
    }),
  password: z
    .string()
    .min(1, t("validation.required")),
  rememberMe: z.boolean().optional(),
});

// For type safety, we can use a dummy translation for inference or export a type helper
export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;
