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
            colorBackground: 'rgba(0, 0, 0, 0.7)', // Slightly dark internal base to ensure white text readability
            colorText: '#ffffff',
            colorTextSecondary: '#e4e4e7',
            colorInputBackground: 'rgba(0, 0, 0, 0.4)',
            colorInputText: '#ffffff',
            borderRadius: '1.5rem',
          },
          elements: {
            modalBackdrop: "bg-black/50 backdrop-blur-md flex items-center justify-center p-4",
            modalContent: "bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] max-w-[350px] w-full mx-auto overflow-hidden",
            card: "bg-transparent shadow-none border-none p-6 md:p-8",
            headerTitle: "text-white font-black uppercase tracking-tight text-xl text-center mb-1",
            headerSubtitle: "text-zinc-300 text-[10px] text-center uppercase tracking-widest font-bold",
            socialButtonsBlockButton: "bg-black/40 border-white/10 hover:bg-white/10 text-white transition-all text-[10px] h-11 uppercase font-black tracking-widest",
            socialButtonsBlockButtonText: "text-white",
            formButtonPrimary: "bg-white hover:bg-red-600 text-black hover:text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 transition-all shadow-xl",
            footerActionLink: "text-white hover:text-red-500 font-black underline decoration-red-600 underline-offset-4",
            footerActionText: "text-zinc-400 font-bold uppercase text-[9px]",
            formFieldLabel: "text-white font-black uppercase text-[9px] tracking-widest mb-2 ml-1",
            formFieldInput: "bg-black/50 border-white/10 text-white text-sm h-12 focus:border-red-600 transition-all",
            userButtonAvatarBox: "border-2 border-red-600 w-9 h-9 shadow-[0_0_20px_rgba(220,38,38,0.3)]",
            userButtonPopoverCard: "bg-zinc-950/80 backdrop-blur-3xl border border-white/10 shadow-2xl w-64 overflow-hidden",
            userButtonPopoverActionButtonText: "text-white font-black uppercase tracking-widest text-[10px]",
            userButtonPopoverActionButton: "hover:bg-white/10 transition-colors py-3",
            userButtonPopoverActionButtonIcon: "text-red-600",
            userButtonPopoverFooter: "hidden",
            identityPreviewText: "text-white font-bold",
            identityPreviewEditButtonIcon: "text-red-500",
            dividerLine: "bg-white/10",
            dividerText: "text-zinc-500 text-[9px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-400 text-[9px] font-bold uppercase",
            alert: "bg-red-600/20 border border-red-600/30 text-white rounded-xl text-xs",
            scrollBox: "custom-scrollbar overflow-y-auto max-h-[70vh]"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}