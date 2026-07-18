# DebateChain Review Changes

Updated on July 18, 2026.

## Summary

This pass addresses the GenLayer review feedback and the public Arena visibility issue.

The app and contract are now wired to the active deployed contract:

```text
0xfC8840bF2B5B4eBdc884B8EE700Cc8C77714d3a7
```

## Contract Changes

- Replaced the previous GenVM dependency header with an immutable SDK pin in the format expected by current GenVM tooling:

```python
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
```

- Added a public on-chain debate index so the frontend can load public Arena debates for every user, not only debates associated with the connected wallet.
- Added `debate_id` into each stored debate payload so frontend records can be linked directly to their contract IDs.
- Added public view methods:
  - `get_debate_ids()`
  - `get_debates(offset, limit)`

## Frontend Changes

- Wired the frontend to read public debates from the contract through `get_debates(0, 100)`.
- Kept the Arena tabs:
  - `All Debates`
  - `My Debates`
- Kept the Arena filters:
  - `All`
  - `Open`
  - `Active`
  - `Round 1`
  - `Round 2`
  - `Awaiting Judgement`
  - `Judged`
  - `Finalized`
- Updated the empty-state copy so `All Debates` and `My Debates` explain different situations correctly.
- Updated contract address references used by the app, scripts, helper tests, and README.

## Deployment Changes

- Deployed the corrected contract to StudioNet.
- Updated the Vercel production environment variable `NEXT_PUBLIC_CONTRACT_ADDRESS` to the active contract address.
- Redeployed production Vercel so `https://debatechain.vercel.app` uses the active contract.

## Verification

Live production Arena verification:

```text
URL: https://debatechain.vercel.app/debates
Visible summary: 19 debates on the active GenLayer contract
Debate cards found: 19
Old 26-debate contract count visible: no
No debates found visible: no
```

Contract schema verification confirmed the deployed contract exposes:

```text
get_debates
get_debate_ids
get_protocol_state
```

## GenVM Lint Output

Command:

```powershell
genvm-lint check .\contract\debate_chain.py --json
```

Output:

```json
{"ok":true,"lint":{"ok":true,"passed":2,"warnings":[{"code":"W004","msg":"Bare Python exception 'ValueError' in contract; use gl.vm.UserError(\"message\") instead","line":566,"col":12},{"code":"W004","msg":"Bare Python exception 'ValueError' in contract; use gl.vm.UserError(\"message\") instead","line":577,"col":16},{"code":"W004","msg":"Bare Python exception 'ValueError' in contract; use gl.vm.UserError(\"message\") instead","line":579,"col":12},{"code":"W004","msg":"Bare Python exception 'ValueError' in contract; use gl.vm.UserError(\"message\") instead","line":601,"col":16}]},"validate":{"ok":true,"contract":"DebateChain","methods":17,"view_methods":9,"write_methods":8,"ctor_params":0,"warnings":[{"code":"I200","msg":"py-genlayer: a newer runner is available (1zr6nqk597d97kg0dyxg0shhrykx5v02zjgnyrajapy4wlqvfvwh). See https://github.com/genlayerlabs/genvm/releases for changes."}]}}
```

## Test Results

- `npm run lint`: passed with one warning from the untracked local populate helper.
- `npm run build`: passed.
- Direct happy-path contract flow: passed.
- Revert/access-control checks: passed.
- Judge, dispute, and finalize flow: passed.
