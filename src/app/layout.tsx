import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AtlasProvider } from "@/lib/atlas-provider";
import { AtlasShell } from "@/components/layout/atlas-shell";

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

const SITE_NAME = "Faruk Gürbüz — Personal Atlas";
const SITE_DESCRIPTION =
  "Hydrologist, geospatial data scientist and builder of open tools — surveyed across İstanbul, Ankara and Iowa City.";

export const metadata: Metadata = {
  metadataBase: new URL("https://farukgurbuz.com"),
  title: {
    default: SITE_NAME,
    template: "%s | Faruk Gürbüz",
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Faruk Gürbüz",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
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
        <AtlasProvider>
          <AtlasShell>{children}</AtlasShell>
        </AtlasProvider>
      </body>
    </html>
  );
}
