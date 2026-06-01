import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Check,
  User,
  Mail,
  Lock
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
import { GetCountries } from "react-country-state-city";

interface RegisterProps {
  onRegisterSuccess: () => void;
}

export default function Register({ onRegisterSuccess }: RegisterProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [countryCodes, setCountryCodes] = useState<Array<{ value: string; label: string; country: string }>>([{ value: "+20", label: "Egypt (+20)", country: "Egypt" }]);
  const { data: plansData } = usePlans();

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
      password: "",
      plan_id: "",
    },
  });

  const selectedPackage = watch("plan_id");

  const countries = [
    { value: "egypt", label: t("egypt") },
    { value: "saudi", label: t("saudiArabia") },
    { value: "uae", label: t("uae") },
    { value: "kuwait", label: t("kuwait") },
  ];

  const genders = [
    { value: "male", label: t("male") },
    { value: "female", label: t("female") },
  ];
  useEffect(() => {
    const displayNames = new Intl.DisplayNames([language === "ar" ? "ar" : "en"], { type: "region" });
    GetCountries()
      .then((data) => {
        if (!data?.length) return;
        const uniqueCodes = Array.from(
          new Map(
            data.map((item) => [
              `+${item.phone_code}`,
              {
                value: `+${item.phone_code}`,
                label: `${displayNames.of(item.iso2) || item.name} (+${item.phone_code})`,
                country: displayNames.of(item.iso2) || item.name,
              },
            ])
          ).values()
        );
        setCountryCodes(uniqueCodes);
      })
      .catch(() => setCountryCodes([{ value: "+20", label: "Egypt (+20)", country: "Egypt" }]));
  }, [language]);

  const onSubmit = async (data: RegisterInput) => {
    try {
      const registrationData = {
        ...data,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      const result = await registerService(registrationData);
      if (result.status === 201 || result.status === 200) {
        message.success(result.message || t("registeredSuccess"));
        sessionStorage.setItem("verify_email", data.email);
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
            <div className="text-start">
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
                      className="h-12 w-44 text-slate-600 font-medium"
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
          <div className="text-start">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              {t("choosePackage")} *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {!plansData && (
                <div className="col-span-full py-2 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 animate-pulse font-medium">
                  {t("loadingPlans")}
                </div>
              )}

              {plansData?.length === 0 && (
                <div className="col-span-full py-2 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 font-medium">
                  {t("noPlansAvailable")}
                </div>
              )}

              {plansData?.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setValue("plan_id", pkg.id, { shouldValidate: true })}
                  className={`w-full p-2 rounded-xl border-2 transition-all text-start relative overflow-hidden flex flex-col justify-between min-h-[80px] cursor-pointer ${
                    selectedPackage === pkg.id
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.01]"
                      : "border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  {selectedPackage === pkg.id && (
                    <div className={`absolute top-0 ${language === 'ar' ? 'left-0 rounded-br-xl' : 'right-0 rounded-bl-xl'} w-6 h-6 bg-primary flex items-center justify-center`}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className="text-start">
                    <div className={`font-bold text-sm mb-1 ${selectedPackage === pkg.id ? "text-primary" : "text-slate-800"}`}>
                      {language === "ar" ? pkg.name_ar : pkg.name_en}
                    </div>
                    <div className="text-slate-500 text-xs font-semibold">
                      {pkg.sessionsCount} {t("sessionsCount")}
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 w-full flex items-baseline gap-1" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <span className="text-xs text-slate-400 font-semibold">{pkg.currency?.symbol}</span>
                    <span className="text-lg font-extrabold text-slate-800">{pkg.price}</span>
                  </div>
                </button>
              ))}
            </div>
            {errors.plan_id && <p className="text-red-500 text-xs mt-2 font-semibold text-start">{errors.plan_id.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] border-none outline-none cursor-pointer text-sm"
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

