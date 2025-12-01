import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/providers-wrapper.jsx";
import { cookies } from "next/headers.js";
import LanguageProvider from "@/providers/languageProvider.js";
import localFont from "next/font/local";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

const figtreeRegular = localFont({
  src: "../fonts/Figtree-Regular.ttf",
  variable: "--font-figtree",
  display: "swap",
});

const hacen = localFont({
  src: "../fonts/alfont_com_Hacen-Tunisia.ttf",
  variable: "--font-hacen",
  display: "swap",
});

const lemands = localFont({
  src: "../fonts/LemandsBold-DOXAm.ttf",
  variable: "--font-lemands",
  display: "swap",
});

const honor = localFont({
  src: "../fonts/HONORSansArabicUI-R.ttf",
  variable: "--font-honor",
  display: "swap",
});

const bavistage = localFont({
  src: "../fonts/bavistage-rpewe.otf",
  variable: "--font-bavistage",
  display: "swap",
});

const ibm = localFont({
  src: "../fonts/IBMPlexSansArabic-Regular.ttf",
  variable: "--font-ibm",
  display: "swap",
});

const roboto = localFont({
  src: "../fonts/RobotoFlex-VariableFont_GRAD,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC,opsz,slnt,wdth,wght.ttf",
  variable: "--font-roboto",
  display: "swap",
});


export const metadata = {
  title: "Go-GetOffer Management App",
  description: "Managing the base app from here",
};

export default async function RootLayout({ children }) {

  // Get language from cookies on server side
  const cookieStore = await cookies();
  const lang = cookieStore.get('Next-i18next')?.value || 'ar';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={lang} dir={dir} key={lang} suppressHydrationWarning>
      <body  className={` ${lang == 'ar' ? 'font-honor' : 'font-figtree'} ${figtreeRegular.variable} ${lemands.variable} ${hacen.variable} ${honor.variable} ${bavistage.variable} ${ibm.variable} ${roboto.variable} antialiased`}>
        <LanguageProvider defaultLang={lang}>
          <Providers>
            {children}
            </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}
