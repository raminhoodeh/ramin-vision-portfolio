import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { type CaseStudyEntry } from '../types';

/* ------------------------------------------------------------------ */
/*  Public identifiers                                                  */
/* ------------------------------------------------------------------ */

export const METACOGNITION_DEEP_DIVE_ID = 'metacognition-deep-dive';

export const METACOGNITION_SENTINEL: CaseStudyEntry = {
  id: METACOGNITION_DEEP_DIVE_ID,
  typeLabel: 'Framework',
  eyebrow: 'Thinking',
  title: 'Framework of Metacognition',
  summary: '',
  readTime: '',
  year: '',
  status: 'live',
  sourceStatus: 'live',
  sections: [],
  chips: [],
  structure: [],
  links: [],
  assetSlots: [],
  related: [],
};

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const STEPS = [
  { label: 'Experience', tag: 'Soil' },
  { label: 'Values', tag: 'Roots' },
  { label: 'Vision', tag: 'Trunk' },
  { label: 'Mission', tag: 'Purpose' },
  { label: 'Strategy', tag: 'Principles' },
  { label: 'Tactics', tag: 'Presence' },
  { label: 'Products', tag: 'Fruits' },
] as const;

const CORE_QUESTIONS_LINE = 'Who am I // Where am I going // Why do I exist // How should I be // and What, therefore, should I do?';
const METACOGNITION_LINKS = [
  {
    phrase: 'Simon Sinek\'s Golden Circle theory',
    href: 'https://www.youtube.com/watch?v=LQPfTNAECRA',
  },
  {
    phrase: 'metaphysical fiction books',
    href: 'https://www.amazon.co.uk/stores/Ramin-Hoodeh/author/B0H69DZL17',
  },
  {
    phrase: 'AI-Native Product Thesis',
    href: '/product-thesis',
  },
  {
    phrase: 'AI-Native Product OS',
    href: '/product-thesis',
  },
  {
    phrase: 'TEDx talk',
    href: 'https://www.ted.com/talks/ramin_hoodeh_existentially_viewing_your_existential_crisis',
  },
] as const;

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'quote'; text: string; cite?: string }
  | { kind: 'steps'; items: { label: string; tag: string; body: string; personalExample?: string; businessExample?: string }[] }
  | { kind: 'chain'; items: { label: string; consequence: string; positive?: boolean }[] };

type Section = {
  id: string;
  num: string;
  rail: string;
  heading: string;
  caption: string;
  /** Which node indices are active for this section (used as fallback / static default). */
  activeSteps: readonly number[];
  blocks: Block[];
};

