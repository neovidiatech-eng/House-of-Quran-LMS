import { useLanguage } from '../../contexts/LanguageContext';
// import { useEffect } from 'react';
// import { X } from 'lucide-react';
// import { useTranslation } from 'react-i18next';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { getRoleSchema, RoleFormData } from '../../lib/schemas/RoleSchema';

// interface EditRoleModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: RoleFormData) => void;
//   roleData: {
//     id: string;
//     name: string;
//     description: string;
//     permissions: string[];
//     status: 'active' | 'inactive';
//   };
// }

// const ALL_PERMISSIONS = [
//   { id: 'dashboard_view', label: 'Dashboard View' },
//   { id: 'students_manage', label: 'Manage Students' },
//   { id: 'teachers_manage', label: 'Manage Teachers' },
//   { id: 'sessions_manage', label: 'Manage Sessions' },
//   { id: 'plans_manage', label: 'Manage Plans' },
//   { id: 'subscriptions_manage', label: 'Manage Subscriptions' },
//   { id: 'exams_manage', label: 'Manage Exams' },
//   { id: 'homework_manage', label: 'Manage Homework' },
//   { id: 'settings_manage', label: 'Manage Settings' },
//   { id: 'users_manage', label: 'Manage Users' },
//   { id: 'finance_manage', label: 'Manage Finance' },
//   { id: 'requests_manage', label: 'Manage Requests' },
// ];

// export default function EditRoleModal({ isOpen, onClose, onSubmit, roleData }: EditRoleModalProps) {
const { language } = useLanguage();
//   const { t, i18n } = useTranslation();

//   const {
//     register,
//     handleSubmit,
//     control,
//     reset,
//     formState: { errors, isSubmitting },
//   } = useForm<RoleFormData>({
//     resolver: zodResolver(getRoleSchema(t)),
//     defaultValues: {
//       name: roleData.name,
//       description: roleData.description,
//       permissions: roleData.permissions,
//       status: roleData.status,
//     },
//   });

//   useEffect(() => {
//     if (isOpen) {
//       reset({
//         name: roleData.name,
//         description: roleData.description,
//         permissions: roleData.permissions,
//         status: roleData.status,
//       });
//     }
//   }, [isOpen, roleData, reset]);

//   const handleClose = () => {
//     reset();
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
//       <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300" dir={language === 'ar' ? 'rtl' : 'ltr'}>
//         {/* Header */}
//         <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/20 to-transparent pointer-events-none" />
//           <h2 className="text-xl font-bold text-white relative z-10">
//             {t('editRole')}
//           </h2>
//           <button
//             onClick={handleClose}
//             className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white relative z-10"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         {/* Form Content */}
//         <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto p-6 space-y-8">
//           <div className="grid grid-cols-1 gap-6">
//             {/* Role Name */}
//             <div className="space-y-2">
//               <label className="block text-sm font-semibold text-gray-700">
//                 {t('roleName')}
//               </label>
//               <input
//                 {...register('name')}
//                 className={`w-full px-4 py-3 rounded-xl border ${
//                   errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary'
//                 } focus:outline-none focus:ring-2 bg-gray-50/50 transition-all text-start`}
//                 placeholder={t('roleName')}
//               />
//               {errors.name && (
//                 <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
//               )}
//             </div>

//             {/* Description */}
//             <div className="space-y-2">
//               <label className="block text-sm font-semibold text-gray-700">
//                 {t('description')}
//               </label>
//               <textarea
//                 {...register('description')}
//                 rows={3}
//                 className={`w-full px-4 py-3 rounded-xl border ${
//                   errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-primary'
//                 } focus:outline-none focus:ring-2 bg-gray-50/50 transition-all text-start resize-none`}
//                 placeholder={t('description')}
//               />
//               {errors.description && (
//                 <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
//               )}
//             </div>

//              {/* Status Selection */}
//              <div className="space-y-2">
//               <label className="block text-sm font-semibold text-gray-700">
//                 {t('status')}
//               </label>
//               <div className="flex gap-4">
//                 {['active', 'inactive'].map((status) => (
//                   <label key={status} className="flex-1 cursor-pointer">
//                     <input
//                       type="radio"
//                       {...register('status')}
//                       value={status}
//                       className="peer hidden"
//                     />
//                     <div className={`py-3 px-4 rounded-xl border-2 text-center font-medium transition-all ${
//                       status === 'active'
//                         ? 'peer-checked:border-green-500 peer-checked:bg-green-50 bg-gray-50 text-gray-600 peer-checked:text-green-700'
//                         : 'peer-checked:border-red-500 peer-checked:bg-red-50 bg-gray-50 text-gray-600 peer-checked:text-red-700'
//                     }`}>
//                       {t(status)}
//                     </div>
//                   </label>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Permissions Section */}
//           <div className="space-y-4">
//             <h3 className="text-lg font-bold text-gray-900">{t('permissions')}</h3>
//             <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
//               <Controller
//                 name="permissions"
//                 control={control}
//                 render={({ field }) => (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {ALL_PERMISSIONS.map((perm) => (
//                       <div key={perm.id} className="flex items-center gap-3">
//                         <CustomCheckbox
//                           id={perm.id}
//                           checked={field.value.includes(perm.id)}
//                           onChange={(checked) => {
//                             if (checked) {
//                               field.onChange([...field.value, perm.id]);
//                             } else {
//                               field.onChange(field.value.filter((id) => id !== perm.id));
//                             }
//                           }}
//                         />
//                          <label
//                           htmlFor={perm.id}
//                           className="text-sm font-medium text-gray-700 cursor-pointer select-none"
//                         >
//                           {perm.label}
//                         </label>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               />
//               {errors.permissions && (
//                 <p className="text-xs text-red-500 mt-4 text-center">{errors.permissions.message}</p>
//               )}
//             </div>
//           </div>

//           {/* Actions */}
//           <div className="flex items-center gap-4 pt-4">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="flex-1 btn-primary text-white py-4 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20"
//             >
//               {isSubmitting ? t('saving') : t('saveChanges')}
//             </button>
//             <button
//               type="button"
//               onClick={handleClose}
//               className="px-8 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
//             >
//               {t('cancel')}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
