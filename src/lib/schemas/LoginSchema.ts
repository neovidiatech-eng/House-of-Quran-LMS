import { z } from "zod";

export const getLoginSchema = (t: (key: string, options?: any) => string) => z.object({
  email: z.string()
    .min(1, t("validation.required"))
    .email(t("validation.emailOrPhoneInvalid")).or(
      z.string()
        .min(7, t("validation.min", { count: 7 }))
        .max(15, t("validation.max", { count: 15 }))
        .regex(/^[0-9]+$/, t("validation.emailOrPhoneInvalid"))
    ),
 password: z
  .string()
  .min(8, t("validation.passwordMin", { count: 8 }))
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#])[A-Za-z\d@$!%*?&^#]+$/,
    t("validation.passwordComplex")
  ),
  rememberMe: z.boolean().optional(),
});

// For type safety, we can use a dummy translation for inference or export a type helper
export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;