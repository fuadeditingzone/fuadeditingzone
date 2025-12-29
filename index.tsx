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
            colorBackground: '#0d0d0d',
            colorText: '#ffffff',
            colorTextSecondary: '#a1a1aa',
            colorInputBackground: '#18181b',
            colorInputText: '#ffffff',
            borderRadius: '1rem',
          },
          elements: {
            card: "border border-white/10 shadow-2xl bg-[#0d0d0d]",
            headerTitle: "text-white font-black uppercase tracking-tight",
            headerSubtitle: "text-zinc-400",
            socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest transition-colors",
            footerActionLink: "text-red-500 hover:text-red-400",
            userButtonAvatarBox: "border-2 border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]",
            userButtonPopoverCard: "bg-[#0d0d0d] border border-white/10 shadow-2xl",
            userButtonPopoverActionButtonText: "text-white font-bold",
            userButtonPopoverFooter: "hidden"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}