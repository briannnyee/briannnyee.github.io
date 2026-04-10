Most React developers reach for `useEffect` as reflexively as they reach for `useState`. And most of them — myself included, for longer than I'd like to admit — don't fully understand when it runs, how many times it runs, and what the cost of each of those runs actually is.

After profiling several production apps this year, I found that misused effects were responsible for some of the most subtle performance bugs I've ever debugged. Here's what I learned.

## Effects Run After the Browser Paints

This is the single most important thing to internalize: **useEffect runs after the browser commits the DOM and paints the new frame.** That means if you `setState` inside an effect, you're always paying for at least one extra render — and the user may briefly see the old state.

```jsx
// Anti-pattern: derived state in useEffect
function UserCard({ user }) {
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(user.firstName + ' ' + user.lastName);
  }, [user]);

  return <h2>{fullName}</h2>;
}
```

This component renders **twice** on every prop change: once with the stale `fullName`, then a commit, then the effect fires, then a second render. The fix is to just compute it during render:

```jsx
function UserCard({ user }) {
  const fullName = user.firstName + ' ' + user.lastName;
  return <h2>{fullName}</h2>;
}
```

## The Dependency Array Is a Contract

When you write `[user]`, you're promising React that the effect only depends on `user`. If you lie — if the effect closes over some other state or prop that isn't listed — you get stale closures that silently serve outdated data. ESLint's `exhaustive-deps` rule exists because humans are terrible at keeping this contract in their heads.

> Every effect should describe a single, self-contained synchronization with something outside of React.

## When You Actually Need It

1. Subscribing to an external store (WebSocket, event emitter, browser API)
2. Syncing state to `localStorage`, URL, or another side channel
3. Triggering analytics events tied to lifecycle, not user actions
4. Running imperative code on a DOM node (focus, scroll, measure)

Notice what's not on this list: transforming props, computing derived values, or chaining state updates. Those belong in render, in a `useMemo`, or in an event handler — never in an effect.

## The Mental Model That Fixed Everything

I stopped thinking of `useEffect` as "run this after render." I started thinking of it as "keep this external thing in sync with my component's state." Once I made that switch, the rule for when to use it became obvious: if there's no external thing, there shouldn't be an effect.

---

If you want to go deeper, the React docs' *You Might Not Need an Effect* page is one of the best pieces of technical writing the React team has ever shipped. Read it twice.
