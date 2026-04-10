I've been a completionist gamer for as long as I've been writing software. Somewhere around my third run through *Elden Ring*, it hit me: the mental model I use to evaluate a great game system is **exactly** the same mental model I use when I'm reviewing an API, a service boundary, or a database schema.

This post is about that overlap — and why thinking like a game designer has made me a materially better systems engineer.

## Constraints Are the Feature

Game designers will tell you that fun lives inside constraints. Remove the rules and you don't get more freedom — you get paralysis. The same is true of software. The best APIs I've used feel almost restrictive at first; they only let you express a small surface of ideas. But that small surface is deep, composable, and impossible to misuse.

> A game is a series of interesting decisions.
>
> — Sid Meier

Swap "game" for "system" and you have one of the most honest descriptions of API design I've ever read. Every function signature, every required field, every error type — it's a decision point you're forcing on whoever uses your code. The interesting ones earn their weight. The rest are friction.

## Emergent Behavior Is the Payoff

The magic moment in any great RPG is when two systems you understood in isolation collide into something you'd never predicted. In *Breath of the Wild*, that's when you realize you can shield-surf down a hill into a sleeping enemy camp with a metal weapon during a thunderstorm. Nobody designed that interaction — it emerged from orthogonal primitives.

Software has the same property. The teams I've worked on that ship fastest are the ones that build **orthogonal primitives** instead of bespoke features. A logging library, a queue, a feature flag system — composable pieces that engineers can combine in ways the original authors never envisioned. That's emergent behavior, and it's how you build leverage.

### A quick example

```python
# Bad: one bespoke endpoint per use case
@app.post('/send-welcome-email')
def send_welcome(user_id): ...

@app.post('/send-password-reset')
def send_reset(user_id): ...

# Good: orthogonal primitives
def send_transactional(template, user, payload):
    ...

# Now every team can compose their own flows
# without asking the infra team for a new endpoint.
```

The first version ships faster this week. The second version ships an order of magnitude more features *per quarter*, because it stopped being a bottleneck.

## Respect the Player's Time

Every modern game that respects its player does the same three things: quick-save anywhere, skip animations you've already seen, and resume exactly where you left off. These feel like obvious table stakes now, but it took decades of bad design before they became universal.

- **Quick-save anywhere** → idempotent writes. If a user can retry your request without breaking state, they will always have a way out.
- **Skip animations** → cache everything you've already computed. Never make anyone wait twice for the same answer.
- **Resume from where you left off** → resumable operations and good pagination. No "start from page 1" after a transient failure.

These are the same instincts. Games figured it out a decade earlier because their feedback loops are faster — a player who feels disrespected quits the game in ten minutes, while a developer who feels disrespected by your API will grumble for years before finally building the replacement.

---

## What Elden Ring Taught Me About Error Handling

The best failure state I've ever seen in a piece of software is the *You Died* screen. It's loud, unambiguous, and it tells you exactly what happened — you died, here, this way, and now you're going back to the last grace site. It doesn't hide the failure. It doesn't apologize. It doesn't try to recover silently. It just shows you the truth and gets out of your way.

I think about this every time I see an API that returns `200 OK` with an error object inside. Say what happened. Say it clearly. Trust the caller to handle it.

## Closing Thought

If you want to be a better systems engineer, play a great RPG with the UI off and the designer's commentary on. You'll start seeing the same patterns everywhere — in your codebases, in your incident reviews, in the way your team ships. Games are just software systems where the user's feedback loop is measured in seconds. We should be so lucky.
