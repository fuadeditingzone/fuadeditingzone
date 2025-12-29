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
            colorBackground: '#ffffff', // Pure white background
            colorText: '#18181b',       // Deep zinc/black text for perfect contrast
            colorTextSecondary: '#52525b',
            colorInputBackground: '#f4f4f5',
            colorInputText: '#18181b',
            borderRadius: '1.25rem',
          },
          elements: {
            modalBackdrop: "bg-black/60 backdrop-blur-md flex items-center justify-center p-4",
            modalContent: "bg-white border border-zinc-200 shadow-2xl rounded-3xl max-w-[360px] w-full mx-auto overflow-hidden",
            card: "bg-white shadow-none border-none p-6 md:p-8",
            headerTitle: "text-zinc-900 font-black uppercase tracking-tight text-xl text-center",
            headerSubtitle: "text-zinc-500 text-[10px] text-center uppercase tracking-widest font-bold",
            socialButtonsBlockButton: "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-900 transition-all text-[10px] h-12 uppercase font-black tracking-widest",
            socialButtonsBlockButtonText: "text-zinc-900 font-black",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.2em] text-[11px] h-12 transition-all shadow-lg",
            footerActionLink: "text-red-600 hover:text-red-700 font-black underline underline-offset-4",
            footerActionText: "text-zinc-500 font-bold uppercase text-[9px]",
            formFieldLabel: "text-zinc-900 font-black uppercase text-[9px] tracking-widest mb-1.5 ml-1",
            formFieldInput: "bg-zinc-50 border-zinc-200 text-zinc-900 text-sm h-12 focus:border-red-600 transition-all placeholder:text-zinc-400",
            userButtonAvatarBox: "border-2 border-red-600 w-9 h-9 shadow-lg",
            userButtonPopoverCard: "bg-white border border-zinc-200 shadow-2xl w-64 overflow-hidden rounded-2xl",
            userButtonPopoverActionButtonText: "text-zinc-900 font-black uppercase tracking-widest text-[10px]",
            userButtonPopoverActionButton: "hover:bg-zinc-50 transition-colors py-3",
            userButtonPopoverActionButtonIcon: "text-red-600",
            userButtonPopoverFooter: "hidden",
            identityPreviewText: "text-zinc-900 font-bold",
            identityPreviewEditButtonIcon: "text-red-600",
            dividerLine: "bg-zinc-200",
            dividerText: "text-zinc-400 text-[9px] font-black uppercase tracking-widest",
            formFieldErrorText: "text-red-600 text-[9px] font-bold uppercase",
            alert: "bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs",
            scrollBox: "custom-scrollbar overflow-y-auto max-h-[70vh]"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}
