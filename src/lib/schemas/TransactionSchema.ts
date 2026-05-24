import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getTransactionTypeEnum = () => z.enum(['income', 'teacher_expense']);
export const getTransactionStatusEnum = () => z.enum(['completed', 'pending']);

export const getTransactionSchema = (t: TFunc) => z.object({
  type: getTransactionTypeEnum(),
  studentName: z.string().optional().or(z.literal('')),
  teacherName: z
    .string()
    .min(3, t("validation.min", { count: 3 })),
  amount: z.coerce
    .number()
    .min(0, t("validation.required")),
  currency: z.string().min(1, t("validation.required")),
  paymentMethod: z.string().optional().or(z.literal('')),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: t("validation.required"),
  }),
  status: getTransactionStatusEnum().default('pending'),
  notes: z.string().optional().or(z.literal('')),
  sessionCount: z.coerce.number().int().positive().optional(),
  sessionDuration: z.coerce.number().positive().optional(),
  ratePerHour: z.coerce.number().positive().optional(),
}).superRefine((data, ctx) => {
  if (data.type === 'income' && (!data.studentName || data.studentName.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: t("validation.required"),
      path: ['studentName'],
    });
  }
});

export type TransactionFormData = z.infer<ReturnType<typeof getTransactionSchema>>;

export interface Transaction extends TransactionFormData {
  id: string;
  createdAt?: string;
}