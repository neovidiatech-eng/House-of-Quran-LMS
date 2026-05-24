import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getPlanSchema = (t: TFunc) => z.object({
  name: z.string().min(1, t("validation.required")),
  nameEn: z.string().min(1, t("validation.required")),
  description: z.string().min(1, t("validation.required")),
  price: z.coerce.number().min(0, t("validation.required")),
  currencyId: z.string().min(1, t("validation.required")),
  duration: z.coerce.number().min(1, t("validation.min", { count: 1 })),
  sessionsCount: z.coerce.number().min(0),
  sessionTime: z.coerce.number().min(1, t("validation.required")),
  features: z.array(z.string().min(1)),
  isPopular: z.boolean(),
  status: z.enum(['active', 'inactive']),
});

export type PlanFormData = z.infer<ReturnType<typeof getPlanSchema>>;