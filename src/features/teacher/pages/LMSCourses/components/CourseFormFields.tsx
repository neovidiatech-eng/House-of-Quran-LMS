import React from 'react';
import { Upload } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';
import { CourseFormFieldsProps } from '../../../../../types/lmsCourses';
import CustomSelect from '../../../../../components/ui/CustomSelect';
import { useLanguage } from '../../../../../contexts/LanguageContext';



const CourseFormFields = ({
  subjectCategories,
  thumbnailInputRef,
  attachInputRef,
}: CourseFormFieldsProps) => {
  const { t } = useLanguage();
  const { register, control, setValue, watch, formState: { errors } } = useFormContext();

  const thumbnailPreview = watch('thumbnailPreview');

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setValue('thumbnailFile', file);
    setValue('thumbnailPreview', url);
  };

  const handleAttachFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const currentAttachments = watch('attachments') || [];

    const newAttachments = files.map(file => ({
      id: Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));

    setValue('attachments', [...currentAttachments, ...newAttachments]);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-start">
          {t('courseTitle')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("title")}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 text-start ${errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
            }`}
          placeholder={t('enterCourseTitle')}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1 text-start">{errors.title.message as string}</p>}
      </div>

      {/* video url */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-start">{t('VideoURL')}</label>
        <input
          type="text"
          {...register("videoUrl")}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 text-start ${errors.videoUrl ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
          placeholder={t('enterVideoURL')}
        />
        {errors.videoUrl && <p className="text-red-500 text-xs mt-1 text-start">{errors.videoUrl.message as string}</p>}
      </div>

      {/* pdf url */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-start">رابط ملف PDF</label>
        <input
          type="text"
          {...register("pdfUrl")}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 text-start ${errors.pdfUrl ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'}`}
          placeholder="أدخل رابط ملف PDF (اختياري)"
        />
        {errors.pdfUrl && <p className="text-red-500 text-xs mt-1 text-start">{errors.pdfUrl.message as string}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-start">{t('courseDescription')}</label>
        <textarea
          rows={3}
          {...register("description")}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-start resize-none"
          placeholder={t('enterCourseDescription')}
        />
        {errors.description && <p className="text-red-500 text-xs mt-1 text-start">{errors.description.message as string}</p>}
      </div>


      <div className="grid grid-cols-1 gap-3">
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <CustomSelect
              label={t('subject')}
              value={field.value}
              onChange={field.onChange}
              options={subjectCategories
                .filter(c => c.id !== 'الكل' && c.id !== 'all')
                .map(c => ({ value: c.id, label: c.name }))
              }
              className="h-[42px]"
              placeholder={t('selectSubject')}
              error={errors.category?.message as string}
            />
          )}
        />

      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1 text-start">{t('thumbnailImage')}</label>
        <div
          onClick={() => thumbnailInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 transition-colors"
        >
          {thumbnailPreview ? (
            <div className="relative h-36">
              <img src={thumbnailPreview} alt="thumbnail" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <p className="text-white text-sm font-medium">{t('changeImage')}</p>
              </div>
            </div>
          ) : (
            <div className="h-28 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Upload className="w-6 h-6" />
              <p className="text-sm">{t('clickToUploadImage')}</p>
            </div>
          )}
        </div>
        <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
      </div>

      <button
        type="button"
        onClick={() => attachInputRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-blue-400 text-gray-500 py-2.5 rounded-xl text-sm transition-colors"
      >
        <Upload className="w-4 h-4" /> {t('uploadAdditionalFiles')}
      </button>
      <input ref={attachInputRef} type="file" multiple className="hidden" onChange={handleAttachFiles} />
    </div>
  );
};

export default CourseFormFields;