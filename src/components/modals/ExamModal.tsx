import { X } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomSelect from "../ui/CustomSelect";
import DatePickerField from "../ui/DatePickerField";
import { Resolver, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExamFormData, getExamSchema } from "../../lib/schemas/ExamSchema";
import { useEffect } from "react";
import { useStudents } from "../../features/admin/hooks/useStudents";
import { useSubjects } from "../../features/admin/hooks/useSubjects";

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (exam: ExamFormData) => void;
  initialData?: ExamFormData | null;
}

export default function AddExamModal({
  isOpen,
  onClose,
  onAdd,
  initialData,
}: AddExamModalProps) {
  const { language, t } = useLanguage();
  const { data } = useStudents();
  const { data: subjData } = useSubjects();

  const subjects = subjData?.subjects.map((s) => ({
    value: s?.id,
    label: s?.name_ar,
  }));

  const students = data?.data.studentsData?.map((s) => ({
    value: s?.id,
    label: s?.user?.name,
  }));

  const text = {
    title: {
      ar: initialData ? "تعديل امتحان" : "إضافة امتحان جديد",
      en: initialData ? "Edit Exam" : "Add New Exam",
    },
    examTitle: { ar: "العنوان", en: "Title" },
    subject: { ar: "المادة", en: "Subject" },
    teacher: { ar: "المعلم", en: "Teacher" },
    student: { ar: "اختر الطالب", en: "Select Student" },
    dueDate: { ar: "التاريخ", en: "Date" },
    duration: { ar: "المدة (دقيقة)", en: "Duration (minutes)" },
    grade: { ar: "الدرجة", en: "Grade" },
    status: { ar: "الحالة", en: "Status" },
    upcoming: { ar: "قادم", en: "Upcoming" },
    completed: { ar: "مكتمل", en: "Completed" },
    cancel: { ar: "إلغاء", en: "Cancel" },
    submitBtn: {
      ar: initialData ? "حفظ التعديلات" : "إضافة",
      en: initialData ? "Save Changes" : "Add",
    },
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(getExamSchema(t)) as Resolver<ExamFormData>,
    defaultValues: {
      grade: 100,
      status: "upcoming",
      teacher: "أ. محمد الأحمدي",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
      } else {
        reset({
          title: "",
          subjectId: "",
          studentId: "",
          teacher: "أ. محمد الأحمدي",
          dueDate: "",
          duration: 0,
          grade: 100,
          status: "upcoming",
        });
      }
    }
  }, [initialData, reset, isOpen]);

  const handleOnSubmit = (data: ExamFormData) => {
    onAdd(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold text-white">
            {initialData
              ? language === "ar"
                ? "تعديل امتحان"
                : "Edit Exam"
              : language === "ar"
                ? "إضافة امتحان جديد"
                : "Add New Exam"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(handleOnSubmit)}
          className="p-6 space-y-4"
          dir="rtl"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.examTitle[language]}
            </label>
            <input
              type="text"
              {...register("title")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-start"
              dir="rtl"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            {/* <label className="block bg-black text-sm font-medium text-gray-700 mb-2 text-start">
              {text.subject[language]}
            </label> */}

            <CustomSelect
              label={text.subject[language]}
              value={watch("subjectId")}
              onChange={(value) =>
                setValue("subjectId", value, { shouldValidate: true })
              }
              options={subjects || []}
            />
            {errors.subjectId && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.subjectId.message}
              </p>
            )}
          </div>

          <div>
            {/* student////////////////// */}
            <CustomSelect
              label={text.student[language]}
              value={watch("studentId")}
              onChange={(value) =>
                setValue("studentId", value, { shouldValidate: true })
              }
              options={students || []}
            />
            {errors.studentId && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.studentId.message}
              </p>
            )}
          </div>

          <div>
          
            <DatePickerField
              label={text.dueDate[language]}
              value={watch("dueDate")}
              onChange={(val) =>
                setValue("dueDate", val, { shouldValidate: true })
              }
              error={errors.dueDate?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.duration[language]}
              </label>
              <input
                type="number"
                min="1"
                {...register("duration")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
              {errors.duration && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.duration.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.grade[language]}
              </label>
              <input
                type="number"
                min="0"
                {...register("grade", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-start"
                dir="rtl"
              />
              {errors.grade && (
                <p className="text-red-500 text-xs mt-1 text-start">
                  {errors.grade.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <CustomSelect
              label={text.status[language]}
              value={watch("status")}
              onChange={(value) =>
                setValue("status", value as "upcoming" | "completed", {
                  shouldValidate: true,
                })
              }
              options={[
                { value: "upcoming", label: text.upcoming[language] },
                { value: "completed", label: text.completed[language] },
              ]}
            />
            {errors.status && (
              <p className="text-red-500 text-xs mt-1 text-start">
                {errors.status.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
            >
              {text.submitBtn[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
