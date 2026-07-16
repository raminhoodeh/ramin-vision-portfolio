# 24Seven - Portfolio Write-up

---

## 1. Problem - What You Were Solving

I was approached by a small boutique concierge business that had already digitised its offering. Bookings for yachts, villas, and experiences across Ibiza and Marbella lived in a proper Shopify-based catalogue, browsable through their own iOS and Android apps. The infrastructure was there. But their actual clients, high-net-worth people used to being served rather than searching, were not engaging with it that way. They wanted to text. A WhatsApp message along the lines of "something in Marbella next week, sleeps ten, a yacht if you can" was how they naturally reached out, the same way they would speak to a real concierge.

The trouble was that a text thread alone could not do the job either. You cannot send someone ten property links over WhatsApp and call that a menu. Clients still needed to see what was actually available: photos, pricing, capacity, and the detail that turns "something in Marbella" into an actual decision. The business was stuck between two half-solutions: an app with a browsable catalogue nobody wanted to browse, and a chat channel clients loved that had no way of showing them anything.

What they wanted, and what I was brought in to build, was both at once: the ease of ordering by conversation, with a visual menu and cart sitting behind it. I took their existing app and codebase and put a Gemini Flash concierge engine inside it.

---

## 2. Architecture - How You Built It

### Model

The concierge is powered by Google Gemini 2.5 Flash, called in its native JSON output mode. I chose Flash because the app it was going into was already live and fast, and a booking chat that hesitates for a few seconds before replying breaks the feeling of speaking to a real concierge. JSON-native output mattered just as much as speed. Rather than parsing freeform text and hoping the model happened to mention the right product names, Gemini returns a structured object containing a message and a list of recommended product handles, which the app renders directly as a carousel of real catalogue items. A second, lighter call to Gemini 2.0 Flash handles smaller per-product booking messages, generating a contextual enquiry from a product's details and whatever dates the client picked.

### Context

The client's existing Shopify catalogue is the model's whole world. On every conversation, the full Storefront catalogue, up to 250 products across Ibiza, Marbella, and a growing Dubai selection, is pulled via a GraphQL query and compressed down to the essentials: handle, title, tags, shortened description, price, and collection. That compressed catalogue, plus the running chat history serialised as plain text, is sent to Gemini on every turn. I deliberately fed the model the entire catalogue rather than retrieving a filtered subset, because a client's request rarely fits one clean category. Someone asking for a yacht in Ibiza and a villa in Marbella the same week needs the model reasoning across the whole inventory at once, not a narrowed slice of it.

### Orchestration

Underneath the chat, the app still runs on the client's existing Expo and React Native codebase, so the orchestration work was about wiring a new AI layer into an app that already worked, not starting over. A conversation runs through Gemini for planning and product linking, and once a client is ready, a second Gemini call condenses the whole conversation into a clean, readable booking brief. That brief becomes the payload for a WhatsApp deep link straight to the human concierge's number. Chat state lives in a small local store persisted on the device, so a client can close the app mid-planning and pick the conversation back up later without losing anything. For the Dubai expansion, which needed to launch ahead of full Shopify onboarding, I built a mock data layer that clones the existing Ibiza collections and relabels them, so Dubai could exist as a real, browsable destination in the app immediately, even though the AI concierge itself cannot yet see or recommend Dubai inventory until it is properly onboarded into Shopify.

### Governance

Because the model is speaking on behalf of a real concierge business to real paying clients, the prompt carries hard constraints rather than suggestions. It is told explicitly never to reference a product that is not in the catalogue it was given, and to always return valid JSON with nothing else wrapped around it. There is also strict prompting to keep a reserved and professional tone and avoid emojis entirely. There is no server-side session either; the entire conversational memory is just the serialised history block sent with each call. That keeps the app simple, but it also means the model's discipline in following those prompt constraints is the only thing standing between a client and a hallucinated product.

### Human

The AI never gets to close a sale. Every planning conversation ends the same way: a confirm booking on WhatsApp button that hands the finished brief to a real concierge agent's WhatsApp number. That was a deliberate line I drew early on, given who the client is. A high-net-worth guest booking a yacht in Ibiza is not looking for a chatbot to confirm their trip; they are looking for the same white-glove service they would get from a phone call, just reached through a faster front door. The AI's job is to make that front door effortless. Closing the booking stays human.

---

## 3. Why This Approach - Your Reasoning

