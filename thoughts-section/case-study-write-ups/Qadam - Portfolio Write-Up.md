# Qadam - Portfolio Write-Up

## Problem

I started Qadam when I realised something had changed in software. For most of my life, building a serious intelligent trading system would have needed a full engineering team. Data engineers. Backend engineers. Quant researchers. Frontend engineers. DevOps. A whole room of people just to wire together the infrastructure before you even got to the trading logic.

But with the new AI coding tools, I could suddenly build systems that were more complex than anything I would have attempted before. And because my product work had exposed me to APIs across geospatial, climate, automotive, finance, and other industries, I knew how much useful data was sitting out there, disconnected.

That was the spark. Could I build a transparent, self-improving paper-trading system that spots patterns across data sources that are usually never compared, maps those patterns to strategies I had learned from successful trader friends, and tests them with paper money in the real world? Qadam became that challenge.

## Architecture

### Model

The model layer is a small fund team turned into software.

A local LLM, Gemma 4, acts like the Research Analyst. It reads noisy inputs and turns them into cleaner research context. A frontier LLM, Gemini 3.5 Pro, acts like the Strategy Lead. It challenges the trade thesis, looks for weak evidence, and asks what would prove the idea wrong. A quantum and classical review layer, Q-CTRL Opal / IBM Quantum, acts like the Head of Quant. That part came from my own curiosity about quantum computers and their promise around nonlinear pattern recognition.

I wanted to give quantum a real product job in Qadam. Linear pattern recognition can test clean relationships, such as whether one source tends to lead price. Nonlinear review is for messier cases, where the relationship may depend on regime, timing, multiple source combinations, or hidden interaction effects.

A Python program sits underneath all of this as the COO. It runs the system. It checks files. It blocks unsafe paths. It writes artifacts. It makes sure no model gets direct broker authority.

### Context

The context layer is where Qadam gets its edge. It is connected to a broad source universe rather than one market feed. The five major data categories are market and technical data, macro and policy data, geopolitical and physical-world signals, social and narrative data, and institutional or alternative finance data such as filings, Capitol trades, broker paper state, and prediction-market context: 50+ APIs in total.

The point is not to collect APIs for the sake of it. The point is to compare sources that normally sit in different worlds. A geopolitical event might affect oil. A shipping signal might affect supply chains. A Reddit narrative might show retail attention forming before price fully moves. A prediction market might move before traditional media catches up. Capitol trades or filings might create a longer-term thesis. Qadam tries to turn those disconnected signals into structured evidence.

It then maps that evidence to strategy frameworks inspired by my friends who worked in finance and were successful traders. Their strategies were not random indicator chasing. They were built around patience, catalysts, conviction, confirmation, risk, and knowing when not to trade. That became central to Qadam's strategy layer.

### Orchestration

The orchestration layer turns raw data into decisions. The flow is simple to describe.

Qadam watches sources. It creates evidence packets. It turns those into research goals. It forms hypotheses. It checks those hypotheses against trader-inspired strategy filters. It runs linear and nonlinear pattern review. It routes promising setups into PaperOps. If a setup passes every gate, it can move through the guarded Alpaca Paper route.

Then the system watches what happened. Did the trade fill? Did it work? Did it fail? Was the original evidence meaningful? Did the model overread the signal? Did the strategy need adjustment? That loop matters because Qadam is meant to improve from outcomes, not just generate impressive-sounding ideas.

### Governance

The governance layer is deliberately strict. Qadam is paper-trading first. It does not use live capital. It does not let LLMs touch broker credentials. Its Telegram bot and the dashboard cannot place trades. Backtests and shadow simulations do not count as proof. Missing evidence blocks the system. Stale sources block the system. Duplicate exposure blocks the system.

This was a product choice. In my view, if a trading system cannot explain why it should act, it should not. Governance is what stops Qadam from becoming a flashy black box and opens up a level of transparency that allows me to better understand and work with Qadam to improve it over time.

### Human

