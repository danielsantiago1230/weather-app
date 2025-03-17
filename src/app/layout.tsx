import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Load fonts with display swap for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Improved metadata for SEO and social sharing
export const metadata: Metadata = {
  title: "Multi-City Weather App",
  description: "A simple weather app showing current conditions in Ottawa, Bogota, and Buenos Aires",
  keywords: ["weather", "forecast", "Ottawa", "Bogota", "Buenos Aires", "temperature"],
  authors: [{ name: "Weather App Team" }],
  openGraph: {
    title: "Multi-City Weather App",
    description: "Track weather conditions in major cities around the world",
    type: "website",
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <div className="flex flex-col min-h-full">
          {children}
        </div>
      </body>
    </html>
  );
}
