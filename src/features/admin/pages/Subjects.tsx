import { useEffect, useState } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import SubjectForm, { COLORS } from '../../../components/modals/SubjectsModal';
import { Subject } from '../../../types/subject';
import { useSubjects, useAddSubject, useUpdateSubject, useDeleteSubject } from '../hooks/useSubjects';
import { SubjectFormData } from '../../../lib/schemas/SubjectsSchema';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';
import { useConfirm } from '../../../hooks/useConfirm';

function getColorClasses(colorId: string) {
  return COLORS.find(c => c.id === colorId) || COLORS[0];
}

export default function Subjects() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError, error, isFetching } = useSubjects(debouncedSearch);
  const { mutate: addSubject } = useAddSubject();
  const { mutate: updateSubject } = useUpdateSubject();
  const { mutate: deleteSubject } = useDeleteSubject();
  const { confirm, ConfirmDialog } = useConfirm();

  const subjects = data?.subjects ?? [];

  useEffect(() => {
    if (searchQuery.length >= 3) {
      setDebouncedSearch(searchQuery);
    } else if (searchQuery.length === 0) {
      setDebouncedSearch('');
    }
  }, [searchQuery]);

  const filtered = subjects.filter(s => {
    if (filterActive === 'all') return true;
    return s.active === (filterActive === 'active');
  });

  const handleAdd = (formData: SubjectFormData) => {
    addSubject(formData);
    setShowAddModal(false);
  };

  const handleEdit = (formData: SubjectFormData) => {
    if (!editingSubject) return;
    updateSubject({ id: editingSubject.id, data: formData });
    setEditingSubject(null);
  };

  const handleDelete = async (id: string) => {
    const subject = subjects.find(s => s.id === id);
    const name = subject ? (language === 'ar' ? subject.name_ar : subject.name_en) : '';
    const confirmed = await confirm({
      title: language === 'ar' ? 'حذف مادة' : 'Delete Subject',
      message: language === 'ar' ? `هل أنت متأكد من حذف "${name}"؟` : `Are you sure you want to delete "${name}"?`,
    });
    if (confirmed) {
      deleteSubject(id);
    }
  };

  const toggleStatus = (subject: Subject) => {
    updateSubject({ id: subject.id, data: { active: !subject.active } });
  };

  if (isError) {
    return (
      <div className="p-6 lg:p-8 text-center text-red-500" dir="rtl">
        <h2 className="text-xl font-bold">Error</h2>
        <p>{error instanceof Error ? error.message : 'Something went wrong'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{language === 'ar' ? 'إدارة المواد الدراسية' : 'Subject Management'}</h1>
          <p className="text-gray-500 text-sm mt-1">{language === 'ar' ? 'إضافة وتعديل المواد الدراسية المتاحة' : 'Add and manage available subjects'}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          {language === 'ar' ? 'إضافة مادة جديدة' : 'Add Subject'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{language === 'ar' ? 'إجمالي المواد' : 'Total Subjects'}</p>
            <p className="text-3xl font-bold text-blue-600">{subjects.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{language === 'ar' ? 'نشطة' : 'Active'}</p>
            <p className="text-3xl font-bold text-green-600">{subjects.filter(s => s.active).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">{language === 'ar' ? 'غير نشطة' : 'Inactive'}</p>
            <p className="text-3xl font-bold text-gray-500">{subjects.filter(s => !s.active).length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث في المواد...' : 'Search subjects...'}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              className={`w-full px-4 py-3 ${language === 'ar' ? 'pr-12' : 'pl-12'} border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-start`}
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterActive(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filterActive === s
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {s === 'all' ? (language === 'ar' ? 'الكل' : 'All') : s === 'active' ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(isLoading || isFetching) ? (
        <TableSkeleton rows={6} columns={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
          <BookOpen className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">{language === 'ar' ? 'لا توجد مواد' : 'No subjects found'}</p>
          <p className="text-gray-400 text-sm mt-1 mb-4">{language === 'ar' ? 'اضغط على "إضافة مادة جديدة" للبدء' : 'Click "Add Subject" to get started'}</p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:underline font-medium text-sm"
            >
              {language === 'ar' ? 'مسح البحث' : 'Clear Search'}
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(subject => {
            const colorClasses = getColorClasses(subject.color);
            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingSubject(subject)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-primary-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <div className={`w-14 h-14 ${colorClasses.bg} rounded-2xl flex items-center justify-center border ${colorClasses.border}`}>
                      <BookOpen className={`w-7 h-7 ${colorClasses.icon}`} />
                    </div>
                  </div>

                  <div className="text-start">
                    <h3 className="text-lg font-bold text-gray-900 mb-0.5">{subject.name_ar}</h3>
                    {subject.name_en && <p className="text-sm text-gray-400 mb-3">{subject.name_en}</p>}
                    <div className="flex items-center justify-start gap-2">
                      <button
                        onClick={() => toggleStatus(subject)}
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${subject.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                      >
                        {subject.active ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <SubjectForm
          title={language === 'ar' ? 'إضافة مادة جديدة' : 'Add New Subject'}
          onSave={handleAdd}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingSubject && (
        <SubjectForm
          title={language === 'ar' ? 'تعديل المادة' : 'Edit Subject'}
          initial={editingSubject}
          onSave={handleEdit}
          onCancel={() => setEditingSubject(null)}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
