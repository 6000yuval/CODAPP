import type { Metadata } from "next";
import UploadClient from "./UploadClient";

export const metadata: Metadata = {
  title: "Upload Your Gameplay",
  description:
    "Upload your Call of Duty: Black Ops 7 gameplay video for AI-powered VOD analysis. Supports MP4, WebM, MOV — up to 15 minutes. Get your pro coaching report in under 3 minutes.",
  openGraph: {
    title: "Upload Your BO7 Gameplay for Analysis",
    description:
      "Drop your Black Ops 7 VOD and get a pro-level coaching report with timestamps, skill ratings, and improvement priorities.",
  },
};

export default function UploadPage() {
  return <UploadClient />;
}
