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
            colorBackground: 'transparent',
            colorText: '#ffffff',
            colorTextSecondary: '#e4e4e7',
            colorInputBackground: 'rgba(255, 255, 255, 0.05)',
            colorInputText: '#ffffff',
            borderRadius: '1.25rem',
          },
          elements: {
            modalBackdrop: "bg-black/40 backdrop-blur-md",
            modalContent: "bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-3xl max-w-[360px] w-[95%] mx-auto overflow-hidden",
            card: "bg-transparent shadow-none border-none p-2",
            headerTitle: "text-white font-black uppercase tracking-tight text-xl text-center",
            headerSubtitle: "text-zinc-300 text-xs text-center",
            socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all text-[10px] h-10 uppercase font-bold",
            socialButtonsBlockButtonText: "text-white font-black tracking-widest",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[10px] h-12 transition-all shadow-lg",
            footerActionLink: "text-red-500 hover:text-red-400 font-black",
            footerActionText: "text-zinc-400 font-medium",
            formFieldLabel: "text-white font-black uppercase text-[9px] tracking-widest mb-1 ml-1",
            formFieldInput: "bg-black/20 border-white/10 text-white text-sm h-11 focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all",
            userButtonAvatarBox: "border-2 border-red-600 w-9 h-9",
            userButtonPopoverCard: "bg-zinc-950/90 backdrop-blur-2xl border border-white/10 shadow-2xl w-64 overflow-hidden",
            userButtonPopoverActionButtonText: "text-white font-bold text-xs",
            userButtonPopoverActionButtonIcon: "text-red-500",
            userButtonPopoverFooter: "hidden",
            identityPreviewText: "text-white font-bold",
            identityPreviewEditButtonIcon: "text-red-500",
            dividerLine: "bg-white/10",
            dividerText: "text-zinc-500 text-[9px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-400 text-[10px] font-bold",
            alert: "bg-red-600/20 border border-red-600/30 text-white rounded-xl",
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
