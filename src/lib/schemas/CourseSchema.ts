import { z } from "zod";

type TFunc = (key: string, options?: any) => string;

export const getCourseSchema = (t: TFunc) => z.object({
  title: z.string().trim().min(3, t("validation.min", { count: 3 })),
  category: z.string().trim().min(1, t("validation.required")),
  attachments: z.array(z.any()).optional(),
  description: z.string().trim().min(1, t("validation.required")),
  videoUrl: z.string().trim().url(t("validation.invalidUrl")),
  pdfUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().url(t("validation.invalidUrl")).optional()
  ),
  thumbnailFile: z.any().nullable(),
  thumbnailPreview: z.string().trim().optional(),
}).refine((data) => data.thumbnailFile !== null || (data.thumbnailPreview && data.thumbnailPreview.trim() !== ""), {
  message: t("validation.required"),
  path: ["thumbnailFile"],
});

export type CourseFormData = z.infer<ReturnType<typeof getCourseSchema>>;
