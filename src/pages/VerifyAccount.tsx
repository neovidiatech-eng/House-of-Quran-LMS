import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyAccountInput, getVerifyAccountSchema } from "../lib/schemas/AuthSchemas";
import { verifyAccount, resendCode } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";
import OtpInput from "../components/ui/OtpInput";
import { message } from "antd";
import { getDashboardPathForRole, storeAuthPermissions } from "../utils/auth";

interface VerifyAccountProps {
  onVerifySuccess?: () => void;
}

export default function VerifyAccount({ onVerifySuccess }: VerifyAccountProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [isResending, setIsResending] = useState(false);

  const email = sessionStorage.getItem("verify_email") || "";

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<VerifyAccountInput>({
    resolver: zodResolver(getVerifyAccountSchema(t)),
    defaultValues: {
      code: "",
    },
  });

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyAccountInput) => {
    try {
      const result = await verifyAccount({
        email,
        otp: data.code
      });
      message.success(result.message || t("verifySuccess") || "Account verified successfully");
      sessionStorage.removeItem("verify_email");

      const token = result.data?.accessToken || result.accessToken || result.data?.token || result.token;
      const registerRole = sessionStorage.getItem("register_role");
      const apiRole =
        result.data?.role ||
        result.role ||
        (typeof result.data?.user?.role === 'string' ? result.data?.user?.role : result.data?.user?.role?.name) ||
        (typeof result.user?.role === 'string' ? result.user?.role : result.user?.role?.name) ||
        result.data?.user?.role_name ||
        result.data?.user?.user_type ||
        result.data?.user?.type ||
        (Array.isArray(result.data?.user?.roles) ? (typeof result.data.user.roles[0] === 'string' ? result.data.user.roles[0] : result.data.user.roles[0]?.name) : undefined);
      const role = (apiRole && apiRole !== "No role assigned") ? apiRole : (registerRole || "student");
      const permissions = result.data?.permissions || result.permissions || [];

      if (token) {
        sessionStorage.setItem("token", token);
        if (role) localStorage.setItem("role", role);
        storeAuthPermissions(permissions, false);
        sessionStorage.removeItem("register_role");
        onVerifySuccess?.();
        navigate(getDashboardPathForRole(role));
      } else {
        sessionStorage.removeItem("register_role");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("Account verification failed:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        (language === "ar" ? "فشلت عملية التحقق. يرجى إعادة المحاولة." : "Verification failed. Please try again.");
      message.error(errorMsg);
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const result = await resendCode({ email });
      message.success(result.message || t("codeSentSuccess") || "New verification code sent");
      setResendCooldown(60);
    } catch (error: any) {
      console.error("Resend failed:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        (language === "ar" ? "فشل إعادة إرسال الكود." : "Failed to resend code.");
      message.error(errorMsg);
    } finally {
      setIsResending(false);
    }
  };

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div>
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4 text-primary">
          <ShieldCheck className="w-16 h-16" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t("verifyAccountTitle")}
        </h1>
        <p className="text-gray-600">{t("verifyAccountSubtitle")}</p>
        <p className="text-sm font-medium text-primary mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Verification Code */}
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

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || resendCooldown > 0}
            className="text-primary text-sm font-medium hover:underline disabled:opacity-50"
          >
            {isResending
              ? "..."
              : resendCooldown > 0
              ? language === "ar"
                ? `إعادة الإرسال بعد ${resendCooldown} ثانية`
                : `Resend in ${resendCooldown}s`
              : t("resendCode")}
          </button>
        </div>

        {/* Submit Button */}
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
              <span>{t("verify")}</span>
              <ArrowIcon className="w-5 h-5" />
            </>
          )}
        </button>

      </form>
    </div>
  );
}

