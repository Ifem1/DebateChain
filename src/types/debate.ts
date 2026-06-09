export type DebateStatus =
  | 'CREATED'
  | 'ACCEPTED'
  | 'OPENING_SUBMITTED'
  | 'REBUTTAL_SUBMITTED'
  | 'READY_FOR_JUDGEMENT'
  | 'JUDGED'
  | 'DISPUTED'
  | 'FINALIZED'
  | 'CANCELLED';

export type DebateSide = 'SIDE_A' | 'SIDE_B';
export type DebateRound = 'opening' | 'rebuttal' | 'final';
export type DebateType = 'claim_vs_counterclaim' | 'product_comparison' | 'governance' | 'educational' | 'creator_challenge';

export type WinnerType = 'SIDE_A' | 'SIDE_B' | 'DRAW' | 'AMBIGUOUS' | 'INSUFFICIENT_ARGUMENTS';

export interface EvidenceItem {
  title: string;
  url: string;
  note: string;
}

export interface Debate {
  debate_id: string;
  creator: string;
  opponent: string;
  topic: string;
  side_a_label: string;
  side_b_label: string;
  status: DebateStatus;
  debate_type: DebateType;
  rounds_required: DebateRound[];
  word_limit: number;
  evidence_required: boolean;
  rules_json: string;
  created_at: number;
  finalized: boolean;
  verdict_id?: string;
}

export interface Submission {
  submission_id: string;
  debate_id: string;
  side: DebateSide;
  round: DebateRound;
  argument_text: string;
  evidence: EvidenceItem[];
  submitted_by: string;
  submitted_at?: number;
  word_count?: number;
}

export interface FallacyDetection {
  type: string;
  description: string;
  excerpt?: string;
}

export interface SubScore {
  side_a: number;
  side_b: number;
}

export interface Verdict {
  debate_id: string;
  winner: WinnerType;
  confidence: number;
  side_a_score: number;
  side_b_score: number;
  argument_strength: SubScore;
  evidence_quality: SubScore;
  rebuttal_quality: SubScore;
  fallacies: {
    side_a: FallacyDetection[];
    side_b: FallacyDetection[];
  };
  key_reasoning: string;
  improvement_notes: {
    side_a: string[];
    side_b: string[];
  };
  strongest_points_a?: string[];
  strongest_points_b?: string[];
  evidence_assessment?: string;
  final_summary?: string;
  judge_notice?: string;
  judged_at?: number;
}

export interface UserReputation {
  address: string;
  debates_total: number;
  wins: number;
  losses: number;
  draws: number;
  fallacy_count: number;
  evidence_quality_avg: number;
  argument_strength_avg: number;
  win_rate: number;
}

export interface ProtocolState {
  owner: string;
  debate_count: number;
  submission_count: number;
  verdict_count: number;
}

export interface CreateDebateInput {
  topic: string;
  side_a_label: string;
  side_b_label: string;
  debate_type: DebateType;
  word_limit: number;
  evidence_required: boolean;
  rounds_required: DebateRound[];
  rules: string;
}
