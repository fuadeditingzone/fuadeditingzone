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
            // High-end Dropdown Style with ZERO Blur
            modalBackdrop: "bg-black/40 backdrop-blur-none fixed inset-0 flex items-start justify-end p-4 md:p-8 pt-20 md:pt-24 z-[999999]",
            modalContent: "bg-white border border-zinc-200 shadow-[0_50px_150px_rgba(0,0,0,0.6)] rounded-[3.5rem] w-full max-w-[520px] overflow-hidden relative animate-in fade-in slide-in-from-top-12 duration-600",
            card: "bg-white shadow-none border-none p-12 md:p-20 mx-auto",
            
            userProfile: {
              root: "w-full bg-white flex flex-col md:flex-row h-full max-h-[85vh] max-w-[900px]",
              navbar: "border-r border-zinc-100 bg-zinc-50/80 p-8 md:w-72 flex-shrink-0",
              navbarButton: "text-zinc-500 font-black uppercase tracking-widest text-[11px] hover:bg-zinc-200 rounded-3xl mb-2.5 px-6 py-5",
              navbarButton__active: "text-red-600 bg-red-50 hover:bg-red-50 shadow-sm border border-red-100",
              pageScrollBox: "custom-scrollbar flex-1 p-12 md:p-20 overflow-y-auto bg-white",
              headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-4xl mb-4",
              headerSubtitle: "text-zinc-500 text-[12px] uppercase tracking-[0.5em] font-bold mb-12",
              profilePage__common: "bg-white",
              sectionTitleText: "text-zinc-900 font-black uppercase tracking-[0.25em] text-[12px] border-b-2 border-red-600 pb-6 mb-12",
            },
            
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-3xl text-center",
            headerSubtitle: "text-zinc-500 text-[11px] text-center uppercase tracking-[0.4em] font-bold mb-10",
            socialButtonsBlockButton: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-all text-[11px] h-16 uppercase font-black tracking-widest px-8 rounded-3xl",
            socialButtonsBlockButtonText: "text-zinc-900 font-black",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[12px] h-16 transition-all shadow-2xl active:scale-95 px-10 rounded-3xl",
            formButtonReset: "text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-[11px]",
            footerActionLink: "text-red-600 hover:text-red-700 font-black underline underline-offset-8",
            footerActionText: "text-zinc-500 font-bold uppercase text-[10px] tracking-widest",
            formFieldLabel: "text-zinc-900 font-black uppercase text-[11px] tracking-widest mb-4 ml-2",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-base h-16 focus:border-red-600 transition-all placeholder:text-zinc-400 rounded-3xl px-8",
            
            userButtonAvatarBox: "border-[4px] border-red-600 w-12 h-12 shadow-2xl",
            userButtonPopoverCard: "bg-white border border-zinc-200 shadow-[0_40px_100px_rgba(0,0,0,0.5)] w-[calc(100vw-3rem)] max-w-[460px] overflow-hidden rounded-[3rem]",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[12px]",
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-7 px-12 border-b border-zinc-50",
            userButtonPopoverActionButtonIcon: "text-red-600 w-6 h-6",
            userButtonPopoverFooter: "hidden",
            
            identityPreviewText: "text-zinc-900 font-bold text-lg break-words",
            identityPreviewEditButtonIcon: "text-red-600",
            dividerLine: "bg-zinc-200 h-[2px]",
            dividerText: "text-zinc-400 text-[11px] font-black uppercase tracking-widest mx-4",
            formFieldErrorText: "text-red-600 text-[11px] font-bold uppercase mt-2 ml-2",
            alert: "bg-red-50 border border-red-200 text-red-700 rounded-3xl text-[12px] font-bold p-8 leading-relaxed",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}