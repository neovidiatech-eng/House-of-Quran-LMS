import { useLanguage } from '../../contexts/LanguageContext';
import {
  X,
  Calendar,
  Clock,
  User,
  GraduationCap,
  BookOpen,
  FileText,
  Award,
} from "lucide-react";

interface Exam {
  id: string;
  title: string;
  grade: number;
  totalMarks: number;
  duration: number;
  status: string;
  dueDate: string;
  student?: any;
  teacher?: any;
  subject?: any;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  exam: Exam | null;
}

export default function ViewExamModal({ isOpen, onClose, exam }: Props) {
  const { language } = useLanguage();
  if (!isOpen || !exam) return null;

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  if (!isOpen) return null;

  if (!exam) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50">
        <div className="bg-white p-6 rounded-xl" dir={language === 'ar' ? 'rtl' : 'ltr'}>Loading...</div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary to-indigo-600">
          <h2 className="text-2xl font-bold text-white">Exam Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title */}
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {exam.title}
            </h3>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full border text-sm ${getStatusStyle(exam.status)}`}
              >
                {exam.status}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Student */}
            <Card
              icon={<User />}
              color="blue"
              label="Student"
              value={exam.student?.user?.name}
            />

            {/* Teacher */}
            <Card
              icon={<GraduationCap />}
              color="green"
              label="Teacher"
              value={exam.teacher?.user?.name}
            />

            {/* Subject */}
            <Card
              icon={<BookOpen />}
              color="purple"
              label="Subject"
              value={exam.subject?.name_en}
            />

            {/* Duration */}
            <Card
              icon={<Clock />}
              color="orange"
              label="Duration"
              value={`${exam.duration} min`}
            />

            {/* Total Marks */}
            <Card
              icon={<FileText />}
              color="cyan"
              label="Total Marks"
              value={exam.totalMarks}
            />

            {/* Grade */}
            <Card
              icon={<Award />}
              color="pink"
              label="Grade"
              value={`${exam.grade} / ${exam.totalMarks}`}
            />

            {/* Date */}
            <Card
              icon={<Calendar />}
              color="indigo"
              label="Due Date"
              value={formatDate(exam.dueDate)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary text-white rounded-xl hover:opacity-90 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* Reusable Card */
function Card({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "bg-primary-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    cyan: "bg-cyan-100 text-cyan-600",
    pink: "bg-pink-100 text-pink-600",
    indigo: "bg-primary-100 text-indigo-600",
  };

  return (
    <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm border hover:shadow-md transition">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-lg ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-semibold text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}
