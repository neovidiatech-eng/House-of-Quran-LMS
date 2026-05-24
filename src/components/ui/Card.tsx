interface IconConfig {
  bgColor: string;
  svg: React.ReactNode;
}

interface DashboardCardProps {
  title: string;
  value: string | number;
  unit: string;
  percentage: string | number;
  isIncrease: boolean;
  icon: IconConfig;
  subText: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 w-180 shadow-sm flex flex-col justify-between  hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="text-right">
          <h3 className="text-gray-500 text-sm font-medium mb-2">{title}</h3>
          <div className="flex items-baseline justify-start gap-1">
             <span className="text-2xl font-black text-gray-900 tracking-tight">{value}</span>
             <span className="text-sm  text-gray-700">{unit}</span>
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${icon.bgColor}`}>
          {icon.svg}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;