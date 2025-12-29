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
            borderRadius: '1.25rem',
          },
          elements: {
            // Positioned top-right and removed blur
            modalBackdrop: "bg-black/5 fixed inset-0 flex items-start justify-end p-4 md:p-8 pt-20 md:pt-20 z-[99999]",
            modalContent: "bg-white border border-zinc-200 shadow-[0_20px_80px_rgba(0,0,0,0.25)] rounded-[2rem] w-full max-w-[640px] overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-300",
            card: "bg-white shadow-none border-none p-6 md:p-10 mx-auto",
            
            userProfile: {
              root: "w-full bg-white flex flex-col md:flex-row h-full max-h-[75vh]",
              navbar: "border-r border-zinc-100 bg-zinc-50/50 p-4 md:w-56 flex-shrink-0",
              navbarButton: "text-zinc-500 font-black uppercase tracking-widest text-[8px] hover:bg-zinc-100 rounded-xl mb-1 px-3 py-2",
              navbarButton__active: "text-red-600 bg-red-50 hover:bg-red-50 shadow-sm",
              pageScrollBox: "custom-scrollbar flex-1 p-6 md:p-10 overflow-y-auto bg-white",
              headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-xl mb-1",
              headerSubtitle: "text-zinc-500 text-[9px] uppercase tracking-[0.3em] font-bold mb-6",
              profilePage__common: "bg-white",
              sectionTitleText: "text-zinc-900 font-black uppercase tracking-widest text-[9px] border-b border-zinc-100 pb-3 mb-6",
            },
            
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-xl text-center",
            headerSubtitle: "text-zinc-500 text-[9px] text-center uppercase tracking-widest font-bold",
            socialButtonsBlockButton: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-all text-[9px] h-11 uppercase font-black tracking-widest px-4",
            socialButtonsBlockButtonText: "text-zinc-900 font-black",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] h-11 transition-all shadow-lg active:scale-95 px-6",
            formButtonReset: "text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-[9px]",
            footerActionLink: "text-red-600 hover:text-red-700 font-black underline underline-offset-4",
            footerActionText: "text-zinc-500 font-bold uppercase text-[8px]",
            formFieldLabel: "text-zinc-900 font-black uppercase text-[8px] tracking-widest mb-2 ml-1",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-xs h-11 focus:border-red-600 transition-all placeholder:text-zinc-400 rounded-xl px-4",
            
            userButtonAvatarBox: "border-2 border-red-600 w-9 h-9 shadow-md",
            userButtonPopoverCard: "bg-white border border-zinc-200 shadow-2xl w-80 overflow-hidden rounded-2xl",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[10px]",
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-4 px-6",
            userButtonPopoverActionButtonIcon: "text-red-600",
            userButtonPopoverFooter: "hidden",
            
            identityPreviewText: "text-zinc-900 font-bold text-sm",
            identityPreviewEditButtonIcon: "text-red-600",
            dividerLine: "bg-zinc-200",
            dividerText: "text-zinc-400 text-[9px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-600 text-[9px] font-bold uppercase",
            alert: "bg-red-50 border border-red-100 text-red-700 rounded-xl text-[10px] font-bold p-3",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}