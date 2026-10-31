import "./globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";


export const metadata = {
  title: "Receptboken",
  description: "Familjens recept, matsedel och inköpslista",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Receptboken", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#1A211E" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="sv">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Atkinson+Hyperlegible:wght@400;700&display=swap" />
      </head>
      <body>
        <Providers>
          <Nav />
          <main className="wrap main">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
