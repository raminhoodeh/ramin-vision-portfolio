# Dreamsea - Portfolio Write-up

## Problem

Dreamsea started in my partner's therapy room. She is a psychotherapist, and clients would often come to sessions wanting her help with dreams. There was real demand for the way she interpreted them. But the dream itself was usually half gone by the time they arrived. They could remember the feeling. Maybe one image. A room, a person, a threat, a colour. But the order, the texture, and the small strange details that make a dream worth reading were often lost.

That was the product problem. The broken version was a client waking up with something vivid, reaching for a notes app, writing two stiff lines in the dark, then trying to reconstruct the rest days later in therapy. The moment had already passed. Dreamsea was my attempt to catch the dream closer to the source, then democratise my partner's interpretation to a wider audience of those who can benefit from it.

## Architecture

### Model

Dreamsea uses Gemini Flash 3.5 for audio understanding and text generation. The first model task is transcription. The user records a dream as audio, and that audio is sent into Gemini as audio input. In addition to speech to text, there is a text to speech flow later in the app, when the iOS app can read an interpretation aloud with Apple's built-in speech tools.

I chose Gemini Flash 3.5 because the product lives in a fragile moment. Someone has just woken up. They might be groggy. They might only remember the dream for another minute. The model needed to handle spoken audio, produce a transcript, and move into interpretation without making the app feel heavy. After transcription, the same model family supports title generation, subtitle generation, symbolic readings, symbol extraction, monthly themes, and affirmations.

For imagery, Dreamsea uses Nano Banana, Gemini 2.5 Flash Image in the current codebase. That model turns the dream transcript into a watercolour-style image using a custom master prompt. I chose watercolour because dreams rarely feel photographic. They blur and carry mood more than clean scene data.

Apple AVFoundation is also part of the model input layer. Gemini itself does not record the dream. The app uses AVFoundation to request microphone access, capture the dream as a local .m4a file, and enforce the recording limit. Then that saved audio file is handed to Gemini for transcription. The handoff is simple: Apple captures the raw dream reliably on device; Gemini turns it into text, meaning, symbols, and image.

### Context

Dreamsea's context layer has two main sources. The first is the user's recorded dream. The user speaks the dream into the app as soon as they wake up. That recording becomes the source material. The app turns it into a transcript, then uses that transcript as the base for every title, interpretation, symbol, image, theme, and later regeneration.

The second is the Dream Wiki. This is the part that makes the system much more interesting. I built a CMS so my partner could update the interpretive material herself, without editing Swift code or asking me to ship a new build. She can update the Dream Wiki and the prompts that guide the model.

That means the app is not frozen around a prompt I wrote once. It can keep absorbing her method. The Dream Wiki is used in two places. Users can read it in a dedicated Learn section, where it explains each dream tradition. The model also receives it as context when it writes an interpretation. If the app is generating a Jungian interpretation, it injects the Jungian wiki material. If it is generating a Persian interpretation, it injects the Persian material. The same pattern applies to Egyptian and Japanese.

This keeps the user-facing education and the AI context in sync. The thing the user reads is the same body of knowledge shaping the model response. There is less drift between product, content, and AI behaviour.

### Orchestration

The orchestration layer is what turns Dreamsea from a prompt into a product. When someone records a dream, the app saves the audio locally, creates a dream record, queues the work, transcribes the audio, generates a title, writes a subtitle, creates each interpretation, saves each result, then adds symbols and imagery.

The user does not manage any of that. They press record, speak, and leave. The app does the slow work behind the scenes. This was a real product challenge because AI fails in boring ways. A model call can time out. The phone can lock. The app can close. Image generation can fail even when the interpretation worked. Early versions could leave a dream stuck in an endless loading state, which felt especially bad because the user had given the app something personal.

So I built the flow around states. A dream can be pending, partly complete, failed, or complete. Each step is saved as it finishes. If the app reopens and finds unfinished dreams, it resumes them. The Library shows progress instead of vague waiting. The dream detail page lets users regenerate after editing the transcript. The merge flow can combine multiple recordings from the same night into one longer dream and run the interpretation again from the merged transcript. That is the difference between an AI demo and an app someone can rely on in the middle of the night.

### Governance

Dreams are not normal user content.

