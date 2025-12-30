importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY", // Shared with your YT key for this project context
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456", // Standardized for FEZ
  appId: "1:1032345523456:web:123456789",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://dl.dropboxusercontent.com/scl/fi/vvk2qlo8i0mer2n4sip1h/faeez-logo.png?rlkey=xiahu40vwixf0uf96wwnvqlw2&raw=1'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});