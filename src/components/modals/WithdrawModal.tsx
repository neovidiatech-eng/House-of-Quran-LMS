import { useLanguage } from '../../contexts/LanguageContext';
import { message } from "antd";
import { Send, X } from "lucide-react";
import { useState } from "react";

export default function WithdrawalModal({ isOpen, onClose, balance, onWithdraw, isRtl, settings }: any) {
  const { language } = useLanguage();
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      message.error(isRtl ? 'يرجى إدخال مبلغ صالح' : 'Please enter a valid amount');
      return;
    }
    if (numAmount > balance) {
      message.error(isRtl ? 'المبلغ يتجاوز الرصيد الحالي' : 'Amount exceeds current balance');
      return;
    }
    setAmount('');
    onWithdraw(numAmount);
    onClose();
    
  };


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-scale-in" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isRtl ? 'طلب سحب رصيد' : 'Withdrawal Request'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isRtl ? 'المبلغ المطلوب سحبه' : 'Amount to withdraw'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-bold text-lg"
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {isRtl ? 'الرصيد المتاح:' : 'Available Balance:'} <span className="font-bold text-gray-900">${balance.toLocaleString()}</span>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <Send className="w-5 h-5" />
            {isRtl ? 'إرسال الطلب' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}