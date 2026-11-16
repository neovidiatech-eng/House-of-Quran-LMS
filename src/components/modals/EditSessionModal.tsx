import { X, Calendar, Clock, FileText, User, GraduationCap, Bell, MonitorPlay,  AlertTriangle, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Schedule } from '../../types/scheduales';
import CustomSelect from '../ui/CustomSelect';

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionFormState = {
  title: string;
  description: string;
  link: string;
  notes: string;
  status: string;
  start_time: string;
  end_time: string;
  type: 'full' | 'half';
  notification_Time: string;
};

interface EditSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Schedule | null;
  groupedSessions?: Schedule[];
  onSave: (id: string, data: any) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditSessionModal({
  isOpen,
  onClose,
  session,
  groupedSessions,
  onSave,
}: EditSessionModalProps) {
  const { t, i18n } = useTranslation();
  const language = i18n.language.split('-')[0];

  // Currently displayed session in the form
  const [currentSession, setCurrentSession] = useState<Schedule | null>(null);

  // Form state for the currently selected session
  const [formData, setFormData] = useState<SessionFormState>({
    title: '',
    description: '',
    link: '',
    notes: '',
    status: '',
    start_time: '',
    end_time: '',
    type: 'full',
    notification_Time: '10',
  });

  // Map of sessionId → saved form state for sessions the user has edited
  const [pendingEdits, setPendingEdits] = useState<Record<string, SessionFormState>>({});

  // Tracks whether the current form has unsaved changes (since last session switch)
  const [currentFormIsDirty, setCurrentFormIsDirty] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const toLocalDatetimeString = (date: Date) => {
    const y = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const mi = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${mo}-${d}T${h}:${mi}`;
  };

  const buildFormState = (s: Schedule): SessionFormState => {
    const startDate = s.start_time ? new Date(s.start_time) : null;
    const endDate = s.end_time ? new Date(s.end_time) : null;
    return {
      title: s.title || '',
      description: s.description || '',
      link: s.link || '',
      notes: s.notes || '',
      status: s.status === 'scheduled' ? 'planned' : (s.status || 'planned'),
      start_time: startDate ? toLocalDatetimeString(startDate) : '',
      end_time: endDate ? toLocalDatetimeString(endDate) : '',
      type: (s.type as 'full' | 'half') || 'full',
      notification_Time: String(
        (s as any).notification_Time ||
        (s as any).notification_time ||
        (s as any).notificationTime ||
        '10'
      ),
    };
  };

  const buildPayload = (data: SessionFormState, sessionId: string) => {
    const originalSession =
      groupedSessions?.find((s) => s.id === sessionId) ?? currentSession!;

    const payload: any = {
      ...(!data.title?.trim() ? {} : { title: data.title.trim() }),
      link: data.link,
      status: data.status,
      start_time: data.start_time
        ? new Date(data.start_time).toISOString()
        : originalSession.start_time,
      notification_Time: data.notification_Time,
    };

    if (data.description?.trim()) payload.description = data.description;
    if (data.notes?.trim()) payload.notes = data.notes;

    return payload;
  };

  // ─── Effects ──────────────────────────────────────────────────────────────

  // Reset all state when the modal opens with a new session
  useEffect(() => {
    if (session && isOpen) {
      setCurrentSession(session);
      setFormData(buildFormState(session));
      setPendingEdits({});
      setCurrentFormIsDirty(false);
    }
  }, [session, isOpen]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  /** Switch the form to a different session in the group. */
  const handleSelectSession = (s: Schedule) => {
    if (!currentSession || s.id === currentSession.id) return;

    // Persist current form state (only if user actually changed something)
    const newPendingEdits = currentFormIsDirty
      ? { ...pendingEdits, [currentSession.id]: formData }
      : { ...pendingEdits };

    setPendingEdits(newPendingEdits);
    setCurrentSession(s);
    setCurrentFormIsDirty(false);

    // Load this session's pending edits if they exist, otherwise load from original data
    const pending = newPendingEdits[s.id];
    setFormData(pending ?? buildFormState(s));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setCurrentFormIsDirty(true);
  };

  /**
   * Save all modified sessions in parallel, then close.
   * Sessions that were never touched are skipped.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) return;

    setIsSaving(true);

    try {
      const allEdits: Record<string, SessionFormState> = {
        ...pendingEdits,
        ...(currentFormIsDirty ? { [currentSession.id]: formData } : {}),
      };

      if (Object.keys(allEdits).length === 0) {
        // Nothing changed — just close
        onClose();
        return;
      }

      await Promise.all(
        Object.entries(allEdits).map(([id, data]) =>
          onSave(id, buildPayload(data, id))
        )
      );

      onClose();
    } catch (error) {
      console.error('Failed to save sessions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Derived values ───────────────────────────────────────────────────────

  const enrolledStudents = useMemo(() => {
    const s = currentSession || session;
    if (!s) return [];

    if (s.groupStudents && Array.isArray(s.groupStudents) && s.groupStudents.length > 0) {
      return s.groupStudents
        .map((gs: any) => gs?.student?.user?.name || gs?.student?.name || "")
        .filter(Boolean);
    }

    if (s.students && Array.isArray(s.students) && s.students.length > 0) {
      return s.students
        .map((st: any) => st?.user?.name || st?.name || "")
        .filter(Boolean);
    }

    if (s.student) {
      const singleName = s.student.user?.name || (s.student as any).name || "";
      return singleName ? [singleName] : [];
    }

    return [];
  }, [currentSession, session]);

  if (!isOpen || !session || !currentSession) return null;

  /** Total number of sessions that will be saved on submit. */
  const editedSessionsCount =
    Object.keys(pendingEdits).length + (currentFormIsDirty ? 1 : 0);

  /** Save button label */
  const saveLabel = isSaving
    ? language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...'
    : editedSessionsCount > 1
      ? language === 'ar'
        ? `حفظ ${editedSessionsCount} حصص`
        : `Save ${editedSessionsCount} Sessions`
      : t('saveChanges');

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 !mt-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-sans transition-all">
      <div className="bg-white rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[14px] bg-primary-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">{t('editSession')}</h2>
              <p className="text-[13px] font-semibold text-gray-400 mt-0.5">
                {language === 'ar' ? 'تعديل بيانات الحصة' : 'Update session configuration and schedule.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row overflow-hidden flex-1">

          {/* ── Left Column – Editable Fields ─────────────────────────────── */}
          <div className="w-full lg:w-[58%] p-6 md:p-8 bg-white overflow-y-auto custom-scrollbar">

            {/* Read-only student / teacher info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="p-2 rounded-xl bg-primary-50 text-blue-500">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {t('studentLabel')} {enrolledStudents.length > 1 ? `(${enrolledStudents.length})` : ''}
                  </p>
                  {enrolledStudents.length === 0 ? (
                    <p className="text-sm font-bold text-gray-900">—</p>
                  ) : enrolledStudents.length === 1 ? (
                    <p className="text-sm font-bold text-gray-900">{enrolledStudents[0]}</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {enrolledStudents.map((name, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-primary-50 text-indigo-700 border border-indigo-100/60 shadow-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-500">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('teacherLabel')}</p>
                  <p className="text-sm font-bold text-gray-900">{currentSession.teacher?.user?.name || '—'}</p>
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
                  <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">
                    {t('startTime')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => handleChange('start_time', e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-emerald-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-emerald-900/40 mb-2 uppercase tracking-wider">
                    {t('endTime')}
                  </label>
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

          {/* ── Right Column – Session List + Preview ─────────────────────── */}
          <div className="w-full lg:w-[42%] bg-[#fcfdfe] border-l border-gray-100/80 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100/50 flex items-center justify-between bg-white/50 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                <h3 className="font-bold text-gray-900 text-sm">
                  {language === 'ar' ? 'معاينة التعديلات' : 'Edit Preview'}
                </h3>
              </div>
              {/* Badge showing how many sessions will be saved */}
              {editedSessionsCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {language === 'ar'
                    ? `${editedSessionsCount} ${editedSessionsCount === 1 ? 'حصة معدّلة' : 'حصص معدّلة'}`
                    : `${editedSessionsCount} ${editedSessionsCount === 1 ? 'session edited' : 'sessions edited'}`}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">

              {/* Batch Sessions List */}
              {groupedSessions && groupedSessions.length > 1 && (
                <div className="mb-6">
                  <h4 className="text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    {t('recurringSessions')}
                  </h4>
                  <div className="space-y-2">
                    {groupedSessions.map((s) => {
                      const isActive = currentSession.id === s.id;
                      const hasEdits = !!pendingEdits[s.id];
                      const isActiveAndDirty = isActive && currentFormIsDirty;

                      return (
                        <div
                          key={s.id}
                          onClick={() => handleSelectSession(s)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isActive
                            ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-gray-900 mb-0.5 truncate">{s.title}</p>
                            <p className="text-[11px] font-bold text-gray-600">
                              {new Date(s.start_time).toLocaleDateString(
                                language === 'ar' ? 'ar-EG' : 'en-US',
                                { day: 'numeric', month: 'short', year: 'numeric' }
                              )}
                            </p>
                            <p className="text-[10px] font-bold text-gray-400 mt-0.5" dir="ltr">
                              {new Date(s.start_time).toLocaleTimeString(
                                language === 'ar' ? 'ar-EG' : 'en-US',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                            {/* "Edited" badge for sessions with pending changes */}
                            {(hasEdits || isActiveAndDirty) && (
                              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">
                                {language === 'ar' ? 'معدّل' : 'Edited'}
                              </span>
                            )}
                            {/* "Editing" badge for the currently active session */}
                            {isActive && (
                              <span className="text-[9px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase">
                                {t('edit')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
            disabled={isSaving}
            className="flex-1 px-7 py-3 text-xs font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-2xl transition-all disabled:opacity-50"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary text-white text-xs font-bold rounded-2xl transition-all shadow-[0_10px_20px_-5px_rgba(79,70,229,0.3)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {saveLabel}
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
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
