There is an enormous amount of noise around AI coding tools right now. Most of it is marketing, and most of the rest is either uncritical hype or reflexive dismissal. After a year of using them every day on real production code, I have opinions. Let me try to share them honestly.

I'm not going to name specific products, because they change every month. I'm going to talk about what I actually use them for, where they fail me, and how my workflow has genuinely shifted.

## What They're Genuinely Good At

- **Boilerplate I've written a hundred times.** Setting up a new CRUD endpoint, a test scaffold, a config file — anything where the shape is obvious and the content is mechanical.
- **Translating between languages I know well and languages I don't.** I can read Rust but I write Go. An AI tool is a surprisingly good bridge when I need to port a small utility.
- **Explaining unfamiliar code.** Dropped into a legacy codebase for the first time? Paste a file, ask for a summary. It's wrong sometimes, but it's a better starting point than cold-reading.
- **Rubber-ducking at 2am.** Not because the answers are great, but because explaining the problem clearly enough for the model to respond forces me to think clearly enough to solve it.

## Where They Fall Apart

### Anything novel or non-obvious

The moment the task requires a non-obvious architectural decision, the output gets subtly wrong. Not wrong-in-an-error-message way — wrong in a compiles-fine-ships-to-prod-and-deadlocks-at-3am way. The models are trained on common patterns, and common patterns are not always right patterns for your specific problem.

### Debugging

They are shockingly bad at debugging anything more complex than a syntax error. They will confidently tell you the bug is in a function that is not the function with the bug. They will suggest fixes that would work in a textbook and break your actual system. Debugging is still mostly on you.

### Security-sensitive code

I do not let them touch authentication, authorization, cryptography, or anything that parses untrusted input. The failure modes are too quiet and too catastrophic.

> The model is very confident. That confidence is the failure mode, not the feature.

## How My Workflow Has Actually Shifted

The thing that surprised me most: I spend more time *reading* code and less time *writing* it. The ratio has flipped from maybe 60/40 writing-to-reading two years ago to something like 25/75 now. Most of my day is reviewing generated code, deciding whether it's right, and surgically editing the parts that aren't.

This has made me a better reviewer. It has also, I think, made me a slightly worse *producer* — there's a muscle that only gets exercised when you type out every character yourself, and that muscle is atrophying for me. I'm not sure yet how I feel about that.

## The Honest Bottom Line

1. They make me faster at tasks I already know how to do.
2. They do not make me smarter at tasks I don't.
3. They are a force multiplier on top of expertise, not a replacement for it.
4. If you don't already know how to evaluate the output, you are shipping the model's confidence as your own. That is a dangerous position to be in.

---

Use them. Don't worship them. And never, ever merge code you don't understand just because the autocomplete looked sure of itself.
