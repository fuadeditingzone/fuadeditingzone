import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

const CLERK_PUBLISHABLE_KEY = "pk_test_YWJsZS1qYXktMzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Register Service Worker for FCM
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Neural SW registered: ', registration);
    })
    .catch((err) => {
      console.log('Neural SW registration failed: ', err);
    });
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY} 
        afterSignOutUrl="/"
        appearance={{
          variables: {
            colorPrimary: '#ff0000',
            colorBackground: '#0f0f0f',
            colorText: '#ffffff',
            colorTextSecondary: '#ffffff',
            colorInputBackground: '#1a1a1a',
            colorInputText: '#ffffff',
            colorDanger: '#ff0000',
            borderRadius: '2rem',
          },
          elements: {
            rootBox: "w-full",
            card: "bg-[#0f0f0f] border border-red-600/40 shadow-2xl overflow-hidden",
            userButtonPopoverCard: "bg-[#0f0f0f] border border-red-600/40 shadow-2xl overflow-hidden",
            userButtonPopoverActionButton: "hover:bg-white/5 transition-colors py-6 px-10 border-b border-white/5 text-white forced-white",
            userButtonPopoverActionButtonText: "text-white font-black uppercase tracking-widest text-[11px]",
            userButtonPopoverActionButtonIcon: "text-red-600 w-6 h-6",
            userButtonPopoverFooter: "hidden",
            
            userProfile: {
              root: "bg-[#0f0f0f] border-none",
              navbar: "bg-[#0a0a0a] border-r border-white/10 p-8",
              navbarButton: "text-white opacity-60 font-black uppercase tracking-widest text-[10px] hover:opacity-100 hover:bg-white/5 rounded-2xl mb-2 px-5 py-4",
              navbarButton__active: "text-white opacity-100 bg-red-600/10 shadow-sm border border-red-600/20",
              pageScrollBox: "bg-[#0f0f0f] p-10 md:p-16",
              headerTitle: "text-white font-black uppercase tracking-tight text-3xl mb-3",
              headerSubtitle: "text-white opacity-70 text-[11px] uppercase tracking-[0.4em] font-bold mb-10",
              sectionTitleText: "text-white font-black uppercase tracking-widest text-[11px] border-b border-white/10 pb-5 mb-10",
            },

            profileSectionPrimaryButton: "text-white hover:text-red-500 transition-colors",
            actionButton: "text-white hover:text-red-500",
            menuItemButton: "text-white hover:bg-white/10",
            menuItemText: "text-white font-bold",
            
            formFieldLabel: "text-white font-black uppercase text-[10px] tracking-widest mb-3 ml-1",
            formFieldInput: "bg-[#1a1a1a] border-white/10 text-white text-sm h-14 focus:border-red-600 transition-all placeholder:text-zinc-700 rounded-2xl px-5",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] text-[11px] h-14 transition-all shadow-2xl active:scale-95 px-8",
            
            dividerLine: "bg-white/10",
            dividerText: "text-white opacity-50 text-[10px] font-black uppercase tracking-widest",
            alert: "bg-red-600/10 border border-red-600/20 text-white rounded-2xl text-[11px] font-bold p-6",
            scrollBox: "chat-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}