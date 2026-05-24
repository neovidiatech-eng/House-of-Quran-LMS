import { useLanguage } from '../../contexts/LanguageContext';
import { X, Calendar, Clock } from "lucide-react";
import { AgendaSession } from "../../types/Agenda";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  sessions: AgendaSession[];
}

export default function SessionsDayModal({
  isOpen,
  onClose,
  date,
  sessions,
}: Props) {
  const { language } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* HEADER */}
        <div className="sticky top-0 bg-primary text-white flex justify-between items-center px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sessions - {date}
          </h2>

          <button onClick={onClose}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No sessions found</p>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="border rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold">{s.title}</h3>

                  <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-blue-700">
                    {s.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mt-2">{s.description}</p>

                <div className="flex items-center gap-2 text-sm mt-3 text-gray-700">
                  <Clock className="w-4 h-4" />
                  {new Date(s.start_time).toLocaleTimeString()} -{" "}
                  {new Date(s.end_time).toLocaleTimeString()}
                </div>

              
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
