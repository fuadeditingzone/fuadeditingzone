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
            colorTextSecondary: '#d4d4d8',
            colorInputBackground: 'rgba(255, 255, 255, 0.05)',
            colorInputText: '#ffffff',
            borderRadius: '1rem',
          },
          elements: {
            modalBackdrop: "bg-black/60 backdrop-blur-sm",
            modalContent: "bg-zinc-950/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl max-w-[400px] mx-auto",
            card: "bg-transparent shadow-none border-none p-4",
            headerTitle: "text-white font-black uppercase tracking-tight text-xl",
            headerSubtitle: "text-zinc-400 text-xs",
            socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all text-xs h-10",
            socialButtonsBlockButtonText: "text-white font-bold",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest text-[10px] h-11 transition-all",
            footerActionLink: "text-red-500 hover:text-red-400 font-bold",
            footerActionText: "text-zinc-500",
            formFieldLabel: "text-white font-black uppercase text-[9px] tracking-widest mb-1",
            formFieldInput: "bg-white/5 border-white/10 text-white text-sm h-10 focus:border-red-600",
            userButtonAvatarBox: "border-2 border-red-600 w-9 h-9",
            userButtonPopoverCard: "bg-zinc-950/80 backdrop-blur-xl border border-white/10 shadow-2xl w-64",
            userButtonPopoverActionButtonText: "text-white font-bold text-xs",
            userButtonPopoverActionButtonIcon: "text-red-500",
            userButtonPopoverFooter: "hidden",
            identityPreviewText: "text-white font-bold",
            identityPreviewEditButtonIcon: "text-red-500",
            dividerLine: "bg-white/10",
            dividerText: "text-zinc-600 text-[10px] font-black uppercase"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}