They can include very personal things the person does not fully understand yet. So Dreamsea treats the dream record as sensitive from the start. This is why the app is local-first. Audio recordings and dream records are stored on the device. The privacy policy is written around no account data collection, local device storage, third-party AI processing for the immediate interpretation, and user control over deletion. The product avoids social sharing in the first version because sharing changes what people are willing to say.

There is also a clinical boundary. Dreamsea can help someone capture and reflect on dream material. It can make my partner's interpretive style more available. But it should not pretend to be a psychotherapist. It should not diagnose, and it should not take over the role of a therapy session.

The next serious governance layer is evaluation. I would want a test set of real-style dream examples covering short dreams, fragmented dreams, traumatic dreams, religious dreams, mundane dreams, and dreams where the safest output is restraint. The app would be scored for specificity, emotional safety, invention, tone, and whether each tradition adds something supportive and healthy for the user.

### Human

The human layer is me and my partner, who collaborated on the app's design. My job was to take a real pattern from my partner's work and turn it into an app that could provide thoughtful and balanced support outside the therapy room. That meant asking product questions that are easy to skip if you only think in models:

What happens in the first minute after waking? What should be captured as audio? What should be stored? What context should the model receive? How can my partner keep changing the knowledge base herself? When should the app feel poetic? When should it be quiet? What happens when the model fails, and what should never be automated?

What Dreamsea had to solve was a memory problem and a trust problem. Dreams are among the most private experiences a person has, and they disappear fast. Most are half gone before your feet hit the floor. The people who bring their dreams into therapy are already working against that clock. By the time they arrive for their session, the emotional texture has usually faded, leaving only fragments. What a product in that space needs to do first is respect that fragility. The model is the easy part. The hard part is understanding the person and the moment well enough to know what the product should never do.

## Why This Approach

The obvious first conception of this app was a text box that says "interpret my dream." However, I chose voice-first because the problem was not really about dream interpretation, but about the way dream data was captured. People lose dreams fast, and typing while half awake forces them to clean up the dream too early. A voice note keeps more of the original material: the weird phrasing, the gaps, the emotional residue, and the sentence that does not make sense yet but might matter later.

I chose a Dream Library / archive approach because one dream is useful, but patterns across dreams are more useful. Dreamsea is built to become a private record that compounds over time, making it more useful than a one-time answer.

I chose a CMS because my partner's method had to stay alive inside the product. If she learns that a prompt is too vague, or wants to add a better explanation to a tradition, she can change the Dream Wiki herself. That is a product choice. The domain expert should be able to shape the AI without waiting for an engineer.

## Tradeoffs

I kept social features out of the first version. That probably makes Dreamsea less viral, but virality would have damaged the core behaviour. If people think a dream might be shared, they start editing themselves. The honest dream matters more.

I chose local-first storage, which makes backup and sync harder. But trust is the product here. If a user believes the app is casual with their dream material, the whole experience breaks.

I chose a richer generation pipeline over a single model call. That gives the dream more depth, but it creates more failure points. So the work became less glamorous and more useful. Save each step. Show progress. Retry. Resume. Fail clearly.

I built the CMS because it gives my partner control, but it also creates a new governance surface. Bad prompt edits could affect output quality. The next version should include preview testing inside the CMS before changes go live.

## Demo

Check out Dreamsea on the Apple App Store here: https://apps.apple.com/us/app/dreamsea/id6761101193

## What I Would Improve

The architecture holds up well, but there are four things I would build out next.

First, an eval layer around roughly fifty anonymised examples scored for specificity, emotional restraint, and whether each tradition adds something distinct. Without it, prompt and wiki changes are hard to validate.

The CMS is already one of the better architectural decisions. My partner can update the Dream Wiki and prompts without a new build. The natural next step is a test panel so she can preview how a change affects a real interpretation before pushing it live.

On transcription, I would look at replacing Gemini speech-to-text with WisprFlow, which is built for groggy, fragmented speech - exactly what someone produces at 3am still half inside a dream. Gemini handles general audio well, but dream capture is a specific context.

Finally, encrypted sync - treated as a trust decision first. Dreamsea is local-first for a reason, and encrypted sync would extend that trust to multi-device use without changing the privacy stance.
