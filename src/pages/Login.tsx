import { useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginInput, getLoginSchema } from "../lib/schemas/LoginSchema";
import { login, googleLogin } from "../services/AuthServices";
import { Link, useNavigate } from "react-router-dom";
import { CustomCheckbox } from "../components/ui/CustomCheckbox";
import { GoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import { connectSocket } from "../utils/socket";
import { getDashboardPathForRole, storeAuthPermissions } from "../utils/auth";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors },
    control,
  } = useForm<LoginInput>({
    resolver: zodResolver(getLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    const { email, password } = data;
    try {
      const result = await login({ email, password });

      const token = result.data?.accessToken || result.accessToken;
      console.log(data);

      if (token) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");

        if (data.rememberMe) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }

        const role = result.data?.role || result.role;
        const permissions = result.data?.permissions || result.permissions || [];
        localStorage.setItem("role", role);
        storeAuthPermissions(permissions, data.rememberMe || false);
        onLoginSuccess();
        message.success(result.message || t('loginSuccess'));

        const userEmail = data.email;
        localStorage.setItem("email", userEmail);

        navigate(getDashboardPathForRole(role));
      }
      connectSocket(token);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t("login")}</h1>
        <p className="text-slate-500 text-sm font-medium">{t("joinAcademy")}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div className="text-start">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("email")} *
          </label>
          <div className="relative">
            <input
              type="email"
              {...register("email")}
              className={`w-full h-14 px-5 py-3 ${language === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} bg-slate-50 border ${errors.email ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-2xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
              placeholder="admin@example.com"
              dir="ltr"
            />
            <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
              <Mail className="w-5 h-5" />
            </div>
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="text-start">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {t("password")} *
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full h-14 ${language === 'ar' ? 'pr-12 pl-12' : 'pl-12 pr-12'} bg-slate-50 border ${errors.password ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-primary focus:ring-primary/10'} rounded-2xl outline-none transition-all focus:ring-4 hover:border-slate-300 font-medium`}
              dir="ltr"
              placeholder="••••••••"
            />
            <div className={`absolute ${language === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
              <Lock className="w-5 h-5" />
            </div>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${language === "ar" ? "left-4" : "right-4"} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none`}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5 font-semibold">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Controller
              name="rememberMe"
              control={control}
              render={({ field }) => (
                <CustomCheckbox
                  checked={field.value ?? false}
                  onChange={field.onChange}
                  label={t("rememberMe")}
                />
              )}
            />
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-primary hover:text-primary-dark font-semibold transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full h-14 bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.99] border-none outline-none cursor-pointer text-base"
        >
          <span>{t("login")}</span>
          <ArrowIcon className="w-5 h-5 animate-pulse" />
        </button>

      
      </form>
    </div>
  );
}
