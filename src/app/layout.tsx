import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Mechho — Bengali Fried Fish Brand | Kismatpur, Hyderabad",
    template: "%s | Mechho",
  },
  description:
    "Order fresh Bengali fried fish — Crispy Fish Fingers, Fish Fry Rice Bowls, Burgers, Buckets & more. Delivery in Kismatpur, Hyderabad. Pre-orders for parties and functions.",
  keywords: ["Bengali fish", "fried fish", "Kismatpur", "Hyderabad", "fish fry", "fish rice bowl", "mechho"],
  openGraph: {
    title: "Mechho — Bengali Fried Fish Brand",
    description: "Bengali fish, fast-food format. Delivery in Kismatpur, Hyderabad.",
    type: "website",
    locale: "en_IN",
    siteName: "Mechho",
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
