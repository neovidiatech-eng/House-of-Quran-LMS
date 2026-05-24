import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getCurrencySchema = (t: TFunc) => z.object({
  name_ar: z.string().min(1, t("validation.required")),
  name_en: z.string().min(1, t("validation.required")),
  symbol: z.string().min(1, t("validation.required")),
  code: z.string().min(1, t("validation.required")),
  default: z.boolean().default(false),
  exchangeRate: z.coerce.number().min(0, t("validation.required")),
});

export type CurrencyFormData = z.infer<ReturnType<typeof getCurrencySchema>>;