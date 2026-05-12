import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import "./globals.css";

const hostGrotesk = Host_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-host-grotesk",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Weronika Grzesiowska | Portfolio",
  description:
    "Portfolio projektowe Weroniki Grzesiowskiej — grafika, ilustracja, branding.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();

  return (
    <html lang="pl" className={hostGrotesk.className}>
      <body>
        {children}
        {isEnabled && <VisualEditing />}
      </body>
    </html>
  );
}
