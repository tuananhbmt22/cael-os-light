# cael-os-light — HARNESS PHASE-0 SPEC (LOCKED)

**Author:** RADIO heir-17 (Fable 5), 2026-07-04→05. (Filename keeps the DRAFT-1 path — goal-0712 and the cooper briefs reference it.)
**Status:** **LOCKED 2026-07-05.** Hardening trail: refutation job #579 (10 findings, all folded) → delta-verify job #580 (confirmed + F10 cured) → live s3 co-converge with Kajima (s3-1 goal-light, s3-2 demo-UI/npm) → lock-conformance job #582 (3 cures folded: c13 goal-light condition, §7.4 goal templates, §15 stop-point law). Owner signature = Kajima's kick, 2026-07-05 ("Kick it now… You are in control now"), with the HARD STOP-POINT: **execution stops at harness complete + installable; tracks re-open by Kajima only.** **Build fires only via RADIO contract from goal-20260704-0712 after the §16 gates.**
**What this is:** the buildable Part-1 contract for the `cael-os-light` HARNESS (Phase 0 of the fixed build sequence, agreement §4). It turns agreement §1–§12 + the 3 gate archetypes + all 12 track build-steps (goals 0700–0711) into the thing Fable dispatches builders against.
**Inputs (all committed):** `cael-os-light-AGREEMENT-DRAFT-1.md` (LOCKED round-1) · `cael-os-light-P1-FIELD-PREP.md` (verified field) · track goals `goal-20260704-0700…0711` · `goal-20260701-0579` evidence locks (Kajima 2026-07-02/03) · Kajima live direction 2026-07-04 (harness = a dependency installation; the 12 unbuilt tracks are the requirements oracle; transition job completes before build).
**Owner goal:** `goal-20260704-0712` (child of goal-0579).

---

## 0. The one-sentence contract

Phase-0 delivers `cael-os-light` as an **installable runtime dependency** — the shared Part-1 core BOTH archetypes (Radio Internal / Radio External) boot on — proven on **synthetic fixture packs only**, such that afterwards each of the 12 prepared tracks can fire as a Part-2 domain pack via its own RADIO contract **without touching harness code**.

Nothing ships until this is real (agreement §4). This is the 70% that amortizes across clients (§1).

## 1. Delivery shape: a DEPENDENCY INSTALLATION (Kajima 2026-07-04)

The harness converges **into a dependency installation**, not an app scaffold:

- **Form:** a TypeScript/npm package (working name `@cael/os-light`) + an init step (`npx`-style) that installs the runtime into a new OR existing project — the docker-like dependency shape from the goal-0579 vision lock: folders + **goal ledger (goal-light, §6)** + rails + hooks seam.
- **Ships COMPILED-ONLY:** dist kernel + a compiled `cael.os.md` product image (the third compile target). NO factory machinery, NO source, NO courts/evals/compiler in the shipped dep (five-walls lock, goal-0579).
- **Serving:** API-metered on the CLIENT's key; substrate is the client's choice via head-adapters (§8). Our demos run on OUR key — never blur (0579 constraint).
- **The product an install yields:** a project that can load ONE compiled image + N registered Part-2 packs, expose headless scored surfaces + a chat/mini-app skin, and emit signed receipts — with the factory staying home.

**Install acceptance (machine-checkable, environment-pinned) [F8]:** on a clean fixture project, exactly TWO commands — (1) `npm install <local tarball fixture>` (no registry, no network), (2) `npx cael-os-light init --fixture` — after which `npx cael-os-light status` boots the turn spine on the bundled synthetic pack + fixture `cael.os.md` and prints `{os_sha, packs[], head_adapter}`. Pinned: both command forms verified on Windows PowerShell AND POSIX sh; model/client keys come from a generated config file (`cael-os-light.config`) — the acceptance run uses the STUB head-adapter fixture so CI is FULLY offline (a real key is only needed for a real model turn); the expected post-init file tree is part of the fixture and diffed. "Author's-machine-only" passes are non-passes.

## 2. The requirements oracle: 12 tracks → what the harness MUST provide

Per Kajima's frame: the unbuilt tracks tell us what the users' harness requires. Derivation (track goal → demand → disposition):

