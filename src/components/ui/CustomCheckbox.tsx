interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string; 
}

export const CustomCheckbox = ({ checked, onChange, label }: CustomCheckboxProps) => {
  return (
    <div 
      className="flex items-center gap-2 cursor-pointer select-none"
      onClick={() => onChange(!checked)}
    >
      <div className="h-5 w-5 rounded-full flex justify-center items-center bg-primary transition-all duration-200">
        <div
          className={`h-2 w-2 rounded-full transition-all duration-200 ${
            checked ? 'bg-white scale-100' : 'bg-transparent scale-0'
          }`}
        />
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </div>
  );
};
