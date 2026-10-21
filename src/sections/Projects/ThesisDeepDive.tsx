import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useIsPresent, useMotionValue, useReducedMotion, type MotionValue } from 'framer-motion';
import { useDialogFocus } from '../../lib/useDialogFocus';
import { ReaderTools } from '../../components/ReaderTools';
import { useThesisScrub } from './useThesisScrub';
import { DerivationCanvas } from './DerivationCanvas';
import { productMethodLoop, productMethodResponsibilities, productMethodRoutes } from '../../data/disxTalk';
import './thesis-method-summary.css';

/* -------------------------------------------------------------------------- */
/*  Links                                                                     */
/* -------------------------------------------------------------------------- */

const PRODUCT_INNOVATION_PROCESS_HREF =
  'https://docs.google.com/document/d/1WA3bAjACbkhMYAi7xiZTq5UO29Tqxsb3/edit?usp=sharing&ouid=110264933146795409149&rtpof=true&sd=true';
const OS_GITHUB_HREF = 'https://github.com/raminhoodeh/AI-Native-Product-OS';

/* -------------------------------------------------------------------------- */
/*  Content                                                                   */
/* -------------------------------------------------------------------------- */

type Block =
  | { kind: 'method-summary' }
  | { kind: 'p'; text: ReactNode }
  | { kind: 'h'; text: string }
  | { kind: 'callout'; text: ReactNode }
  | { kind: 'list'; items: string[] }
  | { kind: 'rules'; items: { tag: string; text: string }[] }
  | { kind: 'layers'; items: { tag: string; text: string }[] }
  | { kind: 'cards'; items: { title: string; tagline?: string; text: string }[] }
  | { kind: 'links'; items: { label: string; href: string }[]; bare?: boolean };

type ThesisSection = {
  id: string;
  num: string;
  rail: string;
  heading: string;
  caption: string;
  /** Width of this section's beat on the master scrub timeline (see useThesisScrub). */
  units: number;
  blocks: Block[];
};

