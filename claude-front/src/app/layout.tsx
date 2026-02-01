import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BS Detector - Verify Startup Claims",
  description: "Analyze startup landing pages and pitch decks for BS. We research every claim against public evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
