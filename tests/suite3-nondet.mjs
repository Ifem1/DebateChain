/**
 * Suite 3 — Non-deterministic: judge_debate + dispute + finalize
 *
 * This suite builds a READY_FOR_JUDGEMENT debate, calls judge_debate
 * (the only non-deterministic function via gl.eq_principle.prompt_non_comparative),
 * waits up to ~10 minutes for consensus, then verifies the verdict,
 * tests dispute_verdict, and tests finalize_debate.
 *
 * Wallets:
 *   creator  = PK_CREATOR_1 (SIDE_A)
 *   opponent = PK_JOINER_1  (SIDE_B)
 *   outsider = PK_JOINER_2  (used for outsider-dispute check)
 */

import {
  checkEnvVars, makeAccount, makeClient, addr,
  send, view, assertOk, assertEqual, assertReverts,
  uid, debateJson, submissionJson,
  log, section,
} from './helpers.mjs';

checkEnvVars();

const creatorAcc  = makeAccount('PK_CREATOR_1');
const opponentAcc = makeAccount('PK_JOINER_1');
const outsiderAcc = makeAccount('PK_JOINER_2');

const creator  = makeClient(creatorAcc);
const opponent = makeClient(opponentAcc);
const outsider = makeClient(outsiderAcc);

const creatorAddr  = addr(creatorAcc);
const opponentAddr = addr(opponentAcc);

const VALID_WINNERS = new Set(['SIDE_A', 'SIDE_B', 'DRAW', 'INSUFFICIENT_ARGUMENTS', 'AMBIGUOUS']);

async function buildReadyDebate() {
  const debateId = uid('j');
  const { execResult: cr } = await send(creator, 'create_debate', [
    debateId,
    debateJson(creatorAddr, {
      topic: 'Remote work permanently increases productivity for knowledge workers',
      rounds_required: ['opening', 'rebuttal'],
    }),
  ]);
  assertOk(cr, 'create_debate for judge test');

  const { execResult: ac } = await send(opponent, 'accept_debate', [debateId]);
  assertOk(ac, 'accept_debate for judge test');

  const { execResult: oa } = await send(creator, 'submit_opening', [
    debateId, 'SIDE_A', uid('s'),
    submissionJson(
      'Remote work eliminates commute stress (avg 45min/day), allowing workers to focus mental energy on deep work. ' +
      'Studies by Stanford (2015, Bloom et al.) showed 13% productivity increase in remote call centre workers. ' +
      'Flexible scheduling aligns with individual peak performance windows.',
      [{ title: 'Stanford Study 2015', note: 'Bloom et al — 13% productivity increase for remote workers' }],
    ),
  ]);
  assertOk(oa, 'opening SIDE_A');

  const { execResult: ob } = await send(opponent, 'submit_opening', [
    debateId, 'SIDE_B', uid('s'),
    submissionJson(
      'Remote work removes spontaneous collaboration and mentorship. ' +
      'Junior employees in particular suffer from lack of in-person guidance. ' +
      'Microsoft 2022 survey showed remote workers formed fewer cross-team connections, ' +
      'reducing innovation output by an estimated 20% in multi-team projects.',
      [{ title: 'Microsoft 2022 Survey', note: 'Remote workers fewer cross-team connections, 20% drop in innovation' }],
    ),
  ]);
  assertOk(ob, 'opening SIDE_B');

  const { execResult: ra } = await send(creator, 'submit_rebuttal', [
    debateId, 'SIDE_A', uid('s'),
    submissionJson(
      'The Microsoft study measured connection frequency, not productivity output. ' +
      'Deep work — writing, coding, analysis — does not require constant collaboration. ' +
      'Async tools (Notion, Slack threads) replace spontaneous hallway conversations effectively.',
    ),
  ]);
  assertOk(ra, 'rebuttal SIDE_A');

  const { execResult: rb } = await send(opponent, 'submit_rebuttal', [
    debateId, 'SIDE_B', uid('s'),
    submissionJson(
      'The Stanford study covered a narrow task: call centre scripts. ' +
      'Knowledge work is diverse and collaborative. A paper by Gibbs et al 2021 ' +
      'found remote workers performed 18% worse on complex interdependent tasks. ' +
      'Async tools add cognitive overhead and delay time-sensitive decisions.',
      [{ title: 'Gibbs et al 2021', note: '18% worse on complex interdependent tasks for remote workers' }],
    ),
  ]);
  assertOk(rb, 'rebuttal SIDE_B');

  const d = await view(creator, 'get_debate', [debateId]);
  assertEqual(d.status, 'READY_FOR_JUDGEMENT', 'status before judge');
  log(`debate ${debateId} is READY_FOR_JUDGEMENT ✓`);

  return debateId;
}

