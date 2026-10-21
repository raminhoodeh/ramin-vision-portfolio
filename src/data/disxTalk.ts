import productMethodDiagramUrl from '../../thoughts-section/courses/ai-native-product-os-light-mode.jpg';
import { disxTalkEvidence } from './teachingEvidence';

export { productMethodDiagramUrl };
export const productWorkspaceHref = 'https://github.com/raminhoodeh/AI-Native-Product-OS';

export const productMethodResponsibilities = [
  { name: 'Model', question: 'What can it do?', detail: 'Choose capabilities against task quality, privacy, latency and cost.' },
  { name: 'Context', question: 'What should it know?', detail: 'Choose relevant knowledge, its provenance, access and permitted use.' },
  { name: 'Orchestration', question: 'What can it act on?', detail: 'Define tool access, sequence, retries and the limits of each action.' },
  { name: 'Governance', question: 'What must hold?', detail: 'Test acceptance criteria, enforce limits and observe failures.' },
  { name: 'Human', question: 'Who is accountable?', detail: 'Set direction, weigh trade-offs and decide when a person must intervene.' },
] as const;

export const productMethodLoop = [
  { name: 'Talk', detail: 'Understand the problem with the people who experience it.' },
  { name: 'Decide', detail: 'Agree scope, success criteria, authority and stop conditions.' },
  { name: 'Build', detail: 'Make a small, testable version inside those boundaries.' },
  { name: 'Observe', detail: 'Inspect user feedback, outputs, failures and evaluation results.' },
  { name: 'Iterate', detail: 'Change the system and rerun the relevant checks.' },
] as const;

export const productMethodRoutes = [
  { label: 'See the diagram', href: '/product-method#method-diagram', detail: 'The Stack and Loop on one slide.' },
  { label: 'Walk through an example', href: '/talks/disx-dubai#worked-example', detail: 'A hypothetical payment decision.' },
  { label: 'Read the full thesis', href: '/product-thesis', detail: 'The reasoning behind the method.' },
  { label: 'Use the toolkit', href: productWorkspaceHref, detail: 'The installable workspace on GitHub.' },
] as const;

export const disxTalk = {
  ...disxTalkEvidence,
  takeaways: [
    'The Stack helps locate a decision or failure across model, context, orchestration, governance and human responsibility.',
    'The Loop makes scope, acceptance criteria and observations part of development, rather than treating a convincing output as enough.',
    'A model’s confidence does not authorise a payment. Approval requirements and escalation rules belong in the surrounding system.',
  ],
  workedExample: [
    {
      phase: 'Talk',
      title: 'Find the bottleneck before choosing the automation',
      body: 'A hypothetical Dubai treasury team needs to prepare a $4.2 billion cross-border payment. The team first asks whether documents, conflicting information, liquidity or approvals are causing the delay.',
      artifact: 'A clearly framed preparation problem.',
    },
    {
      phase: 'Decide',
      title: 'Scope the assistant to an evidence-backed recommendation',
      body: 'The proposed assistant reads the supplied evidence and drafts a recommendation brief, with a simulated handoff into the workflow. It does not gain independent authority to move funds.',
      artifact: 'A bounded task and agreed acceptance criteria.',
    },
    {
      phase: 'Build · Governance + Human',
      title: 'Define who can authorise and what must stop the workflow',
      body: 'The scenario puts transaction limits, mandatory checks and required approvals outside the model. The workflow preserves transaction references for safe retries and records evidence, actions and approvals.',
      artifact: 'System-enforced authority and stop conditions.',
    },
    {
      phase: 'Observe',
      title: 'Expose the ambiguous sanctions match',
      body: 'In the teaching scenario, the model confidently treats a partial counterparty-name match as a different organisation. The proposed workflow lacks an escalation rule for that ambiguity, so confidence is allowed to stand in for a control.',
      artifact: 'A specific failure case, rather than a vague concern about AI.',
    },
    {
      phase: 'Iterate · Evaluation',
      title: 'Turn the failure into an evaluation case',
      body: 'The talk proposes a set of known ambiguous sanctions cases whose expected behaviour is escalation. This defines a testable requirement; it is not a published dataset or a measured pass rate.',
      artifact: 'Expected behaviour: escalate the ambiguous case.',
    },
    {
      phase: 'Iterate · Governance',
      title: 'Enforce escalation independently of confidence',
      body: 'The proposed rule routes a partial match above a defined similarity threshold to a human compliance officer. The model may still read, synthesise and draft; it cannot override the escalation rule.',
      artifact: 'An escalation rule enforced outside the model.',
    },
    {
      phase: 'Observe again',
      title: 'Rerun the scenario against the revised control',
      body: 'The script describes replaying the same hypothetical case with escalation before approval. In a real product, the team would need recorded test results, wider failure coverage and release criteria before relying on that control.',
      artifact: 'An illustrative rerun, with real validation still required.',
    },
  ],
} as const;

