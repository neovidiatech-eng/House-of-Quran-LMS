import { useState } from 'react';
import { Search, Eye, Pencil, Trash2, Plus, Check, Copy } from 'lucide-react';
import WhatsAppPhone from '../../../components/ui/WhatsAppPhone';
import AddUserModal from '../../../components/modals/AddUserModal';
import EditUserModal from '../../../components/modals/EditUserModal';
import ViewUserModal from '../../../components/modals/ViewUserModal';
import Pagination from '../../../components/ui/Pagination';
import { useTranslation } from 'react-i18next';
import { useStaff, useAddStaff, useUpdateStaff, useDeleteStaff } from '../hooks/useStaff';
import { StuffItem } from '../../../types/sttuf';
import { UserFormData } from '../../../lib/schemas/UserSchema';
import { useConfirm } from '../../../hooks/useConfirm';
import { TableSkeleton } from '../../../components/ui/CustomSkeleton';

/** Map a StuffItem from the API to the flat shape the modals & table need */
const toModalUser = (item: StuffItem) => ({
  id: item.id,
  name: item.user.name,
  email: item.user.email,
  phone: item.user.phone,
  password: item.user.password || '',
  countryCode: item.user.code_country || '+20',
  role: item.role?.name || '',
  status: (item.user.status as 'active' | 'inactive') || 'active',
  permissions: [] as string[],
});

type ModalUser = ReturnType<typeof toModalUser>;

export default function Users() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ModalUser | null>(null);
    const [copiedPasswordId, setCopiedPasswordId] = useState<string | null>(null);

  const itemsPerPage = 7;

  // ── API hooks ──────────────────────────────────────────────────────────
  const { data: staffData, isLoading, isError } = useStaff(searchTerm);
  const addStaff = useAddStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const { confirm, ConfirmDialog } = useConfirm();

  const allUsers: ModalUser[] = (staffData?.stuff ?? []).map(toModalUser);

  const totalPages = Math.ceil(allUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = allUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleAddUser = (userData: UserFormData) => {
    addStaff.mutate(
      {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        codeCountry: userData.countryCode,
        phone: userData.phone,
        roleId: userData.role,
        timezone: userData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      {
        onSuccess: () => {
          setIsAddModalOpen(false);
        },
      }
    );
  };

  const handleEditUser = (userData: UserFormData & { id: string }) => {
    updateStaff.mutate(
      {
        id: userData.id,
        staff: {
          name: userData.name,
          email: userData.email,
          codeCountry: userData.countryCode,
          phone: userData.phone,
          roleId: userData.role,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...(userData.password ? { password: userData.password } : {}),
        },
      },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        },
      }
    );
  };

  const handleDeleteUser = async (userId: string) => {
    const confirmed = await confirm({
      title: t('deleteUser'),
      message: t('deleteConfirmUser'),
    });
    if (confirmed) {
      deleteStaff.mutate(userId, {
        onSuccess: () => {},
      });
    }
  };

    const handleCopyPassword = (userId: string, password: string) => {
    navigator.clipboard.writeText(password);
    setCopiedPasswordId(userId);
    setTimeout(() => setCopiedPasswordId(null), 2000);
  };

  const handleViewUser = (user: ModalUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (user: ModalUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 font-medium">
        <span>{t('home')}</span>
        <span>/</span>
        <span className="text-primary">{t('users')}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {t('userManagement')}
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 btn-primary text-white px-6 py-3 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">{t('addNewUser')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pr-12 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={itemsPerPage} columns={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('name')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('email')}</th>
                                    <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('password')}</th>

                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('phone')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('role')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('status')}</th>
                  <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      {t('errorLoadingData')}
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      {t('noData')}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="text-start">
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{user.email}</span>
                      </td>
                          <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group">
                          <span className="text-sm text-gray-600">{user.password || '-'}</span>
                          {user.password && (
                            <button
                              onClick={() => handleCopyPassword(user.id, user.password)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                              title={t('copy')}
                            >
                              {copiedPasswordId === user.id ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <WhatsAppPhone
                          phone={`${user.countryCode} ${user.phone}`}
                          className="text-gray-900"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-purple-600 font-medium">{user.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${user.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                            }`}
                        >
                          {user.status === 'active' ? t('active') : t('inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-start">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                            title={t('view')}
                          >
                            <Eye className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            className="p-2 hover:bg-primary-light rounded-lg transition-colors group"
                            title={t('edit')}
                          >
                            <Pencil className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                            title={t('delete')}
                            disabled={deleteStaff.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={allUsers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddUser}
      />

      {selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          onSubmit={handleEditUser}
          userData={{
            name: selectedUser.name,
            email: selectedUser.email,
            phone: selectedUser.phone,
            countryCode: selectedUser.countryCode,
            role: selectedUser.role,
            permissions: selectedUser.permissions,
            password: '',
            id: selectedUser.id,
          }}
        />
      )}

      {selectedUser && (
        <ViewUserModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedUser(null);
          }}
          userData={selectedUser}
        />
      )}
      {ConfirmDialog}
    </div>
  );
}