async function run() {
  section('Suite 3 — Non-Deterministic (judge_debate + dispute + finalize)');
  log(`Creator  : ${creatorAddr}`);
  log(`Opponent : ${opponentAddr}`);

  // ── 3.1 Build a READY_FOR_JUDGEMENT debate ────────────────────────────────
  section('3.1 Build READY_FOR_JUDGEMENT debate');
  const debateId = await buildReadyDebate();

  // ── 3.2 Call judge_debate (non-deterministic) ─────────────────────────────
  section('3.2 judge_debate — waiting for AI consensus (up to ~10 min)');
  log('Sending judge_debate transaction...');
  log('GenLayer will run eq_principle.prompt_non_comparative across validator nodes.');
  log('This may take 60–600 seconds.');

  const { hash: judgeHash, execResult: judgeResult } = await send(
    creator, 'judge_debate', [debateId],
  );
  log(`judge_debate tx hash : ${judgeHash}`);
  log(`judge_debate execResult: ${judgeResult}`);
  assertOk(judgeResult, 'judge_debate');

  // ── 3.3 Read verdict ──────────────────────────────────────────────────────
  section('3.3 Read verdict');
  const debate = await view(creator, 'get_debate', [debateId]);
  assertEqual(debate.status, 'JUDGED', 'debate status after judge');
  log(`debate.status: ${debate.status} ✓`);

  const verdict = await view(creator, 'get_verdict', [debateId]);
  if (!verdict || typeof verdict !== 'object') {
    throw new Error('ASSERT FAILED: get_verdict returned null or non-object');
  }
  log(`verdict.winner: ${verdict.winner}`);
  log(`verdict.side_a_score: ${verdict.side_a_score}`);
  log(`verdict.side_b_score: ${verdict.side_b_score}`);
  log(`verdict.confidence: ${verdict.confidence}`);
  log(`verdict.final_summary: ${verdict.final_summary?.slice(0, 120)}`);

  if (!VALID_WINNERS.has(verdict.winner)) {
    throw new Error(`ASSERT FAILED: verdict.winner "${verdict.winner}" not in valid set`);
  }
  log(`winner is a valid value ✓`);

  if (typeof verdict.side_a_score !== 'number' || typeof verdict.side_b_score !== 'number') {
    throw new Error('ASSERT FAILED: scores are not numbers');
  }
  log('scores are numbers ✓');

  if (!verdict.key_reasoning || verdict.key_reasoning.length < 10) {
    throw new Error('ASSERT FAILED: key_reasoning is missing or too short');
  }
  log('key_reasoning present ✓');

  // ── 3.4 Check reputation update ──────────────────────────────────────────
  section('3.4 Reputation updated after judgement');
  const repCreator  = await view(creator, 'get_reputation', [creatorAddr]);
  const repOpponent = await view(creator, 'get_reputation', [opponentAddr]);

  if (!repCreator || typeof repCreator !== 'object') {
    throw new Error('ASSERT FAILED: creator reputation not found');
  }
  log(`creator  reputation.debates_total: ${repCreator.debates_total}`);
  log(`opponent reputation.debates_total: ${repOpponent?.debates_total ?? 'n/a'}`);

  if (repCreator.debates_total < 1) {
    throw new Error('ASSERT FAILED: creator debates_total < 1');
  }
  log('reputation updated ✓');

  // ── 3.5 Outsider cannot dispute ───────────────────────────────────────────
  section('3.5 dispute_verdict — outsider cannot dispute (R17)');
  await assertReverts(outsider, 'dispute_verdict', [
    debateId, uid('disp'), JSON.stringify({ reason: 'outsider trying to dispute' }),
  ], 'outsider dispute');
  log('R17 ✓');

  // ── 3.6 Participant can dispute ───────────────────────────────────────────
  section('3.6 dispute_verdict — participant disputes');
  const disputeId = uid('disp');
  const { execResult: dispResult } = await send(creator, 'dispute_verdict', [
    debateId,
    disputeId,
    JSON.stringify({ reason: 'The judge did not properly account for the quality of evidence provided for SIDE_A.' }),
  ]);
  assertOk(dispResult, 'dispute_verdict');
  log(`dispute_verdict execResult: ${dispResult}`);

  const d2 = await view(creator, 'get_debate', [debateId]);
  assertEqual(d2.status, 'DISPUTED', 'status after dispute');
  log(`debate.status: ${d2.status} ✓`);

  // ── 3.7 Finalize from DISPUTED ────────────────────────────────────────────
  section('3.7 finalize_debate — from DISPUTED state');
  const { execResult: finalResult } = await send(creator, 'finalize_debate', [debateId]);
  assertOk(finalResult, 'finalize_debate');
  log(`finalize_debate execResult: ${finalResult}`);

  const d3 = await view(creator, 'get_debate', [debateId]);
  assertEqual(d3.status, 'FINALIZED', 'status after finalize');
  if (d3.finalized !== true) throw new Error('ASSERT FAILED: finalized flag not true');
  log(`debate.status: ${d3.status} ✓`);
  log(`debate.finalized: ${d3.finalized} ✓`);

  // ── 3.8 Cannot finalize again ─────────────────────────────────────────────
  section('3.8 finalize_debate — cannot finalize twice');
  await assertReverts(creator, 'finalize_debate', [debateId], 'double finalize');
  log('double-finalize revert ✓');

  // ── 3.9 Test finalize directly from JUDGED (second debate) ───────────────
  section('3.9 finalize_debate — directly from JUDGED state (second debate)');
  const debateId2 = await buildReadyDebate();

  log('Judging second debate...');
  const { execResult: j2Result } = await send(creator, 'judge_debate', [debateId2]);
  assertOk(j2Result, 'judge_debate 2');

  const dj2 = await view(creator, 'get_debate', [debateId2]);
  assertEqual(dj2.status, 'JUDGED', 'debate2 JUDGED');

  const { execResult: fin2 } = await send(opponent, 'finalize_debate', [debateId2]);
  assertOk(fin2, 'finalize_debate by opponent');
  const dfin2 = await view(creator, 'get_debate', [debateId2]);
  assertEqual(dfin2.status, 'FINALIZED', 'debate2 FINALIZED by opponent');
  log('finalize by opponent ✓');

  section('Suite 3 PASSED');
}

export { run };

if (process.argv[1].endsWith('suite3-nondet.mjs')) {
  run().catch((err) => {
    console.error('\nSuite 3 FAILED:', err.message);
    process.exit(1);
  });
}
