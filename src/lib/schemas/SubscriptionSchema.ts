import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getEditSubscriptionSchema = (t: TFunc) => z.object({
  planName: z.string().min(1, t("validation.required")),
  planPrice: z.string().min(1, t("validation.required")),
  startDate: z.string().min(1, t("validation.required")),
  endDate: z.string().min(1, t("validation.required")),
  status: z.enum(['active', 'expired', 'cancelled']),
  totalSessions: z.number().min(0, t("validation.required")),
  sessionsRemaining: z.number().min(0, t("validation.required")),
}).refine(data => data.sessionsRemaining <= data.totalSessions, {
  message: t("validation.required"),
  path: ["sessionsRemaining"],
});

export type EditSubscriptionFormData = z.infer<ReturnType<typeof getEditSubscriptionSchema>>;
