import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BS Detector - Verify Startup Claims",
  description: "Analyze startup landing pages and pitch decks for BS. Our AI agent researches every claim against public evidence and tells you what's real.",
  keywords: ["startup", "due diligence", "fact check", "pitch deck", "AI", "verification"],
  openGraph: {
    title: "BS Detector - Verify Every Claim. Trust Nothing.",
    description: "Paste a startup's URL or upload a pitch deck. Our AI agent researches every claim against public evidence.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BS Detector - Verify Every Claim",
    description: "AI-powered startup claim verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
