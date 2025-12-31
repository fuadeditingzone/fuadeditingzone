importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Signal Intercepted: ', payload);
  
  const notificationTitle = payload.notification.title || "Incoming Signal | FEZ";
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://dl.dropboxusercontent.com/scl/fi/vvk2qlo8i0mer2n4sip1h/faeez-logo.png?rlkey=xiahu40vwixf0uf96wwnvqlw2&raw=1',
    badge: 'https://dl.dropboxusercontent.com/scl/fi/vvk2qlo8i0mer2n4sip1h/faeez-logo.png?rlkey=xiahu40vwixf0uf96wwnvqlw2&raw=1',
    vibrate: [200, 100, 200],
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});