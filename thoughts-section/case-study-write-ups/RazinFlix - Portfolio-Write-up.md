# RazinFlix - Portfolio Write-up

## Problem

RazinFlix started because I was bored of the selection on traditional streaming services. I love films with meaning, and the best recommendations I was getting did not come from Netflix or Prime algorithms. They came from cinephile friends, family, social media rabbit holes, and personal conversations.

The main problem was that all of those films ended up in a spreadsheet. The quality of the list was high, but the experience was dead. I wanted the browsing experience of Netflix, but with a film library curated by people whose taste I actually wanted and trusted.

## Architecture

### Model

RazinFlix does not currently use a runtime LLM in the frontend. The model layer is closer to a metadata and classification system. Python scripts enrich each film using TMDb, YouTube, IMDb, Wikipedia, Google Knowledge Graph, and cached lookup data. The system pulls posters, trailer keys, descriptions, type information, ratings, and genre signals, then applies deterministic category rules and manual overrides.

That choice matters. This project is not trying to hallucinate film knowledge. It is trying to take a messy, human-curated film list and make it browsable, searchable, and self-organising enough that I can keep maintaining it with family and friends.

### Context

The context layer is the film database itself. The original source is CSV-based, with titles, years, directors, descriptions, IMDb IDs, and ratings. Around that, RazinFlix has a cache, bad-trailer reports, manual poster and trailer overrides, corrected poster assets, and category logic.

The final frontend context is a `films.json` script, originally sourced from my watchlist spreadsheet. In the current build, it contains 337 films, all with posters, and 319 with trailer keys. The catalog is grouped into 13 curated shelves: Japanese Anime, Television & Miniseries, Global Documentaries, Crime & Thriller, Mind-Bending Sci-Fi & Fantasy, Surrealism & The Subconscious, Iranian Cinema & Middle East, Love & Heartbreak, Coming of Age & Youth, Historical Epics & Period Pieces, Psychological & Character Studies, Contemporary Comedy & Satire, and World Cinema & Drama.

That is the product layer. The value is that the list keeps the taste of the people who recommended the films, while still giving me the browsing affordances of a modern streaming app.

### Orchestration

The orchestration layer is a pipeline that reads a CSV, or a plain-text film name and year entered in an Add Film button. It deduplicates entries, enriches missing posters and trailers, checks TMDb first, falls back to YouTube or Wikipedia where needed, applies manual overrides, and writes the finished JSON film data used by the React app.

There are also maintenance scripts that check database health, find missing trailers, verify suspicious trailer/title mismatches, patch bad trailer keys, mutate categories, and query Supabase records. This is the part that turns RazinFlix from a static toy into a small catalog system. The frontend stays simple because the messy work happens before the app loads.

The app itself is a React/Vite interface. It imports the film JSON, groups films into category rows, supports search across title, director, and description, and opens a modal for each film. If a trailer key exists, the modal plays the YouTube trailer. If not, it falls back to the poster and film details.

### Governance

The governance layer is still early, but the project already shows the shape of it. There are scripts for missing fields, suspicious trailer mismatches, duplicate cleanup, and manual correction. That matters because film metadata APIs are useful but imperfect. They can return the wrong poster, wrong trailer, wrong title match, or wrong media type.

The main governance gap is secret handling and repeatability. Some of my API keys and Supabase details are hard-coded in scripts, which should not survive into a public repo. The next version should move all credentials into environment variables, document the pipeline, and add automated checks before publishing a new catalog build. Additionally, users need a password to add a film to RazinFlix.

### Human

The human layer is the most important part of RazinFlix. The app only makes sense because the source list comes from people: friends, family, social media discoveries, and my own taste. Additionally, the categories are curatorial shelves that I feel serve the viewing moods of a variety of casual and deeper occasions.

That is why manual overrides are also fundamental to the product. The system can fetch metadata and organise the collection, but the human layer decides what belongs, what is meaningful, and what is worth watching.

## Why This Approach

The obvious version would have been to build another movie database: connect an API, show popular films, add search, and call it done. But that would have recreated the same problem I had with streaming services: lots of content, not enough trust.

So I chose a curated catalog first, and a streaming-style interface second. The spreadsheet had the taste; it just needed a better experience. RazinFlix keeps human curation at the centre, then uses automation to make that list easier to browse, organise, and maintain.

## Tradeoffs

RazinFlix gives up infinite choice for trusted curation. Traditional streaming services win on volume, but that was exactly the problem. I did not want another endless catalog of average options. I wanted a smaller library where each film had a reason to be there.

It gives up algorithmic personalisation for human taste. Netflix can optimise for what keeps someone watching, but RazinFlix is optimised around recommendations from people I trust: family, friends, cinephiles, and my own discoveries. That makes the catalog more meaningful, but also more subjective.

It gives up instant availability for discovery quality. RazinFlix is not trying to solve licensing or become a streaming platform. It helps me decide what is worth watching, even if I still have to find the film somewhere else afterward.

## Demo

You can access RazinFlix here: https://www.nsso.me/film/razinflix

## What I Would Improve

The honest limitation is that RazinFlix already has the browsing experience I wanted, but not yet the shared maintenance experience. Right now, the system can organise and enrich the list, but adding or correcting films still feels too close to editing scripts and spreadsheets.

The next meaningful improvement is a small curator dashboard where I, my family, and friends can add recommendations, explain why they matter, correct metadata, and assign categories without touching the code. The best version of RazinFlix is a living, easy-to-use, self-organising cinema library where trusted human taste stays at the centre.
