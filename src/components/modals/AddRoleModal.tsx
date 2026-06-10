import { X, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getRoleSchema, RoleFormData } from '../../lib/schemas/RoleSchema';
import { useEffect, useState } from 'react';
import { usePermissions } from '../../features/admin/hooks/usePermissions';
import { Controller } from 'react-hook-form';
import { CustomCheckbox } from '../ui/CustomCheckbox';
import { Role } from '../../types/roles';
import { Permission } from '../../types/permission';

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RoleFormData) => void;
    initialData?: Role | null;
    isLoading?: boolean;
}

export default function AddRoleModal({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    isLoading,
}: AddRoleModalProps) {
    const { t, i18n } = useTranslation();
    const language = i18n.language.split('-')[0];
    const isEdit = !!initialData;
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors },
    } = useForm<RoleFormData>({
        resolver: zodResolver(getRoleSchema(t)),
        defaultValues: {
            name: '',
            permissionIds: [],
        },
    });

    const { data: permissions, isLoading: isLoadingPermissions } = usePermissions();

    const normalizeKey = (value?: string | null) =>
        value
            ?.trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '') || '';

    const prettify = (value?: string | null) =>
        value
            ?.replace(/[_-]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .replace(/\b\w/g, (char) => char.toUpperCase()) || '';

    const actionKeys = new Set([
        'get',
        'post',
        'put',
        'patch',
        'delete',
        'create',
        'read',
        'view',
        'list',
        'update',
        'edit',
        'remove',
        'approve',
        'reject',
        'assign',
        'revoke',
        'join',
        'leave',
        'handle',
        'manage',
    ]);

    const permissionActionLabels: Record<string, { ar: string; en: string }> = {
        get: { ar: 'عرض', en: 'View' },
        post: { ar: 'إنشاء', en: 'Create' },
        put: { ar: 'تحديث', en: 'Update' },
        patch: { ar: 'تحديث', en: 'Update' },
        delete: { ar: 'حذف', en: 'Delete' },
        create: { ar: 'إنشاء', en: 'Create' },
        read: { ar: 'عرض', en: 'View' },
        view: { ar: 'عرض', en: 'View' },
        list: { ar: 'عرض قائمة', en: 'List' },
        update: { ar: 'تحديث', en: 'Update' },
        edit: { ar: 'تعديل', en: 'Edit' },
        remove: { ar: 'حذف', en: 'Delete' },
        approve: { ar: 'قبول', en: 'Approve' },
        reject: { ar: 'رفض', en: 'Reject' },
        assign: { ar: 'تعيين', en: 'Assign' },
        revoke: { ar: 'إلغاء', en: 'Revoke' },
        join: { ar: 'دخول', en: 'Join' },
        leave: { ar: 'مغادرة', en: 'Leave' },
        handle: { ar: 'معالجة', en: 'Handle' },
        manage: { ar: 'إدارة', en: 'Manage' },
    };

    const permissionResourceLabels: Record<string, { ar: string; en: string }> = {
        general: { ar: 'عام', en: 'General' },
        dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
        policies: { ar: 'السياسات', en: 'Policies' },
        settings: { ar: 'الإعدادات', en: 'Settings' },
        users: { ar: 'المستخدمين', en: 'Users' },
        roles: { ar: 'الأدوار', en: 'Roles' },
        permissions: { ar: 'الصلاحيات', en: 'Permissions' },
        courses: { ar: 'الكورسات', en: 'Courses' },
        lectures: { ar: 'المحاضرات', en: 'Lectures' },
        sessions: { ar: 'الحصص', en: 'Sessions' },
        homework: { ar: 'الواجبات', en: 'Homework' },
        assignments: { ar: 'الواجبات', en: 'Assignments' },
        exams: { ar: 'الامتحانات', en: 'Exams' },
        profile: { ar: 'الملف الشخصي', en: 'Profile' },
        requests: { ar: 'الطلبات', en: 'Requests' },
        withdrawals: { ar: 'طلبات السحب', en: 'Withdrawals' },
        weekly_reports: { ar: 'التقارير الأسببيت القرانة', en: 'Weekly Reports' },
        subscriptions: { ar: 'الاشتراكات', en: 'Subscriptions' },
        support: { ar: 'الدعم', en: 'Support' },
        calendar: { ar: 'التقويم', en: 'Calendar' },
        plans: { ar: 'الخطط', en: 'Plans' },
        plan: { ar: 'الخطة', en: 'Plan' },
        chat: { ar: 'المحادثات', en: 'Chat' },
        finances: { ar: 'الماليات', en: 'Finances' },
        currency: { ar: 'العملة', en: 'Currency' },
        currencies: { ar: 'العملات', en: 'Currencies' },
        currencyies: { ar: 'العملات', en: 'Currencies' },
        transactions: { ar: 'المعاملات', en: 'Transactions' },
        expenses: { ar: 'المصروفات', en: 'Expenses' },
        ranks: { ar: 'الترتيب', en: 'Ranks' },
        subjects: { ar: 'المواد', en: 'Subjects' },
        subject: { ar: 'المادة', en: 'Subject' },
        students: { ar: 'الطلاب', en: 'Students' },
        teachers: { ar: 'المعلمين', en: 'Teachers' },
        staff: { ar: 'الموظفين', en: 'Staff' },
        stuff: { ar: 'الموظفين', en: 'Staff' },
        parents: { ar: 'أولياء الأمور', en: 'Parents' },
    };

    const getLocalizedLabel = (
        labels: Record<string, { ar: string; en: string }>,
        key: string,
        fallback?: string | null
    ) => {
        const normalizedKey = normalizeKey(key);
        const currentLanguage = language === 'ar' ? 'ar' : 'en';
        return labels[normalizedKey]?.[currentLanguage] || prettify(fallback || key);
    };

    const parsePermissionSource = (value?: string | null) => {
        const parts = normalizeKey(value).split('_').filter(Boolean);

        if (parts.length < 2) {
            return { actionKey: '', resourceKey: '' };
        }

        const firstPart = parts[0];
        const lastPart = parts[parts.length - 1];

        if (actionKeys.has(firstPart)) {
            return {
                actionKey: firstPart,
                resourceKey: parts.slice(1).join('_'),
            };
        }

        if (actionKeys.has(lastPart)) {
            return {
                actionKey: lastPart,
                resourceKey: parts.slice(0, -1).join('_'),
            };
        }

        return { actionKey: '', resourceKey: '' };
    };

    const getPermissionParts = (permission: Permission) => {
        const parsedCode = parsePermissionSource(permission.code);
        const parsedName = parsePermissionSource(permission.name);

        let resourceKey = normalizeKey(permission.resource);
        let actionKey = normalizeKey(permission.action || permission.method);

        if (!actionKey || !actionKeys.has(actionKey)) {
            actionKey = parsedCode.actionKey || parsedName.actionKey || actionKey;
        }

        if (!resourceKey) {
            resourceKey = parsedCode.resourceKey || parsedName.resourceKey;
        }

        return { actionKey, resourceKey };
    };

    const translatePermissionCategory = (category: string) => {
        const normalizedCategory = normalizeKey(category);
        return getLocalizedLabel(permissionResourceLabels, normalizedCategory, category);
    };

    const translatePermission = (permission: Permission) => {
        const codeKey = normalizeKey(permission.code);
        if (codeKey) {
            const translatedCode = t(`permissionsList.${codeKey}`, { defaultValue: '' });
            if (translatedCode) return translatedCode;
        }

        const { actionKey, resourceKey } = getPermissionParts(permission);

        if (actionKey && resourceKey) {
            const action = getLocalizedLabel(permissionActionLabels, actionKey, permission.action || permission.method);
            const resource = getLocalizedLabel(permissionResourceLabels, resourceKey, permission.resource);
            return `${action} ${resource}`.trim();
        }

        if (actionKey) {
            return getLocalizedLabel(permissionActionLabels, actionKey, permission.action || permission.method);
        }

        if (resourceKey) {
            return getLocalizedLabel(permissionResourceLabels, resourceKey, permission.resource);
        }

        const nameKey = normalizeKey(permission.name);
        if (nameKey) {
            const translatedName = t(`permissionsList.${nameKey}`, { defaultValue: '' });
            if (translatedName) return translatedName;
        }

        return prettify(permission.name || permission.code || permission.resource);
    };

    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                permissionIds: initialData.permissions?.map((p) => p.id) || [],
            });
        } else {
            reset({ name: '', permissionIds: [] });
        }
    }, [initialData, reset]);


    const handleClose = () => {
        reset();
        onClose();
    };

    const onFormSubmit = (data: RoleFormData) => {
        onSubmit(data);
        reset();
    };

    const toggleCategory = (category: string) => {
        setCollapsedCategories(prev => {
            const next = new Set(prev);
            if (next.has(category)) {
                next.delete(category);
            } else {
                next.add(category);
            }
            return next;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-6 flex justify-between items-center bg-primary text-white">
                    <h2 className="text-xl font-bold">
                        {isEdit ? t('editRole') : t('addNewRole')}
                    </h2>

                    <button onClick={handleClose}>
                        <X />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit(onFormSubmit)}
                    className="p-6 space-y-6 text-start"
                >
                    {/* Role Name */}
                    <div>
                        <label className="block mb-2 font-medium">
                            {t('roleName')}
                        </label>

                        <input
                            {...register('name')}
                            className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-200'
                                }`}
                            placeholder={t('roleName')}
                        />

                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    {/* Permissions */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="font-medium text-gray-700">
                                {t('permissions')}
                            </label>

                            {/* <div className="flex items-center gap-3">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder={t('searchPermissions') || 'Search permissions...'}
                                        className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    </div>
                                </div>
                            </div> */}
                        </div>

                        {isLoadingPermissions ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="rounded-xl overflow-hidden">
                                        <div className="h-10 bg-gray-100 animate-pulse rounded-t-xl" />
                                        <div className="grid grid-cols-3 gap-2 p-3">
                                            {[1, 2, 3].map((j) => (
                                                <div key={j} className="h-9 bg-gray-50 rounded-lg animate-pulse" />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Controller
                                name="permissionIds"
                                control={control}
                                render={({ field }) => {
                                    const handleSelectAll = (items: any[]) => {
                                        const itemIds = items.map((p: any) => p.id);
                                        const allSelected = itemIds.every((id: string) => field.value?.includes(id));
                                        if (allSelected) {
                                            field.onChange(field.value.filter((id: string) => !itemIds.includes(id)));
                                        } else {
                                            const newIds = itemIds.filter((id: string) => !field.value?.includes(id));
                                            field.onChange([...(field.value || []), ...newIds]);
                                        }
                                    };

                                    const filteredData = permissions?.data ? Object.entries(permissions.data).reduce((acc, [category, items]) => {
                                        const filteredItems = (items as Permission[]).filter(p =>
                                            translatePermission(p).toLowerCase().includes(searchQuery.toLowerCase()) ||
                                            translatePermissionCategory(category).toLowerCase().includes(searchQuery.toLowerCase())
                                        );
                                        if (filteredItems.length > 0) acc[category] = filteredItems;
                                        return acc;
                                    }, {} as any) : {};

                                    return (
                                        <div
                                            className="space-y-3 max-h-[420px] overflow-y-auto pr-1"
                                            style={{
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: 'var(--color-primary) transparent',
                                            }}
                                        >
                                            {Object.entries(filteredData).length > 0
                                                ? (Object.entries(filteredData) as [string, any[]][]).map(([category, items]) => {
                                                    if (!items.length) return null;
                                                    const isCollapsed = collapsedCategories.has(category);
                                                    const selectedCount = items.filter((p: any) => field.value?.includes(p.id)).length;
                                                    const allSelected = selectedCount === items.length;

                                                    return (
                                                        <div
                                                            key={category}
                                                            className="rounded-xl border border-gray-200 overflow-hidden transition-shadow duration-200 hover:shadow-sm"
                                                        >
                                                            {/* Category Header */}
                                                            <div
                                                                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                                                                style={{
                                                                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                                }}
                                                                onClick={() => toggleCategory(category)}
                                                            >
                                                                <div className="flex items-center gap-2.5">
                                                                    <div
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                                        style={{
                                                                            backgroundColor: 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
                                                                        }}
                                                                    >
                                                                        <Shield size={16} className="text-primary" />
                                                                    </div>
                                                                    <span className="font-semibold text-sm text-gray-800 capitalize">
                                                                        {translatePermissionCategory(category)}
                                                                    </span>
                                                                    {/* Count Badge */}
                                                                    <span
                                                                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                                        style={{
                                                                            backgroundColor: selectedCount > 0
                                                                                ? 'color-mix(in srgb, var(--color-primary) 15%, transparent)'
                                                                                : '#f1f5f9',
                                                                            color: selectedCount > 0
                                                                                ? 'var(--color-primary)'
                                                                                : '#94a3b8',
                                                                        }}
                                                                    >
                                                                        {selectedCount}/{items.length}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center gap-2">
                                                                    {/* Select All */}
                                                                    <button
                                                                        type="button"
                                                                        className="text-xs font-medium px-2.5 py-1 rounded-lg transition-colors duration-150"
                                                                        style={{
                                                                            color: allSelected ? '#ef4444' : 'var(--color-primary)',
                                                                            backgroundColor: allSelected
                                                                                ? 'color-mix(in srgb, #ef4444 8%, transparent)'
                                                                                : 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
                                                                        }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleSelectAll(items);
                                                                        }}
                                                                    >
                                                                        {allSelected ? t('deselectAll') || 'Deselect All' : t('selectAll') || 'Select All'}
                                                                    </button>
                                                                    {isCollapsed
                                                                        ? <ChevronDown size={16} className="text-gray-400" />
                                                                        : <ChevronUp size={16} className="text-gray-400" />
                                                                    }
                                                                </div>
                                                            </div>

                                                            {/* Category Permissions */}
                                                            {!isCollapsed && (
                                                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3 bg-white">
                                                                    {items.map((permission: any) => {
                                                                        const isChecked = field.value?.includes(permission.id);
                                                                        return (
                                                                            <label
                                                                                key={permission.id}
                                                                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border cursor-pointer transition-all duration-200 ${isChecked
                                                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                                                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 bg-white'
                                                                                    }`}
                                                                            >
                                                                                <CustomCheckbox
                                                                                    checked={isChecked}
                                                                                    onChange={() => {
                                                                                        const newValue = isChecked
                                                                                            ? field.value.filter((id: string) => id !== permission.id)
                                                                                            : [...(field.value || []), permission.id];
                                                                                        field.onChange(newValue);
                                                                                    }}
                                                                                />
                                                                                <span className={`text-sm leading-tight ${isChecked ? 'text-primary font-medium' : 'text-gray-600'}`}>
                                                                                    {translatePermission(permission)}
                                                                                </span>
                                                                            </label>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                                : null}
                                        </div>
                                    );
                                }}
                            />
                        )}

                        {errors.permissionIds && (
                            <p className="text-red-500 text-sm mt-2">
                                {errors.permissionIds.message}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 btn-primary text-white py-3 rounded-xl font-bold"
                        >
                            {isLoading
                                ? t('saving')
                                : isEdit
                                    ? t('update')
                                    : t('add')}
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-3 border rounded-xl"
                        >
                            {t('cancel')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
