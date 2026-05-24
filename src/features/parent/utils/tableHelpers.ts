export const calculateDuration = (startTime: any, endTime: any): number => {
  if (!startTime || !endTime) return 0;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (!isNaN(start) && !isNaN(end)) {
    return Math.max(0, Math.round((end - start) / 60000));
  }
  return 0;
};

export const formatDateTime = (dateString: string, isRtl: boolean) => {
  if (!dateString) return { date: '', time: '' };
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { date: dateString, time: '' };
    return {
      date: date.toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
      time: date.toLocaleTimeString(isRtl ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };
  } catch {
    return { date: dateString, time: '' };
  }
};

export const getStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'scheduled': return 'bg-primary-50 text-blue-700 border-blue-200';
    case 'planned': return 'bg-primary-50 text-blue-700 border-blue-200';
    case 'completed': return 'bg-green-50 text-green-700 border-green-200';
    case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
    case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
    default: return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};
