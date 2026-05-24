import { useState } from "react";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import CustomSelect from "../ui/CustomSelect";
interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    id: string;
    name: string;
    nameEn: string;
    description: string;
    price: string;
    currency: string;
    duration: string;
    sessionsCount: number;
    features: string[];
    isPopular: boolean;
    status: "active" | "inactive";
  };
  onSave: (plan: any) => void;
}

export default function EditPlanModal({
  isOpen,
  onClose,
  plan,
  onSave,
}: EditPlanModalProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    name: plan.name,
    nameEn: plan.nameEn,
    description: plan.description,
    price: plan.price,
    currency: plan.currency,
    duration: plan.duration,
    sessionsCount: plan.sessionsCount,
    features: [...plan.features],
    isPopular: plan.isPopular,
    status: plan.status,
  });

  const text = {
    title: { ar: "تعديل الخطة", en: "Edit Plan" },
    nameAr: { ar: "اسم الخطة (عربي)", en: "Plan Name (Arabic)" },
    nameEn: { ar: "اسم الخطة (إنجليزي)", en: "Plan Name (English)" },
    description: { ar: "الوصف", en: "Description" },
    price: { ar: "السعر", en: "Price" },
    currency: { ar: "العملة", en: "Currency" },
    duration: { ar: "المدة (شهر)", en: "Duration (Months)" },
    sessionsCount: { ar: "عدد الحصص", en: "Sessions Count" },
    features: { ar: "المميزات", en: "Features" },
    addFeature: { ar: "إضافة ميزة", en: "Add Feature" },
    isPopular: { ar: "الأكثر شعبية", en: "Most Popular" },
    status: { ar: "الحالة", en: "Status" },
    active: { ar: "نشط", en: "Active" },
    inactive: { ar: "غير نشط", en: "Inactive" },
    save: { ar: "حفظ", en: "Save" },
    cancel: { ar: "إلغاء", en: "Cancel" },
    featurePlaceholder: { ar: "اكتب الميزة...", en: "Enter feature..." },
  };

  const currencies = [
    { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound" },
    { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar" },
    { code: "EUR", nameAr: "يورو", nameEn: "Euro" },
    { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound" },
    { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal" },
    { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham" },
    { code: "KWD", nameAr: "دينار كويتي", nameEn: "Kuwaiti Dinar" },
    { code: "QAR", nameAr: "ريال قطري", nameEn: "Qatari Riyal" },
  ];

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredFeatures = formData.features.filter((f) => f.trim() !== "");
    if (filteredFeatures.length === 0) {
      alert(
        language === "ar"
          ? "يجب إضافة ميزة واحدة على الأقل"
          : "Please add at least one feature",
      );
      return;
    }
    onSave({
      ...plan,
      ...formData,
      features: filteredFeatures,
    });

    onClose();
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ""] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures.length > 0 ? newFeatures : [""],
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh]  overflow-y-auto no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-primary border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">{text.title[language]}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.nameAr[language]}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.nameEn[language]}
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) =>
                  setFormData({ ...formData, nameEn: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-end"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
              {text.description[language]}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start resize-none"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.price[language]}
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.currency[language]}
              </label>
              <CustomSelect
                value={formData.currency}
                onChange={(value) =>
                  setFormData({ ...formData, currency: value as string })
                }
                options={currencies.map((curr) => ({
                  value: curr.code,
                  label: `${curr.code} - ${language === "ar" ? curr.nameAr : curr.nameEn}`,
                }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.duration[language]}
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.sessionsCount[language]}
              </label>
              <input
                type="number"
                value={formData.sessionsCount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sessionsCount: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {text.addFeature[language]}
              </button>
              <label className="text-sm font-medium text-gray-700">
                {text.features[language]}
              </label>
            </div>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={formData.features.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={text.featurePlaceholder[language]}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-start"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-end gap-3">
              <label className="text-sm font-medium text-gray-700">
                {text.isPopular[language]}
              </label>
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData({ ...formData, isPopular: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
                {text.status[language]}
              </label>
              <CustomSelect
                value={formData.status}
                onChange={(value) =>
                  setFormData({ ...formData, status: value as any })
                }
                options={[
                  { value: "active", label: text.active[language] },
                  { value: "inactive", label: text.inactive[language] },
                ]}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              {text.cancel[language]}
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-medium shadow-lg"
            >
              <Save className="w-5 h-5" />
              {text.save[language]}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
