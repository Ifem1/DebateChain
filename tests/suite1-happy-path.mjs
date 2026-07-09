/**
 * Suite 1 — Deterministic happy path
 * create → accept → openings → rebuttals → READY_FOR_JUDGEMENT
 *
 * Wallets:
 *   creator  = PK_CREATOR_1 (SIDE_A)
 *   opponent = PK_JOINER_1  (SIDE_B)
 *
 * No judge_debate call here — that is suite3 (non-deterministic).
 */

import {
  checkEnvVars, makeAccount, makeClient, addr,
  send, view, assertOk, assertEqual,
  uid, debateJson, submissionJson,
  log, section,
} from './helpers.mjs';

checkEnvVars();

const creatorAcc  = makeAccount('PK_CREATOR_1');
const opponentAcc = makeAccount('PK_JOINER_1');
const creator  = makeClient(creatorAcc);
const opponent = makeClient(opponentAcc);
const creatorAddr  = addr(creatorAcc);
const opponentAddr = addr(opponentAcc);

async function run() {
  section('Suite 1 — Happy Path');
  log(`Creator  : ${creatorAddr}`);
  log(`Opponent : ${opponentAddr}`);

  // ── 1. Protocol state before ──────────────────────────────────────────────
  section('1.1 Protocol state snapshot');
  const stateBefore = await view(creator, 'get_protocol_state');
  log(`debate_count before: ${stateBefore.debate_count}`);

  // ── 2. Create debate ──────────────────────────────────────────────────────
  section('1.2 Create debate');
  const debateId = uid('d1');
  const dJson = debateJson(creatorAddr, {
    topic: 'AI will be net positive for employment',
    rounds_required: ['opening', 'rebuttal'],
  });

  const { execResult: createResult } = await send(creator, 'create_debate', [debateId, dJson]);
  assertOk(createResult, 'create_debate');
  log(`create_debate execResult: ${createResult}`);

  // ── 3. Read back debate ───────────────────────────────────────────────────
  section('1.3 Read debate — expect CREATED');
  const d1 = await view(creator, 'get_debate', [debateId]);
  assertEqual(d1.status, 'CREATED', 'status after create');
  assertEqual(d1.creator.toLowerCase(), creatorAddr.toLowerCase(), 'creator address');
  log(`debate.status: ${d1.status} ✓`);

  // ── 4. Check user_debates for creator ────────────────────────────────────
  section('1.4 get_user_debates — creator sees debate');
  const creatorDebates = await view(creator, 'get_user_debates', [creatorAddr]);
  log(`creator debate list length: ${Array.isArray(creatorDebates) ? creatorDebates.length : 'n/a'}`);
  // debate_id may not be stored directly in the object — check topic
  const match = Array.isArray(creatorDebates) && creatorDebates.find(d => d.topic === 'AI will be net positive for employment');
  if (!match) throw new Error('ASSERT FAILED: creator debate not in user_debates');
  log(`user_debates contains new debate ✓`);

  // ── 5. Accept debate ──────────────────────────────────────────────────────
  section('1.5 Accept debate — opponent joins');
  const { execResult: acceptResult } = await send(opponent, 'accept_debate', [debateId]);
  assertOk(acceptResult, 'accept_debate');
  log(`accept_debate execResult: ${acceptResult}`);

  const d2 = await view(creator, 'get_debate', [debateId]);
  assertEqual(d2.status, 'ACCEPTED', 'status after accept');
  assertEqual(d2.opponent.toLowerCase(), opponentAddr.toLowerCase(), 'opponent address');
  log(`debate.status: ${d2.status} ✓`);

  // ── 6. Submit SIDE_A opening ──────────────────────────────────────────────
  section('1.6 submit_opening — SIDE_A');
  const subA1 = uid('s');
  const { execResult: openA } = await send(creator, 'submit_opening', [
    debateId, 'SIDE_A', subA1,
    submissionJson('AI automates repetitive tasks, freeing humans for creative work. Historical evidence: industrial revolution created more jobs than it destroyed.'),
  ]);
  assertOk(openA, 'submit_opening SIDE_A');
  log(`submit_opening SIDE_A execResult: ${openA}`);

  // After only SIDE_A opening, status should still be ACCEPTED (both sides not done)
  const d3 = await view(creator, 'get_debate', [debateId]);
  log(`status after SIDE_A opening: ${d3.status}`);
  assert_one_of(d3.status, ['ACCEPTED', 'OPENING_SUBMITTED'], 'status after one opening');

  // ── 7. Submit SIDE_B opening ──────────────────────────────────────────────
  section('1.7 submit_opening — SIDE_B');
  const subB1 = uid('s');
  const { execResult: openB } = await send(opponent, 'submit_opening', [
    debateId, 'SIDE_B', subB1,
    submissionJson('AI displaces workers faster than new roles emerge. Evidence: manufacturing job losses in the midwest show no equivalent replacement.'),
  ]);
  assertOk(openB, 'submit_opening SIDE_B');
  log(`submit_opening SIDE_B execResult: ${openB}`);

  // After both openings, status should be OPENING_SUBMITTED
  const d4 = await view(creator, 'get_debate', [debateId]);
  assertEqual(d4.status, 'OPENING_SUBMITTED', 'status after both openings');
  log(`debate.status: ${d4.status} ✓`);

  // ── 8. Check submissions ──────────────────────────────────────────────────
  section('1.8 get_debate_submissions');
  const subs = await view(creator, 'get_debate_submissions', [debateId]);
  const subsArr = Array.isArray(subs) ? subs : JSON.parse(subs);
  if (subsArr.length !== 2) throw new Error(`ASSERT FAILED: expected 2 submissions, got ${subsArr.length}`);
  log(`submission count: ${subsArr.length} ✓`);

  // ── 9. Submit SIDE_A rebuttal ─────────────────────────────────────────────
  section('1.9 submit_rebuttal — SIDE_A');
  const subA2 = uid('s');
  const { execResult: rebutA } = await send(creator, 'submit_rebuttal', [
    debateId, 'SIDE_A', subA2,
    submissionJson('The opponent cites manufacturing but ignores the tech sector, which added 5M net jobs. Retraining programs bridge the gap.'),
  ]);
  assertOk(rebutA, 'submit_rebuttal SIDE_A');
  log(`submit_rebuttal SIDE_A execResult: ${rebutA}`);

  // ── 10. Submit SIDE_B rebuttal ────────────────────────────────────────────
  section('1.10 submit_rebuttal — SIDE_B');
  const subB2 = uid('s');
  const { execResult: rebutB } = await send(opponent, 'submit_rebuttal', [
    debateId, 'SIDE_B', subB2,
    submissionJson('Retraining programs have low completion rates. The 5M tech jobs require specialized skills most displaced workers lack.'),
  ]);
  assertOk(rebutB, 'submit_rebuttal SIDE_B');
  log(`submit_rebuttal SIDE_B execResult: ${rebutB}`);

  // After both rebuttals (no "final" round), status should be READY_FOR_JUDGEMENT
  const d5 = await view(creator, 'get_debate', [debateId]);
  assertEqual(d5.status, 'READY_FOR_JUDGEMENT', 'status after both rebuttals');
  log(`debate.status: ${d5.status} ✓`);

  // ── 11. Final state check ─────────────────────────────────────────────────
  section('1.11 Final submission count');
  const subsFinal = await view(creator, 'get_debate_submissions', [debateId]);
  const subsArrFinal = Array.isArray(subsFinal) ? subsFinal : JSON.parse(subsFinal);
  if (subsArrFinal.length !== 4) throw new Error(`ASSERT FAILED: expected 4 submissions, got ${subsArrFinal.length}`);
  log(`total submissions: ${subsArrFinal.length} ✓`);

  // ── 12. Protocol state after ──────────────────────────────────────────────
  section('1.12 Protocol state after');
  const stateAfter = await view(creator, 'get_protocol_state');
  log(`debate_count after: ${stateAfter.debate_count}`);
  if (stateAfter.debate_count <= stateBefore.debate_count) {
    throw new Error('ASSERT FAILED: debate_count did not increase');
  }
  log(`debate_count increased ✓`);

  // ── Return debate ID for suite3 ───────────────────────────────────────────
  section('Suite 1 PASSED');
  log(`Ready-for-judgement debate: ${debateId}`);
  return { debateId, creatorAddr, opponentAddr };
}

function assert_one_of(actual, options, label) {
  if (!options.includes(actual)) {
    throw new Error(`ASSERT FAILED [${label}]: expected one of ${JSON.stringify(options)}, got ${JSON.stringify(actual)}`);
  }
}

export { run };

// Run directly if this is the entry point
if (process.argv[1].endsWith('suite1-happy-path.mjs')) {
  run().catch((err) => {
    console.error('\nSuite 1 FAILED:', err.message);
    process.exit(1);
  });
}
