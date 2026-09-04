import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AtlasProvider } from "@/lib/atlas-provider";
import { AtlasShell } from "@/components/layout/atlas-shell";
import { JsonLd } from "@/components/seo/json-ld";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const SITE_NAME = "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist";
const SITE_DESCRIPTION =
  "Personal website of Faruk Gürbüz — Water Resources Engineer and Geospatial Data Scientist. Explore interactive hydrology simulations, GIS tools, watershed delineation, dam flood routing, and peer-reviewed publications in water resources engineering.";

export const metadata: Metadata = {
  metadataBase: new URL("https://farukgurbuz.com"),
  title: {
    default: SITE_NAME,
    template: "%s | Faruk Gürbüz",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Faruk Gürbüz",
    "Faruk Gurbuz",
    "water resources engineer",
    "geospatial data scientist",
    "hydrology",
    "GIS",
    "watershed delineation",
    "dam flood routing",
    "D8 flow routing",
    "hydrological modeling",
    "interactive hydrology",
    "reservoir hydraulics",
    "spillway discharge",
    "rational method",
    "synthetic hydrograph",
    "level pool routing",
    "Iowa flood center",
    "su kaynakları mühendisi",
    "coğrafi bilgi sistemleri",
    "hidroloji",
    "taşkın öteleme",
  ],
  authors: [{ name: "Faruk Gürbüz", url: "https://farukgurbuz.com" }],
  creator: "Faruk Gürbüz",
  publisher: "Faruk Gürbüz",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Faruk Gürbüz",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Faruk Gürbüz — Water Resources Engineer & Geospatial Data Scientist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
  },
  // Uncomment and add your verification codes after registering with each console:
  // verification: {
  //   google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  //   yandex: "YOUR_YANDEX_VERIFICATION_CODE",
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", spaceGrotesk.variable, ibmPlexMono.variable, "font-display")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--desk)]">
        <JsonLd />
        <AtlasProvider>
          <AtlasShell>{children}</AtlasShell>
        </AtlasProvider>
      </body>
    </html>
  );
}
