import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Color del Dólar — Cotización dólar blue y oficial hoy",
  description: "Consultá en tiempo real el precio del dólar blue y el dólar oficial en Argentina. Compra y venta actualizados durante el horario del mercado.",
  keywords: ["dólar blue hoy", "cotización dólar", "valor del dólar", "dólar oficial Argentina", "precio dólar blue", "tipo de cambio Argentina", "compra venta dólar"],
  authors: [{ name: "Color del Dólar" }],
  metadataBase: new URL("https://colordeldolar.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Color del Dólar — Cotización dólar blue y oficial hoy",
    description: "Precio del dólar blue y oficial en Argentina, actualizado en tiempo real durante el horario del mercado.",
    url: "https://colordeldolar.com",
    siteName: "Color del Dólar",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Color del Dólar — Cotización dólar blue y oficial hoy",
    description: "Precio del dólar blue y oficial en Argentina, actualizado en tiempo real.",
    site: "@colordeldolar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||(window.matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-2RXYPHQLE2"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-2RXYPHQLE2');
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
