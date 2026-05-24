import { useNavigate } from 'react-router-dom';

interface UserRequestsProps {
  pendingCount?: number;
}

export default function UserRequests({ pendingCount = 0 }: UserRequestsProps) {
  const navigate = useNavigate();

  // Dynamic percentage for pending requests bar
  const pendingPercentage = Math.min(100, Math.max(10, pendingCount * 5));

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
      <div className="text-center mb-8">
        <h2 className="text-lg font-bold text-gray-800">طلبات المستخدمين</h2>
      </div>
      
      <div className="space-y-8 flex-grow">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-blue-600 font-bold">{pendingCount}</span>
            <span className="text-gray-600 text-xs font-medium">بانتظار المراجعة</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex justify-end">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500" 
              style={{ width: `${pendingPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-green-500 font-bold">128</span>
            <span className="text-gray-600 text-xs font-medium">تمت الموافقة</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex justify-end">
            <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-red-500 font-bold">12</span>
            <span className="text-gray-600 text-xs font-medium">مرفوضة</span>
          </div>
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden flex justify-end">
            <div className="h-full bg-red-500 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard/requests")}
        className="w-full mt-8 py-3 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
      >
        مراجعة كافة الطلبات
      </button>
    </div>
  );
}
