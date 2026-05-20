# Qadam — Portfolio Write-Up

# Qadam

## Catalyst-Driven Macro Intelligence Platform

---

# 1. Problem

Financial markets are information-processing machines — but they process information reactively. Physical events that will materially move asset prices (a refinery fire detected by satellite, a shipping lane blockage identified via vessel tracking, a surge in military flight activity captured by ADS-B sensors) register in the physical world hours to days before they enter the consensus narrative. During that interval, the options chain still reflects a near-normal probability distribution, systematically underpricing the tail risk that the physical world has already flagged.

The problem is not the absence of data. The data exists — satellite thermal feeds, maritime AIS streams, conflict-event APIs, dark-pool order flow. The problem is that no single retail-accessible system ingests, triages, and reasons over this data fast enough to act on it before it becomes consensus. By the time a Bloomberg headline runs, the edge has closed.

Qadam was built to occupy that window: the gap between physical reality and market awareness.

---

# 2. Architecture

Qadam is structured as two distinct but connected layers.

**Layer A — The Intelligence Engine** is the cognitive and mathematical stack. It ingests alternative data, reasons over it with a multi-model pipeline, runs quantum-assisted pattern recognition on a weekly batch cadence, and surfaces high-conviction signals with a full, auditable evidence trail.

**Layer B — The Orchestration Layer** is the autonomous execution stack. It receives approved signals from Layer A, executes trades within hard-coded risk guardrails on a paper broker account, and manages the human-in-the-loop approval process.

## The Agent Pipeline (Layer A)

**Gemma 4 — Triage / Noise Gate**

Runs 24/7 locally on the MacBook Air M5 Neural Engine via Apple's MLX framework (4-bit quantised). Monitors 450+ concurrent data streams — Telegram OSINT channels, RSS feeds, Twitter/X, Reddit — and performs binary triage: pass an anomaly up the stack, or discard it. Gemma does not reason; it filters. Events below a dynamic Trust Score threshold are quarantined and logged but never passed to the reasoning layer.

**Gemini 3.1 Pro — Strategist / Swarm Engine**

Accessed via Google Cloud API. Receives escalated anomalies and performs deep geopolitical reasoning: causal chain analysis, cross-referencing against the Knowledge Graph, and a 100-persona Swarm Simulation where synthetic Hedge Fund Managers, Logistics Experts, Regional Diplomats, and Retail Traders each reason independently about a catalyst's likely market impact. The output is a probability distribution over outcomes — not a single prediction — with a documented Evidence Trail and swarm dissent score. Signals only advance if the thesis-side tail mass exceeds the options chain's implied distribution by 15 percentage points or more.

**Quantum Engine — Oracle (Weekly Batch)**

Accessed via IBM Quantum and Q-CTRL cloud APIs on a weekly batch cadence (not real-time). Runs two jobs every Sunday evening. Job 1: a non-linear cross-dataset pattern scan using QAOA circuits, identifying co-occurrence relationships across all five data pipelines that classical correlation matrices miss. Job 2: the Strategy Collapse — identifying the specific option strike, expiry, and structure where the Black-Scholes model is most mispriced against Qadam's estimated true probability. Outputs a Black-Scholes Gap Report and a Quantum Ambiguity Score. If ambiguity exceeds the configured threshold, the system compounds patience rather than capital.

**Python Orchestrator — Nervous System**

Built on Python 3.12+ with asyncio and uvloop. The connective tissue of the entire system. Routes every API call, enforces Trust Score rules at every ingestion point, manages all inter-component handoffs, writes every event to an append-only PostgreSQL audit log, monitors all 35 data source heartbeats, and applies Bayesian weight updates after each closed-trade postmortem. The Orchestrator has no intelligence of its own; it follows routing rules defined in a Markdown file and coordinates the rest of the system with deterministic precision.

## The Data Pipelines (World Monitor)

Five specialised pipelines stream raw data into the Orchestrator, each normalised into a unified event schema before any model processes it:

