import { useEffect, useState } from "react";
import { Trash2, Plus, Pencil, Search, ShieldCheck, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import Pagination from "../../../components/ui/Pagination";
import { useDeleteRole, useAddRole, useSearchRoles, useUpdateRole, useAddPermissionsToRole, useRevokePermissionsToRole } from "../hooks/useRoles";
import AddRoleModal from "../../../components/modals/AddRoleModal";
import { Role } from "../../../types/roles";
import { RoleFormData } from "../../../lib/schemas/RoleSchema";
import { TableSkeleton } from "../../../components/ui/CustomSkeleton";
import { useConfirm } from "../../../hooks/useConfirm";


export default function Roles() {
    const { t, i18n } = useTranslation();
    const language = i18n.language.split('-')[0];
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const { data: roles, isLoading } = useSearchRoles(debouncedSearch);
    const { mutateAsync: addRole, isPending: isAdding } = useAddRole();
    const { mutate: updateRole, isPending: isUpdating } = useUpdateRole();
    const { mutate: deleteRole } = useDeleteRole();
    const { mutateAsync: assignPermissions } = useAddPermissionsToRole();
    const { mutateAsync: revokePermissions } = useRevokePermissionsToRole();
    const { confirm, ConfirmDialog } = useConfirm();

    const itemsPerPage = 7;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.length > 2) {
                setDebouncedSearch(searchTerm);
            } else if (searchTerm === "") {
                setDebouncedSearch("");
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredRoles = roles?.data || [];

    const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRoles = filteredRoles.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handleDeleteRole = async (id: string) => {
        const confirmed = await confirm({
            title: t("deleteRole"),
            message: t("deleteConfirmRole"),
        });
        if (confirmed) {
            deleteRole({ id });
        }
    };

    const handleEditClick = (role: Role) => {
        setSelectedRole(role);
        setIsModalOpen(true);
    };

    const handleSubmitRole = async (data: RoleFormData) => {
        if (selectedRole) {
            const permissionsToAdd = data.permissionIds?.filter(
                (id: string) => !selectedRole.permissions?.some((p: any) => p.id === id)
            ) || [];
            const permissionsToRevoke = selectedRole.permissions?.filter(
                (p: any) => !data.permissionIds?.includes(p.id)
            ).map((p: any) => p.id) || [];
            try {
                const promises = [];
                if (permissionsToAdd.length > 0) {
                    promises.push(assignPermissions({ roleId: selectedRole.id, permissionIds: permissionsToAdd }));
                }
                if (permissionsToRevoke.length > 0) {
                    promises.push(revokePermissions({ roleId: selectedRole.id, permissionIds: permissionsToRevoke }));
                }
                if (promises.length > 0) {
                    await Promise.all(promises);
                }

                setIsModalOpen(false);
                setSelectedRole(null);
            } catch (error) {
                console.error("Failed to update role permissions:", error);
                throw error;
            }
        } else {
            await addRole({ name: data.name, permissionIds: data.permissionIds || [] });
            setIsModalOpen(false);
        }
    };

    const handleAddClick = () => {
        setSelectedRole(null);
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <Home className="w-4 h-4" />
                <span>{t('home')}</span>
                <span className="text-gray-400">/</span>
                <span className="text-primary font-medium">{t('roles')}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div className="text-start">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t('roleManagement')}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {t('roleManagementSubtitle')}
                    </p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="flex items-center gap-2 btn-primary text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">{t('addNewRole')}</span>
                </button>
            </div>


            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="relative">
                    <Search className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
                    <input
                        type="text"
                        placeholder={t('search')}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className={`w-full ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-start`}
                    />
                </div>
            </div>

            {/* Table or Skeleton */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <TableSkeleton rows={itemsPerPage} columns={2} />
                    ) : (
                        <table className="w-full">
                            {/* HEADER */}
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                                        {t("roleName")}
                                    </th>                            
                                    <th className="px-6 py-4 text-start text-sm font-semibold text-gray-700">
                                        {t("actions")}
                                    </th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody className="divide-y divide-gray-200">
                                {currentRoles.length > 0 ? (
                                    currentRoles.map((role: any) => (
                                        <tr
                                            key={role.id}
                                            className="hover:bg-gray-50/50 transition-colors group"
                                        >
                                            {/* ROLE NAME */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3 justify-start">
                                                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                                                        <span className="text-purple-600 text-sm font-bold">
                                                            {role.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="text-start">
                                                        <div className="text-sm font-bold text-gray-900">
                                                            {role.name}
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>

                                           

                                            {/* ACTIONS */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 justify-start">
                                                    <button
                                                        onClick={() => handleEditClick(role)}
                                                        className="p-2 hover:bg-primary-50 rounded-lg transition-colors group/btn"
                                                        title={t('edit')}
                                                    >
                                                        <Pencil className="w-4 h-4 text-gray-400 group-hover/btn:text-blue-600" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn"
                                                        title={t('delete')}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500 bg-gray-50/30">
                                            <div className="flex flex-col items-center gap-2">
                                                <ShieldCheck className="w-12 h-12 text-gray-200" />
                                                <p>{t("noData")}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {!isLoading && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRoles.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                )}
            </div>

            {/* Modal */}
            <AddRoleModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedRole(null);
                }}
                onSubmit={handleSubmitRole}
                initialData={selectedRole}
                isLoading={isAdding || isUpdating}
            />
            {ConfirmDialog}
        </div>
    );
}
