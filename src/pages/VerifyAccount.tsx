import { useState } from "react";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { VerifyAccountInput, getVerifyAccountSchema } from "../lib/schemas/AuthSchemas";
import { verifyAccount, resendCode } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";
import OtpInput from "../components/ui/OtpInput";
import { message } from "antd";

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

  const onSubmit = async (data: VerifyAccountInput) => {
    try {
      const result = await verifyAccount({
        email,
        otp: data.code
      });
      message.success(result.message || t("verifySuccess") || "Account verified successfully");
      sessionStorage.removeItem("verify_email");
      
      const token = result.data?.accessToken || result.accessToken;
      if (token) {
        sessionStorage.setItem("token", token);
        const role = result.data?.role || result.role;
        if (role) localStorage.setItem("role", role);
        onVerifySuccess?.();
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Account verification failed:", error);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    try {
      const result = await resendCode({ email });
      message.success(result.message || t("codeSentSuccess") || "New verification code sent");
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
            disabled={isResending}
            className="text-primary text-sm font-medium hover:underline disabled:opacity-50"
          >
            {isResending ? "..." : t("resendCode")}
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

