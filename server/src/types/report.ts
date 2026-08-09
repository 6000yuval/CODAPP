export type ConfidenceLevel = "high" | "medium" | "low" | "insufficient_sample";
export type EvidenceSource = "observed_video" | "inferred_pattern";
export type CoverageScope = "short_clip" | "medium_segment" | "full_vod";
export type MomentPerspective = "player_pov" | "killcam_inference" | "non_playable_state";
export type MomentKey =
  | "initial_setup_hold"
  | "aggressive_initial_push"
  | "good_info_peek"
  | "preaim_angle_discipline"
  | "first_blood_secured"
  | "clean_opening_pick"
  | "overheat_after_blood"
  | "overexposed_post_kill"
  | "untradeable_death"
  | "lack_of_cover_discipline"
  | "tunnel_vision"
  | "killcam_exposed_confirmation"
  | "isolated_engagement"
  | "wide_exposure"
  | "generic_positive"
  | "generic_negative";

export interface CriticalMoment {
  timestamp: string;
  event: string;
  eventKey: MomentKey;
  category: "aim" | "movement" | "positioning" | "decision" | "awareness" | "mechanical" | "teamplay" | "objective";
  rating: "excellent" | "good" | "neutral" | "bad" | "terrible";
  analysis: string;
  recommendation: string;
  confidence: "high" | "medium" | "low";
  perspective: MomentPerspective;
}

export interface Insight {
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
}

export interface MechanicalReview {
  aimQuality: number;
  centering: number;
  recoilControl: number;
  tracking: number;
  flickAccuracy: number;
  crosshairPlacement: number;
  movementQuality: number;
  slideJumpUsage: number;
  notes: string[];
}

export interface DecisionMakingReview {
  engagementSelection: number;
  overChallenges: string[];
  egoChalls: string[];
  badPeeks: string[];
  rotationTiming: number;
  objectivePlay: number;
  notes: string[];
}

export interface PositioningReview {
  mapAwareness: number;
  useOfCover: number;
  spawnAwareness: number;
  powerPositions: number;
  routeChoices: number;
  dangerZoneAwareness: number;
  notes: string[];
}

export interface RecurringPattern {
  pattern: string;
  frequency: "occasional" | "frequent" | "constant";
  impact: "low" | "medium" | "high";
  description: string;
}

export interface CoachVerdict {
  verdict: string;
  bottleneck: string;
  confidence: ConfidenceLevel;
  basedOn: string;
  scope: CoverageScope;
}

export interface HabitLeak {
  name: string;
  trigger: string;
  replacement: string;
  drill: string;
  impact: "medium" | "high";
  punishment: "crimson" | "iridescent" | "top250";
  confidence: ConfidenceLevel;
  evidence: string[];
}

export interface ProAlternative {
  situation: string;
  safest: string;
  aggressive: string;
  soloQueue: string;
}

export interface ScorecardMetric {
  key: string;
  label: string;
  score: number | null;
  observations: number;
  confidence: ConfidenceLevel;
  scope: CoverageScope;
  reason?: string;
}

export interface TrainingGoal {
  title: string;
  cue: string;
  prescription: string;
  target: string;
}

export interface EvidenceAppendix {
  observedFacts: string[];
  inferences: string[];
  nonPlayableStateEvidence: string[];
  limitations: string[];
  sampleSize: {
    timelineMoments: number;
    scope: CoverageScope;
    maxTimestamp: string | null;
    categoryObservations: Record<string, number>;
  };
}

export interface CoachingReport {
  overview: string;
  overallRating: number;
  gameMode: string | null;
  mapName: string | null;
  keyStrengths: Insight[];
  keyMistakes: Insight[];
  timeline: CriticalMoment[];
  recurringPatterns: RecurringPattern[];
  mechanicalReview: MechanicalReview;
  decisionMakingReview: DecisionMakingReview;
  positioningReview: PositioningReview;
  coachingSummary: string;
  topThreePriorities: string[];
  coachVerdict: CoachVerdict;
  srLeakingHabits: HabitLeak[];
  proAlternatives: ProAlternative[];
  scorecards: ScorecardMetric[];
  trainingPrescription: TrainingGoal[];
  evidenceAppendix: EvidenceAppendix;
}

export interface BatchAnalysis {
  batchIndex: number;
  timeRangeStart: number;
  timeRangeEnd: number;
  observations: string[];
  keyMoments: CriticalMoment[];
  aimNotes: string[];
  movementNotes: string[];
  positioningNotes: string[];
  decisionNotes: string[];
  rawAnalysis: string;
}

export interface Job {
  id: string;
  accessToken: string;
  status: "queued" | "extracting_frames" | "analyzing" | "aggregating" | "complete" | "error";
  progress: number;
  videoPath: string;
  videoHash?: string;
  framesDir?: string;
  report?: CoachingReport;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
