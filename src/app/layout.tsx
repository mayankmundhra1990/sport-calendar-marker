import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { PreferencesProvider } from "@/context/PreferencesContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sport Calendar Marker",
  description: "Never miss a match — add your favorite teams' schedules to your calendar",
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
        <PreferencesProvider>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-8">
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
