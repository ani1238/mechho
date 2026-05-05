import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Mechho — Bengali Fish Home Kitchen | Kismatpur, Hyderabad",
    template: "%s | Mechho Home Kitchen",
  },
  description:
    "Order fresh Bengali fish dishes — Crispy Fish Fingers, Fish Fry Rice Bowls, Buckets & more. Home delivery in Kismatpur, Hyderabad. Place pre-orders for parties and functions.",
  keywords: ["Bengali fish", "home delivery", "Kismatpur", "Hyderabad", "fish fry", "fish rice bowl", "mechho"],
  openGraph: {
    title: "Mechho — Bengali Fish Home Kitchen",
    description: "Bengali fish, fast-food format. Home delivery in Kismatpur, Hyderabad.",
    type: "website",
    locale: "en_IN",
    siteName: "Mechho Home Kitchen",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${inter.className} min-h-full flex flex-col bg-mechho-cream text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
