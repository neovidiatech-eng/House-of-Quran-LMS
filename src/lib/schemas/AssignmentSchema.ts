import { z } from 'zod';

type TFunc = (key: string, options?: any) => string;

export const getAssignmentSchema = (t: TFunc) => z.object({
  studentId: z.string().min(1, t("validation.required")),
  subjectId: z.string().min(1, t("validation.required")),
  title: z.string().min(3, t("validation.min", { count: 3 })),
  description: z.string().min(5, t("validation.min", { count: 5 })),
  dueDate: z.string().min(1, t("validation.required")),
  status: z.enum(['pending', 'submitted', 'graded']),
});

export type AssignmentFormData = z.infer<ReturnType<typeof getAssignmentSchema>>;