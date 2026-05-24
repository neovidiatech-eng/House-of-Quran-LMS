import { useLanguage } from '../../contexts/LanguageContext';
import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CourseFormData, getCourseSchema } from '../../lib/schemas/CourseSchema';

import { useTranslation } from 'react-i18next';
import CourseFormFields from '../../features/admin/pages/LMSCourses/components/CourseFormFields';
import { CourseItem } from '../../types/course';
import { AttachedFile } from '../../types/lmsCourses';
import { baseURL } from '../../consts';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => void;
  course?: CourseItem | null;
  subjectCategories: { id: string; name: string }[];
}

type RawCourseAttachment = CourseItem['attatchments'];

function normalizeCourseAttachments(att: RawCourseAttachment): AttachedFile[] {
  if (!att) return [];
  if (Array.isArray(att)) return att;

  if (typeof att === 'string') {
    const url = att.startsWith('http') ? att : `${baseURL}/${att}`;
    return [
      {
        id: Math.random(),
        name: att.split('/').pop() || 'ملف مرفق',
        size: 0,
        type: '',
        url,
      },
    ];
  }

  const url = att.url
    ? att.url.startsWith('http')
      ? att.url
      : `${baseURL}/${att.url}`
    : '';

  return [
    {
      id: att.id ?? Math.random(),
      name: att.name || 'ملف مرفق',
      size: att.size ?? 0,
      type: att.type ?? '',
      url,
    },
  ];
}

export default function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  course,
  subjectCategories,
}: CourseModalProps) {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  const methods = useForm<CourseFormData>({
    resolver: zodResolver(getCourseSchema(t)),
    defaultValues: {
      title: '',
      description: '',
      category: subjectCategories.filter(c => c.id !== 'الكل' && c.id !== 'All')[0]?.id || '',
      videoUrl: '',
      thumbnailFile: null,
      thumbnailPreview: '',
      attachments: [],
    },
  });

  const { reset, handleSubmit } = methods;

  useEffect(() => {
    if (isOpen) {
      if (course) {
        reset({
          title: course.title,
          description: course.description,
          category: course.subjectId || course.subject?.id || '',
          videoUrl: course.videoUrl,
          pdfUrl: course.pdfurl,
          thumbnailFile: null,
          thumbnailPreview: course.image,
          attachments: normalizeCourseAttachments(course.attatchments),
        });
      } else {
        reset({
          title: '',
          description: '',
          category: subjectCategories.filter(c => c.id !== 'الكل' && c.id !== 'all')[0]?.id || '',
          videoUrl: '',
          thumbnailFile: null,
          thumbnailPreview: '',
          attachments: [],
        });
      }
    }
  }, [isOpen, course, reset, subjectCategories]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 !mt-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--color-primary)] px-8 py-6 flex items-center justify-between rounded-t-2xl z-10">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {course ? t('edit_course') : t('add_new_course')}
          </h2>
        </div>

        <div className="p-8">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <CourseFormFields
                subjectCategories={subjectCategories}
                thumbnailInputRef={thumbnailInputRef}
                attachInputRef={attachInputRef}
              />

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 btn-primary text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  {course ? t('save_changes') : t('add')}
                </button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
