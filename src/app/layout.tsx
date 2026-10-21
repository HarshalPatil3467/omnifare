import type { Metadata } from "next";
import {
  Space_Grotesk,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "OmniFare | Multi-Modal Travel Fare Prediction Using ML",
  description:
    "OmniFare: Multi-Modal Travel Fare Prediction Using ML across Flights, Indian Railways, Intercity Roadways, and Coastal Waterways.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body className="antialiased selection:bg-blue-600 selection:text-white text-slate-900">
        {children}
      </body>
    </html>
  );
}
