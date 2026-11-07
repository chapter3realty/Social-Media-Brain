# The plan

## Decisions so far

| Date | Question | Owner's answer | What it means |
|---|---|---|---|
| 2026-11-07 | How edgy? | Max chaos within the law | Gus is unhinged about birds, fries, traffic, paperwork and the industry. The law and the do-not-joke list are the only limits. |
| 2026-11-07 | Who is the face? | Brand account | One Chapter3 Realty account per platform, in Gus's voice. No personal accounts yet. |
| 2026-11-07 | Approvals? | Approve everything for now; the Brain becomes more independent later | Every post goes to the owner. Each edit is logged in `voice/edits.jsonl`. When a whole batch ships without edits, we discuss loosening it. |
| 2026-11-07 | Platforms? | All of them: X, LinkedIn, Threads, Reddit | See the rollout below. |
| 2026-11-07 | Who is talking? | "Do some research, what do you think" | Gus the laughing gull. Reasons in `voice/CHARACTER.md`. |
| 2026-11-07 | Which topics? | Anything | Green, amber and red tiers in `voice/RULES.md`. Commissions, predictions and local politics are allowed, as amber. |
| 2026-11-07 | Who publishes and replies? | The owner | The Brain drafts posts and suggests reply angles. The owner edits and presses publish. |
| 2026-11-07 | Budget? | Free; build our own software instead of paying | No X Premium, no paid scheduler. We build the queue, the checker, the charts and the publishing helpers. |

## Is it OK to run every platform at once?

Yes, with two conditions.

1. **One approval, every platform.** The owner should not write five versions of a post. The Brain writes the X version and adapts it for Threads, Bluesky and LinkedIn in the same draft. One review covers all four. This is what the queue software is for.
2. **Replies are the real time cost, so they get a budget.** On X, a new account grows mainly by replying well to bigger accounts (about 20 to 30 replies a day in the research). Posting takes minutes. Replying takes about an hour. Reddit answers are hand-written and slow. The owner should block out about **60 to 90 minutes a day**.

Rollout:

| Weeks | X | Threads | Bluesky | LinkedIn page | Reddit |
|---|---|---|---|---|---|
| 0 | Claim handles, set up profiles with "Chapter3 Realty", Gus avatar | same | same | same | Owner's account, disclosure in profile |
| 1 to 2 | 1 to 2 posts a day; 10 replies a day | Mirror | Mirror | 2 posts a week | Read the rules of each target subreddit; no posts |
| 3 to 12 | 2 to 3 posts a day; 20 to 30 replies a day; 1 thread a week | Mirror | Mirror | 3 posts a week, 1 carousel | 2 to 4 answers a week |

If the time runs short, drop in this order: Bluesky, then Threads replies, then LinkedIn to 2 a week. Never drop X replies; they are the growth.

## The software we build instead of paying

Everything runs on the owner's machine or in a session like this one. Nothing posts or replies without the owner pressing a button. Platforms ban automated replies, likes and DMs, so we never build those.

| # | Tool | Replaces | Status |
|---|---|---|---|
| 1 | `tools/check.js`: the compliance and voice checker | A compliance reviewer | **Built** |
| 2 | `tools/killswitch.js`: pauses joke posts during storm alerts (National Weather Service, free) | A social manager watching the news | **Built** |
| 3 | The queue: a local web page that shows each draft, lets the owner edit and approve it, and records every edit | Buffer, Hootsuite, Typefully | Next |
| 4 | Publish buttons: one click opens each platform's own post box, already filled in. Free on every platform. Later: direct posting through the free Bluesky and Threads APIs | Paid schedulers | Next |
| 5 | Chart maker: turns Chapter3's data into a branded "Friday Numbers" image with "Chapter3 Realty" on it | Canva | After the queue |
| 6 | Reply desk: a daily list of posts worth replying to, with a fact Gus could add to each. The owner writes the reply. | Reply-guy tools | After the queue |
| 7 | Scorecard: reads the platforms' free analytics exports and writes a weekly report | Paid analytics | Month 2 |

Two costs we cannot build around:

- **X's posting API is pay-per-use** (about 1.5 cents a post, vendor figure, not yet checked on docs.x.com). The free route is the publish button, which opens X's own post box. That is what we start with.
- **LinkedIn company page posting through the API** needs LinkedIn to approve an app. The publish button works without it.

## How the Brain works each week

1. **Intake.** New numbers from Chapter3's data (rental returns, permits, HOA research). A short list of local news. Optional: a two-minute voice memo from the owner with a story or an opinion.
2. **Draft.** The Brain writes the week's posts in `drafts/`, in Gus's voice, one draft per idea with every platform's version.
3. **Check.** `npm run check` runs every rule. A draft with a block does not reach the owner.
4. **Review.** The owner reads the batch, edits, approves. Every edit is logged.
5. **Publish.** The owner presses publish on each platform.
6. **Reply.** The owner spends the reply budget on X.
7. **Learn.** Each Friday the Brain reads the edits and the numbers, then proposes rule changes.

## What we measure

The research says follower count is the wrong main number for a local brokerage. In order:

1. Conversations with real prospects (DMs, replies from people buying or selling here)
2. Visits to the website's tools from social, and newsletter sign-ups
3. Profile visits
4. Replies, quotes and shares per post (not likes)
5. Follower growth per week

Warning signs: mutes, hidden replies, angry quote-posts after a joke. Those cost more reach on X than a boring post.

Realistic targets for 90 days, from the research (estimates, not benchmarks): 300 to 1,000 followers on X. Growth on a LinkedIn company page is slower.

## Open questions for the owner

1. Do you like the name **Gus**? Other options: Hush Puppy, Fry Guy, Captain Assessment.
2. Is Chapter3 or anyone on the team a **NAR member** (a REALTOR®)? This decides whether NAR's rules about other agents apply.
3. Which **MLS** does Chapter3 use, and may its market numbers be posted on social?
4. Are the handles free? Suggested: `@chapter3realty` everywhere.
5. Can you give the reply work 60 to 90 minutes a day? If not, we cut the plan to fit the time you have.
6. Should the profiles say that software helps draft posts and a licensed human approves every post? The research suggests one public line like that is cheap insurance.
