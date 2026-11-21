import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const vietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-vietnam",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "TagMango | All-in-One Platform for Coaches & Creators",
  description:
    "Your all-in-one, AI-powered system. Community, courses, workshops, coaching, payments, your own app & more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${vietnam.variable} ${poppins.variable}`}>
      <body>{children}</body>
    </html>
  );
}
