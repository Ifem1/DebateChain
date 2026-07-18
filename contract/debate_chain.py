# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from genlayer import *
import json


class DebateChain(gl.Contract):
    owner: Address
    debate_count: u256
    submission_count: u256
    verdict_count: u256
    debates: TreeMap[str, str]
    submissions: TreeMap[str, str]
    debate_submissions: TreeMap[str, str]
    verdicts: TreeMap[str, str]
    user_debates: TreeMap[str, str]
    reputation: TreeMap[str, str]
    protocol_state: TreeMap[str, str]

    def __init__(self) -> None:
        self.owner = gl.message.sender_address
        self.debate_count = u256(0)
        self.submission_count = u256(0)
        self.verdict_count = u256(0)
        self.debates = TreeMap()
        self.submissions = TreeMap()
        self.debate_submissions = TreeMap()
        self.verdicts = TreeMap()
        self.user_debates = TreeMap()
        self.reputation = TreeMap()
        self.protocol_state = TreeMap()
        self.protocol_state["all_debate_ids"] = json.dumps([])

    # ─── Write Functions ──────────────────────────────────────────────────────

    @gl.public.write
    def create_debate(self, debate_id: str, debate_json: str) -> None:
        if not debate_id:
            raise gl.vm.UserError("debate_id required")
        if not debate_json:
            raise gl.vm.UserError("debate_json required")
        if self.debates.get(debate_id):
            raise gl.vm.UserError("debate already exists")

        data = json.loads(debate_json)
        data["debate_id"] = debate_id
        data["status"] = "CREATED"
        data["creator"] = str(gl.message.sender_address)
        data["finalized"] = False
        data["verdict_id"] = None

        self.debates[debate_id] = json.dumps(data)
        self.debate_count = self.debate_count + u256(1)
        self.debate_submissions[debate_id] = json.dumps([])

        all_debate_ids = json.loads(self.protocol_state.get("all_debate_ids") or "[]")
        if debate_id not in all_debate_ids:
            all_debate_ids.append(debate_id)
        self.protocol_state["all_debate_ids"] = json.dumps(all_debate_ids)

        addr = str(gl.message.sender_address)
        existing = json.loads(self.user_debates.get(addr) or "[]")
        if debate_id not in existing:
            existing.append(debate_id)
        self.user_debates[addr] = json.dumps(existing)

    @gl.public.write
    def accept_debate(self, debate_id: str) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] != "CREATED":
            raise gl.vm.UserError("debate not in CREATED state")
        if str(gl.message.sender_address) == data["creator"]:
            raise gl.vm.UserError("creator cannot accept own debate")

        data["opponent"] = str(gl.message.sender_address)
        data["status"] = "ACCEPTED"
        self.debates[debate_id] = json.dumps(data)

        addr = str(gl.message.sender_address)
        existing = json.loads(self.user_debates.get(addr) or "[]")
        if debate_id not in existing:
            existing.append(debate_id)
        self.user_debates[addr] = json.dumps(existing)

    @gl.public.write
    def submit_opening(
        self,
        debate_id: str,
        side: str,
        submission_id: str,
        content_json: str,
    ) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] not in ("ACCEPTED", "OPENING_SUBMITTED"):
            raise gl.vm.UserError("invalid state for opening submission")

        sender = str(gl.message.sender_address)
        self._assert_side_ownership(data, side, sender)

        content = json.loads(content_json)
        content["submission_id"] = submission_id
        content["debate_id"] = debate_id
        content["side"] = side
        content["round"] = "opening"
        content["submitted_by"] = sender

        self.submissions[submission_id] = json.dumps(content)
        self.submission_count = self.submission_count + u256(1)

        subs = json.loads(self.debate_submissions.get(debate_id) or "[]")
        if submission_id not in subs:
            subs.append(submission_id)
        self.debate_submissions[debate_id] = json.dumps(subs)

        all_subs = self._get_all_submissions(debate_id)
        side_a_done = any(s["side"] == "SIDE_A" and s["round"] == "opening" for s in all_subs)
        side_b_done = any(s["side"] == "SIDE_B" and s["round"] == "opening" for s in all_subs)

        if side_a_done and side_b_done:
            rounds = data.get("rounds_required", ["opening", "rebuttal"])
            if "rebuttal" not in rounds:
                data["status"] = "READY_FOR_JUDGEMENT"
            else:
                data["status"] = "OPENING_SUBMITTED"
        self.debates[debate_id] = json.dumps(data)

    @gl.public.write
    def submit_rebuttal(
        self,
        debate_id: str,
        side: str,
        submission_id: str,
        content_json: str,
    ) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] not in ("OPENING_SUBMITTED", "REBUTTAL_SUBMITTED"):
            raise gl.vm.UserError("invalid state for rebuttal submission")

        sender = str(gl.message.sender_address)
        self._assert_side_ownership(data, side, sender)

        content = json.loads(content_json)
        content["submission_id"] = submission_id
        content["debate_id"] = debate_id
        content["side"] = side
        content["round"] = "rebuttal"
        content["submitted_by"] = sender

        self.submissions[submission_id] = json.dumps(content)
        self.submission_count = self.submission_count + u256(1)

        subs = json.loads(self.debate_submissions.get(debate_id) or "[]")
        if submission_id not in subs:
            subs.append(submission_id)
        self.debate_submissions[debate_id] = json.dumps(subs)

        all_subs = self._get_all_submissions(debate_id)
        side_a_done = any(s["side"] == "SIDE_A" and s["round"] == "rebuttal" for s in all_subs)
        side_b_done = any(s["side"] == "SIDE_B" and s["round"] == "rebuttal" for s in all_subs)

        if side_a_done and side_b_done:
            rounds = data.get("rounds_required", ["opening", "rebuttal"])
            if "final" not in rounds:
                data["status"] = "READY_FOR_JUDGEMENT"
            else:
                data["status"] = "REBUTTAL_SUBMITTED"
        self.debates[debate_id] = json.dumps(data)

    @gl.public.write
    def submit_final_statement(
        self,
        debate_id: str,
        side: str,
        submission_id: str,
        content_json: str,
    ) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] != "REBUTTAL_SUBMITTED":
            raise gl.vm.UserError("invalid state for final statement")

        sender = str(gl.message.sender_address)
        self._assert_side_ownership(data, side, sender)

        content = json.loads(content_json)
        content["submission_id"] = submission_id
        content["debate_id"] = debate_id
        content["side"] = side
        content["round"] = "final"
        content["submitted_by"] = sender

        self.submissions[submission_id] = json.dumps(content)
        self.submission_count = self.submission_count + u256(1)

        subs = json.loads(self.debate_submissions.get(debate_id) or "[]")
        if submission_id not in subs:
            subs.append(submission_id)
        self.debate_submissions[debate_id] = json.dumps(subs)

        all_subs = self._get_all_submissions(debate_id)
        side_a_done = any(s["side"] == "SIDE_A" and s["round"] == "final" for s in all_subs)
        side_b_done = any(s["side"] == "SIDE_B" and s["round"] == "final" for s in all_subs)

        if side_a_done and side_b_done:
            data["status"] = "READY_FOR_JUDGEMENT"
        self.debates[debate_id] = json.dumps(data)

    @gl.public.write
    def judge_debate(self, debate_id: str) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] != "READY_FOR_JUDGEMENT":
            raise gl.vm.UserError("debate not ready for judgement")

        all_subs = self._get_all_submissions(debate_id)
        side_a_subs = [s for s in all_subs if s["side"] == "SIDE_A"]
        side_b_subs = [s for s in all_subs if s["side"] == "SIDE_B"]

        if not side_a_subs:
            raise gl.vm.UserError("side A has no submissions")
        if not side_b_subs:
            raise gl.vm.UserError("side B has no submissions")

        topic = data.get("topic", "")
        side_a_label = data.get("side_a_label", "Side A")
        side_b_label = data.get("side_b_label", "Side B")
        rules = data.get("rules_json", "")
        evidence_required = data.get("evidence_required", False)

        def fmt_subs(subs):
            parts = []
            for s in subs:
                ev = s.get("evidence", [])
                ev_text = (
                    "Evidence submitted: " + "; ".join(
                        self._format_evidence_item(e, i)
                        for i, e in enumerate(ev[:3])
                    )
                    if ev else "No evidence submitted."
                )
                parts.append(f"[{s['round'].upper()}]\n{s['argument_text']}\n{ev_text}")
            return "\n\n".join(parts)

        side_a_text = fmt_subs(side_a_subs)
        side_b_text = fmt_subs(side_b_subs)

        prompt = f"""You are a strict, impartial AI debate judge. Evaluate the following debate and return ONLY valid JSON with no markdown fences.

DEBATE TOPIC: {topic}
SIDE A ({side_a_label}):
{side_a_text}

SIDE B ({side_b_label}):
{side_b_text}

RULES: {rules}
EVIDENCE REQUIRED: {evidence_required}

SCORING RUBRIC (score each 0-100):
- Argument Strength 30%: logical structure, relevance, clear claim, supported reasoning
- Evidence Quality 25%: quality, relevance, credibility; penalise heavily if evidence_required=true and none submitted
- Rebuttal Quality 20%: how directly the debater engages the opponent's strongest points
- Fallacy Penalty 15%: deduct for strawman, ad hominem, false dilemma, circular reasoning, slippery slope, hasty generalisation, appeal to emotion, appeal to authority without evidence, whataboutism, red herring, unsupported claim
- Clarity and Focus 10%: readability, topic discipline, concise expression

JUDGEMENT RULES:
- Score each side independently before selecting a winner.
- Do NOT reward the longest answer. Quality over quantity.
- Do NOT reward insults or emotional manipulation.
- Identify SPECIFIC fallacies by type with a short description and excerpt.
- Evaluate whether submitted evidence titles, notes, URLs, and fetched excerpts support the claim. Do not assume a URL proves a fact if the fetched excerpt is unavailable or irrelevant.
- If both sides are weak or unclear, return DRAW or INSUFFICIENT_ARGUMENTS.
- Reward direct rebuttal of the opponent's strongest claim.
- Explain WHY the winner won with specific references.

Return ONLY this JSON object:
{{
  "winner": "SIDE_A or SIDE_B or DRAW or INSUFFICIENT_ARGUMENTS",
  "confidence": 0,
  "side_a_score": 0,
  "side_b_score": 0,
  "argument_strength": {{"side_a": 0, "side_b": 0}},
  "evidence_quality": {{"side_a": 0, "side_b": 0}},
  "rebuttal_quality": {{"side_a": 0, "side_b": 0}},
  "fallacies": {{
    "side_a": [{{"type": "fallacy_type", "description": "explanation", "excerpt": "quote"}}],
    "side_b": []
  }},
  "key_reasoning": "Detailed explanation referencing specific argument quality, rebuttal effectiveness, and evidence.",
  "improvement_notes": {{"side_a": ["note1"], "side_b": ["note1"]}},
  "strongest_points_a": ["point1"],
  "strongest_points_b": ["point1"],
  "evidence_assessment": "Whether evidence actually supports the claims made.",
  "final_summary": "One-sentence outcome summary.",
  "judge_notice": "Any caveats about this judgement."
}}"""

        def get_prompt() -> str:
            return prompt

        result = gl.eq_principle.prompt_non_comparative(
            get_prompt,
            task="Judge a structured debate between two participants and return a verdict JSON with winner, scores, fallacies, and reasoning.",
            criteria="The verdict must be fair, evidence-based, and identify specific logical fallacies. It must return strict JSON only."
        )

        # Parse verdict JSON
        try:
            cleaned = result.strip()
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                # strip opening and closing fence
                inner = []
                for line in lines:
                    if line.startswith("```"):
                        continue
                    inner.append(line)
                cleaned = "\n".join(inner)
            verdict = json.loads(cleaned)
        except Exception:
            verdict = {
                "winner": "DRAW",
                "confidence": 0,
                "side_a_score": 50,
                "side_b_score": 50,
                "argument_strength": {"side_a": 50, "side_b": 50},
                "evidence_quality": {"side_a": 50, "side_b": 50},
                "rebuttal_quality": {"side_a": 50, "side_b": 50},
                "fallacies": {"side_a": [], "side_b": []},
                "key_reasoning": "Verdict JSON could not be parsed. Raw: " + str(result)[:400],
                "improvement_notes": {"side_a": [], "side_b": []},
                "strongest_points_a": [],
                "strongest_points_b": [],
                "evidence_assessment": "Unable to assess.",
                "final_summary": "Parse error — raw result stored.",
                "judge_notice": "JSON parse error in AI response.",
            }

        verdict = self._sanitize_verdict(verdict)

        verdict["debate_id"] = debate_id

        self.verdicts[debate_id] = json.dumps(verdict)
        self.verdict_count = self.verdict_count + u256(1)
        data["status"] = "JUDGED"
        data["verdict_id"] = debate_id
        self.debates[debate_id] = json.dumps(data)

        self._update_reputation(data, verdict)

    @gl.public.write
    def dispute_verdict(self, debate_id: str, dispute_id: str, dispute_json: str) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] != "JUDGED":
            raise gl.vm.UserError("can only dispute a judged debate")

        sender = str(gl.message.sender_address)
        if sender not in (data.get("creator"), data.get("opponent")):
            raise gl.vm.UserError("only participants can dispute")

        data["status"] = "DISPUTED"
        data["dispute"] = json.loads(dispute_json)
        self.debates[debate_id] = json.dumps(data)

    @gl.public.write
    def finalize_debate(self, debate_id: str) -> None:
        raw = self.debates.get(debate_id)
        if not raw:
            raise gl.vm.UserError("debate not found")
        data = json.loads(raw)
        if data["status"] not in ("JUDGED", "DISPUTED"):
            raise gl.vm.UserError("debate must be judged or disputed to finalize")

        sender = str(gl.message.sender_address)
        if sender not in (data.get("creator"), data.get("opponent")):
            raise gl.vm.UserError("only participants can finalize")

        data["status"] = "FINALIZED"
        data["finalized"] = True
        self.debates[debate_id] = json.dumps(data)

    # ─── View Functions ───────────────────────────────────────────────────────

    @gl.public.view
    def get_debate(self, debate_id: str) -> str:
        return self.debates.get(debate_id) or ""

    @gl.public.view
    def get_submission(self, submission_id: str) -> str:
        return self.submissions.get(submission_id) or ""

    @gl.public.view
    def get_debate_submissions(self, debate_id: str) -> str:
        sub_ids = json.loads(self.debate_submissions.get(debate_id) or "[]")
        result = []
        for sid in sub_ids:
            raw = self.submissions.get(sid)
            if raw:
                result.append(json.loads(raw))
        return json.dumps(result)

    @gl.public.view
    def get_verdict(self, debate_id: str) -> str:
        return self.verdicts.get(debate_id) or ""

    @gl.public.view
    def get_user_debates(self, address: str) -> str:
        debate_ids = json.loads(self.user_debates.get(address) or "[]")
        result = []
        for did in debate_ids:
            raw = self.debates.get(did)
            if raw:
                result.append(json.loads(raw))
        return json.dumps(result)

    @gl.public.view
    def get_debate_ids(self) -> str:
        return self.protocol_state.get("all_debate_ids") or "[]"

    @gl.public.view
    def get_debates(self, offset: u256, limit: u256) -> str:
        debate_ids = json.loads(self.protocol_state.get("all_debate_ids") or "[]")
        start = int(offset)
        max_items = int(limit)
        if max_items <= 0:
            return json.dumps([])
        end = start + max_items
        result = []
        for did in debate_ids[start:end]:
            raw = self.debates.get(did)
            if raw:
                result.append(json.loads(raw))
        return json.dumps(result)

    @gl.public.view
    def get_reputation(self, address: str) -> str:
        return self.reputation.get(address) or ""

    @gl.public.view
    def get_protocol_state(self) -> str:
        return json.dumps({
            "owner": str(self.owner),
            "debate_count": int(self.debate_count),
            "submission_count": int(self.submission_count),
            "verdict_count": int(self.verdict_count),
        })

    # ─── Internal Helpers ─────────────────────────────────────────────────────

    def _assert_side_ownership(self, data: dict, side: str, sender: str) -> None:
        if side == "SIDE_A":
            if sender != data.get("creator"):
                raise gl.vm.UserError("only creator controls SIDE_A")
        elif side == "SIDE_B":
            if sender != data.get("opponent"):
                raise gl.vm.UserError("only opponent controls SIDE_B")
        else:
            raise gl.vm.UserError("invalid side: must be SIDE_A or SIDE_B")

    def _get_all_submissions(self, debate_id: str) -> list:
        sub_ids = json.loads(self.debate_submissions.get(debate_id) or "[]")
        result = []
        for sid in sub_ids:
            raw = self.submissions.get(sid)
            if raw:
                result.append(json.loads(raw))
        return result

    def _format_evidence_item(self, item: dict, index: int) -> str:
        title = str(item.get("title") or "")[:200]
        url = str(item.get("url") or "")[:500]
        note = str(item.get("note") or "")[:500]
        fetched = self._fetch_evidence_excerpt(url)
        return (
            f"evidence_{index + 1}: "
            f"title={title}; "
            f"url={url}; "
            f"claim_support_note={note}; "
            f"contract_fetched_excerpt={fetched}"
        )

    def _fetch_evidence_excerpt(self, url: str) -> str:
        if not url:
            return "no_url_submitted"
        if not (url.startswith("https://") or url.startswith("http://")):
            return "invalid_url_scheme"

        def fetch_page():
            html = gl.nondet.web.render(url, mode="html")
            return str(html)[:1500]

        try:
            return gl.eq_principle.strict_eq(fetch_page)
        except Exception as err:
            return "fetch_unavailable: " + str(err)[:200]

    def _sanitize_verdict(self, verdict: dict) -> dict:
        valid_winners = {"SIDE_A", "SIDE_B", "DRAW", "INSUFFICIENT_ARGUMENTS", "AMBIGUOUS"}
        if verdict.get("winner") not in valid_winners:
            verdict["winner"] = "DRAW"

        verdict["confidence"] = self._confidence_pct(verdict.get("confidence"))
        verdict["side_a_score"] = self._score(verdict.get("side_a_score"), 50, 0, 100)
        verdict["side_b_score"] = self._score(verdict.get("side_b_score"), 50, 0, 100)

        for key in ("argument_strength", "evidence_quality", "rebuttal_quality"):
            raw = verdict.get(key)
            if not isinstance(raw, dict):
                raw = {}
            verdict[key] = {
                "side_a": self._score(raw.get("side_a"), 0, 0, 100),
                "side_b": self._score(raw.get("side_b"), 0, 0, 100),
            }

        fallacies = verdict.get("fallacies")
        if not isinstance(fallacies, dict):
            fallacies = {}
        verdict["fallacies"] = {
            "side_a": self._sanitize_fallacies(fallacies.get("side_a")),
            "side_b": self._sanitize_fallacies(fallacies.get("side_b")),
        }

        notes = verdict.get("improvement_notes")
        if not isinstance(notes, dict):
            notes = {}
        verdict["improvement_notes"] = {
            "side_a": self._string_list(notes.get("side_a")),
            "side_b": self._string_list(notes.get("side_b")),
        }

        for key in (
            "key_reasoning",
            "evidence_assessment",
            "final_summary",
            "judge_notice",
        ):
            verdict[key] = str(verdict.get(key) or "")

        verdict["strongest_points_a"] = self._string_list(verdict.get("strongest_points_a"))
        verdict["strongest_points_b"] = self._string_list(verdict.get("strongest_points_b"))
        return verdict

    def _to_int(self, value) -> int:
        if isinstance(value, bool):
            return int(value)
        if isinstance(value, int):
            return value
        text = str(value).strip()
        if not text:
            raise ValueError("empty numeric value")
        neg = text.startswith("-")
        if neg:
            text = text[1:]
        digits = ""
        for ch in text:
            if ch.isdigit():
                digits += ch
            elif ch == ".":
                break
            else:
                raise ValueError("non-numeric value")
        if not digits:
            raise ValueError("no digits in value")
        number = int(digits)
        return -number if neg else number

    def _score(self, value, default, low, high):
        try:
            number = self._to_int(value)
        except Exception:
            number = default
        if number < low:
            number = low
        if number > high:
            number = high
        return number

    def _confidence_pct(self, value) -> int:
        # confidence is expressed on a 0-100 integer scale (percent) since
        # GenVM disallows floats. Values already given as 0-100 pass through;
        # values given as a 0-1 fraction like "0.85" are scaled to 85.
        try:
            text = str(value).strip()
            if not text:
                raise ValueError("empty")
            neg = text.startswith("-")
            if neg:
                text = text[1:]
            if "." in text:
                whole, frac = text.split(".", 1)
            else:
                whole, frac = text, ""
            whole_digits = "".join(ch for ch in whole if ch.isdigit()) or "0"
            frac_digits = "".join(ch for ch in frac if ch.isdigit())
            whole_n = int(whole_digits)
            if whole_n == 0 and frac_digits:
                # fractional value like 0.85 -> scale to percent using first two decimals
                frac_digits = (frac_digits + "00")[:2]
                number = int(frac_digits)
            else:
                number = whole_n
            if neg:
                number = 0
        except Exception:
            number = 0
        if number < 0:
            number = 0
        if number > 100:
            number = 100
        return number

    def _string_list(self, value) -> list:
        if not isinstance(value, list):
            return []
        return [str(v)[:500] for v in value[:10]]

    def _sanitize_fallacies(self, value) -> list:
        if not isinstance(value, list):
            return []
        cleaned = []
        for item in value[:20]:
            if not isinstance(item, dict):
                continue
            cleaned.append({
                "type": str(item.get("type") or "unspecified")[:80],
                "description": str(item.get("description") or "")[:500],
                "excerpt": str(item.get("excerpt") or "")[:300],
            })
        return cleaned

    def _update_reputation(self, debate: dict, verdict: dict) -> None:
        creator = debate.get("creator")
        opponent = debate.get("opponent")
        winner = verdict.get("winner")

        for addr, side in [(creator, "SIDE_A"), (opponent, "SIDE_B")]:
            if not addr:
                continue
            raw = self.reputation.get(addr)
            rep = json.loads(raw) if raw else {}

            rep["address"] = addr
            rep["debates_total"] = rep.get("debates_total", 0) + 1

            if winner == side:
                rep["wins"] = rep.get("wins", 0) + 1
            elif winner in ("SIDE_A", "SIDE_B"):
                rep["losses"] = rep.get("losses", 0) + 1
            else:
                rep["draws"] = rep.get("draws", 0) + 1

            fallacy_key = "side_a" if side == "SIDE_A" else "side_b"
            new_fallacies = len(verdict.get("fallacies", {}).get(fallacy_key, []))
            rep["fallacy_count"] = rep.get("fallacy_count", 0) + new_fallacies

            arg_score = verdict.get("argument_strength", {}).get(fallacy_key, 0)
            total = rep["debates_total"]
            prev_avg = rep.get("argument_strength_avg", 0)
            rep["argument_strength_avg"] = ((prev_avg * (total - 1)) + arg_score) // total

            ev_score = verdict.get("evidence_quality", {}).get(fallacy_key, 0)
            prev_ev = rep.get("evidence_quality_avg", 0)
            rep["evidence_quality_avg"] = ((prev_ev * (total - 1)) + ev_score) // total

            # win_rate is an integer percentage (0-100), not a float fraction
            rep["win_rate"] = (rep.get("wins", 0) * 100) // total

            self.reputation[addr] = json.dumps(rep)
