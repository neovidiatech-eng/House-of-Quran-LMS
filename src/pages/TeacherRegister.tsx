import { Controller, useForm } from "react-hook-form";
import { useLanguage } from "../contexts/LanguageContext";
import { TeacherRegisterInput, TeacherRegisterSchema } from "../lib/schemas/RegisterSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_COUNTRIES } from "../consts";
import { Check, Eye, EyeOff, Lock, Mail, User, ListTree } from "lucide-react";
import { Input, Select } from "antd";
import { useState } from "react";
import { useGetCities } from "../features/teacher/hooks/useCity";
import { useTeacherRegister } from "../features/teacher/hooks/useTeacherRegister";
import { message } from "antd";
import { useNavigate } from "react-router-dom";

interface TeacherRegisterProps {
  onRegisterSuccess?: () => void;
}

export default function TeacherRegister({ onRegisterSuccess }: TeacherRegisterProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<TeacherRegisterInput>({
    resolver: zodResolver(TeacherRegisterSchema(t)),
    mode: "onChange",
    defaultValues: {
      name: "",
      age: "",
      city: "",
      phone: "",
      email: "",
      codeCountry: "+20",
      gender: "",
      country: "",
      nationality: "",
      password: "",
      notes: ""
    },
  });

  const selectedCountry = watch("country")
  const selectedCountryObj = DEFAULT_COUNTRIES.find((c) => c.name === selectedCountry);
  const countryCode = selectedCountryObj?.iso2?.toLowerCase() || "";
  const { data: citiesData } = useGetCities(countryCode)

  const cityOptions = citiesData ? citiesData.map((city: any) => ({
    value: city.name,
    label: city.name
  })) : []

  const { mutateAsync: registerTeacherMutation, isPending: isRegistering } = useTeacherRegister();

  const onSubmit = async (data: TeacherRegisterInput) => {
    try {
      const registrationData = {
        ...data,
        age: data.age ? Number(data.age) : undefined,
        comfirmPassword: data.password,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const result = await registerTeacherMutation(registrationData);
      if (result.status === 201 || result.status === 200 || result.success || result.data) {
        message.success(result.message || t("registeredSuccess"));
        sessionStorage.setItem("verify_email", data.email);
        sessionStorage.setItem("register_role", "teacher");
        onRegisterSuccess?.();
        navigate("/verify-account");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMsg = error?.response?.data?.message || error?.message || t("error.somethingWentWrong") || "An error occurred during registration.";
      message.error(errorMsg);
    }
  };

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


  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {t("registerNewTeacher")}
        </h1>
        <p className="text-slate-500 text-sm font-medium">{t("joinAcademyTeacher")}</p>
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

          {/*Age*/}
          <div className="text-start">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("age")}
            </label>
            <div className="relative">
              <input
                type="text"
                {...register("age")}
                placeholder="30"
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
                placeholder="teacher@example.com"
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
          {/*City / governrate*/}
          <div className="text-start">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t("city")}
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  showSearch
                  placeholder={t("selectCity")}
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

        {/* Experience */}
        <div className="text-start">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("notes")}
          </label>
          <div className="relative">
            <textarea
              {...register("notes")}
              placeholder="I have experience in ... "
              className={`w-full min-h-24 max-h-40 px-4 py-2.5 ${language === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'} bg-slate-50 border ${errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
              dir="ltr"
            />
            <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-2 text-slate-400`}>
              <ListTree className="w-5 h-5" />
            </div>
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1.5 font-semibold">{errors.email.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isRegistering}
          className="w-full h-12 bg-primary hover:bg-primary-dark dark:bg-primary-dark dark:hover:bg-[#1a4f47] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99] border-none outline-none cursor-pointer text-sm"
        >
          {isRegistering ? (
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
  )
}