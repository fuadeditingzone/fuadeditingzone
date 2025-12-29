import React from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App';

const CLERK_PUBLISHABLE_KEY = "pk_test_YWJsZS1qYXktMzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY} 
      afterSignOutUrl="/"
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#dc2626',
          colorBackground: '#0a0a0a',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorInputBackground: '#111111',
          colorInputText: '#ffffff',
          borderRadius: '1.5rem',
        },
        elements: {
          modalBackdrop: "fixed inset-0 flex items-center justify-center bg-black/95 backdrop-blur-xl z-[99999] p-4",
          modalContent: "mx-auto shadow-[0_0_100px_rgba(220,38,38,0.3)] border border-white/10 max-h-[90vh] overflow-y-auto",
          userProfile: {
            root: "mx-auto w-full max-w-[800px] shadow-2xl",
            navbar: "hidden", // Simplify mobile view
            scrollBox: "custom-scrollbar",
          },
          card: "bg-[#0a0a0a] border border-white/10 shadow-2xl rounded-[2rem]",
          headerTitle: "text-white font-black uppercase tracking-tighter text-2xl",
          headerSubtitle: "text-gray-400 font-medium text-sm",
          socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all",
          formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3",
          footerActionLink: "text-red-500 hover:text-red-400 font-bold",
          identityPreviewText: "text-white font-bold",
          identityPreviewEditButtonIcon: "text-red-500",
          userButtonAvatarBox: "border-2 border-red-600",
          userButtonPopoverCard: "bg-black border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]",
          userButtonPopoverActionButtonText: "text-white font-bold",
          userButtonPopoverFooter: "hidden"
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);