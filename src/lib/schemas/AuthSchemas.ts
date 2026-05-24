import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getForgotPasswordSchema = (t: TFunc) =>
  z.object({
    email: z
      .string()
      .min(1, t("validation.required"))
      .email(t("validation.email")),
  });

export const getResetPasswordSchema = (t: TFunc) =>
  z.object({
    code: z.string().min(1, t("validation.required")),
    password: z.string().min(6, t("validation.min", { count: 6 })),
    confirmPassword: z.string().min(1, t("validation.required")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordMatch"),
    path: ["confirmPassword"],
  });

export const getVerifyAccountSchema = (t: TFunc) =>
  z.object({
    code: z
      .string()
      .min(4, t("validation.min", { count: 4 }))
      .max(8, t("validation.max", { count: 8 })),
  });

export type ForgotPasswordInput = z.infer<ReturnType<typeof getForgotPasswordSchema>>;
export type ResetPasswordInput = z.infer<ReturnType<typeof getResetPasswordSchema>>;
export type VerifyAccountInput = z.infer<ReturnType<typeof getVerifyAccountSchema>>;
