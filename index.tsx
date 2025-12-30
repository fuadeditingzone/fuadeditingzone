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
            colorBackground: '#0a0a0a',
            colorText: '#ffffff',
            colorTextSecondary: '#a1a1aa',
            colorInputBackground: '#18181b',
            colorInputText: '#ffffff',
            colorDanger: '#ef4444',
            borderRadius: '1.5rem',
          },
          elements: {
            rootBox: "w-full",
            card: "bg-[#0a0a0a] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden",
            userButtonPopoverCard: "bg-[#0a0a0a] border border-red-600/30 shadow-2xl overflow-hidden",
            userButtonPopoverActionButton: "hover:bg-white/5 transition-colors py-5 px-8 text-white",
            userButtonPopoverActionButtonText: "text-white font-black uppercase tracking-widest text-[10px]",
            userButtonPopoverActionButtonIcon: "text-red-600 w-5 h-5",
            userButtonPopoverFooter: "hidden",
            
            userProfile: {
              root: "bg-[#0a0a0a] border-none",
              navbar: "bg-[#050505] border-r border-white/5 p-6",
              navbarButton: "text-white opacity-60 font-black uppercase tracking-widest text-[9px] hover:opacity-100 hover:bg-white/5 rounded-xl mb-1.5 px-4 py-3",
              navbarButton__active: "text-white opacity-100 bg-red-600/10 border border-red-600/20",
              pageScrollBox: "bg-[#0a0a0a] p-8 md:p-12",
              headerTitle: "text-white font-black uppercase tracking-tight text-2xl",
              headerSubtitle: "text-white opacity-50 text-[10px] uppercase tracking-widest font-bold",
              sectionTitleText: "text-white font-black uppercase tracking-widest text-[10px] border-b border-white/5 pb-4 mb-8",
            },

            profileSectionPrimaryButton: "text-red-500 hover:text-red-400 font-bold",
            actionButton: "text-white hover:text-red-500",
            menuItemButton: "text-white hover:bg-white/5",
            menuItemText: "text-white font-bold",
            
            formFieldLabel: "text-zinc-500 font-black uppercase text-[9px] tracking-widest mb-2 ml-1",
            formFieldInput: "bg-[#18181b] border-white/5 text-white text-sm h-12 focus:border-red-600 transition-all rounded-xl px-4",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] text-[10px] h-12 shadow-xl active:scale-95",
            
            dividerLine: "bg-white/5",
            dividerText: "text-zinc-600 text-[9px] font-black uppercase tracking-widest",
            alert: "bg-red-600/10 border border-red-600/20 text-white rounded-xl text-[10px] font-bold p-5",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