- **Pipeline A — Geopolitical & Conflict:** ACLED, UCDP, GDELT, Oref (Israeli Home Front Command real-time red alerts). Detects armed conflict escalation and political instability before it enters mainstream news.
- **Pipeline B — Logistics, Infrastructure & OSINT:** NASA FIRMS (satellite thermal anomaly detection), AIS Maritime APIs (real-time vessel tracking via Spire and MarineTraffic), Wingbits ADS-B (military flight tracking), GPS jamming monitors. The primary physical-to-paper catalyst source.
- **Pipeline C — Economic & Macro:** FRED, BLS, ECB, UN Comtrade, USGS Earthquake API. Calibrates the magnitude of physical catalysts against the prevailing macro regime.
- **Pipeline D — Market Microstructure & Order Flow:** UnusualWhales (institutional dark pool activity), Polymarket/Kalshi (prediction market probability shifts), Alpaca (options chain data), Coinglass (crypto derivatives). Detects where institutional capital is positioning before a catalyst is public.
- **Pipeline E — Social, Sentiment & Narrative:** 435+ RSS/Atom feeds, Telegram scrapers, Twitter/X API, Reddit API, SEC/STOCK Act filings, GitHub API. Measures narrative velocity — how fast a catalyst is becoming consensus — to determine how much edge remains.

## Cross-Cutting Infrastructure

- **Knowledge Graph:** ChromaDB (local) storing every detected catalyst and its eventual market resolution as vector embeddings. Feeds back into Gemini's swarm simulations and the Quantum Engine's pattern recognition. Never purged — the graph is Qadam's most irreplaceable long-term asset.
- **Event Log:** PostgreSQL + TimescaleDB. Append-only. Every signal, fill, override, and system state change is logged and replayable from this single source of truth.
- **Risk Agent:** Deterministic Python. Calculates fractional Kelly position sizing and enforces all hard caps before every order. Per-trade maximum: 5% of current bankroll for defined-risk options, 2% for all other instruments. Cannot be bypassed by any other component.
- **Postmortem Agent:** Analyses every closed trade across five sub-dimensions (catalyst analysis, pricing analysis, regime analysis, execution analysis, override analysis) and updates Bayesian component weights accordingly.

## The 6-Step Signal Filter

Every candidate signal passes five automated layers before it is presented to a human:

1. IV Suppression: implied volatility percentile below the 20th, relative to the ticker's 3-year baseline
2. Options Distribution Gap: Black-Scholes Gap Report confirms tail mass differential of 15 percentage points or more
3. Catalyst Identification: specific, dated catalyst with swarm dissent below 60%
4. Technical Setup: identifiable structural entry zone, risk-reward ratio of at least 1:3, supportive or neutral market regime
5. OBV / Volume Intelligence: on-balance volume verdict is confirmatory or neutral — never contradictory
6. Human Gut Check: Ramin reviews and approves the proposed signal. Every override is logged with a structured reason code and tracked for outcome attribution.

---

# 3. Why This Approach

**Local inference for triage, cloud for reasoning, quantum for pattern recognition.** The most obvious alternative was a fully cloud-based architecture — cheap to prototype, easy to scale. The decision against it was deliberate: latency in the triage layer compounds across 450 concurrent streams. Gemma 4 running locally on the M5 Neural Engine sustains throughput that a cloud-API approach cannot, at a cost envelope that stays within a solo operator's budget. Heavy reasoning (Gemini) and mathematical optimisation (Quantum) are the only workloads that justify cloud spend, because their per-call latency is irrelevant at the timescales they operate on.

**Quantum for weekly batch, not real-time.** The conventional instinct would be to make every component operate in real-time. The Quantum Engine runs once a week by design. Current NISQ hardware has coherence constraints that make real-time quantum computation unreliable for this workload. A weekly batch cadence matches the resolution window of the catalyst types Qadam targets (days to weeks, not seconds) and eliminates the failure modes associated with real-time quantum calls. This is the kind of architectural honesty that separates a production system from a demo.

**Markdown-first agent design.** Each agent in the system is a folder containing one Markdown file (its reasoning instructions, routing logic, and decision rules) and the Python scripts that execute those decisions. The Markdown is the architecture; the Python is the plumbing. Swapping an agent's behaviour means editing a Markdown file — not refactoring a class hierarchy. This makes the system auditable, version-controllable, and replaceable at the component level without touching the orchestration layer.

**Demo before live, always.** Deploying to a live account before statistical proof is established is not a bold move — it is a measurement failure. The system is designed to prove its edge on a £1,000 paper account (90 consecutive days, minimum 100 closed trades, Expectancy > 0 at p < 0.05) before any live capital is considered. The paper environment uses the same code path, the same broker API, and the same risk guardrails as the live environment. The only difference is an environment flag.

