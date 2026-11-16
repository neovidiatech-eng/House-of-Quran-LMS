import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, Package, CheckCircle, Users, User } from "lucide-react";
import { useLanguage } from "../../../contexts/LanguageContext";
import AddPlanModal from "../../../components/modals/AddPlanModal";
import ViewPlanModal from "../../../components/modals/ViewPlanModal";
import { deletePlans, getPlans, updatePlan, createPlan } from "../services/PlansServices";
import { useConfirm } from "../../../hooks/useConfirm";
import { Plan } from "../../../types/plan";
import { PlanFormData } from "../../../lib/schemas/PlanSchema";


export default function Plans() {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { confirm, ConfirmDialog } = useConfirm();

  const text = {
    title: { ar: "خطط الاشتراك", en: "Subscription Plans" },
    addPlan: { ar: "إضافة خطة", en: "Add Plan" },
    edit: { ar: "تعديل", en: "Edit" },
    delete: { ar: "حذف", en: "Delete" },
    view: { ar: "عرض", en: "View" },
    active: { ar: "نشط", en: "Active" },
    inactive: { ar: "غير نشط", en: "Inactive" },
    popular: { ar: "الأكثر شعبية", en: "Most Popular" },
    sessions: { ar: "حصة", en: "sessions" },
    month: { ar: "شهر", en: "month" },
    noPlans: { ar: "لا توجد خطط", en: "No plans found" },
    planDetails: { ar: "تفاصيل الخطة", en: "Plan Details" },
    features: { ar: "المميزات", en: "Features" },
    price: { ar: "السعر", en: "Price" },
    duration: { ar: "المدة", en: "Duration" },
    confirmDelete: {
      ar: "هل أنت متأكد من حذف هذه الخطة؟",
      en: "Are you sure you want to delete this plan?",
    },
  };

  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await getPlans();

        const formatted = data.map((item: any) => ({
          id: item.id,
          name_ar: item.name_ar,
          name_en: item.name_en,
          description: item.description || "",
          price: Number(item.price),
          currency: item.currency,
          currencyId: item.currencyId,
          duration: item.duration,
          sessionsCount: item.sessionsCount ?? item.hours ?? 0,
          sessionTime: item.sessionTime || 0,
          planType: item.planType || 'individual',
          maxStudents: item.maxStudents ?? item.studentsNum ?? 0,
          color: item.color || '#3b82f6',
          features: item.features || [],
          bestSeller: item.bestSeller,
          active: item.active,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        }));

        setPlans(formatted);

      } catch (error) {
        console.log(error);
      }
    };

    fetchPlans();
  }, []);

  const handleOpenAdd = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };
  const handleViewPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowViewModal(true);
  };

  const handleSavePlan = async (
    planData: PlanFormData & { id?: string },
  ) => {
    try {
      const payload: any = {
        name_ar: planData.name,
        name_en: planData.nameEn,
        price: Number(planData.price),
        duration: Number(planData.duration),
        sessionsCount: Number(planData.sessionsCount),
        sessionTime: Number(planData.sessionTime),
        active: planData.status === "active",
        bestSeller: planData.isPopular,
        currencyId: planData.currencyId,
        color: planData.color || '#3b82f6',
        planType: planData.planType,
        isGroup: planData.planType === 'group',
        maxStudents: planData.maxStudents,
      };

      if (planData.description && planData.description.trim() !== '') {
        payload.description = planData.description;
      }
      if (planData.features && planData.features.length > 0) {
        payload.features = planData.features;
      }


      if (planData.id) {
        await updatePlan(planData.id, payload);
      } else {
        await createPlan(payload);
      }

      // Refresh plans after save
      const data = await getPlans();
      const formatted = data.map((item: any) => ({
        id: item.id,
        name_ar: item.name_ar,
        name_en: item.name_en,
        description: item.description || "",
        price: Number(item.price),
        currency: item.currency,
        currencyId: item.currencyId,
        duration: item.duration,
        sessionsCount: item.sessionsCount ?? item.hours ?? 0,
        sessionTime: item.sessionTime || 0,
        planType: item.planType || 'individual',
        maxStudents: item.maxStudents ?? item.studentsNum ?? 0,
        color: item.color || '#3b82f6',
        features: item.features || [],
        bestSeller: item.bestSeller,
        active: item.active,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));

      setPlans(formatted);

      setIsModalOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const handleDeletePlan = async (id: string) => {
    const confirmed = await confirm({
      title: language === "ar" ? "حذف خطة" : "Delete Plan",
      message: text.confirmDelete[language],
    });
    if (!confirmed) return;

    try {
      await deletePlans(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="p-6 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {text.title[language]}
        </h1>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-6 py-3 btn-primary text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          {text.addPlan[language]}
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">{text.noPlans[language]}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const cardColor = plan.color;
            return (
              <div
                key={plan.id}
                className="bg-white rounded-2xl shadow-sm border-2 transition-all hover:shadow-xl overflow-hidden flex flex-col"
                style={{ borderColor: cardColor }}
              >
                {/* Header with plan color */}
                <div
                  className="px-6 py-4 text-white flex items-center justify-between flex-wrap gap-2"
                  style={{ backgroundColor: cardColor }}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-bold text-white">
                      {language === "ar" ? plan.name_ar : plan.name_en}
                    </h3>
                    {plan.planType === 'group' ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-bold backdrop-blur-sm border border-white/30">
                        <Users className="w-3.5 h-3.5" />
                        {(() => {
                          const raw = plan.maxStudents ?? (plan as any).studentsNum;
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
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-medium backdrop-blur-sm border border-white/30">
                        <User className="w-3.5 h-3.5" />
                        {language === 'ar' ? 'فردية' : 'Single'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {plan.bestSeller && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-gray-900 shadow-sm">
                        {text.popular[language]}
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${plan.active
                        ? "bg-white/20 text-white border border-white/30"
                        : "bg-black/25 text-gray-200 border border-black/20"
                        }`}
                    >
                      {plan.active ? text.active[language] : text.inactive[language]}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1 justify-between">
                  {plan.description && (
                    <p className="text-gray-600 text-sm mb-4" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      {plan.description}
                    </p>
                  )}


                <div
                  className="rounded-xl p-6 mb-6 text-center"
                  style={{ backgroundColor: `${plan.color || '#3b82f6'}15` }}
                >
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <div className="text-start">
                      <div className="text-gray-600">{plan.currency?.code}</div>
                      <div className="text-sm text-gray-500">
                        /{text.month[language]}
                      </div>
                    </div>

                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    {plan.sessionsCount} {text.sessions[language]}
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 text-start">
                    {text.features[language]}
                  </h4>
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 text-start"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 flex-1 break-all">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-6 border-t border-gray-200 mt-auto">
                  <button
                    onClick={() => handleViewPlan(plan)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 btn-primary text-white rounded-xl transition-colors text-sm font-medium"
                    title={text.view[language]}
                  >
                    <Eye className="w-4 h-4" />
                    {text.view[language]}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="p-2.5 text-green-600 hover:bg-green-50 rounded-xl transition-colors border border-green-200"
                    title={text.edit[language]}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-red-200"
                    title={text.delete[language]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      )}

      <AddPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlan(null);
        }}
        onSave={handleSavePlan}
        initialData={selectedPlan ? {
          name: selectedPlan.name_ar,
          nameEn: selectedPlan.name_en,

          description: selectedPlan.description,
          price: Number(selectedPlan.price),
          currencyId: selectedPlan.currencyId,
          duration: selectedPlan.duration,
          sessionsCount: selectedPlan.sessionsCount,
          sessionTime: selectedPlan.sessionTime,
          features: selectedPlan.features,
          isPopular: selectedPlan.bestSeller,
          planType: selectedPlan.planType || 'individual',
          maxStudents: String(selectedPlan.maxStudents ?? selectedPlan.maxStudents ?? '0'),
          color: selectedPlan.color || '#3b82f6',
          status: selectedPlan.active ? 'active' : 'inactive',
          id: selectedPlan.id
        } : null}
      />


      {selectedPlan && (
        <>
          <ViewPlanModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedPlan(null);
            }}
            plan={selectedPlan}
          />
        </>
      )}
      {ConfirmDialog}
    </div>
  );
}
