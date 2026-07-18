# DebateChain

DebateChain is a GenLayer-based debate protocol where two wallets commit to opposing sides, submit structured rounds, and ask an Intelligent Contract to produce an on-chain verdict using a fixed rubric.

The project is intentionally one focused product, not a collection of small demos. GenLayer is used where consensus matters: a disputed, reputation-forming judgement between two participants.

## Why GenLayer

DebateChain is not an off-chain advice app. The contract is the source of truth for:

- debate creation and side ownership
- accepted opponents
- submitted opening, rebuttal, and final rounds
- AI validator judgement
- verdict storage
- participant reputation updates

There is no off-chain debate cache. The frontend reads contract state directly from GenLayer.

## Current Evidence Model

Participants can submit evidence titles, URLs, and support notes. During `judge_debate`, the contract attempts to fetch up to three evidence URLs per submission using GenLayer web access and includes stable fetched excerpts in the judge prompt.

If a URL is missing, invalid, unreachable, or too dynamic for consensus, the verdict must treat that evidence as unavailable rather than assume the claim is proven. The app still uses careful wording: evidence is assessed against submitted and fetched details, not blindly declared true.

## Contract

- Contract source: `contract/debate_chain.py`
- Default deployed Studionet contract used by tests: `0xfC8840bF2B5B4eBdc884B8EE700Cc8C77714d3a7`
- Frontend contract address is configured with `NEXT_PUBLIC_CONTRACT_ADDRESS`

Main write methods:

- `create_debate(debate_id, debate_json)`
- `accept_debate(debate_id)`
- `submit_opening(debate_id, side, submission_id, content_json)`
- `submit_rebuttal(debate_id, side, submission_id, content_json)`
- `submit_final_statement(debate_id, side, submission_id, content_json)`
- `judge_debate(debate_id)`
- `dispute_verdict(debate_id, dispute_id, dispute_json)`
- `finalize_debate(debate_id)`

Main view methods:

- `get_debate(debate_id)`
- `get_debates(offset, limit)`
- `get_debate_ids()`
- `get_user_debates(address)`
- `get_debate_submissions(debate_id)`
- `get_verdict(debate_id)`
- `get_reputation(address)`
- `get_protocol_state()`

## App Stack

- Next.js 16 App Router
- React 19
- TypeScript
- GenLayer JS SDK
- Contract-only state reads

## Local Setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Then open `http://localhost:3000`.

Required frontend environment:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xfC8840bF2B5B4eBdc884B8EE700Cc8C77714d3a7
NEXT_PUBLIC_GENLAYER_RPC=https://studio.genlayer.com/api
NEXT_PUBLIC_GENLAYER_EXPLORER=https://explorer-studio.genlayer.com
```

## Tests

The e2e tests use real GenLayer wallets from environment variables. Private keys are never hardcoded.

```bash
$env:PK_CREATOR_1="0x..."
$env:PK_JOINER_1="0x..."
$env:PK_JOINER_2="0x..."
$env:CONTRACT_ADDRESS="0xfC8840bF2B5B4eBdc884B8EE700Cc8C77714d3a7"

node test-all.mjs 1
node test-all.mjs 2
node test-all.mjs 3
```

Suite 1 covers the deterministic happy path through `READY_FOR_JUDGEMENT`.
Suite 2 covers revert/error cases.
Suite 3 runs non-deterministic `judge_debate`, then dispute and finalize flows.

## Submission Notes

For reviewer clarity, submit the full repository with:

- the contract source
- frontend source
- test runner and suites
- deployment/config instructions

Do not submit only a live app link.