---

# 4. Tradeoffs

**Human gate on strategy, not on individual trades.** The operator approves strategy-level decisions and reviews proposed signals at the final filter layer. After approval, the system executes autonomously — no individual trade modifications, no real-time stop adjustments. This removes emotional interference at the trade level while preserving genuine judgment at the strategy level. The tradeoff is that a bad approved signal runs to its defined exit without intervention; the benefit is that the 90-day proof run remains statistically clean and the system is forced to demonstrate edge through process, not discretion.

**Quantum is a weekly Oracle, not a real-time participant.** All real-time decisions (triage, research, execution) are made by classical components. The tradeoff is that intra-week signals do not benefit from quantum pattern recognition until the next Sunday batch. The benefit is architectural reliability: the system never fails open because a quantum API call timed out.

**35 data sources, dynamic Trust Scores, no hard exclusions.** Every source has a Trust Score that degrades when its signals are contradicted by higher-trust sources and recovers when its signals are validated by outcomes. Sources below a threshold of 0.3 are quarantined but retained. The tradeoff is system complexity — 35 heartbeat monitors, 35 failover hierarchies. The benefit is that the data environment improves over time rather than decaying: the Knowledge Graph becomes more accurate, the Trust Score distribution tightens, and the system progressively relies more heavily on sources that have demonstrated predictive value.

**Paper proof phase limits observable alpha.** Running on a £1,000 paper account for 90 days means the system's demonstrated edge accumulates in a simulated environment. Any pattern the market sees is invisible to Qadam's counterparties during this phase — but so is any capital compounding. The tradeoff is accepted deliberately: a system that cannot prove its edge on paper should not be trusted with real capital, regardless of how sophisticated its architecture is.

**No production governance layer in the current version.** The system has risk guardrails (hard caps, kill-switches, circuit breakers) but does not yet have a comprehensive AI governance layer equivalent to what a regulated fund would require: formal model cards, output classifiers, third-party audit trails. This is acceptable at the paper proof stage and is the primary architectural gap to close before any capital promotion.

---

# 5. Demo

[qadam.trade](http://qadam.trade)

Full specifications, architecture documentation, and the World Monitor Integration Reference are maintained in the project's Notion workspace. The quantum circuit technical specifications (QAOA for pattern recognition, VQE for strategy collapse) are version-controlled alongside the codebase.

---

# 6. What I Would Improve

**The evaluation suite is insufficient for a production governance claim.** The current system has risk guardrails and circuit breakers, but no formal eval set for the Intelligence Engine's outputs — no structured set of historical catalyst cases with known outcomes that runs automatically on every model update or Quantum circuit version change. A rigorous eval suite covering at least 50 historical catalyst instances per pipeline category, with documented false-positive rates per source, is the most important addition before the system can be described as production-governed rather than merely guardrailed.

**The Social pipeline Trust Scores are structurally noisy at initialisation.** Telegram OSINT channels and Twitter/X feeds start with low Trust Scores by design, but the backtesting window required to calibrate them accurately is long relative to the demo proof duration. In the first 90 days, the system will make Trust Score decisions on the Social pipeline with less statistical confidence than on the Physical and Market Microstructure pipelines. A synthetic pre-seeding approach — using historical catalyst events to pre-calibrate Social source Trust Scores before the live run begins — would materially improve signal quality in the early demo phase.

**The Quantum Ambiguity Score threshold is hardware-generation-dependent.** The Q_threshold value is calibrated against the current IBM Quantum or Q-CTRL hardware allocation's gate fidelity and qubit coherence time. As quantum hardware improves, the threshold will need recalibration. The current circuit versioning policy handles this, but it introduces a dependency on periodic manual review that a more automated calibration loop would eliminate.

**The web cockpit is the weakest link in the human-in-the-loop design.** The signal review interface (Layer 6 approval) is functional but not optimised for the decision the operator is actually making: does this signal make sense given what I know about the world right now? The ideal cockpit presents the proposed signal alongside a live map of the physical catalysts that generated it, the Knowledge Graph precedents most similar to this cluster, and a one-sentence plain-English synthesis. That level of contextual scaffolding is partially implemented and would significantly improve the quality of the human gate decisions.