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
            borderRadius: '1.5rem',
          },
          elements: {
            modalBackdrop: "bg-black/80 backdrop-blur-xl fixed inset-0 flex items-center justify-center p-4 sm:p-8 z-[99999]",
            modalContent: "bg-white border border-zinc-200 shadow-[0_30px_100px_rgba(0,0,0,0.6)] rounded-[2.5rem] w-full max-w-[900px] mx-auto overflow-hidden relative",
            card: "bg-white shadow-none border-none p-6 md:p-10 mx-auto",
            
            // User Profile (Manage Account) specific refinements
            userProfile: {
              root: "w-full bg-white flex flex-col md:flex-row h-full max-h-[85vh]",
              navbar: "border-r border-zinc-100 bg-zinc-50/50 p-4 md:w-64 flex-shrink-0",
              navbarButton: "text-zinc-500 font-black uppercase tracking-widest text-[9px] hover:bg-zinc-100 rounded-xl mb-1",
              navbarButton__active: "text-red-600 bg-red-50 hover:bg-red-50 shadow-sm",
              pageScrollBox: "custom-scrollbar flex-1 p-6 md:p-12 overflow-y-auto bg-white",
              headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-3xl mb-1",
              headerSubtitle: "text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold mb-8",
              profilePage__common: "bg-white",
              sectionTitleText: "text-zinc-900 font-black uppercase tracking-widest text-[11px] border-b border-zinc-100 pb-3 mb-8",
              // Danger section styling (Delete Account)
              dangerSectionTitle: "text-red-600 font-black uppercase tracking-widest text-[11px]",
              dangerSectionDescription: "text-zinc-500 text-xs font-medium",
            },
            
            // Shared Components
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-2xl text-center",
            headerSubtitle: "text-zinc-500 text-[11px] text-center uppercase tracking-widest font-bold",
            socialButtonsBlockButton: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-all text-[10px] h-12 uppercase font-black tracking-widest",
            socialButtonsBlockButtonText: "text-zinc-900 font-black",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[11px] h-12 transition-all shadow-lg active:scale-95",
            formButtonReset: "text-zinc-500 hover:text-zinc-900 font-black uppercase tracking-widest text-[10px]",
            footerActionLink: "text-red-600 hover:text-red-700 font-black underline underline-offset-4",
            footerActionText: "text-zinc-500 font-bold uppercase text-[9px]",
            formFieldLabel: "text-zinc-900 font-black uppercase text-[9px] tracking-widest mb-2 ml-1",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-sm h-12 focus:border-red-600 transition-all placeholder:text-zinc-400 rounded-xl",
            
            userButtonAvatarBox: "border-2 border-red-600 w-9 h-9 shadow-lg",
            userButtonPopoverCard: "bg-white border border-zinc-200 shadow-2xl w-72 overflow-hidden rounded-2xl",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[10px]",
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-4",
            userButtonPopoverActionButtonIcon: "text-red-600",
            userButtonPopoverFooter: "hidden",
            
            identityPreviewText: "text-zinc-900 font-bold",
            identityPreviewEditButtonIcon: "text-red-600",
            dividerLine: "bg-zinc-200",
            dividerText: "text-zinc-400 text-[9px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-600 text-[9px] font-bold uppercase",
            alert: "bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs font-bold",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}