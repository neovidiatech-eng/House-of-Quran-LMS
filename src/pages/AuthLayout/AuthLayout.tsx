import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";

const AuthLayout = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const isLogin = location.pathname === "/login";
  const isRegister = location.pathname === "/register";
  const isAuthTab = isLogin || isRegister;
  const academyNameAr = "أكاديمية بيت القران";
  const academyNameEn = "House Of Quran Academy";

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Premium glowing backdrop blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#daad15]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Responsive Split Container */}
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] relative z-10">
        
        {/* Left Side: Brand Panel (Only visible on lg screens) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-primary via-primary-dark to-[#1e5850] p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle background overlay patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#daad15_15%,transparent_50%)] opacity-20" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            {/* Logo and Brand Name */}
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpeg"
                alt="House Of Quran Academy Logo"
                className="w-14 h-14 rounded-2xl object-cover border border-white/20 bg-white/10 p-1"
              />
              <div className="text-start">
                <h2 className="text-2xl font-black tracking-wide">{academyNameAr}</h2>
                <p className="text-xs text-white/70">{t("academySubtitle")}</p>
              </div>
            </div>
          </div>

          {/* Core Brand Message */}
          <div className="relative z-10 my-auto py-8 text-start">
            <h1 className="text-3xl font-bold leading-tight mb-4">
              {language === 'ar' ? 'رحلتك نحو المعرفة والتميز تبدأ من هنا' : 'Your Journey to Knowledge & Excellence Starts Here'}
            </h1>
            <p className="text-white/80 text-sm leading-relaxed mb-8">
              {t("academyDescription")}
            </p>
            
            {/* Quick trust metrics or features */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#daad15] shadow-lg shadow-[#daad15]/50" />
                <span className="text-xs font-semibold text-white/90">
                  {language === 'ar' ? 'نخبة من أفضل المعلمين والمعلمات' : 'Elite Certified Instructors'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#daad15] shadow-lg shadow-[#daad15]/50" />
                <span className="text-xs font-semibold text-white/90">
                  {language === 'ar' ? 'مناهج دراسية متكاملة وحديثة' : 'Modern & Comprehensive Curriculum'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#daad15] shadow-lg shadow-[#daad15]/50" />
                <span className="text-xs font-semibold text-white/90">
                  {language === 'ar' ? 'جلسات تفاعلية مباشرة ومواعيد مرنة' : 'Live Interactive Sessions & Flexible Schedules'}
                </span>
              </div>
            </div>
          </div>

          {/* Footer copyright in banner */}
          <div className="relative z-10 text-xs text-white/50 text-start">
            {t("footerText")}
          </div>
        </div>

        {/* Right Side: Interactive Forms Panel */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 md:p-12 bg-white">
          <div className="w-full">
            {/* Mobile Header / Brand Logo */}
            <div className="flex lg:hidden flex-col items-center text-center mb-8">
              <img
                src="/logo.jpeg"
                alt="House Of Quran Academy Logo"
                className="w-16 h-16 rounded-2xl object-cover border border-primary/20 mb-3"
              />
              <h1 className="text-2xl font-bold text-slate-800">{academyNameAr}</h1>
              <p className="text-sm text-slate-600 mt-1">{academyNameEn}</p>
              <p className="text-sm text-slate-500 mt-1">{t("academySubtitle")}</p>
            </div>

            {/* Back Button for forgot password / nested routes */}
            {!isAuthTab && (
              <div className="flex justify-start mb-6">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary transition-colors font-semibold group"
                >
                  <ArrowLeft
                    className={`w-4 h-4 transition-transform ${language === "ar" ? "rotate-180 group-hover:translate-x-1" : "group-hover:-translate-x-1"}`}
                  />
                  <span>{t("backToLogin")}</span>
                </button>
              </div>
            )}

            {/* Navigation Tabs (Login / Signup) */}
            {isAuthTab && (
              <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 gap-1 mb-8">
                <button
                  onClick={() => navigate("/login")}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                    isLogin
                      ? "bg-white text-primary shadow-md shadow-slate-200/50 border border-slate-100/50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  {t("login")}
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
                    isRegister
                      ? "bg-white text-primary shadow-md shadow-slate-200/50 border border-slate-100/50"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                  }`}
                >
                  {language === "ar" ? "تسجيل طالب جديد" : "Register New Student"}
                </button>
              </div>
            )}

            {/* Render forms here */}
            <div className="py-2">
              <Outlet />
            </div>
          </div>

          {/* Footer copyright for mobile/tablet */}
          <div className="text-center mt-8 text-xs text-slate-400 lg:hidden">
            {t("footerText")}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthLayout;
