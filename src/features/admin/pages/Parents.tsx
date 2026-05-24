import { useState } from 'react';
import { Search, Plus, Eye, Edit2, Trash2 } from 'lucide-react';
import { useLanguage } from '../../../contexts/LanguageContext';
import AddParentModal from '../../../components/modals/AddParentModal';
import EditParentModal from '../../../components/modals/EditParentModal';
import ViewParentModal from '../../../components/modals/ViewParentModal';
import Pagination from '../../../components/ui/Pagination';
import { useConfirm } from '../../../hooks/useConfirm';
import { useCreateParent, useGetParents, useDeleteParent, useUpdateParentStatus } from '../hooks/useParents';
import { ParentFormData } from '../../../lib/schemas/ParentSchema';
import { Parent } from '../../../types/parentsAdmin';
import { message } from 'antd';


export default function Parents() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { confirm, ConfirmDialog } = useConfirm();
  const itemsPerPage = 7;

const { data: parentsData } = useGetParents();

const parents = parentsData?.data?.parents || [];

  const filteredParents = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    parent.phone.includes(searchTerm)
  );

  const totalPages = Math.ceil(filteredParents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentParents = filteredParents.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const { mutateAsync: createParentMutate } = useCreateParent();
  const { mutateAsync: deleteParentMutate } = useDeleteParent();
  const { mutateAsync: updateParentMutate } = useUpdateParentStatus();

  const handleAddParent = async (parentData: ParentFormData) => {
    try {
      await createParentMutate(parentData);
      message.success(language === 'ar' ? 'تم إضافة ولي الأمر بنجاح' : 'Parent added successfully');
      setShowAddModal(false);
    } catch (error: any) {
      message.error(error.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء إضافة ولي الأمر' : 'Failed to add parent'));
    }
  };

  const handleEditParent = async (parentData: ParentFormData) => {
    if (selectedParent) {
      try {
        const studentIds = Array.isArray(parentData.students) 
          ? parentData.students 
          : [];
        
        const updateData = {
          name: parentData.name,
          email: parentData.email,
          phone: parentData.phone,
          password: parentData.password || undefined,
          students: studentIds,
        };
        
        // Remove undefined values
        const cleanData = Object.fromEntries(
          Object.entries(updateData).filter(([_, v]) => v !== undefined)
        ) as unknown as Parent;
        
        await updateParentMutate({ parentId: selectedParent.id, data: cleanData });
        message.success(language === 'ar' ? 'تم تحديث ولي الأمر بنجاح' : 'Parent updated successfully');
        setShowEditModal(false);
        setSelectedParent(null);
      } catch (error: any) {
        message.error(error.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء تحديث ولي الأمر' : 'Failed to update parent'));
      }
    }
  };

  const handleDeleteParent = async (id: string) => {
    const confirmed = await confirm({
      title: language === 'ar' ? 'حذف ولي أمر' : 'Delete Parent',
      message: language === 'ar' ? 'هل أنت متأكد من حذف ولي الأمر؟' : 'Are you sure you want to delete this parent?',
    });
    if (confirmed) {
      try {
        await deleteParentMutate(id);
        message.success(language === 'ar' ? 'تم حذف ولي الأمر بنجاح' : 'Parent deleted successfully');
      } catch (error: any) {
        message.error(error.response?.data?.message || (language === 'ar' ? 'حدث خطأ أثناء حذف ولي الأمر' : 'Failed to delete parent'));
      }
    }
  };

  const handleViewParent = (parent: Parent) => {
    setSelectedParent(parent);
    setShowViewModal(true);
  };

  const handleEditClick = (parent: Parent) => {
    setSelectedParent(parent);
    setShowEditModal(true);
  };

  const text = {
    title: { ar: 'إدارة أولياء الأمور', en: 'Parents Management' },
    subtitle: { ar: 'إدارة حسابات أولياء الأمور وربط الطلاب', en: 'Manage parent accounts and link students' },
    addNew: { ar: 'إضافة ولي أمر جديد', en: 'Add New Parent' },
    search: { ar: 'البحث بالاسم أو البريد الإلكتروني...', en: 'Search by name or email...' },
    parentName: { ar: 'ولي الأمر', en: 'Parent Name' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    phone: { ar: 'الهاتف', en: 'Phone' },
    children: { ar: 'عدد الأبناء', en: 'Number of Children' },
    actions: { ar: 'الإجراءات', en: 'Actions' },
    showing: { ar: 'الصفحة 1 من 1 / إجمالي', en: 'Showing 1 of 1 / Total' },
    previous: { ar: 'السابق', en: 'Previous' },
    next: { ar: 'التالي', en: 'Next' },
    students: { ar: 'طالب', en: 'students' }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div className={language === 'ar' ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{text.title[language]}</h1>
          <p className="text-gray-600">{text.subtitle[language]}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">{text.addNew[language]}</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative">
            <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={text.search[language]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${language === 'ar' ? 'pr-12' : 'pl-12'} py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-start`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{text.parentName[language]}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{text.email[language]}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{text.phone[language]}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{text.children[language]}</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{text.actions[language]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentParents.map((parent: Parent) => (
                <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">{parent.name[0]}</span>
                      </div>
                      <span className="font-medium text-gray-900">{parent.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-start">{parent.email}</td>
                  <td className="px-6 py-4 text-gray-700 text-start">{parent.phone}</td>
                  <td className="px-6 py-4 text-start">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary-light text-white rounded-full text-sm font-medium">
                      {parent.students?.length} {text.students[language]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-start">
                    <div className="flex items-center gap-2 justify-start">
                      <button
                        onClick={() => handleDeleteParent(parent.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(parent)}
                        className="p-2 icon-btn-primary rounded-lg transition-colors"
                        title={language === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleViewParent(parent)}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        title={language === 'ar' ? 'عرض' : 'View'}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredParents.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
        />
      </div>

      {showAddModal && (
        <AddParentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddParent}
        />
      )}

      {showEditModal && selectedParent && (
        <EditParentModal
          parent={selectedParent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedParent(null);
          }}
          onSubmit={handleEditParent}
        />
      )}

      {showViewModal && selectedParent && (
        <ViewParentModal
          parent={selectedParent}
          onClose={() => {
            setShowViewModal(false);
            setSelectedParent(null);
          }}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
