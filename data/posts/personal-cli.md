I have a graveyard of productivity apps on my phone. Notion, Obsidian, Things, Todoist, a dozen others I can't even remember the names of. Every one of them promised to be the system. Every one of them got abandoned within a month.

The only productivity tool I've used every day for the last two years is a Python script I wrote in an afternoon. It has no UI, no sync, no mobile app. It's just a single file that I type `do` into my terminal to run. And I cannot imagine living without it.

## Why Personal Tools Stick

Every off-the-shelf productivity tool is built for the *average* user. That's its strength and its fatal weakness. The average user exists nowhere in the real world — they're a statistical fiction. You, on the other hand, are extremely specific. You have one set of quirks, one set of workflows, one set of annoyances. A tool built for the average will always feel slightly wrong.

When you build it yourself, every single decision is calibrated to your exact taste. Every keystroke earns its place. Nothing is there because some product manager thought it'd improve engagement.

## The Three Rules I Follow

### 1. One command to run it

If I have to remember flags or subcommands, I won't use it. My CLI is called `do` — three letters. Typing it into a terminal is as natural as opening Slack.

### 2. Plain text storage

Everything lives in a single markdown file in a dotfolder in my home directory. I can grep it, git it, back it up with `rsync`, and migrate it to a new machine in ten seconds. No database, no schema, no migrations.

```bash
~/.do/
├── tasks.md       # current to-dos, one per line
├── log.md         # append-only journal, one entry per day
└── config.toml    # my preferences, rarely changed
```

### 3. Nothing I wouldn't use tomorrow

When I'm tempted to add a feature, I ask: *will I actually use this within 24 hours?* If the answer is no, it doesn't ship. This rule has killed more features than I've written.

## What It Does

```bash
$ do                         # shows today's tasks
$ do add ship the blog post  # adds a task
$ do done 2                  # marks task #2 complete
$ do log                     # opens today's journal entry
$ do week                    # shows what got done this week
```

That's it. That's the whole thing. About 180 lines of Python. And I use it every single day.

## The Real Point

The most valuable part of this isn't the tool. It's the **permission to build exactly what you need**. Most engineers spend their careers building software for other people. Building something that's just for you — small, weird, opinionated — is a muscle you can atrophy if you don't exercise it.

> Build the thing you wish existed. Don't make it good. Make it yours.
>
> — advice I give myself when I'm stuck

Your CLI doesn't have to be for anyone else. That's the whole point.