const THESIS_SECTIONS: ThesisSection[] = [
  {
    id: 'thesis',
    num: '',
    rail: 'The thesis',
    heading: 'The AI-Native Product Thesis',
    caption: 'The whole derivation in one picture: one advance, two conditions, a stack to think in and a loop to act with.',
    units: 0.8,
    blocks: [
      {
        kind: 'p',
        text: (
          <span className="font-display text-[clamp(1.3rem,2.4vw,1.9rem)] italic leading-[1.2] tracking-[-0.02em] text-text-primary">
            What does the evolving technological landscape reveal about the elusive essence of product management?
          </span>
        ),
      },
      {
        kind: 'method-summary',
      },
      {
        kind: 'p',
        text: (
          <>
            This AI-Native Product Thesis is written on first-principles thinking to illustrate both my approach to
            product as well as my metacognitive framework outlined in the{' '}
            <a
              href="/thoughts"
              data-internal-link
              className="font-medium text-text-primary underline decoration-[#a5b4fc]/60 underline-offset-4 transition hover:decoration-[#a5b4fc]"
            >
              “Thoughts”
            </a>{' '}
            section of this portfolio. Product is a shifting field; the tools, the terminology, even the definition of
            the role are revised regularly. In a field that moves this quickly, you need a way of thinking to ground
            yourself; something fixed to reason from while everything above it changes.
          </>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            What grounds you must be the base conditions that stay true while everything built on them is revised - the
            shifting facts themselves will never hold you. First principles take you down to those conditions, and a
            field rebuilt from them takes a particular shape - grown from the ground up, each claim supported by the one
            below it, branching as it rises: a tree. I call this the{' '}
            <strong className="font-semibold">Stratetree</strong>, the metacognitive framework I use for any durable
            understanding: conditions at the soil, values are the roots, the trunk is the vision, mission are the main
            branches, with strategies branching onwards, sticks of tactics and finally, the fruit; the products people
            pick and enjoy.
          </>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            The structure of this product thesis doubles as a map of this portfolio. The thesis is operationalised by
            the <strong className="font-semibold">AI-Native Product OS</strong>, an evolution of my{' '}
            <a
              href={PRODUCT_INNOVATION_PROCESS_HREF}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-text-primary underline decoration-[#a5b4fc]/60 underline-offset-4 transition hover:decoration-[#a5b4fc]"
            >
              Product Innovation Process
            </a>
            . Arranged as a tree, the argument traces choices from conditions to principles and back again.
            It is a working structure for my product thinking, open to revision when evidence or the situation changes.
          </>
        ),
      },
    ],
  },
  {
    id: 'soil',
    num: '01',
    rail: 'SOIL',
    heading: 'The New Conditions',
    caption: 'AI capability advanced. Two conditions follow: over-information, and execution turned cheap and probabilistic.',
    units: 1.2,
    blocks: [
      {
        kind: 'p',
        text: 'The argument begins where the trouble began: AI capability advanced, which created two new fundamental conditions.',
      },
      {
        kind: 'p',
        text: (
          <>
            The first condition is <strong className="font-semibold">over-information</strong>. Models, tools, and
            terminology now evolve weekly, which means any knowledge I hold as a flat list begins decaying the moment I
            write it down, and is often outpaced by a newer and better tool or approach within months. The problem is
            the shape in which information is held as much as the volume of it.
          </>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            The second condition is that <strong className="font-semibold">execution changed, on two distinct axes</strong>.
            Generative output is <em>probabilistic</em>; it is sampled from learned patterns rather than fixed business rules. As such,
            the same input - e.g. into a now-AI-powered feature - no longer guarantees a completely predictable or
            identical result. Many prototyping and implementation tasks also became <em>cheaper and faster</em>.
            Integration, reliable operation, security and organisational change still require substantial work.
          </>
        ),
      },
      {
        kind: 'callout',
        text: (
          <>
            <strong className="font-semibold">This forms the context of my core thesis:</strong> When execution
            becomes cheap and probabilistic, a product manager&rsquo;s durable value shifts from performing the work
            to designing the system that performs it, and supplying the judgement the system lacks.
          </>
        ),
      },
      {
        kind: 'p',
        text: 'These conditions changed how I use the Product Innovation Process. The pipeline that organised much of my product work - Idea → Design → Concept → Alpha/Beta → Live - still provides useful structure. With generative behaviour, however, a specification and a successful demo cannot establish how every output will behave. Evaluation, clear authority and ongoing observation become explicit parts of the work.',
      },
      {
        kind: 'p',
        text: 'Cheaper prototypes make some assumptions less expensive to test earlier. They do not remove constraints on delivery, access to users, integration or reliable operation. My response is a faster learning loop within proportionate release gates, rather than the removal of those gates.',
      },
    ],
  },
  {
    id: 'roots',
    num: '02',
    rail: 'ROOTS',
    heading: 'Values',
    caption: 'Each condition forces different values into importance - and all five live in the Human layer.',
    units: 1.2,
    blocks: [
      {
        kind: 'p',
        text: (
          <span className="font-display text-[clamp(1.05rem,1.9vw,1.4rem)] italic leading-snug text-text-primary">
            “You are not what you do. You are shaped by what you create.”
          </span>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            The two new fundamental conditions of over-information and probabilistic / cheap execution feed into the
            roots of new values. These are the human characteristics able to generate the most value out of our new
            AI-conducting reality. The values are <strong className="font-semibold">clarity</strong>,{' '}
            <strong className="font-semibold">judgement</strong>, <strong className="font-semibold">vision</strong>,{' '}
            <strong className="font-semibold">taste</strong>, and <strong className="font-semibold">empathy</strong>.
            Each is forced into importance by the conditions below it, and each is more durable than anything else in
            the structure that follows.
          </>
        ),
      },
      {
        kind: 'layers',
        items: [
          {
            tag: 'Clarity',
            text: 'Made essential by over-information. When the field turns over monthly and tools multiply faster than you can evaluate them, a flat list of knowledge collapses under its own weight. The problem is not volume - it is structure. Clarity is the capacity to hold form against the noise: to cut through the abundance, discard what doesn’t compound, and keep only what does.',
          },
          {
            tag: 'Judgement',
            text: 'Judgement has always mattered in product work. With probabilistic output it must also be exercised repeatedly: should we automate this task, is the result useful, and what evidence is enough to release it? The threshold depends on the consequences of being wrong.',
          },
          {
            tag: 'Vision',
            text: 'Cheaper implementation creates more options, while time, attention and distribution remain constrained. Vision gives those options a direction: a reason to prioritise one useful result over a large volume of output.',
          },
          {
            tag: 'Taste',
            text: 'What separates outputs that pass an eval from outputs that are worth using. Three AI-generated variants can all be technically correct - and only one will have soul. Taste is the capacity to hold a standard the checklist will never reach.',
          },
          {
            tag: 'Empathy',
            text: 'Building a product does not establish access to users or demand. Empathy means understanding the job people need done, the words they use and the difference between what they request and what they need. That understanding helps determine whether the output is worth using.',
          },
        ],
      },
      {
        kind: 'p',
        text: (
          <>
            These five values rise to the surface when world-class execution is democratised. They are earned
            capacities that a technical framework alone will never produce - and they live at the top of the
            architecture that follows, in the <strong className="font-semibold">Human Layer</strong>: the one layer
            whose contents only the human can supply.
          </>
        ),
      },
    ],
  },
  {
    id: 'trunk',
    num: '03',
    rail: 'TRUNK',
    heading: 'Meaning / Vision',
    caption: 'The one choice: anti-fragility - each release arrives as fuel rather than a threat.',
    units: 1.0,
    blocks: [
      {
        kind: 'p',
        text: (
          <>
            To define our vision, guided by our values, is to ask: if those roots - of clarity, judgement, vision,
            taste, and empathy - were to grow, what would they become? The answer, in this case,{' '}
            <strong className="font-semibold">
              is to become more adaptable: able to use technological change without rebuilding my thinking from scratch.
            </strong>
          </>
        ),
      },
      {
        kind: 'p',
        text: 'Fragile, in this context, refers to the extent to which an external change necessitates a change in your architecture. Fragility is when a major release becomes a disruption rather than an inspiration - where your career resets on the same schedule as the technology.',
      },
      {
        kind: 'p',
        text: 'The idea of anti-fragility is useful here as an aspiration: learning from change rather than only absorbing it. I want a new model, tool or protocol to prompt a focused reassessment of the relevant choices. The structure is stable enough to help me think, but it remains open to revision; it is not a promise to future-proof a career.',
      },
      {
        kind: 'p',
        text: 'We cannot predict what technology will do next. We can maintain a practice for evaluating changes, preserving useful knowledge and revising assumptions when the evidence calls for it. The method supports that work rather than guaranteeing an answer to every future change.',
      },
    ],
  },
  {
    id: 'branches',
    num: '04',
    rail: 'BRANCHES #1',
    heading: 'Purpose',
    caption: 'Two instruments serve the objective: the Stack is the structure, the Loop is the motion.',
    units: 1.2,
    blocks: [
      {
        kind: 'p',
        text: 'To recap, we covered the two new conditions that influence how we approach product: over-information, and the evolution in execution that makes it cheap, fast and probabilistic. If we want to attain our vision of becoming anti-fragile and thrive in this new technological economy, we must come up with instruments that best serve these new conditions.',
      },
      {
        kind: 'p',
        text: 'The aim is to navigate over-information and bring a small, bounded build forward when it can answer a useful question. The process runs as a learning loop with evaluation and observable guardrails. Discovery, approvals and release gates still need to match the risk.',
      },
      {
        kind: 'p',
        text: (
          <>
            <strong className="font-semibold">The first instrument, or branch off the trunk, is the 5-Layer Stack.</strong>{' '}
            This is an information-containment structure that lets us organise new information related to the AI product
            field. A flat list of new facts, terminologies, and approaches becomes less useful as it grows. But a fixed
            set of categories - a stack - can persist while its contents change. What survives a fast-moving field is
            not the facts themselves but the containers they are sorted into.
          </>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            I arrange these responsibilities as a teaching model:{' '}
            <strong className="font-semibold">Model → Context → Orchestration → Governance → Human</strong> - running
            from the technical engine to the people accountable for its use. This is a way to organise decisions,
            rather than a universal dependency hierarchy. Governance and human responsibility apply across every layer.
          </>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            <strong className="font-semibold">The second instrument is the AI-Native Process Loop</strong> - and it runs
            on the Stack. The familiar pipeline (<em>Idea → Design → Concept → Alpha/Beta → Live</em>) still provides
            useful release discipline. Within it, a small AI prototype can help test an assumption earlier.
            Probabilistic output needs evaluation in controlled conditions and monitoring after release; speed does
            not remove the gates required by the consequences of failure.
          </>
        ),
      },
      {
        kind: 'p',
        text: (
          <>
            The result is this loop: <strong className="font-semibold">Talk → Decide → Build → Observe → Iterate</strong>{' '}
            - five verbs, revisited at a cadence appropriate to the team, the evidence and the risk.
          </>
        ),
      },
    ],
  },
  {
    id: 'strategy',
    num: '05',
    rail: 'BRANCHES #2',
    heading: 'Principles',
    caption: 'One system in two aspects - Orchestration is the hinge where the static Stack becomes the running Loop.',
    units: 1.6,
    blocks: [
      {
        kind: 'p',
        text: (
          <>
            The 5-Layer Stack and the AI-Native Loop are the two functional branches of this thesis - parallel
            structures that work together, each serving the same objective from a different angle. The Stack is the
            structure; the Loop is what the structure does when it moves. This transforms the role of the product
            manager from task administrator to outcome conductor. The strategic principles of these two instruments are
            the deeper qualities that allow them to serve their purpose, or mission. As such, understanding{' '}
            <em>how</em> they are built, and how they are interrelated, forms the operating principles of this thesis
            and the AI-Native Product OS.
          </>
        ),
      },
      { kind: 'h', text: 'Principle 1: The 5-Layer Stack' },
      {
        kind: 'p',
        text: 'Each layer is a useful shelf for organising decisions. The categories help me teach and reason about AI products; they can evolve if the system or evidence requires it. From the technical engine to human responsibility:',
      },
      {
        kind: 'layers',
        items: [
          {
            tag: 'Model',
            text: 'The model supplies capabilities that need to be assessed against the task. It may be a hosted service, an open-weight deployment or a specialised model. Quality, privacy, latency, cost and version changes all influence the choice; a newer or older model is not automatically the better one.',
          },
          {
            tag: 'Context',
            text: 'Company, product and user knowledge, memory, prompts and retrieved material give the model a relevant working context. That material may be owned, licensed or supplied by another person. Provenance, permitted use, privacy and access controls are part of deciding what belongs here.',
          },
          {
            tag: 'Orchestration',
            text: 'The agents, MCPs, and workflow wiring that let the model - loaded with your context - reach your data and tools. Orchestration is the substrate and method you use to operationalise the process loop.',
          },
          {
            tag: 'Governance',
            text: 'The evals, observability, and trust guardrails used to assess orchestration risk: quality, cost, security, and brand behaviour. Their presence supports a release decision; their effectiveness still has to be tested for the feature and its users.',
          },
          {
            tag: 'Human',
            text: 'These are the human qualities or values that cannot be replaced by the technology itself and that, if focused on, are able to generate the most value out of our new AI-conducting reality. The values are clarity, judgement, vision, taste, and empathy. These sit at the top to point the whole Stack at something worth building. They are the values named in the roots, now given an architectural address.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'The ordering is a teaching lens, not a claim that every AI system follows one dependency hierarchy. Model and context choices affect orchestration; governance and human responsibility shape all of them. The Stack helps make those interactions explicit and locate what needs attention.',
      },
      { kind: 'h', text: 'Principle 2: The AI-Native Loop' },
      {
        kind: 'p',
        text: 'The Loop is the process that operationalises that Stack of human and machine infrastructure. Five verbs, each mapping onto specific layers, each producing a visible artifact:',
      },
      {
        kind: 'layers',
        items: [
          {
            tag: 'Talk',
            text: 'Define the problem, generate ideas, and shape what to build through discussion with colleagues and the model; because execution is now much less expensive, this phase compresses what used to be separate ideation and design stages into a single, low-commitment conversation before any build decision is made.',
          },
          {
            tag: 'Decide',
            text: 'Evaluate the options produced by Talk and make a judgment call on what to build and what good looks like. Because the cost of producing a first artifact has fallen dramatically, this decision can be made earlier than the old pipeline permitted - before significant time or resource has been committed, and with a working prototype already within reach.',
          },
          {
            tag: 'Build',
            text: 'Generate a working artifact and connect it to your data and tools, where the old process required a fully specified concept before anything could be built. Here the first working artifact can be made alongside the specification - you reason with it directly rather than describing what it should eventually be.',
          },
          {
            tag: 'Observe',
            text: 'The artifact you built produces AI-generated outputs that cannot be assumed correct. Here you observe them and run them against an eval set to surface what’s being produced, and apply guardrails to contain what should not reach users. This is how probabilistic output is verified in motion.',
          },
          {
            tag: 'Iterate',
            text: 'Feed the observation findings (patterns in failures, phrases from users, gaps in the eval set) back into the system. Iterating involves updating the context, extending the eval library, and refining the build with your observed data - so the next pass starts from a richer position each time.',
          },
        ],
      },
      { kind: 'h', text: 'How they are interrelated' },
      {
        kind: 'p',
        text: 'The thesis opened with two conditions: over-information, and the shift in execution to cheap and probabilistic. The Stack is the structural answer to the first - a fixed set of containers that holds a fast-moving field without collapsing under its own weight. The Loop is the process answer to the second - built for material whose behaviour must be verified rather than assumed, and whose build phase can be pulled forward because the first working artifact no longer demands the level of prior specification it once did.',
      },
      {
        kind: 'p',
        text: 'These two instruments are one system viewed from two angles. The Stack is the structure; the Loop is what the structure does in motion. At every verb in the Loop, every layer of the Stack is active - however, there is a particular focus at each process stage. Talk draws more on the Human and Context layers. Build runs mostly on Model and Orchestration. Observe is Governance in action. Iterate touches all five at once; findings absorbed back into the Context layer, routed by Orchestration, gated by Governance, processed by the Model, and directed by the Human deciding what is worth carrying forward. At each stage in the Loop, no layer in the Stack is ever fully off.',
      },
      {
        kind: 'p',
        text: 'Orchestration is the hinge. It is the layer at which the static Stack becomes the running Loop - structure becoming motion. Without it, you have five well-labelled shelves and no process. With it, each turn deposits what it learned back into the system, and the whole architecture compounds over time.',
      },
    ],
  },
  {
    id: 'tactics',
    num: '06',
    rail: 'BRANCHES #3',
    heading: 'Tactics',
    caption: 'Probabilistic output resolves into four consequences, one per layer - compressed into six standing rules.',
    units: 1.2,
    blocks: [
      {
        kind: 'p',
        text: 'The principles above define how the system operates. Tactics are the daily choices that put those principles into action - the specific decisions you make each week when the system is running and the work is in front of you. But knowing how the system operates is not the same as knowing how to act inside it. To make the right call at each layer, you first need to understand what a probabilistic system specifically demands of you there - and that is not obvious until you spell it out. The four consequences below do exactly that: one per layer, each one making explicit what working on probabilistic material requires of you in practice:',
      },
      {
        kind: 'layers',
        items: [
          {
            tag: 'Consequence One → Model + Context',
            text: 'You cannot just prompt and hope. You have to understand the model you are querying and deliberately load the context it answers from. The world you give it shapes what it returns; a blank prompt leaves nothing worth acting on.',
          },
          {
            tag: 'Consequence Two → Orchestration',
            text: 'Probabilistic systems need loops, not straight lines. Because output must be verified in motion, the process itself bends into a cycle - and Orchestration is the substrate that makes that cycle physically possible: the agents, MCPs, and workflow wiring that let the Loop run.',
          },
          {
            tag: 'Consequence Three → Governance',
            text: 'Probabilistic systems need guardrails and evals, not hope. Because each pass cannot be taken on faith, it requires verification - evals that define what good means, guardrails that contain what bad looks like, and observability that surfaces the difference.',
          },
          {
            tag: 'Consequence Four → Human',
            text: 'Probabilistic systems change what being a professional means. Whatever the preceding layers cannot absorb - the framing of problems, the weighing of trade-offs, the call on whether an output is worth shipping - remains with the Human layer. These are the values named in the roots - clarity, judgement, vision, taste, and empathy - now given their operational address.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'Each consequence calls for an adjustment in how you work, and the following tactics are how you respond to them. These tactics are the new decision-making “rules” you apply each day. This is where the thesis comes to its point: these six rules are what it looks like to adapt to the AI product era and thrive in it as the technology keeps advancing:',
      },
      {
        kind: 'rules',
        items: [
          { tag: 'Rule 1', text: 'Build small when it answers an important question safely. A working artifact can be an inexpensive learning tool; an interview, data review or operational check may sometimes be the better next step.' },
          { tag: 'Rule 2', text: 'Distinguish a Model update from a Stack change. Just because a new frontier is released, it doesn’t mean you need to change your entire Stack. The most-publicised layer can be least architecturally significant for you.' },
          { tag: 'Rule 3', text: 'Know what context you can use. Owned knowledge can be valuable, but licensed, personal and third-party material still carry access and usage obligations.' },
          { tag: 'Rule 4', text: 'Direct the system and understand what it builds. Hands-on implementation and the ability to inspect it support the judgement needed to steer the work.' },
          { tag: 'Rule 5', text: 'Define the evidence needed for release. Quantitative checks, qualitative research and professional judgement all matter; hold a release when unresolved risk exceeds the agreed threshold.' },
          { tag: 'Rule 6', text: 'The Human layer is the control point. Clarity - the first value - is what lets you set the objective without collapsing under the noise. The lower layers serve what it sets.' },
        ],
      },
    ],
  },
  {
    id: 'fruit',
    num: '07',
    rail: 'FRUITS',
    heading: 'Products / Services',
    caption: '',
    units: 1.6,
    blocks: [
      {
        kind: 'p',
        text: 'The products below are applications of this framework in my own practice. Building and shipping them demonstrates use of the method; it does not, by itself, validate the framework or establish user value. Customer outcomes, evaluation results and operational evidence need to be assessed separately for each product.',
      },
      { kind: 'h', text: 'Apps I’ve built from 0 → 1' },
      { kind: 'links', bare: true, items: [{ label: 'View Projects', href: '/projects' }] },
      {
        kind: 'cards',
        items: [
          {
            title: 'nsso',
            tagline: '“The CV of the future.”',
            text: 'Shopify, but the product is you: a public identity surface where Deity reads the live profile, retrieves relevant context, and proposes reviewable profile changes.',
          },
          {
            title: 'Dreamsea',
            tagline: '“A dream interpreter under your pillow.”',
            text: 'Built with a psychotherapist partner, Dreamsea captures dreams by voice, uses Gemini for transcription and interpretation, supplies Dream Wiki context, and generates symbolic imagery. Dream records persist on device while generation uses cloud services.',
          },
          {
            title: '24Seven Concierge',
            tagline: '“A holiday concierge in your pocket.”',
            text: 'Another iOS app; a conversational agent reasons over a browsable Shopify catalogue and routes a customer’s order over WhatsApp to a human concierge.',
          },
          {
            title: 'Qadam',
            tagline: '“A paper-only research team inside your laptop.”',
            text: 'Qadam is a protected macro-intelligence control room: world events become source evidence, hypotheses, reasoning challenges, guarded paper orders, proof ledger entries, postmortems, and learning updates.',
          },
          {
            title: 'RazinFlix',
            tagline: '“From watchlist to personal Netflix.”',
            text: 'A personal film library with film-name input, metadata lookups, Gemini-assisted enrichment, and an admin editor for correcting uncertain matches. Trusted human recommendations shape the catalogue.',
          },
        ],
      },
      { kind: 'h', text: 'Reusable tools developed alongside the apps' },
      {
        kind: 'list',
        items: [
          'Unified RAG Pipeline - a standalone package for chunking, embeddings, namespace-scoped vector retrieval, and cited context packing. The public demo does not establish integration into each private app.',
          'Social Wisdom Agent - a staged extraction pipeline that exports source-linked social content into a document for review and Notion import. Its model-generated self-scores still need human calibration.',
          'AI Costs Dashboard - a standalone metering and routing core with seeded demo events, budget alerts, cached eval scores, and explicit fallback rules. Live private-app telemetry and hard quality gates require separate integration work.',
        ],
      },
      { kind: 'h', text: 'Professional work' },
      {
        kind: 'p',
        text: (
          <>
            <strong className="font-semibold">Bayut</strong> - <strong className="font-semibold">AI Product Manager</strong>{' '}
            <em>(Jan 2026 – Present).</em> One of MENA&rsquo;s leading property platforms. Building search,
            recommendation, and conversational experiences on frontier models for a mass audience - underpinned by
            model selection, eval suites, guardrails, and MCP. Rolled out the AI-Native Product OS across the product
            team.
          </>
        ),
      },
      {
        kind: 'p',
        text: 'AI changes the economics of some product work and adds uncertainty to outputs. The Stratetree, Stack and Loop are how I organise those decisions and learn from what happens. They complement established product discipline, with release controls proportionate to the task and its consequences.',
      },
      {
        kind: 'h',
        text: 'Where this method needs judgment',
      },
      {
        kind: 'p',
        text: 'This is a teaching and decision framework, not a universal architecture standard or a substitute for specialist review. It does not remove the need for discovery, security, compliance, delivery discipline or release gates. A useful model should make its limits visible, and should change when evidence exposes a gap.',
      },
      {
        kind: 'list',
        items: [
          'The control boundary depends on the task: a low-risk draft and a high-value payment need different evidence, permissions and approval conditions.',
          'The presence of an evaluation suite, monitoring or a human approval step does not establish that a control works. Effectiveness requires task-specific tests, operational evidence and continuing review.',
          'Products demonstrate applications; course reception and speaking recognition demonstrate teaching and communication. None should be substituted for measured production quality or customer outcomes.',
        ],
      },
      {
        kind: 'links',
        items: [
          { label: 'Use the installable workspace - GitHub', href: OS_GITHUB_HREF },
          { label: 'Walk through the hypothetical DISx example', href: '/talks/disx-dubai#worked-example' },
          { label: 'See it in practice - Projects', href: '/projects' },
        ],
      },
    ],
  },
];

const SECTION_UNITS = THESIS_SECTIONS.map((section) => section.units);
const THESIS_TOTAL_UNITS = SECTION_UNITS.reduce((sum, unit) => sum + unit, 0);
const DESKTOP_RAIL_QUERY = '(min-width: 1024px)';

function useDesktopRail() {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia(DESKTOP_RAIL_QUERY).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_RAIL_QUERY);
    const update = () => setIsDesktop(media.matches);
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  return isDesktop;
}

/* -------------------------------------------------------------------------- */
/*  Left rail                                                                 */
/* -------------------------------------------------------------------------- */

function ThesisRail({
  activeIndex,
  smooth,
  onJump,
}: {
  activeIndex: number;
  smooth: MotionValue<number>;
  onJump: (index: number) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const isDesktopRail = useDesktopRail();
  const staticFinalX = useMotionValue(THESIS_TOTAL_UNITS);
  const section = THESIS_SECTIONS[activeIndex] ?? THESIS_SECTIONS[0];
  const canvasX = isDesktopRail && !shouldReduceMotion ? smooth : staticFinalX;

  return (
    <aside className="deep-dive-support-rail liquid-glass-strong flex min-h-[52vh] flex-col overflow-hidden rounded-[2rem] lg:sticky lg:top-0 lg:h-full lg:min-h-0">
      <div
        className="relative flex min-h-[34rem] flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] lg:min-h-0"
        style={{ backgroundColor: 'rgba(9,13,28,0.72)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 26% 16%, rgba(165,180,252,0.26), transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02) 36%, rgba(1,6,14,0.55) 100%)',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[length:6px_6px] opacity-[0.1]" />

        {/* faint node numeral */}
        <div className="pointer-events-none absolute right-6 top-4 z-10 select-none font-body text-[7rem] font-black leading-none tracking-[-0.06em] text-white/[0.06]">
          {section.num || '·'}
        </div>

        <div className="relative z-20 flex min-h-0 flex-1 flex-col p-5 md:p-6">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/45">Derivation</p>
            <p className="mt-1.5 text-lg font-semibold uppercase tracking-[0.06em] text-white">{section.rail}</p>
            <p className="mt-0.5 text-sm font-medium tracking-[-0.01em] text-white/55">{getThesisSectionTitle(section)}</p>
          </div>

          <div className="mt-2 flex min-h-0 flex-1 items-center justify-center">
            {/* Desktop scrubs the live derivation; mobile/reduced-motion gets
                the completed frame without the legacy keyed diagram fallback. */}
            <div className="h-full w-full">
              <DerivationCanvas x={canvasX} />
            </div>
          </div>

          <div className="shrink-0">
            <p className="min-h-[2.5rem] text-xs leading-5 text-white/64">{section.caption}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {THESIS_SECTIONS.map((s, index) => {
                const isActive = index === activeIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-label={`Go to ${s.rail}`}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => onJump(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-7 bg-[#a5b4fc]' : 'w-3.5 bg-white/25 hover:bg-white/45'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* -------------------------------------------------------------------------- */
/*  Right column blocks                                                       */
/* -------------------------------------------------------------------------- */

function ThesisMethodOverview({ onNavigate }: { onNavigate?: (href: string) => void }) {
  return (
    <section id="thesis-summary" className="thesis-method-overview" aria-labelledby="thesis-summary-heading">
      <h3 id="thesis-summary-heading">The method in 30 seconds</h3>
      <p>
        AI can make a first working version cheaper to build while making some outputs harder to predict.
        I use five areas of responsibility and a repeatable loop to connect faster experiments to
        customer problems, evidence and clear decision rights.
      </p>
      <dl>
        {productMethodResponsibilities.map((layer) => (
          <div key={layer.name}><dt>{layer.name}</dt><dd>{layer.question}</dd></div>
        ))}
      </dl>
      <p className="thesis-method-overview__loop"><strong>The Loop:</strong> {productMethodLoop.map((step) => step.name).join(' → ')}.</p>
      <p>
        The framework organises decisions. The GitHub workspace packages practical assets;
        the courses teach the approach. Governance and human responsibility apply throughout,
        with release gates matched to the risk.
      </p>
      <nav aria-label="Explore the method before the full thesis">
        {productMethodRoutes.filter((route) => route.href !== '/product-thesis').map((route) => {
          const isExternal = route.href.startsWith('https:');
          return (
            <a
              key={route.href}
              href={route.href}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              onClick={isExternal ? undefined : (event) => { event.preventDefault(); onNavigate?.(route.href); }}
            >{route.label} ↗</a>
          );
        })}
      </nav>
      <p className="thesis-method-overview__continue">The full argument, applications and limitations follow below.</p>
    </section>
  );
}

function SectionBlocks({
  blocks,
  onNavigate,
}: {
  blocks: Block[];
  onNavigate?: (href: string) => void;
}) {
  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block, index) => {
        if (block.kind === 'method-summary') {
          return <ThesisMethodOverview key={index} onNavigate={onNavigate} />;
        }
        if (block.kind === 'p') {
          return (
            <p
              key={index}
              className="text-sm leading-7 text-text-primary/90 md:text-[0.95rem]"
              onClick={(event) => {
                const anchor = (event.target as HTMLElement).closest('a[data-internal-link]');
                if (anchor) {
                  event.preventDefault();
                  onNavigate?.(anchor.getAttribute('href') ?? '');
                }
              }}
            >
              {block.text}
            </p>
          );
        }
        if (block.kind === 'h') {
          return (
            <p key={index} className="pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              {block.text}
            </p>
          );
        }
        if (block.kind === 'callout') {
          return (
            <div key={index} className="rounded-[1.15rem] border border-[#a5b4fc]/30 bg-[#a5b4fc]/[0.08] p-4 md:p-5">
              <p className="text-sm leading-7 text-text-primary md:text-base">{block.text}</p>
            </div>
          );
        }
        if (block.kind === 'list') {
          return (
            <ul key={index} className="space-y-2.5">
              {block.items.map((item) => (
                <li key={item} className="relative pl-5 text-sm leading-6 text-text-primary/85">
                  <span className="absolute left-0 top-[0.6em] h-1.5 w-1.5 rounded-full bg-[#a5b4fc]" />
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        if (block.kind === 'rules') {
          return (
            <div key={index} className="grid gap-2.5">
              {block.items.map((rule, ruleIndex) => {
                const splitAt = rule.text.indexOf('. ');
                const firstSentence = splitAt >= 0 ? rule.text.slice(0, splitAt + 1) : rule.text;
                const rest = splitAt >= 0 ? rule.text.slice(splitAt + 1) : '';
                return (
                  <div
                    key={rule.text}
                    className="thesis-inner-card flex gap-3 rounded-[1rem] p-4"
                  >
                    <span className="thesis-rule-index mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {ruleIndex + 1}
                    </span>
                    <div>
                      <p className="thesis-card-label text-[0.95rem] leading-tight uppercase tracking-[0.18em]">{rule.tag}</p>
                      <p className="thesis-card-body mt-1 text-sm leading-6">
                        <strong className="font-semibold">{firstSentence}</strong>
                        {rest}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        if (block.kind === 'layers') {
          return (
            <div key={index} className="grid gap-2.5">
              {block.items.map((layer) => (
                <div key={layer.tag} className="thesis-inner-card thesis-inner-card--accent rounded-[1rem] p-4">
                  <p className="thesis-card-label text-[0.95rem] leading-tight uppercase tracking-[0.18em]">
                    {layer.tag}
                  </p>
                  <p className="thesis-card-body mt-1.5 text-sm leading-6">{layer.text}</p>
                </div>
              ))}
            </div>
          );
        }
        if (block.kind === 'cards') {
          return (
            <div key={index} className="grid gap-2.5">
              {block.items.map((card) => (
                <div key={card.title} className="thesis-inner-card rounded-[1rem] p-4">
                  <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                    <p className="text-[0.95rem] font-semibold text-white">{card.title}</p>
                    {card.tagline ? (
                      <p className="font-display text-sm italic text-white/62">{card.tagline}</p>
                    ) : null}
                  </div>
                  <p className="thesis-card-body mt-1.5 text-sm leading-6">{card.text}</p>
                </div>
              ))}
            </div>
          );
        }
        // links
        return (
          <div key={index} className={`flex flex-col gap-3 ${block.bare ? 'items-start pt-1' : 'items-end pt-2'}`}>
            {block.bare ? null : (
              <p className="thesis-section-kicker text-[0.62rem] uppercase tracking-[0.22em]">
                See the products and tools mentioned
              </p>
            )}
            <div className={`flex flex-wrap gap-2 ${block.bare ? 'justify-start' : 'justify-end'}`}>
              {block.items.map((link) => {
                const isInternalLink = link.href.startsWith('#') || link.href.startsWith('/');
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target={isInternalLink ? undefined : '_blank'}
                    rel={isInternalLink ? undefined : 'noreferrer'}
                    onClick={
                      isInternalLink
                        ? (event) => {
                            event.preventDefault();
                            onNavigate?.(link.href);
                          }
                        : undefined
                    }
                    className="education-read-more-chip"
                  >
                    <span className="education-read-more-chip__label">{link.label} →</span>
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function getThesisSectionTitle(section: ThesisSection) {
  if (!section.num) return section.heading;
  const prefix = `${section.rail} - `;
  return section.heading.startsWith(prefix) ? section.heading.slice(prefix.length) : section.heading;
}

// The same authored sections, without an overlay or scroll-driven presentation, for readable initial HTML.
export function ThesisReadingCopy() {
  return <article><h1>The AI-Native Product Thesis</h1>{THESIS_SECTIONS.map((section) => <section key={section.id}><h2>{section.heading}</h2><SectionBlocks blocks={section.blocks} /></section>)}</article>;
}

/* -------------------------------------------------------------------------- */
/*  Overlay                                                                   */
/* -------------------------------------------------------------------------- */

export function ThesisDeepDive({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const isPresent = useIsPresent();
  const shouldReduceMotion = useReducedMotion();
  useDialogFocus(rootRef, isPresent, onClose);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const isDesktopRail = useDesktopRail();
  // Master scrub: smooth (beat units) drives the DerivationCanvas;
  // activeIndex drives the rail caption and dots; the article stays fully readable.
  const { activeIndex, smooth } = useThesisScrub(scrollRef, rootRef, sectionRefs, SECTION_UNITS);

  const handleJump = useCallback((index: number) => {
    sectionRefs.current[index]?.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth', block: 'start' });
  }, [shouldReduceMotion]);

  const handleSectionNavigate = useCallback(
    (href: string) => {
      onClose();

      window.requestAnimationFrame(() => {
        const target = href.startsWith('#') ? href : href.startsWith('/') ? href : `/${href}`;
        window.history.pushState(null, '', target);
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
    },
    [onClose],
  );

  return (
    <motion.div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="AI-Native Product OS thesis"
      tabIndex={-1}
      data-reader-modal
      className="portfolio-deep-dive-overlay fixed inset-0 z-[220] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close thesis backdrop"
        tabIndex={-1}
        aria-hidden="true"
        className="portfolio-deep-dive-backdrop absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <button type="button" aria-label="Close product thesis" data-dialog-initial onClick={onClose} className="portfolio-case-reader-exit">
        <span aria-hidden="true">←</span>
        <span>Close thesis</span>
      </button>

      <motion.article className="portfolio-deep-dive-shell relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.86fr_1.14fr] lg:overflow-hidden">
        {!isDesktopRail ? <ThesisMethodOverview onNavigate={handleSectionNavigate} /> : null}
        <ThesisRail activeIndex={activeIndex} smooth={smooth} onJump={handleJump} />

        <div className="portfolio-deep-dive-reader-panel liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0 lg:overflow-hidden">
          <div className="portfolio-deep-dive-header flex shrink-0 items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Product Thesis</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">// AI-Native Product OS</p>
              <ReaderTools />
            </div>
            <button type="button" aria-label="Close thesis" data-dialog-initial onClick={onClose} className="portfolio-deep-dive-inline-close card-glass-attachment is-active">
              <span className="card-glass-attachment__glyph">
                <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
                <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
              </span>
            </button>
          </div>

          <div ref={scrollRef} className="project-deep-dive-scroll mt-7 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4">
            <div className="grid gap-4">
              {THESIS_SECTIONS.map((section, index) => {
                const isThesis = section.id === 'thesis';
                const [leadBlock, ...bodyBlocks] = section.blocks;

                if (isThesis) {
                  return (
                    <section
                      key={section.id}
                      ref={(node) => {
                        sectionRefs.current[index] = node;
                      }}
                      data-index={index}
                      data-state={index === activeIndex ? 'active' : 'inactive'}
                      className="scroll-mt-6 grid gap-4"
                    >
                      <div className="thesis-opening-hero rounded-[1.5rem] p-5 md:p-8">
                        <blockquote className="thesis-opening-quote">
                          {leadBlock?.kind === 'p' ? leadBlock.text : null}
                        </blockquote>
                      </div>

                      <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                        <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
                          {section.heading}
                        </h2>
                        <SectionBlocks blocks={isDesktopRail ? bodyBlocks : bodyBlocks.filter((block) => block.kind !== 'method-summary')} onNavigate={handleSectionNavigate} />
                      </div>
                    </section>
                  );
                }

                return (
                  <section
                    key={section.id}
                    ref={(node) => {
                      sectionRefs.current[index] = node;
                    }}
                    data-index={index}
                    data-state={index === activeIndex ? 'active' : 'inactive'}
                    className="liquid-glass scroll-mt-6 rounded-[1.5rem] p-5 md:p-6"
                  >
                    <p className="thesis-section-kicker text-xs uppercase tracking-[0.22em]">
                      {section.num} / {section.rail}
                    </p>
                    <h3 className="mt-3 max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-4xl">
                      {getThesisSectionTitle(section)}
                    </h3>
                    {section.caption ? (
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{section.caption}</p>
                    ) : null}
                    <SectionBlocks blocks={section.blocks} onNavigate={handleSectionNavigate} />
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}
