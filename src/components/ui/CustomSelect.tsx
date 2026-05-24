import React, { forwardRef } from 'react';
import { Select } from 'antd';
import type { SelectProps } from 'antd';

// تعريف الـ Props التي سيقبلها المكون
export interface CustomSelectProps extends SelectProps {
  label?: string;
  error?: string;
  options: { value: string | number; label: React.ReactNode; searchText?: string }[];
}

const CustomSelect = forwardRef<any, CustomSelectProps>(({ 
  label, 
  error, 
  options, 
  className, 
  ...props 
}, ref) => {
  return (
    <div className="w-full flex flex-col gap-1 text-start">
      {/* Label */}
      {label && (
        <label className="text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <Select
        ref={ref}
        showSearch
        className={`w-full h-[46px] ${className}`}
        optionFilterProp="children"
        placeholder="اختر من القائمة"
        {...props} 
      >
        {options.map((option) => (
          <Select.Option 
            key={option.value} 
            value={option.value}
            label={option.searchText || option.label}
          >
            {option.label}
          </Select.Option>
        ))}
      </Select>

      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
});

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
