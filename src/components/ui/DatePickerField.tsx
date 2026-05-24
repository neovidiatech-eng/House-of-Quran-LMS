import { DatePicker, ConfigProvider } from 'antd';
import ar_EG from 'antd/locale/ar_EG';
import en_US from 'antd/locale/en_US';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import { useTranslation } from 'react-i18next';

interface DatePickerFieldProps {
  value?: string;        // YYYY-MM-DD or YYYY-MM string
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  picker?: 'date' | 'month' | 'year' | 'week' | 'quarter';
}

export default function DatePickerField({
  value,
  onChange,
  label,
  error,
  placeholder = 'اختر التاريخ',
  className = '',
  disabled = false,
  picker = 'date',
}: DatePickerFieldProps) {
  const { i18n } = useTranslation();
  const language = i18n.language.split('-')[0];
  const dayjsValue = value ? dayjs(value) : null;

  const formatMap: Record<string, string> = {
    date: 'DD/MM/YYYY',
    month: 'MM/YYYY',
    year: 'YYYY',
    week: 'wo/YYYY',
    quarter: 'Q/YYYY',
  };

  const outputFormatMap: Record<string, string> = {
    date: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
    week: 'YYYY-wo',
    quarter: 'YYYY-Q',
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2 text-start">
          {label}
        </label>
      )}
      <ConfigProvider locale={language === 'ar' ? ar_EG : en_US} direction={language === 'ar' ? 'rtl' : 'ltr'}
        theme={{
          components: {
            DatePicker: {
              cellHeight: 35,
              cellWidth: 45,
            },
          },
        }}
      >
        <DatePicker
          picker={picker}
          value={dayjsValue}
          onChange={(date) => onChange?.(date ? date.format(outputFormatMap[picker]) : '')}
          placeholder={placeholder}
          format={formatMap[picker]}
          style={{ width: '100%' }}
          disabled={disabled}
          size="large"
          status={error ? 'error' : undefined}
        />
      </ConfigProvider>
      {error && <p className="text-red-500 text-xs mt-1 text-start">{error}</p>}
    </div>
  );
}

