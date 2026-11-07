# Social-Media-Brain

Chapter3 Realty's system for social media: X, Threads, Bluesky, LinkedIn and Reddit. It is the sister of [Blog-Brain](https://github.com/chapter3realty/Blog-Brain), which writes the website's pages.

Chapter3's accounts talk in the voice of **Gus, a laughing gull** who has sat on the roof of every oceanfront tower on the Grand Strand and is paid in fries to read HOA financials. He is chaotic about birds, traffic and paperwork, and serious about buyers' money. Every post is checked against South Carolina licence law, fair housing, Reg Z and Chapter3's own business rules before the owner sees it. The owner approves and publishes every post.

## What is here

| File | What it answers |
|---|---|
| [`reports/Social media personality for Chapter3.md`](reports/Social%20media%20personality%20for%20Chapter3.md) | The research: what the platforms reward, which brand personalities worked and which backfired, the real estate accounts that grew, the legal limits, and a 90-day plan. |
| [`research_notes/`](research_notes/) | The five research notes behind the report, with every source. |
| [`PLAN.md`](PLAN.md) | The owner's decisions so far, the rollout across platforms, the software we build instead of paying for it, and what we measure. |
| [`voice/CHARACTER.md`](voice/CHARACTER.md) | Who Gus is, how he talks, what he jokes about and never jokes about, and the recurring series. |
| [`voice/RULES.md`](voice/RULES.md) | The rules every post follows: the two-layer rule, the legal rules with section numbers, the topic tiers, the do-not-joke list. |
| [`voice/edits.jsonl`](voice/edits.jsonl) | The edit memory. Every change the owner makes to a draft, recorded so the Brain learns from it. |
| [`drafts/`](drafts/) | Batches of posts. `.json` is the source, `.md` is the readable version, `.report.md` is the checker's output. |
| [`ledger/predictions.md`](ledger/predictions.md) | Every prediction Gus makes, graded in public each quarter. |
| [`rules/social.json`](rules/social.json) | The social rules the checker enforces. |
| [`rules/blog-claims.json`](rules/blog-claims.json) | Blog Brain's claims rules, copied unchanged, so both brains block the same things. |
| [`tools/check.js`](tools/check.js) | Checks every platform version of every draft. A blocked post cannot reach the owner. |
| [`tools/killswitch.js`](tools/killswitch.js) | Pauses joke posts while a storm or flood alert covers Horry or Georgetown County. |
| [`tools/render.js`](tools/render.js) | Turns a batch into a page the owner can read. |

## Commands

```
npm test                                      # 84 tests: every rule trips on a bad example and passes a good one
node tools/check.js drafts/batch-001.json --report
node tools/render.js drafts/batch-001.json
node tools/killswitch.js                      # check National Weather Service alerts
node tools/killswitch.js --clear              # a person turns jokes back on after a storm
```

No dependencies. Node 22 or later.

## Non-negotiables

1. **Nothing posts, replies, likes or DMs by itself.** The Brain drafts and checks. The owner presses publish and writes every reply. X, LinkedIn and Reddit ban automated engagement.
2. **Every post names Chapter3 Realty** (SC Code §40-57-135(E)(2)).
3. **Never another firm's listing, address or photos** (§40-57-135(E)(1)).
4. **Never a rate, payment, down payment or loan term.** Chapter3 is not a lender.
5. **Never who a place suits or who lives there** (Fair Housing Act).
6. **No invented clients, reviews or deals.** Gus is a cartoon; he has never sold anything.
7. **The joke never makes a cost look smaller or a risk look funnier.**
