import { updateJob, setJobComplete, setJobError } from "../store/jobStore.js";
import { analyzeVideo } from "./videoAnalyzer.js";
import { buildReportFromVideoAnalysis } from "./reportBuilder.js";

const ANALYSIS_TIMEOUT_MS = 12 * 60 * 1000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`)), timeoutMs);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function runAnalysisPipeline(jobId: string, videoPath: string): Promise<void> {
  try {
    // Step 1: Send full video to Gemini for native video analysis
    updateJob(jobId, { status: "analyzing", progress: 10 });

    console.log(`[${jobId}] Sending full video to Gemini for native analysis...`);
    const videoAnalysis = await withTimeout(
      analyzeVideo(videoPath),
      ANALYSIS_TIMEOUT_MS,
      "Video analysis"
    );

    updateJob(jobId, { progress: 65 });
    console.log(`[${jobId}] Video analysis complete. Found ${videoAnalysis.keyMoments.length} key moments.`);

    // Step 2: Build final coaching report from Gemini analysis
    updateJob(jobId, { status: "aggregating", progress: 70 });

    console.log(`[${jobId}] Building coaching report...`);
    const report = buildReportFromVideoAnalysis(videoAnalysis);

    // Step 3: Complete
    setJobComplete(jobId, report);
    console.log(`[${jobId}] Analysis complete. Overall rating: ${report.overallRating}/10`);

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error during analysis";
    console.error(`[${jobId}] Pipeline error:`, message);
    setJobError(jobId, message);
  }
}
