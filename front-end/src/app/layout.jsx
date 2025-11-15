import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/providers-wrapper.jsx";
import { cookies } from "next/headers.js";
import LanguageProvider from "@/providers/languageProvider.js";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Go-GetOffer Management App",
  description: "Managing the base app from here",
};

export default async function RootLayout({ children }) {

  // Get language from cookies on server side
  const cookieStore = await cookies();
  const lang = cookieStore.get('Next-i18next')?.value || 'en';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';


  return (
    <html lang={lang} dir={dir} key={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LanguageProvider defaultLang={lang}>
          <Providers>{children}</Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
