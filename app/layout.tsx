import type { Metadata } from "next";
import "./globals.css";
import PreviewBar from "@/components/PreviewBar";

export const metadata: Metadata = {
  title: "Lumeya HQ",
  description: "Private operations dashboard for Lumeya Connect",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <PreviewBar />
        <div style={{ paddingTop: "44px" }}>{children}</div>
      </body>
    </html>
  );
}
