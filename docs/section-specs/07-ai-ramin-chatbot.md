# 07 AI Ramin Chatbot

## Purpose

Provide an aesthetic, truthful placeholder for a future AI Ramin assistant that can eventually answer how Ramin would approach a role, job, or project.

## Public Surface

- Bottom navigation item
- Modal launched from the bottom navigation
- Not a normal page section

## Navigation Spec

- Bottom nav label: `AI Ramin`
- Nav target: `ai-ramin`
- Icon: `ai`
- AI Ramin must not appear in structural `navLinks`.
- Current implementation: `BottomNavigation` includes the `AI Ramin` item and passes it into `LiquidGlassJsNavShell`.
- Clicking `AI Ramin` sets the modal open state and renders `AiRaminModal`.
- The `AI Ramin` bottom-nav item becomes active only while the modal is open.
- Closing the modal returns the user to the same active portfolio section.
- Selecting any normal nav item closes the modal and navigates to that section.
- The launcher/modal is a separate interactive surface, not part of `ActivePortfolioSection`.

## Current Implementation Files

- `src/App.tsx`: `BottomNavigation`, `AiRaminModal`, modal state, close behavior, active nav handoff
- `src/components/LiquidGlassJsNavShellReadable.tsx`: bottom nav liquid-glass item rendering
- `src/data/portfolio.ts`: `portfolioContent.aiRaminChatbot`
- `src/index.css`: modal glass classes and bottom-nav active styling

## Source Data

- `portfolioContent.aiRaminChatbot`

Current data includes:

- `floatingLauncher: true`
- `launcherLabel: AI Ramin`
- `modalTitle: AI Ramin`
- `comingSoonState: Coming soon`
- Textarea label and placeholder copy
- Model selector options
- Guardrails copy

## Required Placeholder Behavior

The modal is coming soon for now. It should communicate the intended future capability without pretending to generate real answers.

Future capability:

- User can paste in a job, brief, or project.
- The assistant explains what approach Ramin would bring.
- Guardrails keep answers truthful to Ramin's real skills, experience, and supplied portfolio data.
- User can select a model style/provider.

## Current Modal UX

`AiRaminModal` currently provides:

- Fixed full-viewport overlay with a blurred/dimmed backdrop
- Centered liquid-glass popout article
- Header with avatar, coming-soon state, title, and explanatory copy
- Close button using the glass control style
- Textarea bound to local prompt state
- Model selector buttons
- Disabled submit button while backend behavior is not implemented
- Selected model status panel
- Visible guardrails list
- Escape-key close behavior
- Body scroll lock while open

The prompt state is local only. There is no backend call, generation, streaming, memory, or model routing yet.

## Model Selector Options

The current placeholder selector includes:

- Claude Sonnet
- Gemini Pro
- Deepseek
- GPT 5.5

## Liquid Glass Requirement

The AI Ramin launcher is part of the shared bottom nav and should continue to use the real liquid-glass implementation from:

```txt
react libraries/liquid-glass-js-main
```

The modal itself currently uses portfolio glass CSS classes, including `liquid-glass-popout` and `liquid-glass-control`. CSS fallback is acceptable for the modal shell while the actual bottom launcher remains WebGL-backed.

Do not replace the bottom-nav launcher with a plain CSS pill. CSS fallback should remain a failure-safe, not the intended primary nav surface.

## Required Modal Fields

- Bottom nav launcher label
- Modal title
- Coming soon state
- Textarea label
- Textarea placeholder
- Model selector
- Guardrails copy

## Required UX Rules

- Launcher sits inside the bottom navigation bar as the `AI Ramin` item.
- Modal opens from the launcher and can close cleanly.
- Modal must not block the page permanently if the glass engine fails.
- Guardrails must be visible enough to set expectations.
- Do not present model output as functional until backend behavior exists.
- Do not mount AI Ramin as a route, section, or long-page panel.

## Implementation Checklist

- [ ] AI Ramin reads from `portfolioContent.aiRaminChatbot`.
- [ ] Bottom nav launcher uses the shared liquid-glass nav engine.
- [ ] `AI Ramin` opens the modal and becomes active only while open.
- [ ] Modal has textarea, model selector, coming-soon state, and guardrails.
- [ ] Submit remains disabled until real backend behavior exists.
- [ ] Close button, backdrop, and Escape close behavior are reliable.
- [ ] CSS fallback does not replace the intended bottom-nav engine.

## Acceptance Test

The launcher should feel like part of the advanced glass system, open a truthful coming-soon modal, and avoid implying that the AI assistant is already functional.