const SECTIONS: Section[] = [
  {
    id: 'opening',
    num: '',
    rail: 'The framework',
    heading: 'Framework of Metacognition',
    caption: 'A chain from self-knowledge to output. Personal, organisational, and essential.',
    activeSteps: [0, 1, 2, 3, 4, 5, 6],
    blocks: [
      {
        kind: 'quote',
        text: 'Where is the wisdom we have lost in knowledge? Where is the knowledge we have lost in information?',
        cite: 'T.S. Eliot',
      },
      {
        kind: 'quote',
        text: 'Think about yourselves and your lives. Logic would follow that to plan for a positive future - a future that you want - you need a clear understanding of where and what you are now.\n\nThat\'s how business works - the best businesses have a mission statement, a crystal-clear vision of what they want to achieve, but the only way they get there is through a clear understanding of where they are now, what resources they have, and what they\'re capable of. This allows them to strategise and, step by step, cater every decision to get them to where they want to be.\n\nIn the same way that businesses do this existential analysis of where they are, we need to do this, too.\n\nWe too need an understanding of where and what we are, what resources we have, and what we\'re capable of, so that we can prioritise and step-by-step get to where we want to be.',
      },
      {
        kind: 'p',
        text: 'This quote from my TEDx talk explaining my line of business/personal thinking is the domain of metacognition: thinking about the way we think. And this knowledge of ourselves, our existence and our place within it, is explored in the topic of metaphysics. This refers to how you make the calls that shape your work and your life. Examined closely, we see that the most fulfilling decisions we make were those that were based on a clear understanding of what we found important at the time. By contrast, the less effective decisions were usually reactions to whatever was loudest at the time.',
      },
      {
        kind: 'quote',
        text: 'The devil makes the world noisy so that we can no longer hear ourselves.',
        cite: 'C.S. Lewis',
      },
      {
        kind: 'p',
        text: 'There has always been noise. But the volume has risen tremendously in the 80 years since Lewis penned those words. Rapidly evolving and democratised execution through AI advancements mean more can be built, written, and shipped than any team can often meaningfully evaluate. The filtering mechanism - knowing what actually matters to you - has become the differentiator. When you don\'t have it, over-information fills the vacuum. Every direction looks equally valid. The loudest signal wins, not the most useful.',
      },
      {
        kind: 'p',
        text: 'The cost of noise runs deeper in business and in life, just as the value of focus remains crucial. This is because true, lasting, happiness comes not from fleeting pleasure but from a feeling of fulfilment; of knowing who you are and what you\'re here to do. This is what drove my deeper interest in metaphysics, often in the form of writing metaphysical fiction books: The Proposition and The Untold Story of Adam and Eve. My books are both built around this same enquiry into existential clarity. When I applied first-principles metacognitive thinking to metaphysics in my writing, I realised that the entire field, across religion, spirituality, and philosophy, can be distilled into five hierarchical questions, each one derivable from the last: Who am I // Where am I going // Why do I exist // How should I be // and What, therefore, should I do? Each answer opens the next, which is what makes this a clear train of thought that instills personal and professional clarity.',
      },
      {
        kind: 'quote',
        text: 'People don\'t buy what you do; they buy why you do it.',
        cite: 'Simon Sinek',
      },
      {
        kind: 'p',
        text: 'The Framework of Metacognition begins two questions deeper than the Why. The first is Who - the values and principles a person or company actually holds. The second is what formed the Who - the experiences - observations, lessons, problems, challenges - that inspired those values in the first place. The Why grows from both. The chain then continues through mission, strategy and execution - all the way to what actually gets produced. I have visualised this layout in the shape of a "tree" of knowledge. Soil and roots below the surface, the trunk and branches above it, and finally the fruits, the products and services that are the natural expression of everything beneath them. Through these seven layers, what a person builds remains connected to what they believe, and vice versa. This aligned approach to life is where I believe personal fulfilment and outer success comes from; to not be defined by what you do, but shaped by what you create.',
      },
      {
        kind: 'p',
        text: 'Simon Sinek\'s Golden Circle theory (Why, How, What) is the closest thing in business strategy to this logic. His argument is that most companies communicate from the outside in; what they make, how they make it - rarely why. Inspired leaders reverse this, leading instead with the belief, the cause, the purpose. This works because belief is what customers are motivated by - the product follows as proof in service of that.',
      },
      {
        kind: 'p',
        text: 'These realisations are the backbone of this framework and, as such, form the way I make strategically-aligned product decisions. I\'ve since outlined my AI-Native Product OS through this same first-principles derived approach - achieving systemic clarity in a rapidly evolving product and technology landscape.',
      },
    ],
  },
  {
    id: 'layers',
    num: '01',
    rail: 'Stratetree',
    heading: 'The Metacognitive "Stratetree"',
    caption: 'Seven layers. Each accountable to the one below.',
    activeSteps: [0, 1, 2, 3, 4, 5, 6],
    blocks: [
      {
        kind: 'p',
        text: 'The Framework of Metacognition applies at both personal and professional scales because the logic is identical at each. For a person, it restores the meaningful link from what you\'ve lived to what you ultimately create. For a company, it traces the same chain or "tree" from founding story to product. The framework has seven layers, each one accountable to the one below it:',
      },
      {
        kind: 'steps',
        items: [
          {
            label: 'Experience & Backstory',
            tag: 'Soil',
            body: 'This foundational layer consists of the raw events, observations, challenges, and encounters that shape subsequent beliefs. It includes personal incidents, cultural influences, failures, and formative moments.',
            personalExample: 'An individual repeatedly misses important family events because of unpredictable work demands.',
            businessExample: 'A founder observes that customer-support teams consistently lack answers to basic questions due to fragmented internal knowledge.',
          },
          {
            label: 'Values',
            tag: 'Roots',
            body: 'Values are the principles that crystallise from meaningful experiences. They represent what an individual or organisation considers non-negotiable when resources or pressure are limited.',
            personalExample: 'The individual above begins to value "Reliable Presence" with loved ones after noticing how schedule chaos eroded relationships.',
            businessExample: 'The founder adopts the value "Radical Transparency" in customer communication as a defining value after observing how hidden information damaged trust.',
          },
          {
            label: 'Vision',
            tag: 'Trunk',
            body: 'Vision is expressed as a clear statement beginning with "To be…", describing the desired identity that would result from consistently living the values.',
            personalExample: 'To be a consistent and present partner and parent while still contributing meaningfully in professional work.',
            businessExample: 'To be the industry benchmark for transparent, frictionless customer support.',
          },
          {
            label: 'Mission / Purpose',
            tag: 'Thickest Branch',
            body: 'Mission translates vision into overarching, time-bound goals that serve the vision.',
            personalExample: 'The individual commits to blocking two uninterrupted evenings per week with family for the 12 months, regardless of project deadlines.',
            businessExample: 'The company sets the explicit goal of achieving 95% first-contact resolution for customer queries within 12 months.',
          },
          {
            label: 'Strategy / Principles',
            tag: 'Branches',
            body: 'Strategy consists of decision-making pillars that guide choices toward the mission while remaining consistent with higher layers.',
            personalExample: 'The three principles are (1) Protect your boundaries (2) Pre-emptively plan events/meetings, and (3) Evaluate plans based on values',
            businessExample: 'The three principles are (1) Be transparent with the customer, (2) Aim for the most efficient resolution route, and (3) Flag knowledge and efficiency gaps regularly.',
          },
          {
            label: 'Tactics / Presence',
            tag: 'Finer Branches',
            body: 'Tactics are the repeatable daily actions and operational habits that enact the strategy in real time.',
            personalExample: 'Maintain a shared family calendar, check the calendar daily, conduct a weekly Sunday review of the coming week\'s commitments, and decline any request that violates a protected evening.',
            businessExample: 'Run daily stand-ups focused solely on unresolved queries, check the knowledge-gap status page once per week, incentivise and reward ongoing shared documentation, require every new sprint release to include self-service documentation and knowledge gap reductions.',
          },
          {
            label: 'Creations & Products',
            tag: 'Fruits',
            body: 'The fruits of your labour are the natural outcomes that emerge when all preceding layers remain aligned. They are what happens as a consequence of the chain working; the final outputs that create the meaningful value you intended to create.',
            personalExample: 'Stronger, more present relationships with family - the result of protected time honoured consistently over months. Trust deepens, conflict decreases, and the individual experiences an increased and sustained sense of fulfilment.',
            businessExample: 'Higher customer retention, improved satisfaction scores, and more efficient internal operations. The natural result of a team that shares transparent information, feels more confident, resolves issues on first contact, and retains more customers than before.',
          },
        ],
      },
      {
        kind: 'p',
        text: 'When each layer is explicitly articulated and connected to the one above it, both personal and organisational choices become traceable, defensible, and self-correcting. The framework therefore functions as a diagnostic tool: any sense of disconnection in output can be traced downward until the break in the chain is located.',
      },
      {
        kind: 'p',
        text: 'Trace backwards from the noise. The strategy you need is already implied by the vision you hold. The vision is implied by your values. The values by what you\'ve lived. For a company, the logic holds at every layer: when a product feels disconnected from the brand, the break is never at layer seven. Follow the chain down and you\'ll find it.',
      },
    ],
  },
  {
    id: 'thesis',
    num: '02',
    rail: 'Product Thesis',
    heading: 'The product implications',
    caption: 'When execution is cheap, judgment is the differentiator.',
    activeSteps: [0, 1, 2, 3, 4, 5, 6],
    blocks: [
      {
        kind: 'p',
        text: 'A roadmap is an ordered list of what to build next, and an order is only as defensible as the criterion that produced it. Left implicit, that criterion defaults to whatever is loudest: the largest customer, the newest competitor, the most recent escalation. The framework makes the criterion explicit. An item\'s priority is how directly it serves the layer above it - traced up through strategy and mission to the vision, values, and founding problem beneath them. A roadmap built this way can be defended by derivation rather than by authority, because each item carries the reason it exists.',
      },
      {
        kind: 'p',
        text: 'The same logic governs what to cut. Saying no to a feature stops being a political act and becomes a principled one: does this serve the mission? Does it align with the strategy? The answer is already implied by the layers below. And when something feels wrong; when a product drifts from its brand, when a team loses confidence in the roadmap, when priorities keep shifting - the break is rarely at the top. Follow the chain down and you\'ll find it. The Framework of Metacognition is, at its core, a diagnostic as much as a planning tool.',
      },
      {
        kind: 'p',
        text: 'The AI-Native Product Thesis is itself a worked example of this: it is structured and argued using the Framework of Metacognition, traced from a founding problem up to the product practice it proposes. If you want to see the chain applied end to end, read it next.',
      },
      {
        kind: 'p',
        text: 'Ultimately, T.S. Eliot\'s question of where wisdom is lost in knowledge, and knowledge in information, describes a failure of structure rather than a loss of capability. The framework resolves this entropy by reversing it: information filtered by intentionality becomes knowledge, and knowledge grounded in foundational values becomes wisdom. Whether applied to restore existential clarity for the individual or to defensibly govern product strategy for an organisation, the fulfillment of wisdom requires the discipline to define the root and build upward - more so than the acquisition of more data.',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Stratetree SVG                                                     */
/* ------------------------------------------------------------------ */

// Shared transition - spring-like ease-out so reveals feel organic
const SVG_T = 'opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1)';

function BranchGroup({
  active,
  glowPaths,
  crispPaths,
}: {
  active: boolean;
  glowPaths: React.ReactNode;
  crispPaths: React.ReactNode;
}) {
  return (
    <g style={{ opacity: active ? 1 : 0.08, transition: SVG_T }}>
      <g filter="url(#sd-glow)">{glowPaths}</g>
      {crispPaths}
    </g>
  );
}

function StratetreeSvg({ activeSet }: { activeSet: Set<number> }) {
  // TX is the trunk x-axis. Every branch is mirrored ±offset from TX so the
  // tree is horizontally symmetric. Labels sit to the right starting at LX.
  const TX = 80;
  const LX = 185;
  const Y  = [300, 258, 214, 168, 122, 74, 26] as const;
  // Half-widths of the trunk at each node level - tapers from wide base to thin crown
  const HW = [13,  11,  9.5,  8,  6.5,  5, 3.5] as const;

  const a = (i: number) => activeSet.has(i);

  // Trunk lights up continuously from the lowest to highest active node, even
  // when intermediate nodes (e.g. Mission in the personal section) are skipped.
  const activeArr = [...activeSet].sort((x, y) => x - y);
  const lo = activeArr.length ? activeArr[0] : -1;
  const hi = activeArr.length ? activeArr[activeArr.length - 1] : -1;

  return (
    <svg
      viewBox="0 0 280 324"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="sd-glow" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="trunk-grad" x1="0" y1={Y[0]} x2="0" y2={Y[6]} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#d8dee9" />
          <stop offset="30%"  stopColor="#c4b5fd" />
          <stop offset="60%"  stopColor="#a5b4fc" />
          <stop offset="100%" stopColor="#edf2f7" />
        </linearGradient>
        <linearGradient id="trunk-glow-grad" x1="0" y1={Y[0]} x2="0" y2={Y[6]} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(216,222,233,1)"  />
          <stop offset="30%"  stopColor="rgba(196,181,253,1)" />
          <stop offset="60%"  stopColor="rgba(165,180,252,1)" />
          <stop offset="100%" stopColor="rgba(237,242,247,1)"  />
        </linearGradient>
      </defs>

      {/* Ghost trunk - full tapered silhouette */}
      <path
        d={`M ${TX - 13},${Y[0]} L ${TX - 3.5},${Y[6]} L ${TX + 3.5},${Y[6]} L ${TX + 13},${Y[0]} Z`}
        fill="rgba(255,255,255,0.04)"
      />

      {/* Active trunk segments - wide tapered shape, silver-to-purple gradient */}
      {([0, 1, 2, 3, 4, 5] as const).map((i) => {
        const yb = Y[i], yt = Y[i + 1];
        const hwb = HW[i], hwt = HW[i + 1];
        const mid = (yb + yt) / 2;
        const d = `M ${TX - hwb},${yb} Q ${TX - hwb + 1},${mid} ${TX - hwt},${yt} L ${TX + hwt},${yt} Q ${TX + hwb - 1},${mid} ${TX + hwb},${yb} Z`;
        return (
          <g key={i} style={{ opacity: (i >= lo && i + 1 <= hi) ? 1 : 0, transition: SVG_T }}>
            <path d={d} fill="url(#trunk-glow-grad)" filter="url(#sd-glow)" opacity="0.45" />
            <path d={d} fill="url(#trunk-grad)" />
          </g>
        );
      })}

      {/* Sap flow - dashes travel upward along trunk when all nodes are active */}
      <path
        d={`M${TX},${Y[0]} L${TX},${Y[6]}`}
        stroke="rgba(165,180,252,0.5)"
        strokeWidth="2"
        strokeDasharray="4 8"
        strokeLinecap="round"
        style={{ opacity: activeSet.size === 7 ? 1 : 0, transition: 'opacity 1.8s' }}
      >
        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="0.9s" repeatCount="indefinite" />
      </path>

      {/* Backstory (0) - wide roots curving steeply downward */}
      <BranchGroup
        active={a(0)}
        glowPaths={<>
          <path d={`M${TX},${Y[0]} C${TX - 18},${Y[0]} ${TX - 52},${Y[0] + 14} ${TX - 68},${Y[0] + 24}`}
            stroke="rgba(196,181,253,0.46)" strokeWidth="3" strokeLinecap="round" />
          <path d={`M${TX},${Y[0]} C${TX + 18},${Y[0]} ${TX + 52},${Y[0] + 14} ${TX + 68},${Y[0] + 24}`}
            stroke="rgba(196,181,253,0.46)" strokeWidth="3" strokeLinecap="round" />
          <path d={`M${TX},${Y[0]} C${TX - 10},${Y[0] + 6} ${TX - 28},${Y[0] + 16} ${TX - 32},${Y[0] + 24}`}
            stroke="rgba(226,232,240,0.34)" strokeWidth="2.2" strokeLinecap="round" />
          <path d={`M${TX},${Y[0]} C${TX + 10},${Y[0] + 6} ${TX + 28},${Y[0] + 16} ${TX + 32},${Y[0] + 24}`}
            stroke="rgba(226,232,240,0.34)" strokeWidth="2.2" strokeLinecap="round" />
        </>}
        crispPaths={<>
          <path d={`M${TX},${Y[0]} C${TX - 18},${Y[0]} ${TX - 52},${Y[0] + 14} ${TX - 68},${Y[0] + 24}`}
            stroke="rgba(226,232,240,0.9)" strokeWidth="1.2" strokeLinecap="round">
            {a(0) && <animate attributeName="stroke-width" values="1.2;2.4;1.2" dur="2.6s" repeatCount="indefinite" />}
          </path>
          <path d={`M${TX},${Y[0]} C${TX + 18},${Y[0]} ${TX + 52},${Y[0] + 14} ${TX + 68},${Y[0] + 24}`}
            stroke="rgba(226,232,240,0.9)" strokeWidth="1.2" strokeLinecap="round">
            {a(0) && <animate attributeName="stroke-width" values="1.2;2.4;1.2" dur="2.6s" begin="0.3s" repeatCount="indefinite" />}
          </path>
          <path d={`M${TX},${Y[0]} C${TX - 10},${Y[0] + 6} ${TX - 28},${Y[0] + 16} ${TX - 32},${Y[0] + 24}`}
            stroke="rgba(196,181,253,0.72)" strokeWidth="0.9" strokeLinecap="round">
            {a(0) && <animate attributeName="stroke-width" values="0.9;1.8;0.9" dur="2.6s" begin="0.15s" repeatCount="indefinite" />}
          </path>
          <path d={`M${TX},${Y[0]} C${TX + 10},${Y[0] + 6} ${TX + 28},${Y[0] + 16} ${TX + 32},${Y[0] + 24}`}
            stroke="rgba(196,181,253,0.72)" strokeWidth="0.9" strokeLinecap="round">
            {a(0) && <animate attributeName="stroke-width" values="0.9;1.8;0.9" dur="2.6s" begin="0.45s" repeatCount="indefinite" />}
          </path>
        </>}
      />

      {/* Values (1) - secondary roots curving steeply downward */}
      <BranchGroup
        active={a(1)}
        glowPaths={<>
          <path d={`M${TX},${Y[1]} C${TX - 16},${Y[1]} ${TX - 46},${Y[1] + 14} ${TX - 52},${Y[1] + 24}`}
            stroke="rgba(120,140,255,0.45)" strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M${TX},${Y[1]} C${TX + 16},${Y[1]} ${TX + 46},${Y[1] + 14} ${TX + 52},${Y[1] + 24}`}
            stroke="rgba(120,140,255,0.45)" strokeWidth="2.8" strokeLinecap="round" />
        </>}
        crispPaths={<>
          <path d={`M${TX},${Y[1]} C${TX - 16},${Y[1]} ${TX - 46},${Y[1] + 14} ${TX - 52},${Y[1] + 24}`}
            stroke="rgba(175,192,255,0.86)" strokeWidth="1.05" strokeLinecap="round" />
          <path d={`M${TX},${Y[1]} C${TX + 16},${Y[1]} ${TX + 46},${Y[1] + 14} ${TX + 52},${Y[1] + 24}`}
            stroke="rgba(175,192,255,0.86)" strokeWidth="1.05" strokeLinecap="round" />
        </>}
      />

      {/* Vision (2) - pure trunk, no branches */}

      {/* Mission (3) - thickest upper branch, widest and most prominent */}
      <BranchGroup
        active={a(3)}
        glowPaths={<>
          <path d={`M${TX},${Y[3]} C${TX - 18},${Y[3]} ${TX - 60},${Y[3] - 20} ${TX - 68},${Y[3] - 32}`}
            stroke="rgba(175,190,255,0.65)" strokeWidth="5.5" strokeLinecap="round" />
          <path d={`M${TX},${Y[3]} C${TX + 18},${Y[3]} ${TX + 60},${Y[3] - 20} ${TX + 68},${Y[3] - 32}`}
            stroke="rgba(175,190,255,0.65)" strokeWidth="5.5" strokeLinecap="round" />
        </>}
        crispPaths={<>
          <path d={`M${TX},${Y[3]} C${TX - 18},${Y[3]} ${TX - 60},${Y[3] - 20} ${TX - 68},${Y[3] - 32}`}
            stroke="rgba(218,228,255,0.97)" strokeWidth="2.0" strokeLinecap="round" />
          <path d={`M${TX},${Y[3]} C${TX + 18},${Y[3]} ${TX + 60},${Y[3] - 20} ${TX + 68},${Y[3] - 32}`}
            stroke="rgba(218,228,255,0.97)" strokeWidth="2.0" strokeLinecap="round" />
        </>}
      />

      {/* Strategy (4) - curving steeply upward */}
      <BranchGroup
        active={a(4)}
        glowPaths={<>
          <path d={`M${TX},${Y[4]} C${TX - 16},${Y[4]} ${TX - 52},${Y[4] - 18} ${TX - 58},${Y[4] - 28}`}
            stroke="rgba(120,140,255,0.48)" strokeWidth="2.8" strokeLinecap="round" />
          <path d={`M${TX},${Y[4]} C${TX + 16},${Y[4]} ${TX + 52},${Y[4] - 18} ${TX + 58},${Y[4] - 28}`}
            stroke="rgba(120,140,255,0.48)" strokeWidth="2.8" strokeLinecap="round" />
        </>}
        crispPaths={<>
          <path d={`M${TX},${Y[4]} C${TX - 16},${Y[4]} ${TX - 52},${Y[4] - 18} ${TX - 58},${Y[4] - 28}`}
            stroke="rgba(185,200,255,0.90)" strokeWidth="1.1" strokeLinecap="round" />
          <path d={`M${TX},${Y[4]} C${TX + 16},${Y[4]} ${TX + 52},${Y[4] - 18} ${TX + 58},${Y[4] - 28}`}
            stroke="rgba(185,200,255,0.90)" strokeWidth="1.1" strokeLinecap="round" />
        </>}
      />

      {/* Tactics (5) - curving steeply upward */}
      <BranchGroup
        active={a(5)}
        glowPaths={<>
          <path d={`M${TX},${Y[5]} C${TX - 12},${Y[5]} ${TX - 40},${Y[5] - 16} ${TX - 46},${Y[5] - 24}`}
            stroke="rgba(120,140,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M${TX},${Y[5]} C${TX + 12},${Y[5]} ${TX + 40},${Y[5] - 16} ${TX + 46},${Y[5] - 24}`}
            stroke="rgba(120,140,255,0.45)" strokeWidth="2.5" strokeLinecap="round" />
        </>}
        crispPaths={<>
          <path d={`M${TX},${Y[5]} C${TX - 12},${Y[5]} ${TX - 40},${Y[5] - 16} ${TX - 46},${Y[5] - 24}`}
            stroke="rgba(185,200,255,0.90)" strokeWidth="1.0" strokeLinecap="round" />
          <path d={`M${TX},${Y[5]} C${TX + 12},${Y[5]} ${TX + 40},${Y[5] - 16} ${TX + 46},${Y[5] - 24}`}
            stroke="rgba(185,200,255,0.90)" strokeWidth="1.0" strokeLinecap="round" />
        </>}
      />

      {/* Products (6) — apple silhouette at the crown */}
      <BranchGroup
        active={a(6)}
        glowPaths={<>
          <path
            d={`M ${TX},${Y[6]} C ${TX-7},${Y[6]} ${TX-13},${Y[6]-4} ${TX-13},${Y[6]-10} C ${TX-13},${Y[6]-17} ${TX-8},${Y[6]-19} ${TX-4},${Y[6]-19} C ${TX-1},${Y[6]-19} ${TX},${Y[6]-16} ${TX},${Y[6]-15} C ${TX},${Y[6]-16} ${TX+1},${Y[6]-19} ${TX+4},${Y[6]-19} C ${TX+8},${Y[6]-19} ${TX+13},${Y[6]-17} ${TX+13},${Y[6]-10} C ${TX+13},${Y[6]-4} ${TX+7},${Y[6]} ${TX},${Y[6]} Z`}
            fill="rgba(220,215,255,0.45)"
          />
        </>}
        crispPaths={<>
          <path
            d={`M ${TX},${Y[6]} C ${TX-7},${Y[6]} ${TX-13},${Y[6]-4} ${TX-13},${Y[6]-10} C ${TX-13},${Y[6]-17} ${TX-8},${Y[6]-19} ${TX-4},${Y[6]-19} C ${TX-1},${Y[6]-19} ${TX},${Y[6]-16} ${TX},${Y[6]-15} C ${TX},${Y[6]-16} ${TX+1},${Y[6]-19} ${TX+4},${Y[6]-19} C ${TX+8},${Y[6]-19} ${TX+13},${Y[6]-17} ${TX+13},${Y[6]-10} C ${TX+13},${Y[6]-4} ${TX+7},${Y[6]} ${TX},${Y[6]} Z`}
            fill="rgba(235,232,255,0.09)" stroke="rgba(225,228,255,0.92)" strokeWidth="0.85"
          />
          <path
            d={`M ${TX},${Y[6]-15} C ${TX},${Y[6]-18} ${TX+2},${Y[6]-21} ${TX+3},${Y[6]-22}`}
            fill="none" stroke="rgba(160,215,130,0.72)" strokeWidth="0.85" strokeLinecap="round"
          />
          <path
            d={`M ${TX+1},${Y[6]-18} C ${TX+5},${Y[6]-21} ${TX+7},${Y[6]-20} ${TX+4},${Y[6]-17} C ${TX+2},${Y[6]-16} ${TX+1},${Y[6]-18} ${TX+1},${Y[6]-18} Z`}
            fill="rgba(140,210,110,0.28)" stroke="rgba(140,210,110,0.72)" strokeWidth="0.65"
          />
        </>}
      />

      {/* Fruit bloom — expanding ring radiating from apple center */}
      <g style={{ opacity: a(6) ? 1 : 0, transition: 'opacity 0.8s' }}>
        <circle cx={TX} cy={Y[6] - 10} r={8} fill="none" stroke="rgba(226,232,240,0.65)" strokeWidth="1.2">
          <animate attributeName="r" values="8;20;8" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.8;0;0.8" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Node dots — index 6 hidden; apple is the Products indicator */}
      {STEPS.map((step, i) => (
        <circle
          key={step.label}
          cx={TX}
          cy={Y[i]}
          r={i === 6 ? 0 : 3}
          fill={a(i) ? '#c4cffe' : 'rgba(255,255,255,0.2)'}
          style={{ transition: SVG_T }}
        />
      ))}

      {/* Falling particles - drift from upper branch tips when Tactics or Products active */}
      <g style={{ opacity: (a(5) || a(6)) ? 1 : 0, transition: 'opacity 1.2s' }}>
        <circle cx={TX - 46} cy={Y[5] - 24} r={1.2} fill="#a5b4fc">
          <animate attributeName="cy" from={Y[5] - 24} to={Y[5] + 16} dur="2.0s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.72;0.72;0" dur="2.0s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx={TX + 46} cy={Y[5] - 24} r={1.0} fill="#a5b4fc">
          <animate attributeName="cy" from={Y[5] - 24} to={Y[5] + 18} dur="2.3s" begin="0.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.58;0.58;0" dur="2.3s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        <circle cx={TX - 58} cy={Y[4] - 28} r={1.3} fill="#c4d4ff">
          <animate attributeName="cy" from={Y[4] - 28} to={Y[4] + 20} dur="1.85s" begin="1.0s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.62;0.62;0" dur="1.85s" begin="1.0s" repeatCount="indefinite" />
        </circle>
        <circle cx={TX + 58} cy={Y[4] - 28} r={1.0} fill="#a5b4fc">
          <animate attributeName="cy" from={Y[4] - 28} to={Y[4] + 22} dur="2.1s" begin="0.35s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.52;0.52;0" dur="2.1s" begin="0.35s" repeatCount="indefinite" />
        </circle>
        <circle cx={TX - 68} cy={Y[3] - 32} r={1.1} fill="#d4e0ff">
          <animate attributeName="cy" from={Y[3] - 32} to={Y[3] + 14} dur="2.45s" begin="1.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;0.48;0.48;0" dur="2.45s" begin="1.4s" repeatCount="indefinite" />
        </circle>
      </g>

      {/* Labels */}
      {STEPS.map((step, i) => (
        <g key={step.label} style={{ opacity: a(i) ? 1 : 0.2, transition: SVG_T }}>
          <text
            x={LX} y={Y[i] - 1}
            fontSize="9" fontWeight="600"
            fill="rgba(255,255,255,0.92)"
            fontFamily="system-ui,-apple-system,sans-serif"
            letterSpacing="0.02em"
          >
            {step.label}
          </text>
          <text
            x={LX} y={Y[i] + 10}
            fontSize="7"
            fill="rgba(165,180,252,0.82)"
            fontFamily="system-ui,-apple-system,sans-serif"
            letterSpacing="0.1em"
          >
            {step.tag.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Left rail                                                          */
/* ------------------------------------------------------------------ */

function MetacognitionRail({ activeIndex, activeSet }: { activeIndex: number; activeSet: Set<number> }) {
  const section = SECTIONS[activeIndex] ?? SECTIONS[0];

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

        {section.num ? (
          <div className="pointer-events-none absolute right-6 top-4 z-10 select-none font-body text-[7rem] font-black leading-none tracking-[-0.06em] text-white/[0.06]">
            {section.num}
          </div>
        ) : null}

        <div className="relative z-20 flex min-h-0 flex-1 flex-col p-5 md:p-6">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.24em] text-white/45">Metacognition</p>
            <p className="mt-1.5 text-lg font-semibold uppercase tracking-[0.06em] text-white">{section.rail}</p>
          </div>

          <div className="mt-4 min-h-0 flex-1">
            <StratetreeSvg activeSet={activeSet} />
          </div>

          <div className="shrink-0 pt-4">
            <p className="min-h-[2.5rem] text-xs leading-5 text-white/64">{section.caption}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SECTIONS.map((s, i) => {
                const isActive = i === activeIndex;
                return (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive ? 'w-7 bg-[#a5b4fc]' : 'w-3.5 bg-white/25'
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

/* ------------------------------------------------------------------ */
/*  Right panel blocks                                                  */
/* ------------------------------------------------------------------ */

function RenderBlocks({
  blocks,
  sectionId,
  onStepRef,
}: {
  blocks: Block[];
  sectionId?: string;
  onStepRef?: (stepIdx: number, el: HTMLElement | null) => void;
}) {
  const renderLinkedText = (text: string, keyPrefix: string) => {
    const pieces: (string | JSX.Element)[] = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length) {
      const next = METACOGNITION_LINKS
        .map((link) => ({ ...link, index: remaining.indexOf(link.phrase) }))
        .filter((match) => match.index >= 0)
        .sort((a, b) => a.index - b.index || b.phrase.length - a.phrase.length)[0];

      if (!next) {
        pieces.push(remaining);
        break;
      }

      if (next.index > 0) pieces.push(remaining.slice(0, next.index));

      pieces.push(
        <a
          key={`${keyPrefix}-${keyIndex}`}
          className="metacog-inline-link"
          href={next.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {next.phrase}
        </a>,
      );

      remaining = remaining.slice(next.index + next.phrase.length);
      keyIndex += 1;
    }

    return pieces;
  };

  const renderParagraphText = (text: string) => {
    if (!text.includes(CORE_QUESTIONS_LINE)) return renderLinkedText(text, 'paragraph-link');

    const [before, after] = text.split(CORE_QUESTIONS_LINE);
    const questions = CORE_QUESTIONS_LINE.split(' // ');

    return (
      <>
        {renderLinkedText(before.trimEnd(), 'core-before-link')}
        <span className="metacog-core-questions" aria-label={CORE_QUESTIONS_LINE}>
          {questions.map((question, questionIndex) => (
            <span key={question}>
              <strong>{question}</strong>
              {questionIndex < questions.length - 1 ? <span className="metacog-question-divider"> // </span> : null}
            </span>
          ))}
        </span>
        {renderLinkedText(after.trimStart(), 'core-after-link')}
      </>
    );
  };

  return (
    <div className="mt-4 space-y-4">
      {blocks.map((block, i) => {
        if (block.kind === 'p') {
          return (
            <p key={i} className="text-sm leading-7 text-text-primary/90 md:text-[0.95rem]">
              {renderParagraphText(block.text)}
            </p>
          );
        }
        if (block.kind === 'quote') {
          const quoteParagraphs = block.text.split('\n\n');
          return (
            <blockquote key={i} className="metacog-quote">
              {quoteParagraphs.map((paragraph, paragraphIndex) => (
                <p key={paragraph}>
                  {paragraphIndex === 0 ? '"' : ''}
                  {paragraph}
                  {paragraphIndex === quoteParagraphs.length - 1 ? '"' : ''}
                  {paragraphIndex === quoteParagraphs.length - 1 && block.cite ? (
                    <cite className="metacog-quote-cite"> - {block.cite}</cite>
                  ) : null}
                </p>
              ))}
            </blockquote>
          );
        }
        if (block.kind === 'steps') {
          return (
            <div key={i} className="metacog-steps">
              {block.items.map((step, stepIdx) => (
                <div
                  key={step.label}
                  className="metacog-step"
                  ref={onStepRef ? (el) => onStepRef(stepIdx, el) : undefined}
                >
                  <div className="metacog-step-head">
                    <span className="metacog-step-label">{step.label}</span>
                    <span className="metacog-step-tag">{step.tag}</span>
                  </div>
                  <p className="metacog-step-body">{step.body}</p>
                  {step.personalExample && (
                    <p className="mt-2.5 text-[0.78rem] leading-[1.65] text-text-primary/60">
                      <span className="mr-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-text-primary/35">Personal -</span>
                      {step.personalExample}
                    </p>
                  )}
                  {step.businessExample && (
                    <p className="mt-1.5 text-[0.78rem] leading-[1.65] text-text-primary/60">
                      <span className="mr-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-text-primary/35">Business -</span>
                      {step.businessExample}
                    </p>
                  )}
                </div>
              ))}
            </div>
          );
        }
        if (block.kind === 'chain') {
          return (
            <div key={i} className="metacog-consequence-chain">
              {block.items.map((item) => (
                <div key={item.label} className={`metacog-consequence${item.positive ? ' is-positive' : ''}`}>
                  <span className="metacog-consequence-label">{item.label}</span>
                  <p className="metacog-consequence-body">{item.consequence}</p>
                </div>
              ))}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Overlay                                                            */
/* ------------------------------------------------------------------ */

export function MetacognitionDeepDive({ onClose }: { onClose: () => void }) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  const stepRefs = useRef<Map<string, HTMLElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  // Scroll-driven active set - starts with all nodes lit for the opening overview
  const [activeSet, setActiveSet] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));
  // Grow-on-entry: overrides the scroll-driven set once when layers section first appears
  const grownRef = useRef(false);
  const [growOverride, setGrowOverride] = useState<Set<number> | null>(null);

  // Refs used inside the RAF callback to avoid stale-closure re-renders
  const prevActiveIndexRef = useRef(0);
  const prevActiveSetRef = useRef<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6]));

  const registerStepRef = useCallback((sectionId: string, stepIdx: number, el: HTMLElement | null) => {
    const key = `${sectionId}-${stepIdx}`;
    if (el) stepRefs.current.set(key, el);
    else stepRefs.current.delete(key);
  }, []);

  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;

    function compute() {
      const scroll = scrollRef.current;
      if (!scroll) return;

      const threshold = scroll.scrollTop + scroll.clientHeight * 0.35;

      // Determine which top-level section is active
      let best = 0;
      sectionRefs.current.forEach((el, i) => {
        if (el && el.offsetTop <= threshold) best = i;
      });

      const section = SECTIONS[best];
      const stepsBlock = section.blocks.find((b) => b.kind === 'steps');
      let newSet: Set<number>;

      if (stepsBlock && stepsBlock.kind === 'steps') {
        // Build active set progressively: check which step items have entered the top
        // 60% of the visible scroll area. Steps are ordered ground-to-crown, so the
        // tree lights up from roots upward as the reader moves through the list.
        const scrollRect = scroll.getBoundingClientRect();
        const viewThreshold = scrollRect.top + scrollRect.height * 0.60;

        newSet = new Set<number>();
        stepsBlock.items.forEach((_, stepIdx) => {
          const el = stepRefs.current.get(`${section.id}-${stepIdx}`);
          if (el && el.getBoundingClientRect().top <= viewThreshold) {
            newSet.add(section.activeSteps[stepIdx]);
          }
        });
        if (newSet.size === 0) newSet = new Set([section.activeSteps[0]]);
      } else {
        newSet = new Set(section.activeSteps);
      }

      // Only push to React state when something actually changed - avoids
      // redundant re-renders (and therefore redundant style resets) on every frame.
      const indexChanged = best !== prevActiveIndexRef.current;
      const prev = prevActiveSetRef.current;
      const setChanged =
        newSet.size !== prev.size || [...newSet].some((n) => !prev.has(n));

      if (indexChanged || setChanged) {
        prevActiveIndexRef.current = best;
        prevActiveSetRef.current = newSet;
        // React 18 auto-batches these two calls inside the RAF callback
        if (indexChanged) setActiveIndex(best);
        if (setChanged) setActiveSet(newSet);
      }
    }

    function handleScroll() {
      // Throttle to one update per animation frame to avoid layout thrashing
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(compute);
    }

    scroll.addEventListener('scroll', handleScroll, { passive: true });
    compute(); // run immediately for the initial render
    return () => {
      scroll.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Trigger sequential root-to-fruit grow when the layers section is first reached
  useEffect(() => {
    if (activeIndex === 1 && !grownRef.current) {
      grownRef.current = true;
      let i = 0;
      const step = () => {
        setGrowOverride(new Set(Array.from({ length: i + 1 }, (_, k) => k)));
        i++;
        if (i < 7) setTimeout(step, 160);
        else setTimeout(() => setGrowOverride(null), 700);
      };
      step();
    }
  }, [activeIndex]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      className="portfolio-deep-dive-overlay fixed inset-0 z-[220] overflow-y-auto px-3 py-3 text-text-primary sm:px-5 sm:py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <button
        type="button"
        aria-label="Close framework"
        className="portfolio-deep-dive-backdrop absolute inset-0 bg-bg/20 backdrop-blur-[3px]"
        onClick={onClose}
      />

      <motion.article className="portfolio-deep-dive-shell relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1320px] gap-4 lg:h-[calc(100svh-2.5rem)] lg:min-h-0 lg:grid-cols-[0.86fr_1.14fr] lg:overflow-hidden">
        <MetacognitionRail activeIndex={activeIndex} activeSet={growOverride ?? activeSet} />

        <div className="portfolio-deep-dive-reader-panel liquid-glass-strong flex flex-col rounded-[2rem] p-6 md:p-8 lg:min-h-0 lg:overflow-hidden">
          <div className="portfolio-deep-dive-header flex shrink-0 items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">How I think</p>
              <p className="mt-2 text-xs uppercase tracking-[0.22em] text-muted">// Framework of Metacognition</p>
            </div>
            <button type="button" aria-label="Close" onClick={onClose} className="portfolio-deep-dive-inline-close card-glass-attachment is-active">
              <span className="card-glass-attachment__glyph">
                <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
                <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
              </span>
            </button>
          </div>

          <div
            ref={scrollRef}
            className="project-deep-dive-scroll mt-7 pr-1 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-4"
          >
            <div className="grid gap-4">
              {SECTIONS.map((section, index) => {
                const isOpening = section.id === 'opening';
                const focusClass = index === activeIndex ? 'opacity-100' : 'opacity-[0.55]';
                const [firstBlock, ...restBlocks] = section.blocks;

                const stepRefCallback = (stepIdx: number, el: HTMLElement | null) =>
                  registerStepRef(section.id, stepIdx, el);

                if (isOpening) {
                  return (
                    <section
                      key={section.id}
                      ref={(node) => { sectionRefs.current[index] = node; }}
                      className={`scroll-mt-6 grid gap-4 transition-opacity duration-300 ${focusClass}`}
                    >
                      <div className="thesis-opening-hero rounded-[1.5rem] p-5 md:p-8">
                        <blockquote className="thesis-opening-quote">
                          <span className="font-display text-[clamp(1.3rem,2.4vw,1.9rem)] italic leading-[1.2] tracking-[-0.02em] text-text-primary">
                            {firstBlock?.kind === 'quote' ? `"${firstBlock.text}"` : null}
                          </span>
                        </blockquote>
                      </div>
                      <div className="liquid-glass rounded-[1.5rem] p-5 md:p-6">
                        <h2 className="max-w-2xl text-3xl font-semibold tracking-[-0.04em] text-text-primary md:text-5xl">
                          {section.heading}
                        </h2>
                        <RenderBlocks blocks={restBlocks} sectionId={section.id} onStepRef={stepRefCallback} />
                      </div>
                    </section>
                  );
                }

                return (
                  <section
                    key={section.id}
                    ref={(node) => { sectionRefs.current[index] = node; }}
                    className={`scroll-mt-6 liquid-glass rounded-[1.5rem] p-5 transition-opacity duration-300 md:p-6 ${focusClass}`}
                  >
                    <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-muted">{section.num}</p>
                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-text-primary md:text-2xl">
                      {section.heading}
                    </h2>
                    <RenderBlocks blocks={section.blocks} sectionId={section.id} onStepRef={stepRefCallback} />
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
