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
          baseTheme: undefined, // Handled manually via variables for maximum control
          variables: {
            colorPrimary: '#dc2626',
            colorBackground: '#0a0a0a',
            colorText: '#ffffff',
            colorTextSecondary: '#a1a1aa',
            colorInputBackground: '#18181b',
            colorInputText: '#ffffff',
            colorDanger: '#dc2626',
            borderRadius: '2rem',
          },
          elements: {
            // Layout Fixes
            rootBox: "w-full",
            card: {
              margin: 'auto',
              maxWidth: '100%',
              backgroundColor: '#0a0a0a',
              padding: '2.5rem',
            },
            
            // UserButton Popover (Dropout) Settings
            userButtonPopoverCard: {
                zIndex: 999999,
                width: 'calc(100vw - 2rem)',
                maxWidth: '480px',
                backgroundColor: '#0a0a0a',
                overflow: 'hidden'
            },
            userButtonPopoverActionButton: "hover:bg-white/5 transition-colors py-6 px-10 border-b border-white/5",
            userButtonPopoverActionButtonText: "text-white font-black uppercase tracking-widest text-[11px]",
            userButtonPopoverActionButtonIcon: "text-red-600 w-6 h-6",
            userButtonPopoverFooter: "hidden",
            
            // Profile Modal (Account) Styling
            userProfile: {
              root: "bg-black border-none",
              navbar: "bg-[#050505] border-r border-white/10 p-8",
              navbarButton: "text-zinc-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 rounded-2xl mb-2 px-5 py-4",
              navbarButton__active: "text-red-500 bg-red-500/5 hover:bg-red-500/5 shadow-sm border border-red-500/20",
              pageScrollBox: "bg-[#0a0a0a] p-10 md:p-16 overflow-y-auto",
              headerTitle: "text-white font-black uppercase tracking-tight text-3xl mb-3",
              headerSubtitle: "text-zinc-500 text-[11px] uppercase tracking-[0.4em] font-bold mb-10",
              sectionTitleText: "text-white font-black uppercase tracking-widest text-[11px] border-b border-white/10 pb-5 mb-10",
            },
            
            // Input and Form refinement
            formFieldLabel: "text-zinc-400 font-black uppercase text-[10px] tracking-widest mb-3 ml-1",
            formFieldInput: "bg-[#111111] border-white/10 text-white text-sm h-14 focus:border-red-600 transition-all placeholder:text-zinc-600 rounded-2xl px-5",
            formButtonPrimary: "bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] text-[11px] h-14 transition-all shadow-2xl active:scale-95 px-8",
            
            // Metadata & Shared Elements
            dividerLine: "bg-white/10",
            dividerText: "text-zinc-600 text-[10px] font-black uppercase tracking-widest",
            identityPreviewText: "text-white font-bold text-base break-words",
            identityPreviewEditButtonIcon: "text-red-600",
            alert: "bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-[11px] font-bold p-6",
            scrollBox: "custom-scrollbar overflow-y-auto"
          }
        }}
      >
        <App />
      </ClerkProvider>
    </React.StrictMode>
  );
}