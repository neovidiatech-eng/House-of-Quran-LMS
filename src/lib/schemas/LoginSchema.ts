import { z } from "zod";

export const getLoginSchema = (t: (key: string, options?: any) => string) => z.object({
  email: z.string()
    .min(1, t("validation.required"))
    .email(t("validation.email")),
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