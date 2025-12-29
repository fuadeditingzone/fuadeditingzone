
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
        variables: {
          colorPrimary: '#dc2626',
          colorBackground: '#0a0a0a',
          colorText: '#ffffff',
          colorTextSecondary: '#9ca3af',
          colorInputBackground: '#1a1a1a',
          colorInputText: '#ffffff',
          borderRadius: '1rem',
        },
        elements: {
          modalBackdrop: "flex items-center justify-center bg-black/80 backdrop-blur-sm z-[9999]",
          modalContent: "mx-auto shadow-[0_0_50px_rgba(220,38,38,0.2)] border border-white/10",
          card: "bg-[#0a0a0a] border border-white/10",
          headerTitle: "text-white font-black uppercase tracking-tighter",
          headerSubtitle: "text-gray-400 font-medium",
          socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white",
          formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest",
          footerActionLink: "text-red-500 hover:text-red-400",
          identityPreviewText: "text-white",
          identityPreviewEditButtonIcon: "text-red-500",
        }
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