The client did not need a new app, and they definitely did not need me to convince their clients to start browsing a catalogue they had already shown no interest in browsing. The obvious move given the problem, high-net-worth guests who wanted to text rather than search, was to meet them inside the chat channel they were already using, and let the model do the work of turning a loose WhatsApp-style request into a visual, bookable answer. That is why the concierge is a layer inside their existing app rather than a separate product: the catalogue, the booking flow, and the brand were already right. What was missing was a way to talk to it.

The next real decision was how the model should see the catalogue. The obvious alternative was a standard RAG setup: embed the products, retrieve the top few matches by similarity, and only show those to the model. I ruled this out on purpose. At 250 products, the catalogue is small enough that injecting the whole thing costs far less than standing up a vector database, and it avoids a specific failure mode that matters a lot for this client's guests: someone asking for "a yacht in Ibiza and a villa in Marbella the same week" needs the model reasoning across the entire inventory at once, not just whatever narrow slice a similarity search happened to retrieve. Full injection was the boring choice, but it was the one that could not quietly miss half of a compound request.

The last decision was to make Gemini return structured JSON rather than a normal chat reply. A concierge chat that is just freeform text still leaves someone squinting at a wall of prose trying to picture a yacht. Forcing the model to return a message plus a list of exact product handles meant the app could always render real, clickable product cards from the response, not a hopeful guess at parsing them out of a paragraph. It also made failure visible: if the JSON does not parse, that is a loud, catchable error instead of a silent mismatch between what the model said and what got shown to a paying client.

---

## 4. Tradeoffs - What You Gave Up

The first tradeoff was catalog injection over a leaner retrieval step, and it is the right call for where the product is today. Sending Gemini the entire compressed catalogue on every message means the AI Concierge can reason across every restaurant, villa, car, and private jet in the inventory at once, rather than guessing which slice of the catalogue a request falls into. At a few hundred products, that is a real advantage: a compound request like a villa and a yacht in the same week gets answered properly instead of half-missed. It is a choice that will need revisiting once the catalogue grows past roughly 500 products, but for a catalogue this size, full injection is simpler to reason about and more reliable than a retrieval layer built before it is actually needed.

Second, I chose not to give the concierge any server-side memory, which is the right shape for a single-session planning tool bolted onto an existing app. Chat history is serialised on the client and replayed with every call, so a member can close the app mid-plan and reopen it exactly where they left off, with no backend to build or maintain. That is the right trade for getting this feature live fast and keeping it cheap to run. The absence of a stored history only becomes a real cost once the business wants to study what members are asking for over time, and that is a problem worth solving once there is a track record to learn from, not before.

Third, I shipped without a formal evaluation suite behind the AI Concierge, and that was the right call for getting a first version of this feature in front of real clients quickly. The prompt instructs Gemini never to reference a product outside the real catalogue, and enforcing that through instruction alone was fast to build and good enough to prove clients actually wanted a chat-based ordering experience before investing in test infrastructure. Building an eval suite before knowing whether the feature would be used would have been effort spent in the wrong place. It is the right next investment now that itineraries are being generated for real, paying clients, not a gap that should have been closed on day one.

---

## 5. Demo - A Live, Clickable URL

**App Store:** [24Seven Concierge on the App Store](https://apps.apple.com/us/app/24seven-concierge/id6663954162)

Live on the App Store. Browse the catalogue, and use the AI Concierge bar at the bottom of every screen to create your itinerary.

---

## 6. What I Would Improve - Honest Self-Assessment

The most concrete next investment is the evaluation suite the tradeoffs above deferred, now that there is real usage to justify building it. Today the only signal that Gemini is performing well is human observation, with no automated coverage of the failure modes that actually matter: a hallucinated product that is not in the catalogue, an itinerary that quietly misses a date conflict, or a malformed response when the catalogue JSON runs long. The plan is a suite of roughly 30 to 50 test cases split across three failure types: out-of-catalog references, multi-destination constraint satisfaction, and graceful handling when Gemini returns invalid JSON despite the structured-output instruction.

The second improvement is closing the gap at the end of the WhatsApp handoff. Every AI-generated itinerary currently ends the same way: a message to a human agent, with no async slot reservation, no price lock, and no structured booking intake beyond free text. A member who finishes planning at 2am gets no acknowledgment until a human reads WhatsApp the next morning. A Shopify checkout integration that can at minimum capture a structured hold or enquiry against specific product variants would turn that final step into an actual booking record instead of a prose message.
