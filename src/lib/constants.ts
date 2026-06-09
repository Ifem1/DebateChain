export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

export const GENLAYER_RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://studio.genlayer.com/api';

export const GENLAYER_EXPLORER = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || 'https://explorer-studio.genlayer.com';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const DEBATE_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Open',
  ACCEPTED: 'Active',
  OPENING_SUBMITTED: 'Round 1',
  REBUTTAL_SUBMITTED: 'Round 2',
  READY_FOR_JUDGEMENT: 'Awaiting Judgement',
  JUDGED: 'Judged',
  DISPUTED: 'Disputed',
  FINALIZED: 'Finalized',
  CANCELLED: 'Cancelled',
};

export const DEBATE_STATUS_COLORS: Record<string, string> = {
  CREATED: 'rgba(37,99,235,0.15)',
  ACCEPTED: 'rgba(34,211,238,0.15)',
  OPENING_SUBMITTED: 'rgba(34,211,238,0.15)',
  REBUTTAL_SUBMITTED: 'rgba(245,197,66,0.15)',
  READY_FOR_JUDGEMENT: 'rgba(245,197,66,0.2)',
  JUDGED: 'rgba(245,197,66,0.2)',
  DISPUTED: 'rgba(225,29,72,0.15)',
  FINALIZED: 'rgba(34,197,94,0.15)',
  CANCELLED: 'rgba(100,116,139,0.15)',
};

export const DEBATE_STATUS_TEXT: Record<string, string> = {
  CREATED: '#3b82f6',
  ACCEPTED: '#22D3EE',
  OPENING_SUBMITTED: '#22D3EE',
  REBUTTAL_SUBMITTED: '#F5C542',
  READY_FOR_JUDGEMENT: '#F5C542',
  JUDGED: '#F5C542',
  DISPUTED: '#E11D48',
  FINALIZED: '#22c55e',
  CANCELLED: '#64748b',
};

export const FALLACY_DESCRIPTIONS: Record<string, string> = {
  strawman: 'Misrepresenting the opponent\'s argument to make it easier to attack.',
  ad_hominem: 'Attacking the person rather than their argument.',
  false_dilemma: 'Presenting only two options when more exist.',
  circular_reasoning: 'Using the conclusion as a premise without independent support.',
  slippery_slope: 'Claiming one event will lead to extreme consequences without evidence.',
  hasty_generalisation: 'Drawing a broad conclusion from limited examples.',
  appeal_to_emotion: 'Using emotional manipulation instead of logical argument.',
  appeal_to_authority: 'Citing authority without relevant evidence.',
  whataboutism: 'Deflecting criticism by pointing to another\'s wrongdoing.',
  red_herring: 'Introducing irrelevant information to distract from the argument.',
  unsupported_claim: 'Making an assertion without providing evidence.',
};

export const SCORING_RUBRIC = [
  { category: 'Argument Strength', weight: 30, key: 'argument_strength' },
  { category: 'Evidence Quality', weight: 25, key: 'evidence_quality' },
  { category: 'Rebuttal Quality', weight: 20, key: 'rebuttal_quality' },
  { category: 'Fallacy Penalty', weight: 15, key: 'fallacy_penalty' },
  { category: 'Clarity & Focus', weight: 10, key: 'clarity' },
];
