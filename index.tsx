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
            borderRadius: '1rem',
          },
          elements: {
            // Positioned top-right and removed blur
            modalBackdrop: "bg-black/5 fixed inset-0 flex items-start justify-end p-4 md:p-6 pt-20 md:pt-20 z-[99999]",
            modalContent: "bg-white border border-zinc-200 shadow-[0_15px_50px_rgba(0,0,0,0.2)] rounded-[1.5rem] w-full max-w-[600px] overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-300",
            card: "bg-white shadow-none border-none p-4 md:p-8 mx-auto",
            
            userProfile: {
              root: "w-full bg-white flex flex-col md:flex-row h-full max-h-[70vh]",
              navbar: "border-r border-zinc-100 bg-zinc-50/50 p-3 md:w-52 flex-shrink-0",
              navbarButton: "text-zinc-500 font-black uppercase tracking-widest text-[8px] hover:bg-zinc-100 rounded-lg mb-1",
              navbarButton__active: "text-red-600 bg-red-50 hover:bg-red-50 shadow-sm",
              pageScrollBox: "custom-scrollbar flex-1 p-5 md:p-8 overflow-y-auto bg-white",
              headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-xl mb-1",
              headerSubtitle: "text-zinc-500 text-[9px] uppercase tracking-[0.3em] font-bold mb-5",
              profilePage__common: "bg-white",
              sectionTitleText: "text-zinc-900 font-black uppercase tracking-widest text-[9px] border-b border-zinc-100 pb-2 mb-5",
            },
            
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-lg text-center",
            headerSubtitle: "text-zinc-500 text-[9px] text-center uppercase tracking-widest font-bold",
            socialButtonsBlockButton: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-all text-[9px] h-10 uppercase font-black tracking-widest",
            socialButtonsBlockButtonText: "text-zinc-900 font-black",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] h-10 transition-all shadow-lg active:scale-95",
            formButtonReset: "text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-[9px]",
            footerActionLink: "text-red-600 hover:text-red-700 font-black underline underline-offset-4",
            footerActionText: "text-zinc-500 font-bold uppercase text-[8px]",
            formFieldLabel: "text-zinc-900 font-black uppercase text-[8px] tracking-widest mb-1.5 ml-1",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-xs h-10 focus:border-red-600 transition-all placeholder:text-zinc-400 rounded-lg",
            
            userButtonAvatarBox: "border-2 border-red-600 w-8 h-8 shadow-md",
            userButtonPopoverCard: "bg-white border border-zinc-200 shadow-xl w-64 overflow-hidden rounded-xl",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[9px]",
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-3",
            userButtonPopoverActionButtonIcon: "text-red-600",
            userButtonPopoverFooter: "hidden",
            
            identityPreviewText: "text-zinc-900 font-bold text-xs",
            identityPreviewEditButtonIcon: "text-red-600",
            dividerLine: "bg-zinc-200",
            dividerText: "text-zinc-400 text-[8px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-600 text-[8px] font-bold uppercase",
            alert: "bg-red-50 border border-red-100 text-red-700 rounded-xl text-[10px] font-bold",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}