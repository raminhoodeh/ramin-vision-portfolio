# 07 AI Ramin Chatbot

## Purpose

Provide an aesthetic placeholder for a future AI Ramin assistant that can eventually answer how Ramin would approach a role, job, or project.

## Public Surface

- Bottom navigation item
- Pop-up modal
- Not a normal scroll section

## Navigation Spec

- Bottom nav label: `AI Ramin`
- Nav target: `ai-ramin`
- Icon: `ai`
- AI Ramin must not appear in structural `navLinks`.
- Current implementation: `BottomNavigation` includes the `AI Ramin` item and passes it into `LiquidGlassJsNavShell`.
- Clicking the `AI Ramin` item sets the modal open state and renders `AiRaminModal`.
- The `AI Ramin` bottom-nav pill becomes active while the modal is open.
- Closing the modal returns the user to the same active portfolio section.
- The launcher/modal is a separate interactive surface, not part of `ActivePortfolioSection`.

## Source Data

- `portfolioContent.aiRaminChatbot`

## Required Placeholder Behavior

The modal is coming soon for now. It should communicate the intended future capability without pretending to generate real answers.

Future capability:

- User can paste in a job or project.
- The assistant explains what approach Ramin would bring.
- Guardrails keep answers truthful to Ramin's real skills and experience.
- User can select a model style/provider.

## Required Modal Fields

- Bottom nav launcher label
- Modal title
- Coming soon state
- Textarea
- Model selector
- Guardrails copy

## Model Selector Options

The placeholder selector should allow options such as:

- Claude Sonnet
- Gemini Pro
- Deepseek
- GPT 5.5

## Liquid Glass Requirement

The AI Ramin bottom-nav launcher/modal should use the real liquid glass implementation from:

```txt
react libraries/liquid-glass-js-main
```

Do not replace this with a plain CSS pill if the section is being implemented or polished. CSS fallback may exist only as a failure-safe, not as the intended design.

## Required UX

- Launcher sits inside the bottom navigation bar as the `AI Ramin` item.
- Modal opens from the launcher and can close cleanly.
- Modal must not block the page permanently if the liquid glass engine fails.
- Guardrails must be visible enough to set expectations.
- Do not present model output as functional until backend behavior exists.

## Implementation Checklist

- [ ] AI Ramin reads from `portfolioContent.aiRaminChatbot`.
- [ ] Bottom nav launcher uses the real liquid-glass JS engine as the intended surface.
- [ ] `AI Ramin` opens the modal and becomes active while open.
- [ ] Modal has textarea, model selector, coming soon state, and guardrails.
- [ ] Close behavior is reliable.
- [ ] CSS fallback is guarded and does not replace the intended engine.

## Acceptance Test

The launcher feels like part of the advanced glass system, opens a truthful coming-soon modal, and does not imply that the AI assistant is already fully functional.
