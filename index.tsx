import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

const CLERK_PUBLISHABLE_KEY = "pk_test_YWJsZS1qYXktMzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
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
            colorPrimary: '#dc2626',
            colorBackground: '#ffffff',
            colorText: '#18181b',
            colorTextSecondary: '#52525b',
            colorInputBackground: '#f8f8f8',
            colorInputText: '#18181b',
            colorDanger: '#dc2626',
            borderRadius: '2rem',
          },
          elements: {
            // High-End Dropout (UserButton Popover) Configuration
            userButtonPopoverCard: {
                zIndex: 99999,
                width: 'calc(100vw - 2rem)',
                maxWidth: '540px',
                borderRadius: '3rem',
                border: '1px solid rgba(220, 38, 38, 0.4)',
                boxShadow: '0 50px 150px rgba(0,0,0,0.6)',
                overflow: 'hidden'
            },
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-8 px-14 border-b border-zinc-50",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[13px]",
            userButtonPopoverActionButtonIcon: "text-red-600 w-7 h-7",
            userButtonPopoverFooter: "hidden",
            
            // Full User Profile Modal Configuration
            userProfile: {
              root: "w-full bg-white flex flex-col md:flex-row h-full max-h-[88vh] max-w-[1000px]",
              navbar: "border-r border-zinc-100 bg-zinc-50/90 p-10 md:w-80 flex-shrink-0",
              navbarButton: "text-zinc-500 font-black uppercase tracking-widest text-[12px] hover:bg-zinc-200 rounded-[1.75rem] mb-3 px-8 py-6",
              navbarButton__active: "text-red-600 bg-red-50 hover:bg-red-50 shadow-sm border border-red-100",
              pageScrollBox: "custom-scrollbar flex-1 p-14 md:p-24 overflow-y-auto bg-white",
              headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-5xl mb-5",
              headerSubtitle: "text-zinc-500 text-[13px] uppercase tracking-[0.6em] font-bold mb-16",
              sectionTitleText: "text-zinc-900 font-black uppercase tracking-[0.3em] text-[13px] border-b-2 border-red-600 pb-8 mb-16",
            },
            
            // Shared Modal Content settings
            modalBackdrop: "bg-black/40 backdrop-blur-none fixed inset-0 flex items-start justify-end p-6 md:p-12 pt-24 md:pt-28 z-[999999]",
            modalContent: "bg-white border border-zinc-200 rounded-[4rem] w-full max-w-[580px] overflow-hidden relative animate-in fade-in slide-in-from-top-12 duration-700",
            card: "bg-white shadow-none border-none p-14 md:p-24 mx-auto w-full",
            
            // Text and Label refinements to match VFX aesthetic
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-4xl text-center",
            headerSubtitle: "text-zinc-500 text-[12px] text-center uppercase tracking-[0.4em] font-bold mb-12",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.6em] text-[13px] h-20 transition-all shadow-3xl active:scale-95 px-12 rounded-[1.5rem]",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-lg h-20 focus:border-red-600 transition-all placeholder:text-zinc-400 rounded-[1.5rem] px-10",
            identityPreviewText: "text-zinc-900 font-bold text-xl break-words",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}