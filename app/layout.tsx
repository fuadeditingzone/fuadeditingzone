import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { Poppins } from 'next/font/google';
import "./globals.css";

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Fuad Editing Zone | VFX & Design',
  description: 'Graphic Designer & VFX Editor portfolio by Fuad Ahmed. High-impact visuals and cinematic VFX.',
  openGraph: {
    title: 'Fuad Editing Zone | VFX & Design',
    description: 'Graphic Designer & VFX Editor portfolio by Fuad Ahmed.',
    images: ['https://www.dropbox.com/scl/fi/uq92m0e5o05mvzt65pd43/Gemini_Generated_Image_hhs74dhhs74dhhs7.png?rlkey=kq52p7r4aetsyokvags5dx73x&raw=1'],
    url: 'https://fuadeditingzone.pages.dev',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fuad Editing Zone | VFX & Design',
    description: 'Graphic Designer & VFX Editor portfolio by Fuad Ahmed.',
    images: ['https://www.dropbox.com/scl/fi/uq92m0e5o05mvzt65pd43/Gemini_Generated_Image_hhs74dhhs74dhhs7.png?rlkey=kq52p7r4aetsyokvags5dx73x&raw=1'],
  },
};

const CLERK_PUBLISHABLE_KEY = "pk_test_YWJsZS1qYXktMzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${poppins.variable} font-sans bg-black text-white antialiased`}>
        <ClerkProvider 
          publishableKey={CLERK_PUBLISHABLE_KEY}
          afterSignOutUrl="/"
          appearance={{
            variables: {
              colorPrimary: '#ff0000',
              colorBackground: '#0a0a0a',
              colorText: '#ffffff',
            }
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}