| # | Track (goal) | What it demands of Part-1 | Disposition |
|---|---|---|---|
| P1 | 0700 RBAC-RAG | atomic-fact identify index (F9); gate archetype **A**; dual-channel deny (F1); abstention floor (F2); UNION doc-ids (F7); receipts scoring permission+doc-id (F6); graded-cooper residual (P035); VN UTF-8 | **CORE** |
| P2 | 0701 eligibility rec | gate archetype **B** (state-rules, question-independent, rank+cap-3+never-empty fallback); notification engine (trigger→template, alignment-validated); per-user multi-entity aggregation; hidden-eval threshold discipline | **CORE** |
| P3 | 0702 mini-app shell | pack-composition on deployment B; **payment/booking state-machine** (HMAC + JWT + Idempotency-Key + CREATED→IPN-webhook(replay-guard)→SUCCEEDED + 3× retry); headless surfaces under a skin | seam typed now; module lands Phase-2 (P3 fire) |
| P4 | 0703 engagement | **stateful** mission-lifecycle + XP/streak/badge; **idempotent budgeted points-ledger**; **generative-content-under-deterministic-gate** (bounded raptor authors, validated before issue); rubric-judge scoring | state-KERNEL core; engagement module deferred to P4 fire; rubric-judge in eval harness (core) |
| P5 | 0704 vehicle-docs | doc-wallet store + required-doc-set + consent/access gate; per-entity deadline sorter + all-entity batch scan; date→days adapters; **per-track threshold re-derivation law** | seams typed now; modules at P5 fire; thresholds-law CORE (pack loader enforces) |
| P6 | 0705 query understanding | deterministic text-normalization (accents/abbrev-dict/address-parse) THEN bounded extraction → typed output | seam typed now; module at maps fire (P1/P2 need only dept-canonicalization, in gate A) |
| P7 | 0706 semantic search | gate archetype **C** (3-lane, open-world tri-state, field-first, negation-aware, honest fallback, precision-by-construction); broken-key quarantine + client-flag protocol | **CORE** (engine + interpreter + battery); corpus/pack at maps fire |
| P8 | 0707 conversational maps | multi-turn context; **clarify-don't-guess as a first-class outcome**; action generation | clarify/ask outcome CORE (turn spine); maps orchestration at P8 fire |
| P9 | 0708 autocomplete | prefix index over the same gate; low-latency path | pack-level reuse; nothing new in core |
| P10 | 0709 hotel POI | typed entity store, closed token vocabs, route-on-task-type, completeness scorer, refuse-with-honest-alternative | entity-store KERNEL core; scorer/pack at P10 fire |
| P11 | 0710 restaurant/menu | deterministic OCR-line parser + VN diacritic restoration (pack-pluggable parser slot); row quarantine | parser SLOT core (interface only); parser impl at P11 fire |
| P12 | 0711 group drive | stateful trace-clock replay + situation-detector → typed severity events + alert-prioritizer; refuse-unsafe-regroup | seam typed now; module at P12 fire (reuses gate C + verify) |

**Core-membership rule (the minimality law):** Phase-0 CORE = (a) the union of what P1+P2 need at runtime — they fire first — plus (b) all THREE gate archetype interpreters (the locked 3-archetype model IS the harness thesis), plus (c) the state-store kernel, plus (d) every deferred module's **typed seam**, plus (e) install/init + image/pack loaders + the 2-layer eval harness. Deferred modules land with their first consumer track, against their frozen seam. (Crux for the cooper: attack this membership line.)

## 3. Hard rules (inherited; binding on every Phase-0 builder)

1. **Builder is never the sole judge** — independent judge on disk; different-model audit where correctness risk is real.
2. **Structured output is the transport** — typed receipts; NEVER prose-parse for routing/actions; validate before render/mutate; invalid structure degrades locally and logs.
3. **Refuse-without-evidence** is a first-class outcome; refuse-with-honest-alternative where the domain allows (P5/P10/P12 pattern).
4. **Never overfit public evals** — hidden sets exist (P1/P2 verified); public numbers reported as public; NEVER special-case P035 (F5); threshold constants require derivation evidence per track.
5. **Open-world honesty** — missing token ≠ false; tri-state (present/absent/unknown) is engine-native.
6. **Model portability** — no provider lock; role/contract naming; head-adapters pass tool/event-parity + cache-economics gates before carrying the image (owned-harness doctrine).
7. **Compiled-only shipping; the factory never ships.** Client data NEVER in repo/image/fixtures — synthetic packs only; Cael hosts only the signer.
8. **Identity is data at the gate** — P1 identity = role+dept injected as data; VMA auth is consumer-only; the two deployments share the core, NOT a login (agreement §10).
9. **UI is a skin** — scoring paths stay headless; the mini-app/chat NEVER sits in the scoring path.
10. **UTF-8 Vietnamese end-to-end** (diacritics survive every layer, incl. parsers and receipts).

## 4. Runtime turn spine (the QA/route rail made product)

