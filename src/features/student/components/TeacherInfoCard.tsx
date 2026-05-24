import { BookOpen, Calendar, GraduationCap, MessageCircle, ShieldCheck, Star, User } from "lucide-react";
import { useTeacherById } from "../../admin/hooks/useTeacher";
import { TeacherInfoCardProps } from "../pages/Profile";
import { useNavigate } from "react-router-dom";
import { useCreateChat, useConversations } from "../../../hooks/useChat";
import { useProfile } from "../hooks/useProfile";

export const TeacherInfoCard = ({ teacher, isRtl, settings }: TeacherInfoCardProps) => {
  const { data: teacherData } = useTeacherById(teacher.id);
  const navigate = useNavigate();
  const name = teacherData?.user?.name || teacher.name || (isRtl ? 'لا يوجد معلم' : 'No Teacher');
  const { data: profileResponse } = useProfile();
  const studentId = profileResponse?.data?.id|| profileResponse?.data?.user_id;
  const { mutateAsync: createChat } = useCreateChat();
  const { data: conversations } = useConversations();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6" style={{ color: settings.primaryColor }} />
          {isRtl ? 'المعلم الخاص بك' : 'Your Teacher'}
        </h2>
       <div className="flex items-center gap-2">
    
   <button
  className="w-10 h-10 rounded-xl text-white shadow-sm
             flex items-center justify-center transition
             hover:scale-105 active:scale-95"
  style={{ backgroundColor: settings.primaryColor }}
  title={isRtl ? "مراسلة المعلم" : "Message teacher"}
  onClick={async () => {
    // Check if conversation already exists
    let existingConv = conversations?.find(c => c.otherParty?.id === teacher.id);
    
    // Only create if it doesn't exist
    if (!existingConv && studentId) {
      try {
        existingConv = await createChat({ teacherId: teacher.id, studentId });
      } catch (error) {
        console.error("Failed to create chat:", error);
        navigate('/student-dashboard/chat');
        return;
      }
    }

    if (existingConv) {
      if (!existingConv.otherParty || !existingConv.otherParty.name) {
        existingConv = {
          ...existingConv,
          otherParty: {
            id: teacher.id,
            name: name,
            email: ''
          }
        };
      }
    }

    navigate('/student-dashboard/chat', { 
      state: { 
        conversation: existingConv
      } 
    });
  }}
>
  <MessageCircle className="w-5 h-5 text-white" />
</button>

    {/* Status */}
    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      <span className="text-sm font-bold text-yellow-700">
        {teacher.status}
      </span>
    </div>

    </div>
  </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 overflow-hidden border-2 border-dashed border-gray-200">
            <User className="w-12 h-12" />
          </div>
          <div className="absolute -bottom-2 -left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-lg border-2 border-white uppercase flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {isRtl ? 'نشط' : 'Active'}
          </div>
        </div>

        <div className="flex-1 text-center md:text-right">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="text-right">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {name}
              </h3>

              <p className="text-gray-600 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" style={{ color: settings.primaryColor }} />
                {teacher.subject}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{isRtl ? 'معلم معتمد' : 'Verified Teacher'}</p>
                <p className="text-xs font-semibold text-gray-700">{isRtl ? 'هوية محققة' : 'Identity Verified'}</p>
              </div>
            </div>
            <div className="p-3 bg-primary-50/50 rounded-xl border border-blue-100 flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider">{isRtl ? 'الجلسة القادمة' : 'Next Session'}</p>
                <p className="text-xs font-semibold text-gray-700 leading-tight">
                  {teacher.nextSession ? (
                    new Date(teacher.nextSession).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })
                  ) : (
                    isRtl ? 'لا توجد جلسات قادمة' : 'No upcoming sessions'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};