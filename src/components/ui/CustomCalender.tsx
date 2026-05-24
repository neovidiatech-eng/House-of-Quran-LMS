import React from 'react';
import { Calendar, ConfigProvider, DatePicker, theme } from 'antd';
import type { Dayjs } from 'dayjs';
import ar_EG from 'antd/locale/ar_EG';
import 'dayjs/locale/ar';

interface CustomCalendarProps {
  value?: Dayjs;
  onChange?: (date: Dayjs) => void;
  fullscreen?: boolean;
  className?: string;
}

export const CustomCalendar = ({
  value,
  onChange,
  fullscreen = false,
  className = ""
}: CustomCalendarProps) => {
  const { token } = theme.useToken();

  const wrapperStyle: React.CSSProperties = {
    border: `1px solid ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadiusLG,
    backgroundColor: '#fff',
  };

  return (
    <ConfigProvider locale={ar_EG} direction="rtl"
      theme={{
        components: {
          DatePicker: {
            cellHeight: 50,
            cellWidth: 50,
          },
        },
      }}
    >
      <div style={wrapperStyle} className={className}>
        <Calendar
          fullscreen={fullscreen}
          value={value}
          onSelect={onChange}
          headerRender={({ value, type, onChange, onTypeChange }) => {
            return (
              <div className="p-2 flex justify-between items-center border-b mb-2">
                <span className="font-bold text-blue-600">
                  {value.format('MMMM YYYY')}
                </span>
              </div>
            );
          }}
        />
      </div>
    </ConfigProvider>
  );
};
