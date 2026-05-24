import React, { useState, useEffect, useRef, useMemo } from 'react';
import { message } from 'antd';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Send, Search,
  MessageSquare, CheckCheck, Check
} from 'lucide-react';

import { RootState } from '../../../store/store';
import { useSettings } from '../../../contexts/SettingsContext';
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
import { useProfile } from '../hooks/useProfile';
import { Conversation } from '../../../types/chat';
import { useConversations } from '../../../hooks/useChat';

export default function StudentChat() {
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
  const isConnected = chatState.connected;
  const conversations = chatState.conversations;
  const currentMessages = activeConversation ? chatState.messages[activeConversation.conversationId] || [] : [];
  const onlineUsers = chatState.onlineUsers;
  const typingStatus = chatState.typing;

  // Get current student profile to get studentId
  const { data: profileResponse } = useProfile();
  const studentId = profileResponse?.data?.id;
const studentUserId = profileResponse?.data?.user_id;
  useEffect(() => {
    if (profileResponse) {
      console.log("🎓 Student Profile Info:", {
        studentId: profileResponse.data?.id,
        userId: profileResponse.data?.user_id,
        raw: profileResponse.data
      });
    }
  }, [profileResponse]);

  // Fetch all conversations
  const { data: conversationsResponse, isLoading: loadingConvs } = useConversations()
  // Sync React Query with Redux
  useEffect(() => {
    if (conversationsResponse) {
      console.log("📋 ALL TEACHERS IN SIDEBAR:");
      conversationsResponse.forEach(c => {
        console.log(` - ${c.otherParty?.name}: ${c.otherParty?.id}`);
      });
      dispatch(setConversations(conversationsResponse));
    }
  }, [conversationsResponse, dispatch]);

  const hasInitializedFromState = useRef(false);

  // Handle incoming navigation from Teacher Profile
  useEffect(() => {
    if (hasInitializedFromState.current) return;

    const state = location.state as { teacherId?: string, conversation?: Conversation };
    if (state?.conversation) {
      setActiveConversation(state.conversation);
      hasInitializedFromState.current = true;
      navigate('.', { replace: true, state: {} });
    } else if (state?.teacherId && conversations.length > 0) {
      const existingConv = conversations.find(c => c.otherParty?.id === state.teacherId);
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

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation, currentMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
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
const filteredConversations = useMemo(() => {
  return conversations.filter(c =>
    c.otherParty?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ); 
}, [conversations, searchQuery]);
  console.log("ONLINE USERS:", onlineUsers);
  console.log("CURRENT USER:", studentId);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 animate-fade-in" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Sidebar: Conversations List */}
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
              placeholder={isRtl ? 'بحث في المعلمين...' : 'Search teachers...'}
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
              <p className="text-xs text-gray-400">{isRtl ? 'لا توجد محادثات' : 'No chats yet'}</p>
            </div>
          ) : filteredConversations.map(conv => {
            const isActive = activeConversation?.conversationId === conv.conversationId;
            const partyIdStr = conv.otherParty?.id?.toString() || (conv.otherParty as any)?.user_id?.toString();
            const partyId = partyIdStr?.trim().toLowerCase();
            const isOtherPartyOnline = partyId ? onlineUsers.some(id => id.trim().toLowerCase() === partyId) : false;

            // Debugging online status
            if (partyId && !isOtherPartyOnline && onlineUsers.length > 0) {
              console.log(`Checking status for ${conv.otherParty.name}: ID (${partyId}) not found in online list:`, onlineUsers);
            }
            const hasTyping = typingStatus.some(t =>
              t.conversationId === conv.conversationId &&
              t.isTyping &&
              t.userId !== studentId
            );

            return (
              <div
                key={conv.conversationId}
                onClick={() => setActiveConversation(conv)}
                className={`group p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-gray-50/50 ${isActive ? 'bg-primary/5 border-primary/10' : 'hover:bg-gray-50'}`}
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 shadow-sm overflow-hidden"
                    style={isActive ? { backgroundColor: settings.primaryColor, color: '#fff' } : {}}>
                    {conv.otherParty?.name?.substring(0, 1).toUpperCase() || '?'}
                  </div>
                  {isOtherPartyOnline && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className={`text-sm font-bold truncate ${isActive ? 'text-primary' : 'text-gray-900'}`} style={isActive ? { color: settings.primaryColor } : {}}>
                      {conv.otherParty?.name || (isRtl ? 'مستخدم' : 'User')}
                    </h4>
                    <span className="text-[10px] text-gray-400">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500 truncate flex-1">
                      {hasTyping ? (
                        <span className="text-primary italic animate-pulse" style={{ color: settings.primaryColor }}>{isRtl ? 'يكتب الآن...' : 'Typing...'}</span>
                      ) : (
                        conv.lastMessage || (isRtl ? 'ابدأ المحادثة' : 'Start chatting')
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

      {/* Main Area: Chat Window */}
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
                  <h2 className="font-bold text-gray-900">{activeConversation.otherParty?.name || (isRtl ? 'محادثة' : 'Chat')}</h2>
                  <p className="text-[10px] flex items-center gap-1">
                    {!isConnected ? (
                      <span className="text-amber-600 font-medium animate-pulse">{isRtl ? 'جاري إعادة الاتصال...' : 'Reconnecting...'}</span>
                    ) : typingStatus.some(t => t.conversationId === activeConversation.conversationId && t.isTyping && t.userId !== studentId) ? (
                      <span className="text-primary font-medium italic animate-pulse" style={{ color: settings.primaryColor }}>{isRtl ? 'يكتب الآن...' : 'Typing...'}</span>
                    ) : (activeConversation.otherParty?.id && onlineUsers.some(id => id.trim().toLowerCase() === activeConversation.otherParty!.id.toString().trim().toLowerCase())) ? (
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

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 no-scrollbar" style={{ backgroundImage: 'radial-gradient(#e5e7eb 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}>
              {currentMessages.map((msg, idx) => {
const isMe = String(msg.senderId) === String(studentUserId);                console.log(`[MSG] senderId:${msg.senderId} | studentId:${studentId} | isMe:${isMe}`);
                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-scale-in w-full`}>
                    <div className="max-w-[75%] group">
                      <div className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm relative ${isMe
                        ? 'text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                        }`}
                        style={isMe ? { backgroundColor: settings.primaryColor } : {}}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <div className={`flex items-center gap-1 mt-1 text-[9px] ${isMe ? 'text-primary-50/80 justify-end' : 'text-gray-400 justify-start'}`}>
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

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
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
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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
            <h3 className="text-lg font-bold text-gray-900 mb-2">{isRtl ? 'واتساب الأكاديمية' : 'Academy Chat'}</h3>
            <p className="text-sm max-w-xs leading-relaxed">{isRtl ? 'اختر محادثة من القائمة للبدء أو تواصل مع معلمك من خلال صفحته الشخصية' : 'Select a chat to start messaging or contact your teacher from their profile'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
