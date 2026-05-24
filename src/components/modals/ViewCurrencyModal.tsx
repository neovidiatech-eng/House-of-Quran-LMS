import { X, DollarSign, Tag, TrendingUp } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Currency } from '../../types/currency';

interface ViewCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency
}

export default function ViewCurrencyModal({ isOpen, onClose, currency }: ViewCurrencyModalProps) {
  const { language } = useLanguage();

  const text = {
    title: { ar: 'تفاصيل العملة', en: 'Currency Details' },
    code: { ar: 'رمز العملة', en: 'Currency Code' },
    nameAr: { ar: 'الاسم بالعربية', en: 'Arabic Name' },
    nameEn: { ar: 'الاسم بالإنجليزية', en: 'English Name' },
    symbol: { ar: 'الرمز المختصر', en: 'Symbol' },
    exchangeRate: { ar: 'سعر الصرف', en: 'Exchange Rate' },
    isDefault: { ar: 'العملة الافتراضية', en: 'Default Currency' },
    yes: { ar: 'نعم', en: 'Yes' },
    no: { ar: 'لا', en: 'No' },
    close: { ar: 'إغلاق', en: 'Close' },
    basicInfo: { ar: 'المعلومات الأساسية', en: 'Basic Information' },
    rateInfo: { ar: 'معلومات السعر', en: 'Rate Information' }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  !mt-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh]  overflow-y-auto no-scrollbar no-scrollbar" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">{text.title[language]}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {currency.default && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-bold text-lg">{text.yes[language]} - {text.isDefault[language]}</span>
              </div>
            </div>
          )}

          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full mb-4">
              <span className="text-5xl font-bold text-blue-600">{currency.symbol}</span>
            </div>
            <h3 className="text-4xl font-bold text-gray-900 mb-2">{currency.code}</h3>
            <p className="text-xl text-gray-600">
              {language === 'ar' ? currency.name_ar : currency.name_en}
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Tag className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.basicInfo[language]}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">{text.code[language]}</p>
                <p className="text-2xl font-bold text-gray-900">{currency.code}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-cyan-200">
                <p className="text-sm text-gray-600 mb-2">{text.symbol[language]}</p>
                <p className="text-2xl font-bold text-gray-900">{currency.symbol}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-2">{text.nameAr[language]}</p>
                <p className="text-lg font-semibold text-gray-900">{currency.name_ar}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-cyan-200">
                <p className="text-sm text-gray-600 mb-2">{text.nameEn[language]}</p>
                <p className="text-lg font-semibold text-gray-900">{currency.name_en}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-bold text-gray-900">{text.rateInfo[language]}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 border border-green-200 text-center">
                <p className="text-sm text-gray-600 mb-3">{text.exchangeRate[language]}</p>
                <div className="flex items-baseline justify-center gap-2">
                  <p className="text-5xl font-bold text-green-600">{currency.exchangeRate}</p>
                </div>
                {!currency.default && (
                  <p className="text-xs text-gray-500 mt-2">مقابل العملة الافتراضية</p>
                )}
              </div>
              <div className="bg-white rounded-lg p-6 border border-emerald-200 text-center">
                <p className="text-sm text-gray-600 mb-3">{text.isDefault[language]}</p>
                <span className={`inline-flex px-6 py-3 rounded-full text-lg font-bold ${currency.default
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
                  }`}>
                  {currency.default ? text.yes[language] : text.no[language]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              {text.close[language]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
