import type { Metadata } from "next";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,700&display=swap');
          `}</style>
      </head>
      <body className="bg-black text-white">{children}</body>
    </html>
  );
}
const authors = "tokyo";
export const metadata: Metadata = {
  title: "Scrap calculator",
  description: "Calcula la cantidad de scraps de manera rapida y eficaz",
  authors: [{ name: authors }],
};
