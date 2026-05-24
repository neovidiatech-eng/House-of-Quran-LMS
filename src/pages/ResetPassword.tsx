import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordInput, getResetPasswordSchema } from "../lib/schemas/AuthSchemas";
import { resetPassword, resendCode } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";
import OtpInput from "../components/ui/OtpInput";
import { message } from "antd";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const email = sessionStorage.getItem("reset_email") || "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(getResetPasswordSchema(t)),
    defaultValues: {
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    try {
      const result = await resetPassword({
        email,
        otp: data.code,
        password: data.password,
        confirm: data.confirmPassword,
      });
      message.success(result.message || t("changesSavedSuccess"));
      sessionStorage.removeItem("reset_email");
      navigate("/login");
    } catch (error) {
      console.error("Reset password failed:", error);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const result = await resendCode({ email });
      message.success(result.message || t("codeSentSuccess") || "Code resent successfully");
    } catch (error) {
      console.error("Resend failed:", error);
    } finally {
      setIsResending(false);
    }
  };

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t("resetPasswordTitle")}
        </h1>
        <p className="text-gray-600">{t("resetPasswordSubtitle")}</p>
        <p className="text-sm font-medium text-primary mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Code */}
        <div>
          <label className="block text-right text-gray-700 font-medium mb-4">
            {t("otpCode")}
          </label>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <OtpInput
                value={field.value}
                onChange={field.onChange}
                length={6}
                disabled={isSubmitting}
              />
            )}
          />
          {errors.code && (
            <p className="text-red-500 text-xs mt-2 text-center">
              {errors.code.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-right text-gray-700 font-medium mb-2">
            {t("newPassword")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                  focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary 
                  transition-all pr-12"
              dir="ltr"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${language === "ar" ? "left" : "right"}-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600`}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-right text-gray-700 font-medium mb-2">
            {t("confirmNewPassword")}
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary 
                transition-all pr-12 text-right"
            dir="ltr"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex justify-center py-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="text-primary text-sm font-medium hover:underline disabled:opacity-50"
          >
            {isResending ? "..." : t("resendCode")}
          </button>
        </div>

        {/* Reset Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white rounded-xl py-4 px-6 font-semibold 
              hover:bg-primary-dark transition-all duration-200 flex items-center justify-center gap-2
              shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{t("verifyAndReset")}</span>
              <ArrowIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

