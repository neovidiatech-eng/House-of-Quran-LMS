import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Search, Mail, Phone, BookOpen, Clock, MessageCircle } from 'lucide-react';
import { useSettings } from '../../../contexts/SettingsContext';
import { useMyStudents } from '../hooks/useMyStudents';
import { useNavigate } from 'react-router-dom';
import { useCreateChat, useConversations } from '../../../hooks/useChat';
import { useTeacherProfile } from '../hooks/useTeacherProfile';



export default function TeacherStudents() {
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const isRtl = i18n.language.split('-')[0] === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const { data: students } = useMyStudents();

  const studentList = Array.isArray(students?.data) ? students.data : [];
  const filteredStudents = studentList.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const { data: profileResponse } = useTeacherProfile();
 // const teacherId = profileResponse?.data?.teacher?.user_id;
  const teacherUserId = profileResponse?.data?.teacher?.id;
  const { data: conversations } = useConversations();
  const { mutateAsync: createChat } = useCreateChat();
  return (
    <div className="space-y-6 animate-fade-in pb-10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6" style={{ color: settings.primaryColor }} />
          {isRtl ? 'طلابي' : 'My Students'}
        </h1>

        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={isRtl ? 'بحث باسم الطالب...' : 'Search by student name...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`block w-full ${isRtl ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all sm:text-sm`}
            style={{ '--tw-ring-color': settings.primaryColor } as any}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents?.map((student) => (
          <div key={student.code} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-lg" style={{ color: settings.primaryColor }}>
                  {student.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 truncate max-w-[150px]" title={student.name}>{student.name}</h3>
                  <p className="text-xs text-gray-500">{student.code}</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const targetStudentId = student.user_id || student.id || student.studentId || student.userId || student.user?.id;
                  
                  if (!targetStudentId) {
                    console.error("Student ID is missing!", student);
                    alert("لا يمكن بدء المحادثة: معرف الطالب مفقود");
                    return;
                  }

                  let existingConv = conversations?.find(c => c.otherParty?.id === targetStudentId);
                  
                  if (!existingConv && teacherUserId && targetStudentId) {
                    try {
                      existingConv = await createChat({ teacherId: teacherUserId as string, studentId: targetStudentId });
                    } catch (err) {
                      console.error("Failed to create chat:", err);
                      return;
                    }
                  }

                  if (existingConv) {
                    // Inject the student name and details if missing from the chat creation response
                    if (!existingConv.otherParty || !existingConv.otherParty.name) {
                      existingConv = {
                        ...existingConv,
                        otherParty: {
                          id: targetStudentId,
                          name: student.name,
                          email: student.email || ''
                        }
                      };
                    }

                    navigate('/teacher-dashboard/chat', {
                      state: {
                        conversation: existingConv
                      }
                    });
                  } else {
                    // Fallback navigate
                    navigate('/teacher-dashboard/chat');
                  }
                }}
                className="p-2.5 rounded-xl text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: settings.primaryColor }}
                title={isRtl ? 'بدء محادثة' : 'Start Conversation'}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                <GraduationCap className="w-4 h-4 opacity-70" />
                <span>{student.}</span>
              </div> */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4 opacity-70" />
                <span className="truncate" title={student.email}>{student.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4 opacity-70" />
                <span dir="ltr">{student.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center p-2 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-xs font-medium">{isRtl ? 'الكورسات' : 'Courses'}</span>
                </div>
                <span className="font-bold text-gray-900">{student.subject.name}</span>
              </div>
              <div className="text-center p-2 rounded-lg bg-gray-50">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs font-medium">{isRtl ? 'الحصص' : 'Sessions'}</span>
                </div>
                <span className="font-bold text-gray-900">{student.sessions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStudents?.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">{isRtl ? 'لم يتم العثور على طلاب' : 'No students found'}</h3>
          <p className="text-gray-500">
            {isRtl ? 'جرب البحث باسم آخر.' : 'Try searching with a different name.'}
          </p>
        </div>
      )}
    </div>
  );
}
