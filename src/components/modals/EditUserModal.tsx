import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CustomSelect from '../ui/CustomSelect';
import { EditUserFormData, getEditUserSchema } from '../../lib/schemas/UserSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useRoles } from '../../features/admin/hooks/useRoles';
import { DEFAULT_COUNTRIES } from '../../consts/countries';
import { useGetCities } from '../../features/teacher/hooks/useCity';
// import { CustomCheckbox } from '../ui/CustomCheckbox';
//import { usePermissions } from '../../hooks/usePermissions';

//  To Add id to userData
interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: EditUserFormData & { id: string }) => Promise<void>;
  userData: EditUserFormData & { id: string };
}
// Static permission list removed in favor of dynamic fetching

export default function EditUserModal({ isOpen, onClose, onSubmit, userData }: EditUserModalProps) {
  const { language, t } = useLanguage();

  // const { data: permsData} = usePermissions();
  // const permissionsList = permsData?.data || [];

  // const dynamicPermissionGroups = permissionsList.reduce((acc: any, p) => {
  //   const parts = p.code.split('_');
  //   const groupKey = parts.length > 1 ? parts[0].toLowerCase() : 'other';

  //   if (!acc[groupKey]) {
  //     acc[groupKey] = {
  //       title: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
  //       permissions: []
  //     };
  //   }
  //   acc[groupKey].permissions.push({
  //     id: p.code,
  //     label: p.name
  //   });
  //   return acc;
  // }, {});

  const { control, handleSubmit, register, reset, watch, formState: { errors } } = useForm<EditUserFormData>({
    resolver: zodResolver(getEditUserSchema(t)),
    defaultValues: userData,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [countryCodes] = useState<Array<{ name: string; phone_code: string; emoji?: string; iso2: string }>>(DEFAULT_COUNTRIES);
  const { data: rolesData } = useRoles();
  const dynamicRoles = rolesData?.data || [];

  useEffect(() => {
    if (userData && isOpen) {
      reset({ ...userData, password: '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, isOpen]);


  const onFormSubmit = async (data: EditUserFormData) => {
    try {
      await onSubmit({
        ...data,
        id: userData.id,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const uniqueCountryCodes = Array.from(
    new Map(countryCodes.map((c) => [`+${c.phone_code}`, c])).values()
  );
  const displayNames = new Intl.DisplayNames([language === 'ar' ? 'ar' : 'en'], { type: 'region' });

  const selectedCountry = watch("country");
  const selectedCountryObj = DEFAULT_COUNTRIES.find((c) => c.name === selectedCountry);
  const iso2 = selectedCountryObj?.iso2?.toLowerCase() || "eg";
  const { data: citiesData } = useGetCities(iso2);
  const cityOptions = citiesData ? citiesData.map((city: any) => ({
    value: city.name,
    label: city.name
  })) : [];

  const countries = DEFAULT_COUNTRIES.map((c) => ({
    value: c.name,
    label: `${c.emoji} ${displayNames.of(c.iso2) || c.name}`,
  }));

  const countryOptions = uniqueCountryCodes.map((c) => ({
    value: `+${c.phone_code}`,
    searchText: `${displayNames.of(c.iso2) || c.name} +${c.phone_code}`,
    label: (
      <div className={`flex justify-between items-center ${language === 'ar' ? 'flex-row-reverse' : ''} w-full text-start`}>
        <span>{c.emoji} {displayNames.of(c.iso2) || c.name}</span>
        <span className="text-gray-400 font-mono text-xs">+{c.phone_code}</span>
      </div>
    ),
  }));

  const roleOptions = dynamicRoles.map((role) => ({
    value: role.id,
    searchText: role.name,
    label: (
      <div className="text-start w-full capitalize">
        {role.name}
      </div>
    ),
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-primary rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">
            {t('editUser')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white/80" />
          </button>
        </div>

        {/* Body */}
        <form id="edit-user-form" onSubmit={handleSubmit(onFormSubmit)} className="flex-1  overflow-y-auto no-scrollbar p-6">
          <div className="space-y-6">
            {/* Name and Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  {t('name')}
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"

                />
                {errors.name && <p className="text-red-500 text-xs mt-1 text-start">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  {language === 'ar' ? 'السن' : 'Age'}
                </label>
                <input
                  type="text"
                  {...register('age')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                />
                {errors.age && <p className="text-red-500 text-xs mt-1 text-start">{errors.age.message}</p>}
              </div>
            </div>

            {/* Country and City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Controller
                  name="country"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={language === 'ar' ? 'الدولة' : 'Country'}
                      value={field.value}
                      onChange={field.onChange}
                      options={countries}
                      className="h-[48px]"
                    />
                  )}
                />
              </div>
              <div>
                <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <CustomSelect
                      label={language === 'ar' ? 'المدينة' : 'City'}
                      value={field.value}
                      onChange={field.onChange}
                      options={cityOptions}
                      className="h-[48px]"
                    />
                  )}
                />
              </div>
            </div>

            {/* Country Code and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="countryCode"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('countryCode')}
                    value={field.value}
                    onChange={field.onChange}
                    options={countryOptions}
                    className="h-[48px]"
                  />
                )}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  dir="ltr"
                  placeholder="1234567890"

                />
                {errors.phone && <p className="text-red-500 text-xs mt-1 text-start">{errors.phone.message}</p>}

              </div>
            </div>

            {/* Age and Role */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  {t('email')}
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start"
                  dir="ltr"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 text-start">{errors.email.message}</p>}
              </div>

              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    label={t('role')}
                    value={field.value}
                    onChange={field.onChange}
                    options={roleOptions}
                    className="h-[48px]"
                  />
                )}
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                  {t('newPasswordOptional')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    className="w-full px-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-start transition-all"
                    dir="ltr"
                    placeholder={t('leaveEmptyPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Permissions */}
            {/* <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 text-start w-full">
                  {t('permissions')}
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoadingPerms ? (
                  <div className="col-span-3 text-center py-4">{t('loading')}...</div>
                ) : (
                  Object.entries(dynamicPermissionGroups).map(([key, group]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900 text-start">
                        {group.title}
                      </h3>
                      {group.permissions.map((permission: any) => (
                        <label
                          key={permission.id}
                          className="flex items-center justify-end gap-2 cursor-pointer"
                        >
                          <span className="text-sm text-gray-700">
                            {permission.label}
                          </span>
                          <Controller
                            name="permissions"
                            control={control}
                            render={({ field }) => {
                              const isChecked = field.value?.includes(permission.id) ?? false;
                              return (
                                <CustomCheckbox
                                  checked={isChecked}
                                  onChange={() => {
                                    const next = isChecked
                                      ? field.value.filter((id: string) => id !== permission.id)
                                      : [...(field.value || []), permission.id];
                                    field.onChange(next);
                                  }}
                                />
                              );
                            }}
                          />
                        </label>
                      ))}
                    </div>
                  ))
                )}
                {errors.permissions && <p className="text-red-500 text-sm mt-4 text-center w-full col-span-1 md:col-span-3">{errors.permissions.message}</p>}
              </div>
            </div> */}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-medium"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            form="edit-user-form"
            className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}


