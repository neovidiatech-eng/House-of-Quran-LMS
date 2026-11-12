import { useState } from "react";
import {
  Eye,
  EyeOff,
  Check,
  User,
  Mail,
  Lock,
  Users,
  UserPlus,
  Sparkles,
  Layers
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { ConfigProvider, DatePicker, Input, Select, message } from "antd";
import localeAr from 'antd/es/locale/ar_EG';
import localeEn from 'antd/es/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { usePlans } from "../features/admin/hooks/usePlans";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getRegisterSchema, RegisterInput } from "../lib/schemas/RegisterSchema";
import { register as registerService } from "../services/AuthServices";
import { DEFAULT_COUNTRIES } from "../consts";
import { useGetCities } from "../features/teacher/hooks/useCity";

interface RegisterProps {
  onRegisterSuccess: () => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const { data: plansData } = usePlans();
  void onRegisterSuccess;

  // Group Plan UI state (Front-end preview for upcoming backend support)
  const [planFilter, setPlanFilter] = useState<'all' | 'single' | 'group'>('all');
  const [groupName, setGroupName] = useState('');
  const [groupMembers, setGroupMembers] = useState<string[]>(['']);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(getRegisterSchema(t)),
    mode: "onChange",
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      codeCountry: "+20",
      birth_date: "",
      gender: "",
      country: "",
      nationality: "",
      password: "",
      plan_id: "",
      age: "",
      city: "",
    },
  });

  const selectedPackage = watch("plan_id");
  const selectedPlanObj = plansData?.find((p) => p.id === selectedPackage);

  const filteredPlans = plansData?.filter((pkg) => {
    if (planFilter === 'single') return !pkg.planType || pkg.planType === 'single';
    if (planFilter === 'group') return pkg.planType === 'group';
    return true;
  });



  const genders = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
  ];

  const displayNames = new Intl.DisplayNames(
    [language === "ar" ? "ar" : "en"],
    { type: "region" }
  );

  const countries = DEFAULT_COUNTRIES.map((country) => ({
    value: country.name,
    label: `${country.emoji} ${displayNames.of(country.iso2) || country.name}`,
  }));

  const nationalityOptions = DEFAULT_COUNTRIES.map((country) => ({
    value: country.nationality,
    label: country.nationality,
  }));


  const countryCodes = Array.from(
    new Map(
      DEFAULT_COUNTRIES.map((country) => [
        `+${country.phone_code}`,
        {
          value: `+${country.phone_code}`,
          label: `${country.emoji} ${displayNames.of(country.iso2) || country.name
            } (+${country.phone_code})`,
          country: displayNames.of(country.iso2) || country.name,
        },
      ])
    ).values()
  );

  const selectedCountry = watch("country")
  const selectedCountryObj = DEFAULT_COUNTRIES.find((c) => c.name === selectedCountry);
  const countryCode = selectedCountryObj?.iso2?.toLowerCase() || "";
  const { data: citiesData } = useGetCities(countryCode)

  const cityOptions = citiesData ? citiesData.map((city: any) => ({
    value: city.name,
    label: city.name
  })) : []



  const onSubmit = async (data: RegisterInput) => {
    try {
      const registrationData = {
        ...data,
        age: data.age ? Number(data.age) : undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      const result = await registerService(registrationData);
      if (result.status === 201 || result.status === 200) {
        message.success(result.message || t("registeredSuccess"));
        sessionStorage.setItem("verify_email", data.email);
        sessionStorage.setItem("register_role", "student");
        navigate("/verify-account");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
    }
  };

  const primaryColor = typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "#369589"
    : "#369589";

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 16,
          colorPrimary: primaryColor,
          controlOutline: `${primaryColor}26`,
        },
        components: {
          Select: {
            controlHeight: 52,
            optionSelectedBg: `${primaryColor}10`,
            colorTextPlaceholder: '#94a3b8',
            activeBorderColor: primaryColor,
            hoverBorderColor: primaryColor,
            borderRadius: 16,
          },
          Input: {
            controlHeight: 52,
            activeBorderColor: primaryColor,
            hoverBorderColor: primaryColor,
            borderRadius: 16,
          },
          DatePicker: {
            cellWidth: 50,
            controlHeight: 52,
            borderRadius: 16,
          },
        },
      }}
      locale={language === "ar" ? localeAr : localeEn}
      direction={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="w-full">
        <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {t("registerNewStudent")}
          </h1>
          <p className="text-slate-500 text-sm font-medium">{t("joinAcademy")}</p>
        </div>

        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Name */}
            <div className="text-start ">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("fullName")} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("name")}
                  placeholder={language === "ar" ? "أحمد محمد" : "Ahmed Mohamed"}
                  className={`w-full h-12 px-4 py-2.5 ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-50 border ${errors.name ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
                />
                <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <User className="w-5 h-5" />
                </div>
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.name.message}</p>}
            </div>
            {/* Age */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'ar' ? 'السن' : 'Age'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("age")}
                  placeholder="ex: 15"
                  className={`w-full h-12 px-4 py-2.5 ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-50 border ${errors.age ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
                />
                <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <User className="w-5 h-5" />
                </div>
              </div>
              {errors.age && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.age.message}</p>}
            </div>

            {/* Email */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("email")} *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  placeholder="student@example.com"
                  className={`w-full h-12 px-4 py-2.5 ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-50 border ${errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
                  dir="ltr"
                />
                <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <Mail className="w-5 h-5" />
                </div>
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email.message}</p>}
            </div>

            {/* Phone and Country Code */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("phoneNumber")} *
              </label>
              <div className="flex gap-2" dir="ltr">
                <Controller
                  name="codeCountry"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={countryCodes}
                      className="h-12 text-slate-600 font-medium"
                    />
                  )}
                />
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="tel"
                      placeholder="01069441989"
                      status={errors.phone ? "error" : ""}
                      className="flex-1 h-12 bg-slate-50 border-slate-200 rounded-xl font-medium focus:bg-white"
                    />
                  )}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1.5 font-semibold text-start">{errors.phone.message}</p>}
            </div>

            {/* Birth Date */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("birthDate")} *
              </label>
              <Controller
                name="birth_date"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:shadow-none h-12 w-full text-slate-600 font-medium hover:border-slate-300"
                    status={errors.birth_date ? "error" : ""}
                    placeholder={t("selectDate")}
                    value={value ? dayjs(value) : null}
                    onChange={(date) => onChange(date ? date.format("YYYY-MM-DD") : "")}
                  />
                )}
              />
              {errors.birth_date && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.birth_date.message}</p>}
            </div>

            {/* Gender */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("gender")} *
              </label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder={t("selectGender")}
                    options={genders}
                    className="w-full h-12"
                    status={errors.gender ? "error" : ""}
                    placement={language === "ar" ? "bottomRight" : "bottomLeft"}
                  />
                )}
              />
              {errors.gender && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.gender.message}</p>}
            </div>

            {/* Country */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("country")} *
              </label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("selectCountry")}
                    options={countries}
                    className="w-full h-12"
                    status={errors.country ? "error" : ""}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                )}
              />
              {errors.country && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.country.message}</p>}
            </div>

            {/* Nationality */}
            <div className="text-start">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("nationality")} *
              </label>
              <Controller
                name="nationality"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={t("selectNationality")}
                    options={nationalityOptions}
                    className="w-full h-12"
                    status={errors.nationality ? "error" : ""}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                )}
              />
              {errors.nationality && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.nationality.message}</p>}
            </div>

            {/* City */}
            <div className="text-start md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {language === 'ar' ? 'المدينة' : 'City'}
              </label>
              <Controller
                name="city"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    showSearch
                    placeholder={language === 'ar' ? 'اختر المدينة' : 'Select City'}
                    options={cityOptions}
                    className="w-full h-12"
                    status={errors.city ? "error" : ""}
                    filterOption={(input, option) =>
                      (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                    }
                  />
                )}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.city.message}</p>}
            </div>



            {/* Password */}
            <div className="text-start md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("password")} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="••••••••"
                  className={`w-full h-12 px-4 py-2.5 ${language === 'ar' ? 'pr-11 pl-11' : 'pl-11 pr-11'} bg-slate-50 border ${errors.password ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
                  dir="ltr"
                />
                <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                  <Lock className="w-5 h-5" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${language === "ar" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.password.message}</p>}
            </div>
          </div>

          {/* Package Selection */}
          <div className="text-start space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="block text-sm font-semibold text-slate-700">
                {t("choosePackage")} *
              </label>

              {/* Plan Type Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold self-start">
                <button
                  type="button"
                  onClick={() => setPlanFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${planFilter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  {language === 'ar' ? 'الكل' : 'All'}
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter('single')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${planFilter === 'single' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <User className="w-3 h-3" />
                  <span>{language === 'ar' ? 'فردية' : 'Single'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlanFilter('group')}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${planFilter === 'group' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Users className="w-3 h-3" />
                  <span>{language === 'ar' ? 'جماعية' : 'Group'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {!plansData && (
                <div className="col-span-full py-3 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-pulse font-medium">
                  {t("loadingPlans")}
                </div>
              )}

              {filteredPlans?.length === 0 && (
                <div className="col-span-full py-4 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium text-xs">
                  {language === 'ar' ? 'لا توجد خطط متاحة بهذا التصنيف' : 'No plans available in this category'}
                </div>
              )}

              {filteredPlans?.map((pkg) => {
                const isGroup = pkg.planType === 'group';
                const pkgColor = pkg.color || '#369589';
                const isSelected = selectedPackage === pkg.id;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setValue("plan_id", pkg.id, { shouldValidate: true })}
                    className={`w-full rounded-2xl border-2 transition-all text-start relative overflow-hidden flex flex-col justify-between min-h-[95px] cursor-pointer ${
                      isSelected ? "shadow-lg scale-[1.01]" : "hover:shadow-md hover:border-slate-300"
                    }`}
                    style={{
                      borderColor: pkgColor,
                      backgroundColor: isSelected ? `${pkgColor}12` : '#ffffff',
                    }}
                  >
                    {isSelected && (
                      <div
                        className={`absolute top-0 ${language === 'ar' ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} w-6 h-6 flex items-center justify-center shadow-sm`}
                        style={{ backgroundColor: pkgColor }}
                      >
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="p-3 w-full">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div
                          className="font-bold text-sm"
                          style={{ color: isSelected ? pkgColor : '#1e293b' }}
                        >
                          {language === "ar" ? pkg.name_ar : pkg.name_en}
                        </div>
                        {isGroup ? (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-extrabold border border-purple-200">
                            <Users className="w-3 h-3" />
                            {(() => {
                              const raw = pkg.maxStudents ?? pkg.studentsNum;
                              const str = String(raw ?? '').trim().toLowerCase();
                              const isUnlimited = !str || str === '0' || str === 'unlimited';
                              if (isUnlimited) {
                                return language === 'ar' ? 'جماعية (غير محدود)' : 'Group (Unlimited)';
                              }
                              const count = parseInt(str, 10) || 0;
                              if (count <= 0) {
                                return language === 'ar' ? 'جماعية (غير محدود)' : 'Group (Unlimited)';
                              }
                              return language === 'ar'
                                ? `جماعية (${count} ${count === 1 ? 'طالب' : 'طلاب'})`
                                : `Group (${count} ${count === 1 ? 'student' : 'students'})`;
                            })()}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                            <User className="w-3 h-3 text-slate-400" />
                            {language === 'ar' ? 'فردية' : 'Single'}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-xs font-semibold">
                        {pkg.sessionsCount} {t("sessionsCount")}
                      </div>
                    </div>
                    <div className="p-3 pt-2 border-t border-slate-100 w-full flex items-baseline gap-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <span className="text-xs text-slate-400 font-semibold">{pkg.currency?.symbol}</span>
                      <span className="text-lg font-extrabold text-slate-800">{pkg.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.plan_id && <p className="text-red-500 text-xs mt-2 font-semibold text-start">{errors.plan_id.message}</p>}

            {/* Dynamic Group Plan Details Section (UI Preview) */}
            {selectedPlanObj?.planType === 'group' && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-indigo-50/60 to-purple-50 border border-purple-200 text-start space-y-3.5 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm border-b border-purple-100 pb-2">
                  <div className="p-1.5 bg-purple-600 text-white rounded-xl shadow-sm">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{language === 'ar' ? `إعداد الخطة الجماعية` : `Group Plan Setup`}</span>
                      <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full font-bold">
                        {String(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum) === '0'
                          ? (language === 'ar' ? 'غير محدود' : 'Unlimited')
                          : `${selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum ?? 2} ${language === 'ar' ? 'طلاب' : 'students'}`}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-purple-700 font-medium leading-relaxed">
                  {language === 'ar'
                    ? "اخترت خطة جماعية! يمكنك تحديد اسم فريقك وإضافة إيميلات الأعضاء المشاركين معك الآن."
                    : "You selected a group plan! Enter your group name and invite members."}
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === 'ar' ? "اسم المجموعة / الفريق" : "Group / Team Name"}
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder={language === 'ar' ? "مثال: أبطال المعرفة" : "e.g. Knowledge Heroes"}
                    className="w-full h-10 px-3 bg-white border border-purple-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {language === 'ar'
                      ? String(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum) === '0'
                        ? 'دعوة زملائك للمجموعة'
                        : `دعوة زملائك للمجموعة (حتى ${Math.max(1, (Number(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum ?? 2) - 1))} أعضاء)`
                      : String(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum) === '0'
                        ? 'Invite Members'
                        : `Invite Members (up to ${Math.max(1, (Number(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum ?? 2) - 1))} members)`}
                  </label>
                  {groupMembers.map((member, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="email"
                        value={member}
                        onChange={(e) => {
                          const updated = [...groupMembers];
                          updated[idx] = e.target.value;
                          setGroupMembers(updated);
                        }}
                        placeholder={language === 'ar' ? `البريد الإلكتروني لعضو ${idx + 1}` : `Member ${idx + 1} Email`}
                        className="flex-1 h-9 px-3 bg-white border border-purple-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
                      />
                      {groupMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setGroupMembers(groupMembers.filter((_, i) => i !== idx))}
                          className="px-2.5 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold transition-all"
                        >
                          {language === 'ar' ? "حذف" : "Remove"}
                        </button>
                      )}
                    </div>
                  ))}

                  {(String(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum) === '0' ||
                    groupMembers.length < Math.max(1, (Number(selectedPlanObj.maxStudents ?? selectedPlanObj.studentsNum ?? 2) - 1))) && (
                    <button
                      type="button"
                      onClick={() => setGroupMembers([...groupMembers, ""])}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 pt-1 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{language === 'ar' ? "+ إضافة بريد عضو آخر" : "+ Add Another Member"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-[#1a4f47] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] border-none outline-none cursor-pointer text-sm"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Check className="w-5 h-5" />
            )}
            <span>{t("registerNow")}</span>
          </button>

          <p className="text-center text-xs text-slate-400 leading-relaxed font-medium">
            {t("afterRegistration")}
          </p>

        </form>
      </div>
    </ConfigProvider>
  );
}