// Complete author-supplied talk script with an undated enrolment claim omitted from the introduction.
// All other paragraph wording is preserved; reading headings are editorial.
// This is not a transcription verified against an event recording.
export const disxTranscriptSections = [
  {
    "id": "why-the-framework",
    "title": "Why a way of thinking matters",
    "paragraphs": [
      "Hi everyone. I’m Ramin Hoodeh. I’m an AI product manager working in embedded finance and applied AI, here in Dubai. I’m also the creator of the AI-Native Product OS, which I teach online. Today I’m going to take you through it, then show how we could apply it to fast, high-value international payments.",
      "I want to talk about this because businesses are under growing pressure to automate more and more complex, expensive work. This is great from the perspective of innovation, and potential cost savings - maybe it even allows for higher quality work to be done by humans and takes away some of the more mundane work… but the risk is that this automation pressure can  sometimes be occuring in places where a mistake can cost far more than the automation saves.",
      "So if we want to respond to that pressure — or that opportunity — safely, we need to really understand this whole world of AI; I really mean, the full picture. Because the gap in our knowledge is exactly where mistakes could become expensive.",
      "And this is exactly where the main challenge arises. How do we understand the whole world of AI - think about today. How many talks have you already sat through? How many more are on the programme? And that's just today. Add the podcasts, the books, the reels, the LinkedIn posts that arrived in your feed this week. The field of AI moves so fast that staying informed can start to feel like a job in itself.",
      "And sometimes, the more seriously you engage with AI, the less certain you feel. As Socrates put it — “the more I learn, the more I realise how much I don't know.” So before I give you another thing to know, I want to give you a container for that knowing. I want to give you  way of thinking about how you hold facts. And this thinking about thinking, is what we call metacognition.",
      "In our noisy world of AI, metacognition has never been more important. And once I give you this foundation, which I call the AI-Native Product OS, then I’m going to show you how you can apply it to solve AI problems, in this case in automating a very high-stakes; large, financial transaction. Does that sound good? Are you up for doing that now? Okay, great.",
      "Let’s look at this slide. This… one… slide… Is the only slide in this talk - which is the AI-Native Product OS. And I’ve made it the only slide in this talk for a reason, that you remember it - because if you can retain this… you have a metacognitive toolkit to understand any topic, from today, from now, that you’ll ever learn about AI. And the way it works is that it gives you a place, a shelf in the cabinet of your mind, for each AI concept - specifically in applying AI technologies to solve a problem."
    ]
  },
  {
    "id": "the-five-responsibilities",
    "title": "The Stack: five areas of responsibility",
    "paragraphs": [
      "On the left we have a triangle of knowledge, which we’ll call the Stack. The stack is made of up these five layers: Model, Context, Orchestration, Governance, Human. These 5 layers hold the complete picture of any AI system. Everything you will ever hear about AI belongs somewhere in one of these, somewhat hierarchical, layers.",
      "At the foundational layer, we have the Model. One of the first decisions when designing an AI solution, is choosing the Model. Do you use the latest and greatest Claude Fable model, or do you only need something lightweight and cheaper - perhaps something you can run locally, you know, for privacy. Now the Model layer is the most hype element of AI at the moment; which is are raw the raw engines we all know about, otherwise called the LLMs: GPT, Grok, Gemini - a million others. So, whenever you hear things like tokens, transformer, temperature, fine-tuning, and all these other topics you see on that slide, just know they’re talking specifically about the Model layer.",
      "And then we all know that we should load that Model with the right Context; which is the next layer. This is where you can maximise the potential of the Model’s intelligence, by teaching it about your unique situation. So here we hear things like system prompts, RAG, knowledge bases, memory, embeddings, which are referring to the Context layer. This is the layer you own. The Model you can rent, but the Context you load it with is usually yours.",
      "So once you’ve loaded that Model with your Context, now it’s time to look at deploying that intelligence, which we call Orchestration. Orchestration means taking an action. This is where things like agents come in; workflow automation, tool calls, function calling, MCP connections… All of those topics you see on the slide next to the Orchestration layer, relate to how we need to think about the wiring that connects the model, loaded with your context, to the services, and systems it needs to act in the world.",
      "But as we all know, we can’t always safely predict exactly what an AI is going to do next. That’s because these Models are not deterministic, like traditional software, they are probabilistic. This means that it doesn’t always produce the same result from the same input. Which… erm… is a bit concerning, right? Especially when it’s supposed to autonomously handle very sensitive, valuable financial transactions. Which is why the next layer is about governing those AI actions. Governance, is about making the system trustworthy at scale. Terms like evals, guardrails, observability, safety testing, monitoring - all on the slide - that’s the Governance layer; ensuring the system doesn’t produce a harmful result - because we have to assume it will.",
      "And once you understand those four layers, you’re in a position to think about the system as a whole. That’s why the Human layer sits at the top. It’s where you bring all that understanding together to make decisions on what the system should do, how it should work, and which trade-offs make sense for the people using it. You hear that term “Human in the loop,” where a person is there to press a red button in case the AI is about to derail itself. But ideally what we want is a “Human at the helm,” someone who understands the whole system they’re steering - not just someone who presses approve.",
      "The role of this “Human at the helm,” is to do things that the computer can’t yet do. That’s where we hear about those more human characteristics that are becoming ever more valuable now like vision, and taste. Like when execution, or the ability to Orchestrate agents, becomes ubiquitous - the most important trait now is judgement of what to orchestrate autonomously, and what to still do manually. So the Human layer is partly about designing the entire system, and is the more philosophical or strategic side of AI. The Human layer is also about understanding not only just the stack itself, but how we operationalize it; how we put it to work."
    ]
  },
  {
    "id": "the-product-loop",
    "title": "The Loop: putting the Stack to work",
    "paragraphs": [
      "Which then brings us to the second half of the AI-native Product OS, the process Loop. This is where the Human at the helm carries this understanding of the AI stack forward into building an actual product or solution. And in product management, this process used to look very linear; stage-by-stage you’d have an Idea, Design a Concept, Build an MVP, and then finally go live. Nowadays that time between thinking of an idea and building it has collapsed, so this AI product development process now looks like this loop, first you Talk & Decide - discuss the idea between you and your teammates and decide on an initial solution, Build - get straight to building it, because it’s so much more accessible now, 3. Observe - release it into a world, maybe a controlled environment and see how it behaves, 4. Iterate - based on its behaviour, you chisel and polish it to iron out the kinks, and build or improve upon it again.",
      "As you move through this process, you pick out the different layers you’re working on. So, the Stack helps us understand the system. The Loop helps us develop it. And they work together: as we move through the Loop, we use the Stack to see which layers need attention and how a change in one affects the others. Or we can see where the souce of a problem lies. What we observe then guides what we change on the next pass.",
      "So the complete picture is the Stack and the Loop, working together, with humans steering the process. If you leave today with nothing else, leave with that. The model names will change. The tools will change. But you’ll still need a way to understand the system and a way to develop it. Feel free to take a picture of the slide and save it - you can also find it on www DOT ramin DOT vision.",
      "This way of thinking will never be outdated - if you’re watching this on YouTube in 10 years let me know - I’ll be checking the comments… I always read the comments. So, shall we put this AI-Native Product OS to work?"
    ]
  },
  {
    "id": "scoping-the-payment-example",
    "title": "A hypothetical payment: discover and decide",
    "paragraphs": [
      "Okay, great. Now, imagine a treasury team here in Dubai needs to move the equivalent of 4.2 billion dollars across currencies and jurisdictions before... next week. They want to move faster and spend less time preparing the transfer. We're going to explore a hypothetical workflow and test it with a simulated bank.",
      "We start with Talk. We get treasury, payments operations, compliance, and engineering together and ask: where are we actually losing time? Is it collecting documents? Checking conflicting information? Waiting for liquidity? We need to understand that before deciding what to automate.",
      "Once we do, we Decide on a first version: an assistant that prepares an evidence-backed recommendation, with a simulated handoff into the payment workflow. We agree what good looks like, who can authorise the transfer, and what should stop it."
    ]
  },
  {
    "id": "building-the-simulation",
    "title": "Build: the model, context, workflow and controls",
    "paragraphs": [
      "Now we Build, using the Stack. For the Model, it helps to start with what the model is actually doing. The treasury team gets flooded with unstructured inputs every time a large payment moves: counterparty risk reports, sanctions screening results, regulatory memos, jurisdiction-specific rules. Traditionally, an analyst reads all of that, synthesises it, and writes a payment recommendation brief that a senior approver signs off on. That's the job we're giving the model. So the model acts as that analyst: reading everything, connecting the dots, and producing the brief. Once you know that, the model selection criteria follow naturally. The primary consideration here is privacy, rather than capability. For a treasury system, you'd want a model running in a controlled, trusted environment, with a very low temperature to keep it predictable and minimise the risk of it improvising. You also want an older model, not the latest and greatest, because a selection of older models have proved themselves over time, and because of that history, you can choose the one that has been most predictable for your use case.",
      "Context is where it gets more interesting: it's loading in clean data — verified accounts, balances, screening results, policies, and actually making sure the AI actually understands your business. Who's a customer, who's a supplier, what a transaction reference actually means in your system. That requires what's called a semantic layer — a layer that sits above your raw data and ensures any new information is always interpreted through the same lens every time, so it stays organised and well compartmentalised as new data or Context is added.",
      "For Orchestration, we have two main considerations. The first is the order of action: the agent’s tool calls must first clear the payment and screening checks, then obtain the required security approvals, and only then submit the instruction. Workflow automation can enforce that sequence, so that the agent isn’t just improvising. The second consideration is related to safe retries: so the workflow needs to preserve the original transaction references, based on that semantic Context, so it recognises a retried payment as the same instruction, and not mistake it for a new transfer.",
      "Then we have Governance, with 3 main considerations. First, we need guardrails that enforce transaction limits, approval requirements and mandatory checks outside the model, regardless of how confident its recommendation sounds. Second, we need to see what the system is doing and catch problems early, which brings us to that concept of observability, which is what gives us a trace of the evidence used, the tool calls made and the approvals received. Third we have monitoring which uses that information to flag failed checks, unexpected actions or delays while the workflow is running. That lets the team intervene and leaves an audit trail, because in payments, someone will need to explain exactly what happened.",
      "And the Human at the helm is someone who understands enough of this stack, these layers who’s main job in this case, is to decide what to automate, to architect into this system - and what still should be manual and needs a person."
    ]
  },
  {
    "id": "observing-the-ambiguity",
    "title": "Observe: an ambiguous sanctions match",
    "paragraphs": [
      "And now that we've Built that AI stack, we move to the next step in the process loop, onto Observing it out in the wild, or in the controlled environment.",
      "And imagine, everything's going fine with the system in the team's day-to-day workflow until, one day, monitoring flags something unusual: the agent has cleared a payment to a counterparty — let's call them \"Al Rayan Capital LLC\" — but that name is a close, partial match to an entity on a sanctions watchlist. The model had read the screening results, weighed the context, and confidently recommended proceeding. It decided they were different organisations. It was probably right. But \"probably\" isn't good enough when you're moving 4.2 billion dollars. No rule stopped it. No escalation was triggered. The model produced a confident recommendation on an ambiguous case, and the workflow treated that confidence as a green light. That's the nature of a probabilistic system: it doesn't always flag what it doesn't know. That's what we Observe (not to be mistaken with Observability — we're just Observing as part of the wider process here).",
      "So now we can see the gap isn't in Orchestration — the workflow ran exactly as designed. The gap is in Governance: we gave the model a job it could do, but we didn't define what should happen when it shouldn't be the final word."
    ]
  },
  {
    "id": "iterating-the-controls",
    "title": "Iterate: evaluation and enforced escalation",
    "paragraphs": [
      "And that's when we Iterate… We add two things. First, we add an eval set — a collection of known ambiguous sanctions cases, where the right answer is always to escalate. This is so we can test how the model behaves on the exact kind of input that caused the problem… The Second iteration solution we implement is… a guardrail: any partial sanctions match above a defined similarity threshold, automatically routes to a human compliance officer… regardless of how confident the model sounds.",
      "Then we simulate the same scenario again. This time, the ambiguous counterparty is flagged before the recommendation reaches the approver. The model still does its job — reading, synthesising, drafting the brief… but the Governance layer now catches the cases where it shouldn't be trusted alone."
    ]
  },
  {
    "id": "closing-the-talk",
    "title": "A place to put what you learn",
    "paragraphs": [
      "That’s the AI-Native Product OS in practice. The Stack helps you understand the system and locate the problem. The Loop helps you test and improve it. The Human at the helm decides what to automate and where a person is needed.",
      "You don’t need to remember every AI term from today. You need a place to put what you learn, and a way to put it to work. That’s the metacognitive toolkit I wanted to leave you with, I hope it was nice and memorable and applicable. Again you can find it at www DOT ramin DOT vision.",
      "Thank you. I’m happy to take your questions."
    ]
  }
] as const;

export const disxTranscriptWordCount = disxTranscriptSections
  .flatMap((section) => section.paragraphs)
  .join(' ')
  .split(/\s+/).length;
export const disxTranscriptReadMinutes = Math.ceil(disxTranscriptWordCount / 200);
