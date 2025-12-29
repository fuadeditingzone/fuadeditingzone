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
            borderRadius: '1.75rem',
          },
          elements: {
            // Centered layout to prevent clipping and improve visibility
            modalBackdrop: "bg-black/60 backdrop-blur-md fixed inset-0 flex items-center justify-center p-4 z-[99999]",
            modalContent: "bg-white border border-zinc-200 shadow-[0_40px_120px_rgba(0,0,0,0.5)] rounded-[3rem] w-full max-w-[500px] overflow-hidden relative animate-in fade-in zoom-in-95 duration-400",
            card: "bg-white shadow-none border-none p-8 md:p-12 mx-auto",
            
            userProfile: {
              root: "w-full bg-white flex flex-col md:flex-row h-full max-h-[85vh] max-w-[800px]",
              navbar: "border-r border-zinc-100 bg-zinc-50/50 p-6 md:w-64 flex-shrink-0",
              navbarButton: "text-zinc-500 font-black uppercase tracking-widest text-[9px] hover:bg-zinc-100 rounded-2xl mb-1.5 px-4 py-3",
              navbarButton__active: "text-red-600 bg-red-50 hover:bg-red-50 shadow-sm",
              pageScrollBox: "custom-scrollbar flex-1 p-8 md:p-12 overflow-y-auto bg-white",
              headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-2xl mb-2",
              headerSubtitle: "text-zinc-500 text-[10px] uppercase tracking-[0.35em] font-bold mb-8",
              profilePage__common: "bg-white",
              sectionTitleText: "text-zinc-900 font-black uppercase tracking-widest text-[10px] border-b border-zinc-100 pb-4 mb-8",
            },
            
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-2xl text-center",
            headerSubtitle: "text-zinc-500 text-[10px] text-center uppercase tracking-widest font-bold",
            socialButtonsBlockButton: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-all text-[10px] h-14 uppercase font-black tracking-widest px-6",
            socialButtonsBlockButtonText: "text-zinc-900 font-black",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.25em] text-[11px] h-14 transition-all shadow-xl active:scale-95 px-8",
            formButtonReset: "text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-[10px]",
            footerActionLink: "text-red-600 hover:text-red-700 font-black underline underline-offset-4",
            footerActionText: "text-zinc-500 font-bold uppercase text-[9px]",
            formFieldLabel: "text-zinc-900 font-black uppercase text-[9px] tracking-widest mb-3 ml-1",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-sm h-14 focus:border-red-600 transition-all placeholder:text-zinc-400 rounded-2xl px-5",
            
            userButtonAvatarBox: "border-[3px] border-red-600 w-11 h-11 shadow-lg",
            userButtonPopoverCard: "bg-white border border-zinc-200 shadow-3xl w-[calc(100vw-2rem)] max-w-[420px] overflow-hidden rounded-[2.5rem]",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[11px]",
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-5 px-8",
            userButtonPopoverActionButtonIcon: "text-red-600 w-5 h-5",
            userButtonPopoverFooter: "hidden",
            
            identityPreviewText: "text-zinc-900 font-bold text-base break-words",
            identityPreviewEditButtonIcon: "text-red-600",
            dividerLine: "bg-zinc-200",
            dividerText: "text-zinc-400 text-[10px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-600 text-[10px] font-bold uppercase",
            alert: "bg-red-50 border border-red-100 text-red-700 rounded-2xl text-[11px] font-bold p-5",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}