The human layer is me and my trading friends. I am the product manager; they are the operators, fund managers, and critics of the system. Together, we decide what the system should be allowed to do, inspect the dashboard, and review whether the reasoning is legible. Overall, we shape the strategy universe and judge whether the system is becoming more useful or just more complex.

The dashboard is built for that job. It shows the portfolio value, current holdings, trading history, connected data sources, strategy universe, detected patterns, possible trade intents, and the final PaperOps decision. The whole point is that we, or anyone, should be able to look at Qadam and understand what it is thinking. This gives users more reason to trust the system, while giving us enough evidence to challenge it.

## Why This Approach

The easy version of this project would have been a signal bot: connect a few APIs, ask an LLM for trade ideas, show a polished explanation, and maybe add a shiny dashboard.

I wanted something harder and more useful. I wanted to see whether a complex trading system could be built like a thinking machine with receipts. Every observation, hypothesis, strategy match, risk check, paper trade, and postmortem should leave a trail.

The strategy layer also had to respect how good traders actually behave. My successful trader friends were not successful because they traded constantly. They waited. They looked for catalysts. They cared about timing. They knew that a good story is not the same thing as a trade.

Qadam tries to encode and democratise that discipline. It looks for patterns across previously uncompared data sources, checks whether those patterns match real trading strategies, and then tests them with paper money before making any stronger claim.

The quantum layer fits because markets are not always linear. Sometimes the useful pattern is not "source A moves, asset B follows." Sometimes it is "this kind of source only matters when another source confirms it, during this kind of regime, with this kind of price structure." That is the kind of nonlinear search space that made quantum computing feel worth exploring.

## Tradeoffs

Qadam gives up speed for evidence. It could place a higher frequency of paper trades if it treated every interesting signal as actionable, but that would defeat the point. A quiet day is fine if the setup is weak.

I intended for Qadam to give up simplicity for separation of roles. One AI could generate a trade, explain it, and score the risk in one response. Qadam separates research, strategy, quant review, risk, execution, and learning into different modules, run by different hardware, because each stage needs to be challenged on its own and performed by systems that are more optimised for that role.

Qadam also gives up full autonomy for safety. The models can reason and recommend, but Python enforces the rules. The broker route stays guarded. Live capital stays off for now.

It also gives up easy marketing claims. A beautiful backtest is not proof of an edge. A clever quantum review is not proof either. A paper trade that was entered for a clear reason, managed through a real route, and reviewed afterward is much closer to proof.

So far, the paper version of Qadam has returned around 20 percent over its first few months. That is promising, but I would still frame it carefully. For me, the most interesting part is whether Qadam can show why the return happened, which decisions helped, which signals were noise, and what should change next.

## Demo

Live dashboard: https://qadam.trade/dashboard

The dashboard is public-safe and read-only. It shows Qadam as a real operating system. It starts with the fund and moves chronologically along its train of thought: portfolio value, holdings, exposure, paper trade history, and account state. Then it shows the intelligence layer: sources, categories, freshness, trust, and blockers. Then the strategy layer: which trading strategies exist, which ones are active, which ones are held, and which patterns are being reviewed.

The final sections show what Qadam is thinking about now, and why PaperOps did or did not allow a trade.

## What I Would Improve

The honest limitation is that Qadam is still proving its edge. The system is already more complex than I originally imagined I could build, so it is already a success in my eyes. It connects a wide data universe, runs trader-inspired strategy filters, performs linear and nonlinear pattern review, submits guarded paper trades, and records what happened afterward. But the next version needs deeper proof.

I would expand the historical replay system so Qadam can test its full data universe against its full trading universe. Not source by source. All together. I want to know whether patterns appear across combinations of geopolitical signals, macro data, narrative pressure, prediction markets, filings, technical structure, and price.

I would also improve the evaluation layer around false positives. Qadam needs to get better at knowing when a pattern is real, when it is overfit, when the story is too convenient, and when the quantum or nonlinear layer is really adding value rather than just using quantum for the sake of quantum.

Overall, the best version of Qadam is the one that can look back at a decision and say, in plain English, "Here is what I saw, here is why I acted, here is what proved me right or wrong, and here is what I changed because of it."
