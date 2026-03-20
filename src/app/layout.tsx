import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/context/PreferencesContext";
import Navbar from "@/components/Navbar";
import ServerSyncProvider from "@/components/ServerSyncProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sport Calendar Marker — Never Miss a Match",
  description: "Follow your favourite teams and sync their match schedules directly to Google Calendar. No manual entry. Always up to date.",
  verification: {
    google: "psfdqrFvNR_g2cjLdmPb_fio2IoDkwM2BDDaFSh13bg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} font-sans antialiased bg-gray-50 min-h-screen`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg"
        >
          Skip to content
        </a>
        <PreferencesProvider>
          <ServerSyncProvider />
          <Navbar />
          <main id="main-content" className="mx-auto max-w-6xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 mt-12 py-6 text-center text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-700 hover:underline">
              Privacy Policy
            </a>
          </footer>
        </PreferencesProvider>
      </body>
    </html>
  );
}
