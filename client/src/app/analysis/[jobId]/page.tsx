import AnalysisClient from "./AnalysisClient";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <AnalysisClient jobId={jobId} />;
}

export function generateMetadata() {
  return {
    title: "Gameplay Analysis",
    description:
      "Your Call of Duty: Black Ops 7 VOD is being analyzed. View your pro coaching report with timestamped feedback and skill ratings.",
    robots: { index: false, follow: false },
  };
}
