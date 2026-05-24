import React, { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Send , Search, CheckCheck, Check, MessageSquare
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { useSettings } from '../../../contexts/SettingsContext';
import { RootState } from '../../../store/store';
import { useTeacherProfile } from '../hooks/useTeacherProfile';
import {
  setConversations,
  setActiveConversation as setActiveConversationAction,
} from '../../../store/chatSlice';
import {
  openConversation,
  sendMessage,
  startTyping,
  stopTyping,
  markAsRead
} from '../../../chat/chatEmits';
import { getConversations } from '../../../services/ChatServices';
import { Conversation } from '../../../types/chat';

export default function TeacherChat() {
  const dispatch = useDispatch();
  const { i18n } = useTranslation();
  const { settings } = useSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const isRtl = i18n.language.split('-')[0] === 'ar';

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redux state
  const chatState = useSelector((state: RootState) => state.chat);
  const conversations = chatState.conversations;
  const onlineUsers = chatState.onlineUsers;
  const typingStatus = chatState.typing;
  const isConnected = chatState.connected;

  // Fetch conversations
  const { data: convResponse, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  });

  // Sync React Query with Redux
  useEffect(() => {
    if (convResponse) {
      console.log("📋 ALL STUDENTS IN TEACHER SIDEBAR:");
      convResponse.forEach(c => {
        console.log(` - ${c.otherParty?.name}: ${c.otherParty?.id}`);
      });
      dispatch(setConversations(convResponse));
    }
  }, [convResponse, dispatch]);

  // Get teacher profile and loading state
  const { data: profileResponse, isLoading: profileLoading } = useTeacherProfile();

  // Extract teacher ID (prefer user_id, fallback to id, then wallet.userId)
  const teacherData = profileResponse?.data?.teacher;
const teacherId = teacherData?.user_id
  // Log teacher data for debugging
  useEffect(() => {
    if (profileResponse) {
      console.log('📋 Teacher Object:', profileResponse.data?.teacher);
      console.log('🔑 Teacher ID Extracted:', teacherId);
    }
  }, [profileResponse, teacherId]);

  const hasInitializedFromState = useRef(false);

  // Handle incoming navigation from My Students
  useEffect(() => {
    if (hasInitializedFromState.current) return;

    const state = location.state as { studentId?: string, conversation?: Conversation };
    if (state?.conversation) {
      setActiveConversation(state.conversation);
      hasInitializedFromState.current = true;
      // Clear React Router state properly
      navigate('.', { replace: true, state: {} });
    } else if (state?.studentId && conversations.length > 0) {
      const existingConv = conversations.find(c => c.otherParty?.id === state.studentId);
      if (existingConv) {
        setActiveConversation(existingConv);
        hasInitializedFromState.current = true;
        navigate('.', { replace: true, state: {} });
      }
    }
  }, [location.state, conversations, navigate]);

  // Sync activeConversation with Redux conversations to get fully populated otherParty
  useEffect(() => {
    if (activeConversation && conversations.length > 0) {
      const fullyPopulatedConv = conversations.find(c => c.conversationId === activeConversation.conversationId);
      if (
        fullyPopulatedConv && 
        fullyPopulatedConv.otherParty?.name && 
        (!activeConversation.otherParty?.name || activeConversation.otherParty.name !== fullyPopulatedConv.otherParty.name)
      ) {
        setActiveConversation(fullyPopulatedConv);
      }
    }
  }, [conversations, activeConversation]);

  // Open room and mark as read
  useEffect(() => {
    if (activeConversation && isConnected) {
      openConversation(activeConversation.conversationId);
      markAsRead(activeConversation.conversationId);
      dispatch(setActiveConversationAction(activeConversation.conversationId));
    }
  }, [activeConversation, isConnected, dispatch]);

  // Cleanup active conversation on unmount
  useEffect(() => {
    return () => {
      dispatch(setActiveConversationAction(null));
    };
  }, [dispatch]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, activeConversation]);

  const currentMessages = activeConversation ? chatState.messages[activeConversation.conversationId] || [] : [];
  const activeTyping = typingStatus.filter(t =>
    t.conversationId === activeConversation?.conversationId &&
    t.isTyping &&
    t.userId !== teacherId
  );
  const isOnline = activeConversation
    ? onlineUsers.some(id => id.trim().toLowerCase() === activeConversation.otherParty?.id?.toString().trim().toLowerCase() || id.trim().toLowerCase() === (activeConversation.otherParty as any)?.user_id?.toString().trim().toLowerCase())
    : false;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversation || !isConnected) return;

    const hasPhoneNumber = /\d{8,}/.test(messageInput.replace(/[\s-]/g, ''));
    if (hasPhoneNumber) {
      message.error(isRtl ? 'عذراً، غير مسموح بإرسال أرقام الهواتف' : 'Sorry, sending phone numbers is not allowed');
      return;
    }

    sendMessage(activeConversation.conversationId, messageInput);
    setMessageInput('');
    stopTyping(activeConversation.conversationId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isConnected) return;
    setMessageInput(e.target.value);
    if (!activeConversation) return;

    if (e.target.value.length > 0) {
      startTyping(activeConversation.conversationId);
    } else {
      stopTyping(activeConversation.conversationId);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.otherParty?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>
      {profileLoading ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" style={{ borderTopColor: settings.primaryColor }} />
            <span className="text-gray-500">{isRtl ? 'جاري تحميل البيانات...' : 'Loading profile...'}</span>
          </div>
        </div>
      ) : (
        <>
          {/* Sidebar for Students List */}
          <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-1/3 md:h-full shrink-0 overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/30">
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="font-bold text-gray-900">{isRtl ? 'المحادثات' : 'Chats'}</h3>
                {!isConnected && <span className="text-[10px] text-amber-600 animate-pulse font-medium">{isRtl ? 'جاري الاتصال...' : 'Connecting...'}</span>}
              </div>
              <div className="relative">
                <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                <input
                  type="text"
                  placeholder={isRtl ? 'بحث في الطلاب...' : 'Search students...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`block w-full ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} py-2.5 border border-gray-100 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm`}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loadingConvs ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" style={{ borderTopColor: settings.primaryColor }} />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <MessageSquare className="w-10 h-10 text-gray-200" />
                  <p className="text-xs text-gray-400 leading-relaxed">{isRtl ? 'لا توجد محادثات نشطة حالياً' : 'No active conversations yet'}</p>
                </div>
              ) : filteredConversations.map(conv => {
                const hasTyping = typingStatus.some(t => t.conversationId === conv.conversationId && t.isTyping);
                const partyIdStr = conv.otherParty?.id?.toString() || (conv.otherParty as any)?.user_id?.toString();
                const partyId = partyIdStr?.trim().toLowerCase();
                const isOtherPartyOnline = partyId ? onlineUsers.some(id => id.trim().toLowerCase() === partyId) : false;
                const isActive = activeConversation?.conversationId === conv.conversationId;

                // Log comparison result
                if (partyId) {
                  console.log(`🔎 Checking ${conv.otherParty.name}: ID (${partyId}), Online: ${isOtherPartyOnline}, List:`, onlineUsers);
                }

                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => setActiveConversation(conv)}
                    className={`group p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-gray-50/50 ${isActive ? 'bg-primary/5 border-primary/10' : 'hover:bg-gray-50'}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-transform group-hover:scale-105 ${isActive ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`} style={isActive ? { backgroundColor: settings.primaryColor } : { color: settings.primaryColor }}>
                        {conv.otherParty?.name?.substring(0, 1).toUpperCase() || '?'}
                      </div>
                      {isOtherPartyOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-primary' : 'text-gray-900'}`} style={isActive ? { color: settings.primaryColor } : {}}>
                          {conv.otherParty?.name || (isRtl ? 'طالب' : 'Student')}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium shrink-0">
                          {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate flex-1 ${isActive ? 'text-primary/70' : 'text-gray-500'}`}>
                          {hasTyping ? (
                            <span className="text-primary font-medium italic animate-pulse" style={{ color: settings.primaryColor }}>{isRtl ? 'يكتب...' : 'Typing...'}</span>
                          ) : (
                            conv.lastMessage || (isRtl ? 'ابدأ المراسلة' : 'Start messaging')
                          )}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center" style={{ backgroundColor: settings.primaryColor }}>
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden h-2/3 md:h-full">
            {activeConversation ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: settings.primaryColor }}>
                      {activeConversation.otherParty?.name?.substring(0, 1) || '?'}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-900">{activeConversation.otherParty?.name || (isRtl ? 'طالب' : 'Student')}</h2>
                      <p className="text-[10px] flex items-center gap-1">
                        {!isConnected ? (
                          <span className="text-amber-600 font-medium animate-pulse">{isRtl ? 'جاري إعادة الاتصال...' : 'Reconnecting...'}</span>
                        ) : activeTyping.length > 0 ? (
                          <span className="text-primary font-medium italic animate-pulse" style={{ color: settings.primaryColor }}>{isRtl ? 'يكتب الآن...' : 'Typing...'}</span>
                        ) : isOnline ? (
                          <><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span><span className="text-green-600 font-medium">{isRtl ? 'متصل الآن' : 'Online'}</span></>
                        ) : (
                          <span className="text-gray-400">{isRtl ? 'غير متصل' : 'Offline'}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {/* <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button> */}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 no-scrollbar" style={{ backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
                  {currentMessages.map((msg, idx) => {
                    const isMe = String(msg.senderId) === String(teacherId);
                    console.log(`[MSG] senderId: ${msg.senderId} | teacherId: ${teacherId} | isMe: ${isMe}`);

                    return (
                      <div key={msg.id || idx} className={`flex ${isMe
                        ? (isRtl ? 'justify-start' : 'justify-end')
                        : (isRtl ? 'justify-end' : 'justify-start')
                        } animate-scale-in w-full`}>
                        <div className="max-w-[75%] group">
                          <div className={`px-4 py-2.5 rounded-2xl shadow-sm relative text-sm ${isMe
                            ? (isRtl ? 'text-white rounded-tl-none' : 'text-white rounded-tr-none')
                            : (isRtl ? 'bg-gray-100 text-gray-800 rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none')
                            }`}
                            style={isMe ? { backgroundColor: settings.primaryColor } : {}}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                            <div className={`flex items-center gap-1.5 mt-1 text-[9px] ${isMe ? 'text-primary-50/80 justify-end' : 'text-gray-400 justify-start'}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {isMe && (msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {activeTyping.length > 0 && (
                  <div className="px-6 py-2 text-[10px] text-primary italic animate-pulse" style={{ color: settings.primaryColor }}>
                    {isRtl ? 'يكتب الآن...' : 'Typing...'}
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100">
                  <form onSubmit={handleSend} className="flex gap-3 items-center">
                    {/* <div className="flex gap-1 text-gray-400">
                  <button type="button" disabled={!isConnected} className="p-2 hover:text-primary transition-colors disabled:opacity-30"><Smile className="w-5 h-5" /></button>
                  <button type="button" disabled={!isConnected} className="p-2 hover:text-primary transition-colors hidden sm:block disabled:opacity-30"><Paperclip className="w-5 h-5" /></button>
                </div> */}
                    <input
                      type="text"
                      value={messageInput}
                      onChange={handleTyping}
                      disabled={!isConnected}
                      placeholder={!isConnected ? (isRtl ? 'انتظار الاتصال...' : 'Waiting for connection...') : (isRtl ? 'اكتب رسالتك هنا...' : 'Type a message...')}
                      className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      style={{ borderColor: settings.primaryColor + '20' }}
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim() || !isConnected}
                      className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all shadow-md disabled:opacity-50 disabled:scale-100 active:scale-95"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''} ${!isRtl ? 'ml-1' : 'mr-1'}`} />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/30">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                  <MessageSquare className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{isRtl ? 'مساعد المعلم الذكي' : 'Teacher Chat'}</h3>
                <p className="text-sm max-w-xs leading-relaxed">{isRtl ? 'اختر طالباً من القائمة الجانبية للبدء بمتابعته والتواصل معه بشكل لحظي' : 'Select a student from the sidebar to start real-time communication and support'}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
