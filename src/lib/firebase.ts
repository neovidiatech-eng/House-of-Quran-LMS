import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "wa3y-notification.firebaseapp.com",
  projectId: "wa3y-notification",
  storageBucket: "wa3y-notification.firebasestorage.app",
  messagingSenderId: "613296187597",
  appId: "1:613296187597:web:3ed290e010a8fa48106184",
  measurementId: "G-KZDW12FHNC"
};

export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

export const requestForToken = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      await navigator.serviceWorker.ready; // Wait until the SW is active

      const currentToken = await getToken(messaging, { 
        vapidKey: 'BMQC6yy8jhCkxJOENrR8Au92Fa0OIMMlttjFIS2xZE1u0ZmjnUxN3COe87Dlb8bK6vqTCUZ5tsiBy5kGhBgNvQg',
        serviceWorkerRegistration: registration
      });
      if (currentToken) {
        // console.log('FCM Token:', currentToken);
        // TODO: Send this token to backend to save for the user
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Notification permission denied.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
