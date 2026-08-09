import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:5173"),
  title: {
    default: "BO7 VOD Analyzer - AI-Powered Call of Duty Coaching",
    template: "%s | BO7 VOD Analyzer",
  },
  description:
    "Get pro-level VOD reviews for Call of Duty: Black Ops 7. Upload your gameplay, get AI-powered coaching analysis with timestamps, mechanical skill ratings, positioning breakdowns, and actionable improvement priorities. Built for competitive COD players.",
  keywords: [
    "Call of Duty coaching",
    "Black Ops 7 VOD review",
    "BO7 gameplay analysis",
    "COD VOD analyzer",
    "competitive COD coaching",
    "CDL coaching tool",
    "aim analysis COD",
    "gameplay review AI",
    "Black Ops 7 tips",
    "COD improvement tool",
    "esports coaching",
    "ranked play coaching",
    "COD positioning guide",
    "Black Ops 7 ranked",
    "COD pro coaching",
    "FPS gameplay analyzer",
    "competitive gaming coach",
    "COD mechanical skill review",
    "game sense analysis",
    "BO7 meta analysis",
  ],
  authors: [{ name: "BO7 VOD Analyzer" }],
  creator: "BO7 VOD Analyzer",
  publisher: "BO7 VOD Analyzer",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "BO7 VOD Analyzer",
    title: "BO7 VOD Analyzer - AI-Powered Call of Duty Coaching",
    description:
      "Upload your Black Ops 7 gameplay. Get a pro-level VOD review with exact timestamps, mechanical skill ratings, and personalized coaching. Like having a CDL coach in your pocket.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BO7 VOD Analyzer - Pro Coaching for Black Ops 7",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BO7 VOD Analyzer - AI COD Coaching",
    description:
      "Upload your BO7 gameplay, get a brutally honest pro coaching report. Timestamps, aim ratings, positioning analysis, decision-making review.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
  category: "Gaming",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "BO7 VOD Analyzer",
              description:
                "AI-powered VOD analysis and coaching tool for Call of Duty: Black Ops 7 competitive players",
              applicationCategory: "GameApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              featureList: [
                "Aim quality analysis",
                "Movement mechanics review",
                "Positioning and map awareness evaluation",
                "Decision-making assessment",
                "Timestamped coaching feedback",
                "Mechanical skill ratings",
                "Recurring pattern detection",
                "Personalized improvement priorities",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}