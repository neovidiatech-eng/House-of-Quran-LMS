import { X, Calendar, Clock, FileText, User, GraduationCap, Bell, MonitorPlay, Video, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Schedule } from '../../types/scheduales';
import CustomSelect from '../ui/CustomSelect';

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Schedule | null;
  onSave: (id: string, data: any) => void;
}

export default function EditSessionModal({ isOpen, onClose, session, onSave }: EditSessionModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    link: '',
    notes: '',
    status: '',
    start_time: '',
    end_time: '',
    type: 'full' as 'full' | 'half',
    notification_Time: '10',
  });

  const toLocalDatetimeString = (date: Date) => {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${mo}-${d}T${h}:${mi}`;
  };

  useEffect(() => {
    if (session && isOpen) {
      const startDate = session.start_time ? new Date(session.start_time) : null;
      const endDate = session.end_time ? new Date(session.end_time) : null;
      setFormData({
        title: session.title || '',
        description: session.description || '',
        link: session.link || '',
        notes: session.notes || '',
        status: session.status === 'scheduled' ? 'planned' : (session.status || 'planned'),
        start_time: startDate ? toLocalDatetimeString(startDate) : '',
        end_time: endDate ? toLocalDatetimeString(endDate) : '',
        type: (session.type as 'full' | 'half') || 'full',
        notification_Time: '10',
      });
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(session.id, {
      title: formData.title,
      description: formData.description,
      link: formData.link,
      notes: formData.notes,
      status: formData.status,
      start_time: formData.start_time ? new Date(formData.start_time).toISOString() : session.start_time,
      notification_Time: formData.notification_Time,
    });
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-primary-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('editSession')}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">{language === 'ar' ? 'تعديل بيانات الحصة' : 'Update session configuration and schedule.'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row overflow-hidden flex-1">
          
          {/* Left Column - Editable Fields */}
          <div className="w-full lg:w-[58%] p-6 md:p-8 bg-white overflow-y-auto custom-scrollbar">
            
            {/* Read-only info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="p-2 rounded-xl bg-primary-50 text-blue-500">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('studentLabel')}</p>
                  <p className="text-sm font-bold text-gray-900">{session.student?.user?.name || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('teacherLabel')}</p>
                  <p className="text-sm font-bold text-gray-900">{session.teacher?.user?.name || '—'}</p>
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="grid grid-cols-1 gap-5 mb-6">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> {t('sessionTitleLabel')} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                />
              </div>
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> {t('description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-1 gap-5 mb-6">
              <div className="text-start">
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  {t('status')}
                </label>
                <CustomSelect
                  value={formData.status}
                  onChange={(val) => handleChange('status', val as string)}
                  options={[
                    { value: 'planned', label: t('scheduled') },
                    { value: 'completed', label: t('completed') },
                    { value: 'missed', label: t('missed') || 'Missed' },
                    { value: 'cancelled', label: t('cancelled') },
                  ]}
                  className="rounded-2xl border-none bg-gray-50"
                />
              </div>
            </div>

            {/* Start & End Time */}
            <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-3xl p-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">{t('startTime')}</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-emerald-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">{t('endTime')}</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => handleChange('end_time', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-emerald-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Notification & Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <Bell className="w-3.5 h-3.5" /> {t('notificationTime')}
                </label>
                <CustomSelect
                  value={formData.notification_Time}
                  onChange={(val) => handleChange('notification_Time', val as string)}
                  options={[
                    { value: '10', label: language === 'ar' ? 'قبل 10 دقائق' : '10 minutes before' },
                    { value: '30', label: language === 'ar' ? 'قبل 30 دقيقة' : '30 minutes before' },
                    { value: '60', label: language === 'ar' ? 'قبل ساعة' : '1 hour before' },
                  ]}
                  className="rounded-2xl border-none bg-gray-50"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                  <MonitorPlay className="w-3.5 h-3.5" /> {t('meetingLink')}
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => handleChange('link', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                  dir="ltr"
                  placeholder="https://zoom.us/..."
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" /> {t('notes')}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-indigo-100 rounded-2xl text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 resize-none"
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100/80 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-gray-900 text-sm">{language === 'ar' ? 'معاينة التعديلات' : 'Edit Preview'}</h3>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {/* Preview Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-indigo-600 font-black text-sm">
                    {formData.title?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{formData.title || t('sessionTitleLabel')}</h4>
                    <p className="text-[10px] font-bold text-gray-400">{session.student?.user?.name}</p>
                  </div>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('status')}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold border uppercase tracking-widest ${
                      formData.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      formData.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-primary-50 text-blue-600 border-blue-100'
                    }`}>
                      {t(formData.status)}
                    </span>
                  </div>

                  {formData.start_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('startTime')}</span>
                      <span className="text-xs font-bold text-gray-800" dir="ltr">{new Date(formData.start_time).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )}
                  {formData.link && (
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('meetingLink')}</span>
                      <a href={formData.link} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700">
                        <Video className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-black text-sm">
                    {session.teacher?.user?.name?.charAt(0)?.toUpperCase() || 'T'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">{session.teacher?.user?.name}</p>
                    <p className="text-[10px] font-bold text-gray-400">{t('teacherLabel')}</p>
                  </div>
                </div>
              </div>

              {/* Description Preview */}
              {formData.description && (
                <div className="bg-white border border-gray-100 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('description')}</p>
                  <p className="text-xs font-medium text-gray-700 leading-relaxed">{formData.description}</p>
                </div>
              )}

              {/* Notes Preview */}
              {formData.notes && (
                <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-4">
                  <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-wider mb-1">{t('notes')}</p>
                  <p className="text-xs font-medium text-amber-900/70 leading-relaxed">{formData.notes}</p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center gap-4 px-8 py-5 border-t border-gray-100 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all"
          >
            {t('cancel')}
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            className="flex-1 px-8 py-3 bg-primary hover:bg-primary-700 text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95"
          >
            {t('saveChanges')}
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}} />
    </div>
  );
}