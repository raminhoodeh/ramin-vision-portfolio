const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink,
  AlignmentType, LevelFormat, BorderStyle, TabStopType, TabStopPosition,
} = require("docx");

// ---------- style constants ----------
const FONT = "Calibri";
const C_ACCENT = "1F3864"; // deep navy
const C_MUTED = "595959";
const BODY = 18;   // 9pt
const SMALL = 16;  // 8pt

const t = (text, opts = {}) => new TextRun({ text, font: FONT, size: BODY, ...opts });
const link = (text, url, opts = {}) =>
  new ExternalHyperlink({ link: url, children: [new TextRun({ text, style: "Hyperlink", font: FONT, size: BODY, ...opts })] });

const heading = (text) =>
  new Paragraph({
    spacing: { before: 150, after: 50 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C_ACCENT, space: 1 } },
    children: [t(text, { bold: true, size: 19, color: C_ACCENT })],
  });

const roleHeader = (left, right) =>
  new Paragraph({
    spacing: { before: 80, after: 12 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [...left, new TextRun({ text: "\t" }), t(right, { italics: true, size: 17, color: C_MUTED })],
  });

const bullet = (children, opts = {}) =>
  new Paragraph({
    numbering: { reference: "b", level: opts.level || 0 },
    spacing: { after: opts.after != null ? opts.after : 22 },
    children,
  });

// Stack line: bold "Stack:" label + bold tool names, normal descriptors, " · " separated.
// item forms: "Tool" (bold) | ["Tool", " descriptor"] (bold + normal) | ["", "concept"] (normal only)
const sk = (text, bold) => new TextRun({ font: FONT, size: SMALL, bold: !!bold, text });
const stack = (items) => {
  const out = [sk("  "), sk("Stack: ", true)];
  items.forEach((it, i) => {
    if (i) out.push(sk(" · "));
    if (Array.isArray(it)) {
      if (it[0]) out.push(sk(it[0], true));
      if (it[1]) out.push(sk(it[1]));
    } else {
      out.push(sk(it, true));
    }
  });
  return out;
};

const project = (name, quote, desc, stackRuns) => {
  const runs = [t(name + " ", { bold: true }), t("— ")];
  if (quote) runs.push(t("“" + quote + "” ", { italics: true }));
  runs.push(t(desc));
  if (stackRuns) runs.push(...stackRuns);
  return bullet(runs, { after: 26 });
};

const qual = (title, org, year) =>
  new Paragraph({
    spacing: { after: 6 },
    tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
    children: [t(title, { bold: true }), t("  –  " + org), new TextRun({ text: "\t" }), t(year, { italics: true, size: 17, color: C_MUTED })],
  });

// ---------- document ----------
const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: BODY } } } },
  numbering: {
    config: [
      {
        reference: "b",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 230, hanging: 170 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 520, hanging: 170 } } } },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 560, right: 700, bottom: 560, left: 700 } },
      },
      children: [
        // ---------- HEADER ----------
        new Paragraph({ spacing: { after: 8 }, alignment: AlignmentType.CENTER,
          children: [t("RAMIN TOM HOODEH", { bold: true, size: 30, color: C_ACCENT })] }),
        new Paragraph({ spacing: { after: 26 }, alignment: AlignmentType.CENTER,
          children: [t("Senior Product Manager  |  AI Builder  |  Fiction Author", { size: 19, color: C_MUTED })] }),
        new Paragraph({ spacing: { after: 16 }, alignment: AlignmentType.CENTER,
          children: [
            link("raminhoodeh@gmail.com", "mailto:raminhoodeh@gmail.com"),
            t("  |  +44 7928 291399  |  "),
            link("LinkedIn", "http://bit.ly/raminlinkedin"), t("  |  "),
            link("Portfolio", "http://www.ramin.vision/"), t("  |  "),
            link("GitHub", "https://github.com/raminhoodeh"),
          ] }),

        // ---------- SUMMARY (added) ----------
        new Paragraph({ spacing: { after: 6 }, alignment: AlignmentType.CENTER,
          children: [t("Consumer-focused AI Product Manager who turns frontier model capability into intuitive, beautifully crafted products — with AI safety and human-in-the-loop judgement built in. Six AI products shipped end-to-end on a shared platform of my own.", { italics: true }) ] }),

        // ---------- SPEAKING / TEACHING / WRITING ----------
        heading("Speaking, Teaching & Writing"),
        new Paragraph({ spacing: { after: 18 }, children: [
          link("TEDx Talk", "http://bit.ly/ramintedx"), t("  ·  Best-selling courses: "),
          link("Product Innovation Process", "https://www.udemy.com/course/the-fastest-way-to-become-a-product-manager"), t(" and "),
          link("AI-Native Product OS", "https://maven.com/raminhoodeh/ai-product"), t("  ·  "),
          link("Fiction Book", "https://www.amazon.co.uk/Purpose-Ramin-Hoodeh/dp/1527286185"),
        ] }),

        // ---------- QUALIFICATIONS ----------
        heading("Qualifications"),
        qual("AI Engineering Professional Certificate", "IBM", "2026"),
        qual("Professional Machine Learning Engineer", "Google AI School", "2026"),
        qual("Generative AI Leader Certification", "Google AI School", "2026"),
        qual("MCP Protocols: Advanced Topics", "Anthropic Academy", "2026"),
        qual("Leadership Development Programme", "MBTI", "2024"),
        qual("MSc Environmental Technology with Distinction", "Imperial College London", "2017"),
        qual("BA Business & Marketing, 1st Class Honours", "University of Northampton", "2016"),

        // ---------- PERSONAL PROJECTS ----------
        heading("Personal Projects"),
        new Paragraph({ spacing: { after: 12 }, children: [
          t("Builder of AI-Powered iOS, Android & Web Apps and Tools — ", { bold: true }),
          t("all designed, architected, and shipped from the ground up (model selection, context/RAG, orchestration, governance, and UX).", { italics: true }),
        ] }),
        new Paragraph({ spacing: { after: 5 }, children: [t("Apps", { bold: true, color: C_ACCENT })] }),
        project("Qadam", "a hedge fund that lives in your laptop.",
          "A local-first macro fund that catches catalyst-driven trades before consensus. Five live intelligence pipelines (conflict, physical/OSINT, macro, market, narrative) feed a Python orchestrator: a local LLM filters the noise, a frontier LLM builds and challenges each strategy, and a weekly quantum-classical oracle stress-tests it (informs, never overrides). It autonomously submits paper trades only when a 6-stage filter and a hard Risk Agent gate pass; live capital is disabled, with five fund managers overseeing from a read-only cockpit.",
          stack(["Python", ["Local LLM", " (filter)"], ["Frontier LLM", " (strategy)"], "IBM Quantum", "Risk Agent", ["", "append-only event log"]])),
        project("nsso", "the CV of the future.",
          "Your links, bio, résumé, portfolio and personal shop — your whole digital identity in one page. An AI chatbot interviews you, builds your profile for you, then uses that profile context plus its own knowledge base to recommend your next actions.",
          stack([["Gemini", " embeddings"], "RAG", "Supabase / pgvector", ["", "tool calling"]])),
        project("Dreamsea", "your subconscious, decoded.",
          "Speak a dream and get back AI transcription, narration, interpretation, symbols and affirmations — grounded in a custom dream-interpretation corpus built in partnership with dream psychologists, not generic model guesswork.",
          stack([["Gemini", " transcription / interpretation / image-gen"], ["", "expert-owned CMS"], "iOS"])),
        project("24Seven Concierge", "a five-star concierge in your pocket.",
          "Chat to assemble a luxury trip from live services; the agent reasons over a full Shopify catalog, then summarises your checkout into an itinerary handed to a human concierge on WhatsApp to fulfil.",
          stack([["Gemini 2.5 Flash", " planning"], ["Gemini 2.0 Flash", " drafting"], "Shopify", "WhatsApp", "iOS"])),
        project("RazinFlix", "turned my watchlist into a social recommendations visualiser.",
          "A streaming-style film/TV canon with AI-enriched, cleaned-up metadata and an opinionated aesthetic taxonomy that overrides generic genres; password-gated to add titles.",
          stack(["TMDB", "IMDb", ["Google Cloud Vision API", " (artwork & name matching)"], "YouTube Data API", ["Gemini", " enrichment"], "Supabase"])),
        new Paragraph({ spacing: { before: 36, after: 5 }, children: [t("Tools powering the above", { bold: true, color: C_ACCENT })] }),
        project("Mass Social Wisdom Agent", "turn the scroll into a second brain.",
          "Dump a bulk list of social URLs (video or image, any platform) and it returns a topic-organised document; that distilled wisdom feeds my Unified RAG Pipeline and my own Notion second brain.",
          stack([["Gemini 2.5 Flash", " OCR / composition / quality scoring"], ["Python", " (7-stage pipeline)"], "Notion", ["", "DOCX export"]])),
        project("Unified RAG Pipeline", "one memory, every product.",
          "Rather than rebuild retrieval per app, one ingestion-to-retrieval layer they all share: chunking, embedding and vector storage with per-product namespaces. Add a source once; every product can use it.",
          stack([["Gemini", " embeddings"], "Supabase / pgvector", ["", "shared ingestion layer"]])),
        project("AI Costs Dashboard", "mission control for AI spend.",
          "A single control plane for API, model and tooling spend across every product; normalises cost across providers into one cost-per-feature view, so I route each task to the cheapest model that still passes its eval.",
          stack([["Multi-model", " cost normalisation"], ["", "per-product budgets & alerts"]])),

        // ---------- PRODUCT EXPERIENCE ----------
        heading("Product Experience"),

        roleHeader([link("Bayut", "https://www.bayut.com/", { bold: true }), t("  —  AI Product Manager", { bold: true })], "Jan 2026 – Present"),
        bullet([t("Confidential AI-native features in property search, recommendations, and conversational AI — built on model selection, eval suite design, guardrail implementation, and MCP integration. Implemented my AI-Native Product OS as a standard framework across the wider Product team.")]),

        roleHeader([link("Side.inc", "https://www.side.inc/", { bold: true }), t("  —  Senior Product Manager; ERP", { bold: true })], "Mar 2025 – Aug 2025"),
        new Paragraph({ spacing: { after: 8 }, indent: { left: 230 }, children: [t("[Made redundant due to clients replacing Side.inc’s human actor voices with AI replicas]", { italics: true, size: SMALL, color: C_MUTED })] }),
        bullet([t("Replaced multiple internal ERP products with AI-coded in-house alternatives, reducing ERP operational costs by 20% over 4 months and decreasing idea-to-feature time by 90% for internal process improvement.")]),
        bullet([t("Global company-wide point of contact for employees to explore and request new AI or automation tools across the organisation. Integrated:")], { after: 6 }),
        bullet([t("AI coding copilot Windsurf, shifting engineering resources from 60% Maintenance / 40% Innovation to 40% Maintenance / 60% Innovation.")], { level: 1, after: 6 }),
        bullet([t("Microsoft Enterprise Copilot with the core ERP, unifying siloed data across Finance, Operations and Sales — eliminating 30% of manual reporting overhead and giving leadership real-time, cross-functional insight for faster strategic decisions.")], { level: 1 }),

        roleHeader([link("Perkbox Vivup", "https://vivupbenefits.co.uk/", { bold: true }), t("  —  Senior Product Manager", { bold: true })], "Jan 2023 – Nov 2024"),
        bullet([t("Analysed qualitative user interview data to ideate and streamline the gateway UX of the Vivup App, increasing the Google Play Store rating by 0.6 and iPhone App Store rating by 1.2 within 3 months.")]),
        bullet([t("Introduced monetisation to an existing feature by capturing a margin of user savings, maintaining user satisfaction and growing the product’s customer lifetime value by 19% over 5 months.")]),
        bullet([t("Aligned stakeholders on a new unified Order Guidance user journey across multiple products, decreasing order-form and checkout abandonment rate by a third within the first month of delivery.")]),

        roleHeader([link("GroupM", "https://www.groupm.com/", { bold: true }), t("  —  Product Manager, Global Innovation Group", { bold: true })], "Jan 2022 – Dec 2022"),
        bullet([
          t("Implemented my "),
          link("Product Innovation Process", "https://www.ramin.vision/product.html"),
          t(" to help manage the product division of GroupM’s Global Innovation Group, mentoring junior PMs and engineers in product strategy and user-centric mindsets."),
        ]),
        bullet([
          t("Translated EY’s carbon-emissions methodology (300+ dataset variables) into product specifications for a "),
          link("Carbon Calculator", "https://www.mi-3.com.au/20-07-2022/carbon-footprint-different-media-distribution-options-will-increasingly-influence-where"),
          t(" — still the most widely used calculator in the media sector, measuring the environmental impact of £1bn+ of media investment in 2022."),
        ]),

        roleHeader([link("Cox Automotive", "https://www.coxautomotive.com/", { bold: true }), t("  —  Product Owner; Auction Platform [Contract]", { bold: true })], "Sept 2021 – Dec 2021"),
        bullet([
          t("Created and rolled out a "),
          link("Feature Scoring Framework", "https://www.ramin.vision/decision"),
          t(" to prioritise a large backlog of features on a new "),
          link("auction product", "https://www.manheim-express.eu/"),
          t(" for car manufacturers, halving stakeholder feedback cycles and producing a more user-centric roadmap."),
        ]),

        roleHeader([link("Ordnance Survey", "https://www.ordnancesurvey.co.uk/", { bold: true }), t("  —  Product Manager; Geospatial API", { bold: true })], "Dec 2020 – Sept 2021"),
        bullet([t("Led 12 discovery workshops with my Propositions & Innovation team and client stakeholders to discover sustainability applications of geospatial data, securing senior buy-in and validating 3 product concepts for further investment.")]),
        bullet([
          t("Defined and launched the first "),
          link("geospatial API", "https://docs.microsoft.com/en-gb/connectors/ordnancesurveyplaces/"),
          t(" on Microsoft’s Power Platform, improving energy clients’ ability to forecast carbon impacts on asset valuations by 25% within 6 months and increasing geospatial data utilisation by 30% across 2 key accounts by Q3 2021."),
        ]),

        roleHeader([link("Urgentem", "http://bit.ly/urgentemwebsite", { bold: true }), t("  —  Product Manager; Climate Data Platform", { bold: true })], "Oct 2019 – Nov 2020"),
        bullet([
          t("Co-managed the development and start-up launch of financial climate-risk analytics platform Element6, contributing to a 20% reduction in climate-related risk across client portfolios totalling £900m AUM — since featured in the "),
          link("Financial Times", "https://www.ft.com/content/7b734848-1287-4106-b866-7d07bc9d7eb8"), t("."),
        ]),
        bullet([t("Led a cross-regional SCRUM team of carbon-data analysts, developers and UX designers, prioritising UX improvements from qualitative client feedback — improving demo-to-buy conversion by 30% over 4 months and reducing quarterly churn by 25%.")]),
        bullet([t("Set up Google Analytics to measure feature uptake and cut 3 under-utilised features, raising the story-point-to-usage ratio by 25% over 8 months.")]),

        roleHeader([link("Deity AI", "http://www.deityai.org/", { bold: true }), t("  —  Product Manager; Chatbot", { bold: true })], "Jul 2017 – Oct 2019"),
        bullet([
          t("Ideated and implemented an AI "),
          link("“conversation mediator” chatbot", "https://drive.google.com/file/d/19Ln-UWxReuAFTFdDc4JBZHdDxzeBPmwt/view?usp=sharing"),
          t(" into a consumer dating app that improved chat retention rate by over 50% in its first 3 months of release."),
        ]),

        roleHeader([link("ERM", "http://www.erm.com/", { bold: true }), t("  —  Product Stewardship Consultant", { bold: true })], "Dec 2018 – Oct 2019"),
        bullet([
          t("Co-authored a "),
          link("research paper", "https://ec.europa.eu/research/participants/documents/downloadPublic?documentIds=080166e5c80d5f80&appId=PPGMS"),
          t(" published by the European Commission on lifecycle assessment of double-sided solar panels. Identified satellite-data use cases to detect copper mines at risk of leaking waste into waterways, improving partner RepRisk’s product revenue by 10% over 6 months."),
        ]),

        roleHeader([link("Tesla", "http://bit.ly/teslaramin", { bold: true }), t("  —  Senior Product Specialist [promoted from Product Specialist]", { bold: true })], "Apr 2017 – Sept 2018"),
        bullet([t("Ideated and initiated a Tesla / SpaceX marketing campaign through direct communication with the CEO, more than doubling attendance of Owners Orientation events in Q1–Q3 2018.")]),
        bullet([t("Averaged a consistent 120% of my Tesla Model S sales target from Q3 2017 to Q2 2018, and sold the first Tesla Powerwall to a residential customer in the UK.")]),

        // ---------- SKILLS ----------
        heading("Skills & Tools"),
        new Paragraph({ spacing: { after: 8 }, children: [
          t("AI Product: ", { bold: true }),
          t("LLM model selection & routing · prompt & system-prompt design · context-layer architecture (RAG, memory, MCP) · eval-suite design & continuous evaluation · guardrails & AI safety (input/output classifiers, refusal layers) · observability & tracing · fallback & failure-mode design · agent orchestration & workflow automation · rapid AI prototyping · plain-English data querying via MCP · AI-Native Loop (Talk → Decide → Build → Observe → Iterate)."),
        ] }),
        new Paragraph({ spacing: { after: 8 }, children: [
          t("Product: ", { bold: true }),
          t("product taste & judgement · UX wireframing · data analytics · roadmapping · feature prioritisation · user research · A/B & user-acceptance testing · agile & lean delivery · spec & scope documentation · user-story writing · ESG regulation · B2B & B2C sales."),
        ] }),
        new Paragraph({ spacing: { after: 4 }, children: [
          t("Tools: ", { bold: true }),
          t("Jira · Asana · Monday · Azure DevOps · GitHub · Figma · Adobe XD · Google Analytics & Firebase · Miro · Typeform. "),
          link("Full list of my favourite AI tools", "https://docs.google.com/document/d/1jrt7pojR8eUTcejwCDPQUHIFRpvWcOCLGoBy01Lh3Qk/edit?usp=sharing"),
        ] }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const out = "/Users/raminhoodeh/Downloads/Ramin Hoodeh CV 2026.docx";
  fs.writeFileSync(out, buffer);
  console.log("WROTE: " + out);
});
