import { TimePicker, ConfigProvider, TimePickerProps } from 'antd';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';

interface CustomTimePickerProps extends Omit<TimePickerProps, 'value' | 'onChange'> {
    label?: string;
    error?: string;
    value?: string;
    onChange?: (timeString: string) => void;
}

const CustomTimePicker = ({ label, error, className, value, onChange, ...props }: CustomTimePickerProps) => {
    return (
        <ConfigProvider
            theme={{
                components: {
                    DatePicker: {
                        controlHeight: 44,
                        borderRadius: 12,
                        colorPrimary: '#7c3aed',
                        colorBorder: '#e5e7eb',
                        colorTextPlaceholder: '#9ca3af',
                        fontFamily: 'inherit',
                    },
                },
            }}
        >
            <div className="flex flex-col gap-1.5 w-full">
                {label && (
                    <label className="text-sm text-gray-700 text-start">
                        {label}
                    </label>
                )}

                <TimePicker
                    {...props}
                    value={value ? dayjs(value, 'HH:mm') : null}
                    onChange={(time) => {
                        onChange?.(time ? time.format('HH:mm') : '');
                    }}
                    suffixIcon={<Clock className="w-4 h-4 text-gray-400" />}
                    className={`w-full border-gray-200 hover:border-purple-400 focus:border-purple-500 shadow-sm ${className}`}
                    popupClassName="custom-time-popup"
                    use12Hours={true}
                    format="h:mm a"
                />

                {error && (
                    <span className="text-xs text-red-500 mt-1 text-start">{error}</span>
                )}
            </div>
        </ConfigProvider>
    );
};

export default CustomTimePicker;
