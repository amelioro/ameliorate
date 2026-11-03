---
name: commit-message
description: Write a commit message in this repo's voice — short subject, motivation where it isn't obvious, `includes:` for what the summary doesn't cover. Use whenever you're about to write, amend, or draft a commit message.
---

# Writing a commit message

`type(scope): lowercase summary`. **The subject never exceeds 50 characters**. Shorten the summary rather than spilling over. Body lines wrap at 72.

**Almost half of all commits are the subject line and nothing else.** That's the default. Add a body only for one of the three reasons below, and if you can't name which one applies, there is no body.

1. **The motivation isn't clear from the summary.** One or two lines saying _why_, never restating _what_ — the diff already shows that.
2. **Something is folded in that the summary doesn't cover.** An `includes:` bullet each, or a single `also ...` line for one small thing.
3. **The summary needs a list to be legible at all** — a set of renames, say.

Write it the way the examples read: lowercase, plain, ASCII (`-` for a dash, `->` for an arrow). Hedge where you're actually unsure — "seems", "I think", "not sure if it's better, but" — rather than manufacturing confidence a commit doesn't have.

## Examples

Subject only, which is the common case:

```
docs(plgr): clarify why veracity is on thesis
```

Motivation, because "why darken it" isn't obvious:

```
touchup(plgr): darken yellow note a bit more

was a bit bright, hard to see the stroke/border
```

```
touchup(plgr): optionally tint lone type markers

instead of tinting the full type characters - "supports"/"critiques"
were too loud when tinted.
```

Motivation plus one folded-in extra:

```
chore(AGENTS.md): make conventions more prominent

also clarify the comment conventions.

motivation: LLM hasn't totally been following the conventions.
This may not improve but the changes seem worth a shot.
```

`includes:` for what the summary doesn't imply:

```
feat(plgr): derive fill/text colors

should make it easier to customize because you don't have to pick
three colors!

includes:
- dark mode is derived as well, so colors look nicer per mode
```

```
touchup(plgr): make headers consistent

includes:
- font size and weight
- using consistent gray band for header background
- reducing comments that seem unnecessary
- using gray for pill fill instead of primary purple (am thinking that
they don't need to stand out as much)
```

A list where the summary alone can't carry it:

```
refactor(plgr): rename edge claim render options

- "explicit, separate" -> "spelled out"
- "implicit, on the edge" -> "implied"

seems a little clearer.
```

## Not this

The failure mode is a body that narrates the change in full prose — explaining the mechanism, walking through each file, arguing for the design:

```
feat(amv2): cut wireframe v5, reading the generated bundle

v5 renders from the pasted bundle instead of hand-derived constants. The
rendering is mostly untouched: an adapter maps the bundle onto the names
the existing code already reads, and OVERRIDES holds what the structure
can't say - recent activity, which canned view a question opens, ...

[two more paragraphs]
```

All of that is either readable from the diff or belongs in a doc or a code comment. The commit needed its subject line and, at most, the one thing a reader couldn't have guessed.
