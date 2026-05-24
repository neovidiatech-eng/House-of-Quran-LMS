import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordInput, getForgotPasswordSchema } from "../lib/schemas/AuthSchemas";
import { forgetPassword } from "../services/AuthServices";
import { useNavigate } from "react-router-dom";
import { message } from "antd";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(getForgotPasswordSchema(t)),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      const result = await forgetPassword(data);
      // Store email in session for the reset password step
      sessionStorage.setItem("reset_email", data.email);
      message.success(result.message || t('codeSentSuccess'));
      navigate("/reset-password");
    } catch (error) {
      console.error("Forget password request failed:", error);
    }
  };

  const ArrowIcon = language === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          {t("forgetPasswordTitle")}
        </h1>
        <p className="text-gray-600">{t("forgetPasswordSubtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-right text-gray-700 font-medium mb-2">
            {t("email")}
          </label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl 
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary 
                transition-all text-right hover:border-gray-300"
            placeholder="example@email.com"
            dir="ltr"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1 text-right">
              {errors.email.message}
            </p>
          )}
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
              <span>{t("sendCode")}</span>
              <ArrowIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

