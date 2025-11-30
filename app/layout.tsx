import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
 
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  );
}


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const authors = "tokyo"
export const metadata: Metadata = {
  title: "Scrap calculator",
  description: "Calcula la cantidad de scraps de manera rapida y eficaz",
  authors: [{ name: authors }]
};

