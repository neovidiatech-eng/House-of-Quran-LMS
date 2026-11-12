import { useEffect } from 'react';
import { requestForToken, onMessageListener } from '../lib/firebase';
import { message } from 'antd';
import { useQueryClient } from '@tanstack/react-query';

export const useFCM = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Request token and log it (or send to backend)
    requestForToken().then((token) => {
      if (token) {
        console.log("FCM Token generated:", token);
        // TODO: Send this token to backend API to register device for push notifications
      }
    });

    // 2. Listen to foreground messages
    const listenToMessages = async () => {
      try {
        const payload: any = await onMessageListener();
        if (payload?.notification) {
          message.info(`${payload.notification.title}`);
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
        // recursive call to keep listening
        listenToMessages();
      } catch (error) {
        console.error("FCM listener error", error);
      }
    };

    listenToMessages();
  }, [queryClient]);
};
