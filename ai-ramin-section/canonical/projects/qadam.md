---
title: "Qadam"
source_type: project_case_study
trust_level: canonical_candidate
visibility: public_portfolio_safe_with_caution
retrieval_priority: high
answer_permission: factual_answer_with_non_financial_advice_boundary
source_paths:
  - "projects-section/Qadam - Portfolio Write-Up.md"
  - "overall-structure-context.md"
  - "src/data/portfolio.ts"
public_links:
  - "http://qadam.trade"
---

# Qadam

## Summary

Qadam is a protected macro-intelligence control room that shows the path from world events to evidence, reasoning, paper-only trade lifecycle, proof ledger, operations, and learning.

It is a project and portfolio example, not financial advice.

## Problem

Most retail trading systems chase indicators, copy other people's trades, or hide behind black-box automation. They rarely explain why a trade exists, what evidence supports it, what would invalidate it, or whether the system is learning from mistakes.

Qadam was built to make the whole chain readable: world event, source evidence, hypothesis, challenge, risk gate, paper order, result, postmortem, and learning update. A Fund Manager should be able to inspect why Qadam is allowed to act, blocked, degraded, or waiting.

## Dashboard Flow

The Qadam dashboard at qadam.trade is not just a trading screen. It is a readable control room for the full path from evidence to action to learning:

1. Login / Access Gate: only allowlisted Fund Managers reach the cockpit.
2. Safety Status: paper mode, live capital off, and order authority behind runtime gates come first.
3. Overview / Mission Control: fund state, source state, strategy posture, team/agent state, hypotheses, paper account status, and learning-loop maturity.
4. Source Intelligence Network: conflict, physical/OSINT, macro, market, narrative, and supplemental technical sources, including feed health.
5. Strategy Universe + Reasoning: worldview priors, evidence packets, research goals, hypotheses, Strategy Lead challenges, and Head of Quant / quantum-classical review.
6. Trade Lifecycle: observed signals, trade ideas, blocked trades, staged paper orders, submitted paper orders, open positions, closed paper trades, candidate identity, order lineage, and postmortems.
7. Paper Account & Trade State: balance, P&L, open exposure, closed trades, drawdown, proof ledger, maturity, and postmortem completeness.
8. Operations / Control Plane: Python COO, local LLM, frontier LLM, Head of Quant, Risk Agent, Execution Policy, source plumbing, Telegram, governance, event logs, and diagnostics.
9. Backtesting & Replay Lab: past evidence, paper outcomes, postmortems, strategy updates, edge memory, and replayable source history.

## Architecture

Qadam is designed as a self-auditing fund team in software:

- a Python COO/orchestrator
- a local Research Analyst that compresses noisy information
- a Strategy Lead that challenges assumptions and falsification
- a Head of Quant / quantum-classical review layer for ambiguity and non-linear structure
- cross-domain source pipelines across conflict, physical/OSINT, macro, market, and narrative signals
- local and durable stores for evidence, comments, runtime state, postmortems, and replayability
- Signal Integrity checks for stale, weak, under-corroborated, or single-source ideas
- Risk Agent and Execution Policy gates for sizing, kill switches, venue limits, idempotency, and live-capital boundaries
- guarded Alpaca Paper routes for qualified paper orders only
- outbound Telegram summaries and alerts, without Telegram becoming a command surface

As of the cockpit snapshot on June 27, 2026, Qadam is in paper mode with 29/37 sources online, 387 research goals, 5 hypotheses, 1 candidate, 2 open positions, 78 closed paper trades, 5 candidate relationships under observation, 0 confirmed edges, and live capital disabled.

## Product Judgement

The simplest product model is: world happens, Qadam observes, filters sources, forms hypotheses, challenges them, checks risk and authority, paper-trades only if gates pass, logs the outcome, learns, and lets Fund Managers review the whole chain.

Evidence beats excitement: a dramatic story means nothing unless source evidence, market confirmation, risk, and invalidation are clear.

Reasoning and execution are visibly separated. Strategy and quant review can explain, challenge, and recommend, but they cannot execute.

AI and quantum-classical review are leverage, not authority. They can compress, challenge, and detect patterns, but they do not override deterministic gates.

No forced trades: a quiet day is acceptable if there is no qualified setup.

Fail closed: missing evidence, stale data, degraded sources, broken plumbing, duplicate order risk, or unclear authority should block action instead of permitting it.

Paper before live: Qadam must prove itself in paper mode before live capital is considered.

## Tradeoffs

- Safety status takes prime dashboard space, but it answers whether Qadam can do anything dangerous before anything else.
- The proof boundary is intentionally paper-level, not live-capital proof.
- The system may produce more no-trade, blocked, degraded, or waiting states because missing or weak evidence blocks action.
- Local-first sovereignty improves ownership and replayability, but adds setup, storage, maintenance, and observability burden.
- Candidate edge is not proven edge. The cockpit should keep candidate, watchlisted, qualified, confirmed, and retired states distinct.

## What This Proves

- Transparent AI architecture for high-risk decision support.
- Product judgement around evidence, invalidation, lifecycle state, and authority boundaries.
- Agent orchestration across source intake, research, strategy review, risk, paper execution, postmortems, and learning.
- Local-first design for memory, logs, comments, postmortems, source history, and runtime state.
- Governance discipline: safety status first, no forced trades, fail-closed behavior, paper validation, and explicit live-capital boundaries.

## Retrieval Guidance

Use this file for questions about Qadam, AI intelligence systems, alternative data, agentic control planes, local-first architecture, paper-trading validation, dashboard/product architecture, or product judgement under uncertainty.

Do not provide investment advice, trading instructions, or claims about financial returns.
