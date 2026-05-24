import { BookOpen, X, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSubjectSchema, SubjectFormData } from '../../lib/schemas/SubjectsSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { Subject } from '../../types/subject';

export const COLORS = [
  { id: '#10b981', bg: 'bg-green-100', icon: 'text-green-600', border: 'border-green-200', labelKey: 'color_green' },
  { id: '#3b82f6', bg: 'bg-primary-100', icon: 'text-blue-600', border: 'border-blue-200', labelKey: 'color_blue' },
  { id: '#f97316', bg: 'bg-orange-100', icon: 'text-orange-600', border: 'border-orange-200', labelKey: 'color_orange' },
  { id: '#ef4444', bg: 'bg-red-100', icon: 'text-red-600', border: 'border-red-200', labelKey: 'color_red' },
  { id: '#14b8a6', bg: 'bg-teal-100', icon: 'text-teal-600', border: 'border-teal-200', labelKey: 'teal' },
  { id: '#eab308', bg: 'bg-yellow-100', icon: 'text-yellow-600', border: 'border-yellow-200', labelKey: 'color_yellow' },
  { id: '#ec4899', bg: 'bg-pink-100', icon: 'text-pink-600', border: 'border-pink-200', labelKey: 'pink' },
  { id: '#6b7280', bg: 'bg-gray-100', icon: 'text-gray-600', border: 'border-gray-200', labelKey: 'gray' },
];

interface SubjectFormProps {
  initial?: Partial<Subject>;
  onSave: (data: SubjectFormData) => void;
  onCancel: () => void;
  title: string;
}

export default function SubjectForm({ initial, onSave, onCancel, title }: SubjectFormProps) {
  const {t } = useLanguage();
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SubjectFormData>({
    resolver: zodResolver(getSubjectSchema(t)) as Resolver<SubjectFormData>,
    defaultValues: {
      name_ar: initial?.name_ar || '',
      name_en: initial?.name_en || '',
      active: initial?.active ?? true,
      color: initial?.color || '#10b981',
    }
  });

  const selectedColor = watch('color');
  const selectedActive = watch('active');

  useEffect(() => {
    if (initial) {
      reset({
        name_ar: initial.name_ar || '',
        name_en: initial.name_en || '',
        active: initial.active ?? true,
        color: initial.color || '#10b981',
      });
    }
  }, [initial, reset]);

  return (
    <div className="fixed inset-0 !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-primary rounded-t-2xl">

          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar">
          <div>
            <label className="block text-sm font-medium text-gray-700 text-start mb-1.5">
              {t('subjectNameAr')}
              <span className="text-red-500 mr-1">*</span>
            </label>
            <input
              type="text"
              {...register('name_ar')}
              dir="rtl"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-start"
            />
            {errors.name_ar && <p className="text-red-500 text-xs mt-1 text-start">{errors.name_ar.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-start mb-1.5">
              {t('subjectNameEn')}
            </label>
            <input
              type="text"
              {...register('name_en')}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
            {errors.name_en && <p className="text-red-500 text-xs mt-1 text-start">{errors.name_en.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-start mb-2">
              {t('color')}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setValue('color', c.id)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${selectedColor === c.id ? `${c.border} ring-2 ring-blue-400` : 'border-transparent hover:border-gray-200'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                    <BookOpen className={`w-4 h-4 ${c.icon}`} />
                  </div>
                  <span className="text-[10px] text-gray-600">{t(c.labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 text-start mb-1.5">
              {t('status')}
            </label>
            <div className="flex gap-3">
              {[true, false].map(val => (
                <button
                  key={val.toString()}
                  type="button"
                  onClick={() => setValue('active', val)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${selectedActive === val
                    ? (val ? 'border-green-400 bg-green-50 text-green-700' : 'border-gray-400 bg-gray-50 text-gray-700')
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                >
                  {selectedActive === val && <Check className="w-4 h-4" />}
                  {val ? t('active') : t('inactive')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button type="button" onClick={onCancel} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium">
              {t('cancel')}
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium shadow-lg shadow-blue-600/20">
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
