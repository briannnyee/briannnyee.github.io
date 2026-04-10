I spent three months building a product nobody used. Not "low traction." Not "slow start." **Zero users.** The kind of zero where the only traffic in your analytics dashboard is your own refreshes.

It was, without question, the most useful three months of my career.

## The Pitch

The idea was simple and, in my head, obviously good. I'd noticed that every developer I knew kept a messy folder of one-off scripts — little utilities to rename files, download data, automate a tedious workflow. What if there was a place to share those scripts? A clean interface, versioning, maybe a way to install them with a single command. A GitHub Gists for scripts that actually got used.

I talked to exactly two friends about it. They both said "huh, that's cool." I took that as validation and started building.

## What I Built

- A CLI tool in Go that could install and run scripts from a central registry
- A web UI with syntax highlighting, tags, and a decent search
- Authentication with GitHub OAuth
- A whole rating and comment system nobody would ever use
- A landing page I wrote and rewrote four times

Every single one of those features was built before I had *one* conversation with a stranger about whether they wanted this. Every single one.

## The Thing I Should Have Done First

> The cheapest possible version of your idea is a conversation. You are always more expensive than a conversation.

When I finally launched, I posted on a few forums, messaged maybe twenty people directly, and waited. The response was polite silence. A handful of sign-ups, zero scripts uploaded, zero installs. When I asked people why, the answers were consistent: *"I already have a folder for that. I just grep it."*

The messy folder wasn't a pain point. It was a **feature**. Developers liked the friction because it meant their scripts were private and disposable. I had solved a problem nobody thought they had.

## What I'd Do Differently

1. **Talk to twenty strangers before writing one line of code.** Not friends. Strangers. Friends will lie to make you feel good.
2. **Sell it before you build it.** If they won't give you their email to be notified at launch, they won't give you their scripts either.
3. **Build the smallest possible thing that can fail fast.** One feature. One screen. One week of work, not three months.
4. **Separate the idea from yourself.** The project failing doesn't mean you failed. It means the experiment returned data.

## The Silver Lining

I don't regret building it. Every technical skill I picked up along the way — the Go CLI patterns, the OAuth integration, the Postgres full-text search — has compounded into things I use at my day job now. The product failed. The learning didn't.

But the real lesson isn't technical. It's this: *build it and they will come* is the most expensive lie in software. The cheapest lie, too, since you're the only one telling it to yourself.
