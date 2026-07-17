export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x0ba22266e0ABBCa2E2e162d8905C11a31B0e0af1';

export const GENLAYER_RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC || 'https://studio.genlayer.com/api';

export const GENLAYER_EXPLORER = process.env.NEXT_PUBLIC_GENLAYER_EXPLORER || 'https://explorer-studio.genlayer.com';

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
  CREATED: 'rgba(239,138,255,0.1)',
  ACCEPTED: 'rgba(239,138,255,0.14)',
  OPENING_SUBMITTED: 'rgba(191,90,242,0.14)',
  REBUTTAL_SUBMITTED: 'rgba(217,70,239,0.14)',
  READY_FOR_JUDGEMENT: 'rgba(239,138,255,0.18)',
  JUDGED: 'rgba(239,138,255,0.18)',
  DISPUTED: 'rgba(248,113,113,0.14)',
  FINALIZED: 'rgba(74,222,128,0.1)',
  CANCELLED: 'rgba(100,100,120,0.12)',
};

export const DEBATE_STATUS_TEXT: Record<string, string> = {
  CREATED: '#ef8aff',
  ACCEPTED: '#ef8aff',
  OPENING_SUBMITTED: '#bf5af2',
  REBUTTAL_SUBMITTED: '#d946ef',
  READY_FOR_JUDGEMENT: '#ef8aff',
  JUDGED: '#ef8aff',
  DISPUTED: '#f87171',
  FINALIZED: '#4ade80',
  CANCELLED: '#7a6490',
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