```
identity+context ──▶ decode/route (which pack/mode; ambiguous → CLARIFY outcome)
  └▶ gated IDENTIFY (index of atomic facts — never bodies) → resolve true target(s)
  └▶ GATE (pluggable rule-set: archetype A|B|C) → allow / deny / rank / refuse  [+ firing_rule + evidence]
  └▶ allow: GROUND on the full cited unit → stateless answering cooper (bounded)
      deny:  DUAL-CHANNEL → user gets generic id-free refusal; AUDIT record carries resolved target id
  └▶ VERIFY (evidence present? polarity/number preserved? else REFUSE; abstention floor: denied best-match is never substituted by a visible neighbor)
  └▶ RECEIPT (typed; validated) → LEDGER append (per-user, isolated) → render (skin) + audit channel
```

**Graded-cooper hook:** the deterministic path handles ordinary turns with ZERO second-brain calls (field-proven: 98% of P1's score at zero model-call). Escalation fires ONLY on configured triggers: low retrieval confidence · permission-boundary proximity · step-up actions (OTP/payment) · residual metadata↔intent conflicts (P035-class). Escalation use is visible in the receipt.

**Turn outcomes are an enum:** `answer | refuse(+evidence) | refuse(+alternative) | clarify | escalate` — clarify-don't-guess (P8) is core, not a maps add-on.

## 5. The gate engine — ONE contract, THREE archetypes

```ts
GateRuleSet.decide(subject, object|state, ctx) -> {
  decision: allow | deny | score(rank) | refuse,
  firing_rule,          // always cited — feeds receipt + audit + explainability
  evidence[],           // tri-state facts consulted: present | absent | unknown
}
```

- **A — closed-world decision matrix** (P1 RBAC): pure fn of (role, user_dept, doc_classification, doc_dept). Classification across ALL blocks (F3); canonical name normalization (F4); Privileged=Executive-only (F10); MAX-restrictiveness on cross-doc facts (F11); multi-doc = deny-if-any; classification vocab out of the retrieval namespace (F12).
- **B — deterministic state-rules** (P2 eligibility): rules over subject state; **question-independent**; rank by priority → cap N → **fallback never-empty** (healthy user → discovery/loyalty); every pick cites its firing rule; thresholds pack-supplied WITH derivation evidence.
- **C — open-world token-gate** (maps; the 3rd archetype): **Lane 1** field hard-gate (gate the FIELD, never the noisy token); **Lane 2** token-only physical strong-soft (present=+big, absent=penalty-not-kill; hard-kill only when the token is the sole discriminator AND ≥1 in-category candidate carries it; synonym/subsumption map); **Lane 3** objective soft-rank (never filters; tie-break rating→popularity→review_count); top-N else HONEST FALLBACK (refuse / offer-alternative, citing the field/token that fired or failed). Negation-aware; category-tokens routed to the category axis; geo on lat-long.

**Engine-level laws:** rule-sets are pack DATA, the engine is code; tri-state value model is engine-native (A/B simply never emit `unknown`); every decision is explainable (firing_rule mandatory); NO answer path may bypass the gate.

## 6. Part-1 primitive inventory (CORE)

| primitive | contract (compressed) | first consumers |
|---|---|---|
| `ground` | (query, corpus_scope) → cited atomic evidence units; boilerplate-stripped index; whole-corpus-in-context allowed for small corpora; embedding recipe optional per pack | P1, P5 |
| `gate` | §5 engine + 3 interpreters | all |
| `structuredOutput` | typed receipt schemas named for consumers; validate-before-render/mutate; local degrade + log | all |
| `verify` | refuse-without-evidence; abstention floor; polarity/scope/number preservation (F8) | P1, P5, P10–P12 |
| `ledger-memory` | per-user append-only session ledger; per-user isolation as a LIBRARY (logical ACL); PII stays on app infra | all |
| `goal-light` [s3-1] | user-goal ledger on the state-kernel: structured goal records (decoded objective, status enum, steps, blocked_by/relates, evidence, verification hint) + read/write API; PERSISTENT INTENT across sessions — the agentic-kernel category made real. Ships records+lifecycle+relations ONLY; factory goal-governance (coopers, courts, judge queues, board ranking, drift scouts) NEVER ships (factory wall). Sources: goal-0579 vision lock ("folders + goal ledger + rails + hooks"), dogfood→product flip law (goal-ledger semantics survive the flip unchanged) | P4 missions (a mission IS a goal-light record with XP/reward semantics), P5 renewals-in-progress, copilot cross-session continuity |
| `dual-channel` | user channel (generic, id-free on deny) + out-of-band audit record (resolved target id, decision, evidence) | P1 (deny rows), all gated denies |
| `graded-cooper` | trigger config + second-brain call seam + receipt visibility | P1 residual, step-up |
| `notify` | trigger rules → template map; **template↔trigger alignment validated at pack load** (P2's misaligned templates = the proof case); timing/dedupe/arbitration seam for L2 | P2, P4, P5 |
| `state-kernel` | typed entity store (keyed, closed vocabs) + append-only event ledger + **idempotency guard** (the one substrate under engagement/wallet/payment/trace-clock) | P2 (vehicles), P4/P5/P12 modules later |
| `normalize` (seam) | deterministic-first text layer: accents/abbrev/address; interface frozen, impl minimal (dept-canonicalization ships for P1) | P1 (dept names), P6+ later |
| `parser-slot` (seam) | pack-pluggable deterministic parser interface (OCR-line, diacritic-restore) | P11 later |

**Typed seams frozen in Phase-0 (modules deferred to their consumer track; "frozen" = the TYPES ship in Phase-0 and a builder can write their fixtures today):**

- **Engagement (P4)** [F4, s3-1] — frozen types: `MissionAssignment` (persona × engagement-state → archetype + target + reason), `GeneratedMissionDraft` (bounded-raptor-authored body under hard constraints), `MissionValidationResult` (VALIDATE-before-issue: not-already-active, extends-not-replaces-loyalty, horizon-appropriate), `MissionLifecycleEvent`, `PointsLedgerEntry`. A mission SPECIALIZES a `goal-light` record (§6) — lifecycle/steps/verification come from goal-light; XP/streak/reward semantics are the P4 layer. Invariants frozen with them: points awards are IDEMPOTENT (replayed completion ⇒ zero double-award) and BUDGETED (per-period cap; breach ⇒ refuse + audit).
- **Payment/booking (P3, Phase-2 impl)** [F9] — agreement §10 makes this a NEW harness primitive, so the SEAM freezes now even though the VMA implementation defers: `PaymentIntent` (signed: HMAC + JWT + Idempotency-Key), `PaymentWebhook` (sig + timestamp), `ReplayGuardDecision`, `ActionReceipt` (CREATED→…→SUCCEEDED state trace, 3× retry law). P3's shell builds against these types, not a `wallet.pay()` stub.
- Doc-wallet + required-doc-set + consent/access gate (P5) · multi-entity sorter/batch-scanner (P5; the minimal user→[entities] aggregation itself is CORE for P2) · trace-clock/situation-detector/alert-prioritizer (P12) · maps conversation orchestrator (P8) — each freezes its entity/event schemas through the §7.4 pack declarations.

## 7. Part-2 pack contract (the swappable registry, C6 made real)

A domain pack declares (all validated at load; malformed → REFUSED with named errors):

1. identity + archetype (`internal|external`) + deployment binding (A/B)
2. corpus + index recipe (atomic-fact extraction rules)
3. gate rule-set (DATA for archetype A|B|C) + **`threshold_derivations[]`** — the anti-porting law made a SCHEMA, not a prose promise [F2]: `{track_id, threshold_id, source_fields, candidate_ranges, selected_value, validation_fixture, public_scope, copied_from: null|{track, reason}, reviewer_attestation}`. Loader REFUSES: a threshold with no derivation record; a derivation whose `source_fields` are not this pack's declared data; a non-null `copied_from` without reason+attestation; a derivation whose `validation_fixture` does not run green at load.
4. **entity/state declarations** [F3]: `entity_schemas` (typed, closed vocabs), `ownership_edges` (e.g. user→[vehicles]), `event_schemas`, `idempotency_keys`, retention/privacy tags, fixture migrations. Loader REFUSES a pack whose gate rules, actions, or scored surfaces reference undeclared state — this is what keeps `state-kernel` a swappable contract instead of bespoke track code. **goal-light declarations [s3-3]:** any pack that creates or specializes goal records ALSO declares its goal templates (record-shape extensions), allowed lifecycle transitions, and relation shapes; the loader refuses goal writes outside declared templates (P4 missions = the first declarer).
5. receipt schemas (consumer-named)
6. notification templates + triggers (alignment-checked)
7. adapters (BYO shape proven by MyTasco COP: baseUrl, bearer-provider, header set, response envelope, OTP step-up hooks, org-scope)
8. scored-surface bindings (headless fns → eval keys) + public/hidden declaration
9. **`broken_key_claims[]`** [F6] — broken-key quarantine is GOVERNED DATA, never test-time judgment: `{case_id, defect_type, corpus_evidence, competing_expected, client_flag_text, score_disposition, reviewer}`. Rules: quarantine of HIDDEN rows is forbidden; a claim without corpus evidence is refused; quarantined rows are excluded from the score AND surfaced in the client flag — the two dispositions are never silently merged.
10. rubric (for soft-eval tracks; graded by a DIFFERENT model as judge)
11. parser plugins (optional, `parser-slot`)

Pack load = validate → register → route. Same Part-1, swap Part-2 (agreement §2) — the router IS the gate-rule-set swap, not a login.

## 8. Image + serving + head-adapters

- Boot loads a compiled **`cael.os.md` product image** (third compile target; produced by OUR factory compiler) as the cached prefix; runtime reports its **OS-SHA**; per-tenant fingerprint + update-heartbeat seam (five-walls lock). Phase-0 freezes the image ENVELOPE the runtime consumes (format + SHA discipline + load contract) and boots from a FIXTURE image; the compiler pipeline itself = C5, round-2, factory-side.
- **Head-adapter contract:** per-provider adapter under a fixed role contract; MUST pass tool/event-parity + cache-economics gates before carrying the image; pinned public API client patterns only. Phase-0 ships adapter #1 (default head) + the gate harness a #2 must pass (certification run = round-2 / goal-0584 benchmarks).

## 9. Receipts, dual-channel, signer seam

- Receipt (typed): `{answer|refusal, decision, firing_rule, cited_ids UNION, evidence_refs, confidence, escalation_used, pack_id, image_sha}`.
- Audit record (out-of-band): resolved target id(s) on deny, decision, evidence — the grader/auditor channel (P1 doc-id scoring on deny rows reads THIS, never the user channel).
- **Signer seam:** receipts are the attestation unit (C4). Cael-hosted signer signs receipt batches → the "verified delivery" moat. Competition-tier vs production-tier = OPEN owner-fork (§17); Phase-0 ships the seam (hashable receipt stream), not the service.
- Delivery-provenance pack (goal-0585): the eval harness emits per-run provenance (brief/report/scores/replay refs) — the container already-emits pattern, curated.

## 10. Headless scored surfaces + the 2-layer eval harness

- **L1 (objective):** per-track headless fns bound by packs — e.g. `p1_answer(role,dept,q)→{permission,document_id}`, `p2_recommend(user_id,q)→{recommendation[]}`. The self-harness scores EVERY declared key (P1: permission AND doc-id; F6), reports public-set scope explicitly, and supports **broken-key quarantine + client-flag protocol** (P6/P7/P11 lesson: ship the correct product, FLAG the broken key, never chase it).
- **Rubric-judge:** soft tracks (P3/P4/P5) scored via rubric + DIFFERENT-model judge; judge output is itself a typed receipt.
- **L2 (composition proof):** RADIO-orchestrated container session — spawn the app session, fire a DESIGNED prompt-set walking per-track scenarios + MIXED cross-track prompts; score: gate holds turn-to-turn, no capability bleed, notification arbitration. Two sessions = the two deployments; recorded replay = the delivery provenance made live. Phase-0 ships the RUNNER + recorder on synthetic packs.

## 11. Phase-0 winning conditions (machine-checkable; ALL on synthetic fixture packs)

1. **Install:** §1 acceptance (clean project → boot in ≤2 commands; OS-SHA reported).
2. **Gate batteries:** A) synthetic RBAC battery incl. multi-doc MAX-restrictiveness, canonicalization, deny-if-any — with declared allow-row minimums (a deny-everything gate fails); B) eligibility battery incl. rank/cap/never-empty-fallback + question-independence (same state ⇒ same output across questions); C) open-world battery incl. tri-state missing≠false, field-over-token, sole-discriminator hard-kill, negation, honest-fallback firing, and the **precision-by-construction guarantee** (a hard-gate-violating candidate never surfaces). **Anti-gaming bounds [F5]:** battery C's fixture set is PARTITIONED with declared expected outcomes — clean rows (minimum valid-result coverage: the gate must RETURN results on ≥ the declared clean-row share), offer-alternative rows, refuse rows — and a **false-refusal cap** on clean rows, so over-conservative refusal cannot pass; quarantining any row requires a pre-declared §7.9 `broken_key_claims` record (test-time quarantine = fail).
3. **Dual-channel zero-leak:** across the full deny battery — generic id-free user refusals; audit records carry resolved ids; ZERO denied content/existence in the user channel (string-level check).
4. **Refuse-without-evidence:** ungrounded → refusal citing the missing evidence; grounded → cited answer; abstention floor holds (decoy fixture).
5. **Receipts:** every turn validates against schema; a forced-invalid turn degrades locally (chat survives; mutation blocked) + logs.
6. **Ledger isolation:** continuity across turns; user A can never read user B via ANY surface (adversarial fixture probes).
7. **Graded-cooper:** ordinary battery = ZERO second-brain calls; each configured trigger fires on its fixture row; escalation visible in receipts.
8. **Pack loader:** loads the synthetic pack; REFUSES each malformed variant with named errors — missing/foreign threshold-derivation, load-red derivation fixture, template↔trigger misalignment, undeclared scored surface, bare constants, gate/action/scored-surface referencing UNDECLARED state (§7.4), an evidence-free or hidden-row `broken_key_claim` (§7.9).
9. **Image:** boots from the fixture `cael.os.md`; identical cached prefix across turns; SHA mismatch → refuse boot.
10. **L1:** synthetic scored fn runs end-to-end; report names public scope; quarantine path proven on a planted broken key.
11. **L2:** a recorded 2-session composition proof on two synthetic packs (mixed prompts; gate holds; bleed probe fails to bleed) + provenance pack emitted.
12. **Adapter conformance [F7]:** the whole battery green on adapter #1 run through an ADAPTER CONFORMANCE SUITE (not an assertion): a fixed transcript replayed through the adapter must produce the expected tool-call/event envelopes, a stable cache-prefix hash across turns, correct structured-output failure semantics, correct retry/error mapping, and receipt equivalence. A future adapter #2 passes the SAME suite before carrying the image.
13. **goal-light [s3-3]:** goal records persist across a session restart (create → restart → read intact); lifecycle transitions obey the status enum (an illegal transition is REFUSED); relations hold across restart (completing a blocker surfaces the dependent goal via derived unblocks); per-user goal ISOLATION (user A can never read user B's goal records via any surface).

**Fixture manifest table [F10]:** artifact path convention `fixtures/phase0/c<NN>/<class>/<fixture-id>/` (the builder ships every named fixture at that path; a named fixture missing on disk = the condition is red). Classes: H=happy, R=expected-red, M=malformed/adversarial, I=idempotence/recovery, S=stale-state. `—` = class not applicable to that condition (declared here, not silently skipped).

| # condition | H | R | M | I | S |
|---|---|---|---|---|---|
| c01 install | `clean-project-boot` | `init-on-dirty-project-refused` | `corrupt-tarball-refused` | `re-init-noop` | `stale-config-regenerated` |
| c02 gate batteries | `a-allow-rows` `b-rec-rows` `c-clean-rows` | `a-deny-rows` `b-inelig-rows` `c-refuse-rows` `c-over-refusal-cap-breach-fails` | `a-unknown-role-dept` `b-malformed-state` `c-unknown-token` | `same-input-identical-decision-replay` | `ruleset-hot-swap-takes-effect-only-after-reload` |
| c03 dual-channel | `allow-with-citations` | `deny-planted-leak-caught` | `audit-write-failure-fails-closed` | `replayed-deny-single-audit-record` | `audit-order-preserved-across-restart` |
| c04 refuse-without-evidence | `grounded-cited-answer` | `ungrounded-refusal` `decoy-abstention-floor` | `corrupt-corpus-unit` | `same-refusal-on-replay` | `corpus-update-invalidates-old-citation` |
| c05 receipts | `valid-receipt-every-turn` | `forced-invalid-degrades-locally` | `schema-violating-fields-logged` | — | `schema-version-bump-old-receipts-readable` |
| c06 ledger isolation | `continuity-across-turns` | `cross-user-read-probe-denied` | `corrupted-row-recovery` | `replayed-append-single-entry` | `restart-mid-session-resume` |
| c07 graded-cooper | `ordinary-rows-zero-secondbrain-calls` | `residual-trigger-escalates` `step-up-trigger-escalates` `low-confidence-trigger-escalates` | `escalation-seam-failure-refuses-not-answers` | `same-trigger-same-escalation-replay` | `trigger-config-change-applies` |
| c08 pack loader | `valid-pack-loads` | one fixture per §11.8 refusal (7: `no-derivation` `foreign-derivation` `red-derivation-fixture` `template-trigger-misalign` `undeclared-scored-surface` `undeclared-state-ref` `evidence-free-broken-key-claim`) | `unparseable-pack` | `re-register-no-duplicate` | `pack-update-evicts-old-version` |
| c09 image | `fixture-image-boots-sha-reported` | `sha-mismatch-boot-refused` | `truncated-image-refused` | `cache-prefix-identical-across-turns` | `mid-session-image-swap-refused` |
| c10 L1 harness | `scored-fn-end-to-end-report` | `planted-broken-key-quarantined-with-claim` | `fn-schema-violating-output-caught` | `re-run-identical-score-report` | `eval-set-version-pinned-in-report` |
| c11 L2 harness | `two-session-composition-recorded` | `planted-bleed-probe-caught` | `session-crash-partial-preserved-marked` | `replay-recording-same-verdicts` | `notification-arbitration-across-restart` |
| c12 adapter conformance | `fixed-transcript-replay-green` | `envelope-drift-detected` | `adapter-error-mapping-cases` | `cache-prefix-hash-stable-across-replays` | `adapter-version-bump-reruns-suite` |
| c13 goal-light | `goal-create-read-across-restart` | `illegal-lifecycle-transition-refused` `cross-user-goal-read-denied` | `malformed-goal-record-rejected` | `replayed-create-single-record` | `blocker-completion-surfaces-dependent-after-restart` |

Named non-negotiable cases live inside these cells: points-ledger double-award replay + notification dedupe + payment webhook replay ride c06-I/c03-I-class fixtures of their modules WHEN those modules land (their seam fixtures ship with the module, same class grid); parser row quarantine = c10-R shape; trace-clock replay restart = c11-class of P12's module.

## 12. Hard rejects (any one = the build is wrong)

- prose-parsed routing/actions; UI in a scoring path
- any answer path bypassing the gate; second-brain on the hot path; a model as its own only checker
- public-eval-derived constants without derivation evidence; P035 special-cased; public scores reported as hidden expectations
- client data anywhere in repo/image/fixtures; secrets in receipts; factory machinery in the dep
- provider-locked names/behavior; a second prompt-fork per model
- silent empty recommendation; silent broken-key chasing; missing-token treated as false
- vision/image-OCR, websocket/live-GPS/map-render (de-scoped: P11 images are metadata-only; P12 is replay-scoped)

## 13. Out of scope (Phase-0)

Track packs P1–P12 (fire per their goals, each with a build cooper where round-2 status requires) · **the reusable client-demo UI [s3-2]** — ONE shell, per-client instantiation over the harness's headless surfaces + L2 replay records (goal-0670 portal: `/[client]/[track]` routes, client-named); FIRST post-Phase-0 deliverable because delivery demos need it (Kajima 2026-07-05), but never in the scoring path and never Phase-0-core · signer SERVICE tiers (C4 fork) · the `cael.os.md` compiler pipeline (C5; envelope frozen here) · pricing/licensing · Galaxy/PhongVu replication proofs · website-embed tenant SKU (SKU-2; dev-install is SKU-1) · deferred modules (§6 seam list) until their consumer fires.

**Publish-channel note [s3-2]:** the npm-registry decision (public npm = free · private npm ≈ paid per-user · GitHub Packages token-gated · per-client tarball/git URL = free, registry-less) is DEFERRED behind the §17 open-core-vs-closed-license fork — deliberately non-load-bearing: the §1/§11 install acceptance runs from a LOCAL TARBALL fixture, so Phase-0 builds identically under every channel.

## 14. Build order (Phase-0 slices; each machine-checkable, judged on disk)

- **S1** state-kernel + receipt schemas + structuredOutput validation (+ ledger isolation)
- **S2** gate engine + A/B/C interpreters + batteries (winning 2)
- **S3** ground + verify + dual-channel + graded-cooper (winning 3,4,7)
- **S4** pack loader + image loader + install/init + adapter #1 (winning 1,8,9,12)
- **S5** notify + normalize-minimal (winning: pack-load alignment checks)
- **S6** eval harness L1 + rubric-judge + L2 runner/recorder + provenance (winning 10,11)

## 15. Track fire-map (after Phase-0 green + lock)

Priority (agreement §3): **P1 (0700) → P2 (0701) → P3 shell+payment (0702) → P4 (0703) / P5 (0704)** [= Consumer-Copilot v1] → deferred: maps P6–P9, POI P10/P11, convoy P12. Each fires via RADIO contract from its prepared goal; converged-with-corrections tracks (P4/P5/P10/P11/P12 + maps gate) get a hardening build cooper BEFORE their contract (retain thread 6). P1/P2 are already cooper-hardened/LOCKED.

**Stop-point law [s3-3, Kajima pin 2026-07-05]:** this fire-map is an ORDER/ELIGIBILITY map only. After Phase-0 goes green + installable (§11 incl. c01), execution STOPS. A track fires only when Kajima RE-OPENS that specific track goal — no auto-continuation from harness-done into client deliveries.

## 16. Build-gates (what must clear before ANY Phase-0 build dispatch)

1. **Spec locked** — s2 cooper + s3 Kajima converge on THIS doc.
2. **P0 stability** — goal-0576 (pre-mutation/T-Cell) + goal-0631 (output-banning) out of awaiting_verification (0596 mg-native = completed ✓).
3. **Transition job complete (Kajima 2026-07-04)** — CURRENT STATE (live goal, verified 2026-07-04): goal-20260702-0663 is `paused`; Phases 1–3 done; **Phase-4 is PARTIAL — crash-boot recovery, app-substrate freeze, and resident recuration are still PENDING**, parked for the Fable seat. GATE CONDITION: those three items COMPLETE + 0663's own success criterion "cael-os-light (goal-0579) transition dependency satisfied and recorded on that goal" is recorded. 0663's own sequencing constraint (defect-goals resolved / clean-base-first, cf. goal-0689 URANUS CLEAN-BASE DECLARATION) applies INSIDE this gate — clearing 0663 includes honoring it. Why load-bearing: user-session continuity in the product rides the transition rail's `substrate=app` seam; the freeze is a direct os-light dependency. [F1]
4. **CONVERGE-ONLY discipline** — build fires via RADIO contract from goal-20260704-0712, never solo (containers must cooper; RADIO only merges).

## 17. NOT decided here (owner-forks + round-2)

Kajima's forks (agreement §7, unchanged): (a) open-core vs closed-license · (b) vertical-first vs horizontal · (c) flagship scope · (d) P035 residual policy [LOCKED lean: trust-metadata + escalation, never overfit]. Round-2: C4 signer tiers · C5 compiler pipeline · C8 portal · Phase-2 External-core detail · exact escalation-trigger thresholds (C1, converge with Kajima) · substrate benchmark floors (goal-0584) · P7 disposition nuance (broken-key flagging language to the client).

## 18. Brief-contract compliance + provenance

Maps to the 8-section challenge-brief law: goal=§0/§1 · hard rules=§3 · layout=§4–§10 · winning=§11 · hard rejects=§12 · test cases=§11 fixtures (EVAL_STANDARD) · out-of-scope=§13 · report contract=builder report + judge-on-disk + provenance pack (§9/§10).

Drafted by heir-17 (Fable 5) from committed ground truth only; no client data read for this doc beyond the committed prep docs; no OS mutation; no code.

**Round-2 fold map (job #579 refutation, verdict needs-round-2, all 10 findings accepted):** F1→§16.3 (0663 state corrected to paused/PARTIAL + gate condition + 0689) · F2→§7.3 (`threshold_derivations[]` schema, load-enforced) · F3→§7.4 (entity/state/event pack declarations) · F4→§6 (engagement seam frozen as named types + idempotent/budgeted invariants) · F5→§11.2 (C-battery partitions, valid-coverage minimum, false-refusal cap, predeclared-claim quarantine) · F6→§7.9 (`broken_key_claims[]` governed data) · F7→§11.12 (adapter conformance suite) · F8→§1 (install acceptance pinned: tarball fixture, two exact commands, stub adapter, PS+POSIX) · F9→§6 (payment seam types frozen in Phase-0) · F10→§11 (fixture manifest law + named non-negotiable cases). §2's core-membership line (all 3 interpreters in core) was CONFIRMED-SOUND by the cooper.

**Round-2b (job #580 delta-verify):** F1–F9 CURED; F10 PARTIAL (manifest law without the table) + N1 → cured by the §11 fixture manifest table (12 conditions × 5 EVAL_STANDARD classes, path convention pinned, N/A cells declared). Verification of this last fold is mechanical: the table exists, every condition has its classes, paths are pinned — checked cell-by-cell at judge-close of #580.

**s3 round changes (Kajima live converge, 2026-07-05):** [s3-1] `goal-light` added as a core primitive (§1/§6) — Kajima asked whether the harness needs the goals ledger; answer YES from the 0579 vision lock (install footprint names the goal ledger), the dogfood→product flip law (goal-ledger semantics survive the flip), and the tracks themselves (P4 missions = goal records + reward semantics; P5 renewals-in-progress; copilot continuity). Cut: records/lifecycle/relations ship; factory goal-governance never ships. Kajima RATIFIED s3-1 (2026-07-05): end-users chat with agents → sessions persist → cael-os-light carries the basic goal ledger. [s3-2] The cockpit/UI question RESOLVED: the reusable client-demo UI (one shell, every client, over headless surfaces + L2 replays; goal-0670 portal shape) = the FIRST post-Phase-0 deliverable, never Phase-0-core, never scoring-path (§13). npm publish channel = deferred behind the license fork; install acceptance is tarball-based so the choice is non-load-bearing (§13).

**Round-3 (job #582 lock-conformance, verdict fix-then-lock — all 3 cures folded [s3-3]):** F1→§11 condition 13 + manifest row c13 (goal-record persistence/lifecycle/relations/isolation, machine-checkable); F2→§7.4 goal-light pack declarations (goal templates + allowed transitions + relation shapes; loader refuses undeclared goal writes); F3→§15 stop-point law (fire-map = order/eligibility only; tracks re-open by Kajima). Clean checks passed: no ledger-memory/goal-light overlap, factory wall intact, P4-specializes-goal-light consistent, s3-2 consistent, npm-deferral consistent. LOCKED 2026-07-05 on Kajima's kick.

Next: Kajima's s3 converge round on THIS doc → LOCK → then the §16 build-gates (0576/0631 verify + goal-0663 Phase-4 tail) → Phase-0 build via RADIO contract.
