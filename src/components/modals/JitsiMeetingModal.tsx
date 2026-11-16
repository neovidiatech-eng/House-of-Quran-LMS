import { useState } from 'react';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { ExternalLink, LogOut, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ConfirmModal from './ConfirmModal';

export interface JitsiRoomData {
  domain: string;
  roomName: string;
  token?: string;
  url?: string;
  isModerator?: boolean;
}

interface JitsiMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomData: JitsiRoomData | null;
  sessionTitle?: string;
  isTeacher?: boolean;
  onLeave: () => Promise<void> | void;
  onEndSession?: () => Promise<void> | void;
  userName?: string;
  userEmail?: string;
}

export default function JitsiMeetingModal({
  isOpen,
  onClose,
  roomData,
  sessionTitle,
  isTeacher = false,
  onLeave,
  onEndSession,
  userName,
  userEmail,
}: JitsiMeetingModalProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.startsWith('ar');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const role = (localStorage.getItem('role') || '').toLowerCase();
  const canEndSession = Boolean(
    isTeacher &&
    role !== 'student' &&
    role !== 'parent' &&
    onEndSession
  );

  if (!isOpen || !roomData) return null;

  const handleLeave = async () => {
    try {
      setIsLeaving(true);
      await onLeave();
      onClose();
    } catch (err) {
      console.error('Leave session error:', err);
    } finally {
      setIsLeaving(false);
    }
  };

  const handleConfirmEnd = async () => {
    if (!canEndSession || !onEndSession) return;
    try {
      setIsEnding(true);
      await onEndSession();
      setShowEndConfirm(false);
      onClose();
    } catch (err) {
      console.error('End session error:', err);
    } finally {
      setIsEnding(false);
    }
  };

  const openInNewTab = () => {
    if (roomData.url) {
      window.open(roomData.url, '_blank');
    } else {
      const fullUrl = `https://${roomData.domain}/${roomData.roomName}${
        roomData.token ? `?jwt=${roomData.token}` : ''
      }`;
      window.open(fullUrl, '_blank');
    }
  };

  return (
    <>
      <div className="fixed inset-0 !mt-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
        <div
          className={`bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-800 transition-all duration-200 ${
            isFullscreen
              ? 'w-screen h-screen rounded-none fixed inset-0'
              : 'w-full max-w-7xl h-[92vh]'
          }`}
          dir={isRtl ? 'rtl' : 'ltr'}
        >
          {/* Top Control Bar */}
          <div className="bg-gray-950 px-4 py-3 border-b border-gray-800 flex items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <div className="truncate">
                <h3 className="font-bold text-base sm:text-lg text-white truncate">
                  {sessionTitle || (isRtl ? 'حصة مباشرة' : 'Live Session')}
                </h3>
                <span className="text-xs text-gray-400">
                  {isTeacher
                    ? isRtl ? 'معلم (متحكم بالجلسة)' : 'Teacher (Moderator)'
                    : isRtl ? 'طالب' : 'Student'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Open in external tab */}
              <button
                type="button"
                onClick={openInNewTab}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                title={isRtl ? 'فتح في نافذة جديدة' : 'Open in new tab'}
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isRtl ? 'فتح في نافذة جديدة' : 'Open in tab'}
                </span>
              </button>

              {/* Fullscreen toggle */}
              <button
                type="button"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors hidden md:inline-flex"
                title={isFullscreen ? (isRtl ? 'تصغير' : 'Exit Fullscreen') : (isRtl ? 'ملء الشاشة' : 'Fullscreen')}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Leave Button */}
              <button
                type="button"
                onClick={handleLeave}
                disabled={isLeaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>{isRtl ? 'مغادرة الجلسة' : 'Leave Session'}</span>
              </button>

              {/* Teacher Only: End Session for Everyone */}
              {canEndSession && (
                <button
                  type="button"
                  onClick={() => setShowEndConfirm(true)}
                  disabled={isEnding}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors shadow-sm"
                >
                  <PhoneOff className="w-4 h-4" />
                  <span>{isRtl ? 'إنهاء الجلسة للجميع' : 'End Session'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Jitsi Meeting Container */}
          <div className="flex-1 w-full h-full bg-black relative">
            <JitsiMeeting
              domain={roomData.domain || 'meet.jit.si'}
              roomName={roomData.roomName}
              jwt={roomData.token}
              configOverwrite={{
                startWithAudioMuted: false,
                startWithVideoMuted: false,
                disableModeratorIndicator: false,
                enableEmailInStats: false,
                prejoinPageEnabled: false,
                defaultLanguage: isRtl ? 'ar' : 'en',
                enableWelcomePage: false,
                toolbarButtons: isTeacher
                  ? [
                      'camera',
                      'chat',
                      'closedcaptions',
                      'desktop',
                      'download',
                      'embedmeeting',
                      'etherpad',
                      'feedback',
                      'filmstrip',
                      'fullscreen',
                      'help',
                      'highlight',
                      'linktosalesforce',
                      'livestreaming',
                      'microphone',
                      'noisesuppression',
                      'participants-pane',
                      'profile',
                      'raisehand',
                      'recording',
                      'security',
                      'select-background',
                      'settings',
                      'shareaudio',
                      'sharedvideo',
                      'shortcuts',
                      'stats',
                      'tileview',
                      'toggle-camera',
                      'videoquality',
                      'whiteboard',
                      'hangup',
                    ]
                  : [
                      'microphone',
                      'camera',
                      'desktop',
                      'chat',
                      'raisehand',
                      'tileview',
                      'settings',
                      'fullscreen',
                      'select-background',
                      'videoquality',
                    ],
              }}
              interfaceConfigOverwrite={{
                DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
                SHOW_JITSI_WATERMARK: false,
                SHOW_WATERMARK_FOR_GUESTS: false,
                TOOLBAR_BUTTONS: isTeacher
                  ? [
                      'microphone',
                      'camera',
                      'closedcaptions',
                      'desktop',
                      'fullscreen',
                      'fodeviceselection',
                      'hangup',
                      'profile',
                      'chat',
                      'recording',
                      'livestreaming',
                      'etherpad',
                      'sharedvideo',
                      'settings',
                      'raisehand',
                      'videoquality',
                      'filmstrip',
                      'feedback',
                      'stats',
                      'shortcuts',
                      'tileview',
                      'select-background',
                      'download',
                      'help',
                      'mute-everyone',
                      'security',
                    ]
                  : [
                      'microphone',
                      'camera',
                      'desktop',
                      'chat',
                      'raisehand',
                      'tileview',
                      'settings',
                      'fullscreen',
                      'select-background',
                      'videoquality',
                    ],
              }}
              userInfo={{
                displayName: userName || (isTeacher ? 'المعلم' : 'الطالب'),
                email: userEmail || '',
              }}
              onReadyToClose={handleLeave}
              getIFrameRef={(iframeRef) => {
                iframeRef.style.height = '100%';
                iframeRef.style.width = '100%';
                iframeRef.style.border = '0';
              }}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Ending Session */}
      <ConfirmModal
        isOpen={showEndConfirm && canEndSession}
        onClose={() => setShowEndConfirm(false)}
        onConfirm={handleConfirmEnd}
        title={isRtl ? 'إنهاء الجلسة للجميع' : 'End Session for Everyone'}
        message={
          isRtl
            ? 'هل أنت متأكد من رغبتك في إنهاء الجلسة للجميع؟ سيتم إغلاق الغرفة واحتساب الجلسة كمكتملة وتسجيل المستحقات.'
            : 'Are you sure you want to end this session for all participants? This will mark the session as completed.'
        }
        confirmText={isRtl ? 'نعم، أنهِ الجلسة' : 'Yes, End Session'}
        cancelText={isRtl ? 'إلغاء' : 'Cancel'}
      />
    </>
  );
}
