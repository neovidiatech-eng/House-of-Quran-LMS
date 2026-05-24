import { useState, useEffect } from 'react';
import {
  Plus, Trash2, Shield, Home,
  Search, ChevronDown, ChevronUp, X, Check, Loader2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePermissions, useAddPermission, useUpdatePermission, useDeletePermission } from '../hooks/usePermissions';
import { Permission, CreatePermissionPayload } from '../../../types/permission';
import { useConfirm } from '../../../hooks/useConfirm';
import { message, Spin } from 'antd';

// ─── Inline Modal ────────────────────────────────────────────────────────────
interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePermissionPayload) => void;
  initialData?: Permission | null;
  isLoading?: boolean;
}

function PermissionModal({ isOpen, onClose, onSubmit, initialData, isLoading }: PermissionModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.split('-')[0] === 'ar';
  const isEdit = !!initialData;

  const [form, setForm] = useState<{ name: string; resource: string; method: string }>({
    name: initialData?.name ?? '',
    resource: initialData?.resource ?? initialData?.code ?? '',
    method: initialData?.method ?? '',
  });

  const [errors, setErrors] = useState<{ name?: string; resource?: string; method?: string }>({});

  const handleChange = (field: 'name' | 'resource' | 'method', value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: { name?: string; resource?: string; method?: string } = {};
    if (!form.name.trim()) e.name = t('validation.required') || 'Required';
    if (!form.resource.trim()) e.resource = t('validation.required') || 'Required';
    if (!form.method.trim()) e.method = t('validation.required') || 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const handleClose = () => {
    setForm({ name: '', resource: '', method: '' });
    setErrors({});
    onClose();
  };

  // Reset form when initialData changes
  useEffect(() => {
    setForm({
      name: initialData?.name ?? '',
      resource: initialData?.resource ?? initialData?.code ?? '',
      method: initialData?.method ?? '',
    });
  }, [initialData]);

  if (!isOpen) return null;

  const inputCls = (field: 'name' | 'resource' | 'method') =>
    `w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary'
    }`;

  return (
    <div className="fixed inset-0 !mt-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-primary text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <h2 className="text-lg font-bold">
              {isEdit ? t('editPermission') || 'Edit Permission' : t('addPermission') || 'Add Permission'}
            </h2>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('permissionName') || 'Permission Name'} <span className="text-red-400">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="e.g. Create Course"
              className={inputCls('name')}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Resource */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('permissionResource') || 'Resource'} <span className="text-red-400">*</span>
            </label>
            <input
              value={form.resource}
              onChange={e => handleChange('resource', e.target.value)}
              placeholder="e.g. courses"
              className={inputCls('resource')}
              dir="ltr"
            />
            {errors.resource && <p className="text-red-500 text-xs mt-1">{errors.resource}</p>}
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t('permissionMethod') || 'Method'} <span className="text-red-400">*</span>
            </label>
            <select
              value={form.method}
              onChange={e => handleChange('method', e.target.value)}
              className={inputCls('method')}
            >
              <option value="">Select Method</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            {errors.method && <p className="text-red-500 text-xs mt-1">{errors.method}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2 btn-primary text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isLoading ? (t('saving') || 'Saving...') : isEdit ? (t('update') || 'Update') : (t('add') || 'Add')}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium text-sm transition-colors"
            >
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Permissions() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language.split('-')[0] === 'ar';
  const { data: permissionsResponse, isLoading } = usePermissions();
  const { mutate: addPermission, isPending: isAdding } = useAddPermission();
  const { mutate: updatePermission, isPending: isUpdating } = useUpdatePermission();
  const { mutate: deletePermission } = useDeletePermission();
  const { confirm, ConfirmDialog } = useConfirm();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const openAdd = () => {
    setSelectedPermission(null);
    setIsModalOpen(true);
  };

  // const openEdit = (perm: Permission) => {
  //   setSelectedPermission(perm);
  //   setIsModalOpen(true);
  // };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: t('deletePermission') || 'Delete Permission',
      message: t('deleteConfirmPermission') || 'Are you sure you want to delete this permission?',
    });
    if (confirmed) deletePermission(id);
  };

  const handleSubmit = (data: CreatePermissionPayload) => {
    if (selectedPermission) {
      updatePermission(
        { id: selectedPermission.id, permission: data },
        {
          onSuccess: () => {
            message.success(t('updatedSuccessfully') || 'Updated successfully');
            setIsModalOpen(false);
            setSelectedPermission(null);
          },
        }
      );
    } else {
      addPermission(data, {
        onSuccess: () => {
          message.success(t('addedSuccessfully') || 'Added successfully');
          setIsModalOpen(false);
        },
      });
    }
  };

  // Flatten all permissions across categories for display + search
  const rawData = permissionsResponse?.data ?? {} as Record<string, Permission[]>;
  const filteredData: Record<string, Permission[]> = {};
  for (const [cat, items] of Object.entries(rawData)) {
    if (!Array.isArray(items)) continue;
    const q = searchQuery.toLowerCase();
    const filtered = items.filter(p =>
      (p?.name?.toLowerCase() ?? '').includes(q) ||
      (p?.code?.toLowerCase() ?? '').includes(q) ||
      (p?.action?.toLowerCase() ?? '').includes(q) ||
      (p?.resource?.toLowerCase() ?? '').includes(q) ||
      (p?.method?.toLowerCase() ?? '').includes(q) ||
      cat.toLowerCase().includes(q)
    );
    if (filtered.length > 0) filteredData[cat] = filtered;
  }

  const totalPermissions = Object.values(rawData).reduce((s, arr) => s + (Array.isArray(arr) ? arr.length : 0), 0);
  const totalCategories = Object.keys(rawData).length;

  return (
    <div className="p-6 lg:p-8 space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Home className="w-4 h-4" />
        <span>{t('home') || 'Home'}</span>
        <span className="text-gray-300">/</span>
        <span className="text-primary font-medium">{t('permissions') || 'Permissions'}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('permissionsManagement') || 'Permissions Management'}</h1>
          <p className="text-gray-500 mt-1 text-sm">{t('permissionsManagementSubtitle') || 'Manage system permissions grouped by category'}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 btn-primary text-white px-6 py-3 rounded-xl shadow-sm hover:shadow-md transition-all font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('addPermission') || 'Add Permission'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : totalPermissions}</p>
            <p className="text-sm text-gray-500">{t('totalPermissions') || 'Total Permissions'}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center">
            <Shield className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{isLoading ? '—' : totalCategories}</p>
            <p className="text-sm text-gray-500">{t('totalCategories') || 'Categories'}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="relative">
          <Search className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchPermissions') || 'Search permissions by name, code, or action...'}
            className={`w-full ${isRtl ? 'pl-12 pr-4' : 'pr-12 pl-4'} py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all`}
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Spin size="large" />
        </div>
      ) : Object.keys(filteredData).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center py-20 text-center">
          <Shield className="w-16 h-16 text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">{t('noData') || 'No permissions found'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {(Object.entries(filteredData) as [string, Permission[]][]).map(([category, items]) => {
            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield size={16} className="text-primary" />
                    </div>
                    <span className="font-bold text-gray-800 capitalize text-start">
                      {category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                      {items.length}
                    </span>
                  </div>
                  {isCollapsed ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronUp size={18} className="text-gray-400" />}
                </button>

                {/* Permissions Table */}
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-y border-gray-100">
                        <tr>
                          <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {t('permissionName') || 'Name'}
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {t('permissionResource') || 'Resource'}
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {t('permissionMethod') || 'Method'}
                          </th>
                          <th className="px-6 py-3 text-start text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            {t('actions') || 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.map(perm => (
                          <tr key={perm.id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-medium text-gray-900">{perm.name}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <code className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-mono">
                                {perm.resource || perm.code}
                              </code>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary-50 text-indigo-600 uppercase">
                                {perm.method || perm.action}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {/* <button
                                  onClick={() => openEdit(perm)}
                                  className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                                  title={t('edit') || 'Edit'}
                                >
                                  <Pencil className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors" />
                                </button> */}
                                <button
                                  onClick={() => handleDelete(perm.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                  title={t('delete') || 'Delete'}
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-600 transition-colors" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <PermissionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedPermission(null); }}
        onSubmit={handleSubmit}
        initialData={selectedPermission}
        isLoading={isAdding || isUpdating}
      />

      {ConfirmDialog}
    </div>
  );
}
