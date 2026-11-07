# Platform Algorithms and Automation Rules (X, LinkedIn, Threads, Bluesky, Reddit), late 2025 to Nov 2026

Research date: 2026-11-07. Context: small, new real estate brokerage with a funny, opinionated voice, using AI to help draft posts.
Source quality key: **[PRIMARY]** = platform code, docs, or official statement; **[DATASET]** = measured third-party study; **[PRESS]** = reputable tech press; **[VENDOR]** = SEO or vendor blog (lower confidence); **[FOLKLORE]** = creator lore with no traceable source.

## X/Twitter: what the "For You" ranker rewards and punishes

### Takeaway
X's ranker is now a Grok-based transformer called Phoenix. It is open source, and its weights went public in August 2026. Per unit of predicted probability, the strongest positive signals are copy-link shares (20), replies from mutual follows (5 + 15 boost), replies, quotes and DM shares (5 each), and follows (4). Likes are worth about 0.7, and bookmarks and profile clicks are worth 0. Negative feedback is very heavy: one predicted report (-234) cancels out dozens of replies. A brand voice that provokes conversation works. A voice that gets people to mute it ("not interested", mute, report) is very costly.

### Cited Findings
**Architecture and releases**
- On 20 Jan 2026 X published the For You ranking code under Apache 2.0 at github.com/xai-org/x-algorithm. It has three parts: Home Mixer (the pipeline), Thunder (in-network posts from accounts you follow) and Phoenix (a Grok-based transformer that does out-of-network retrieval and ranking). The README reportedly says "every hand-engineered feature has been eliminated." — [Keywords Everywhere timeline](https://keywordseverywhere.com/news/social-algorithm-updates/x-algorithm-open-source/) [PRESS/VENDOR]; [xai-org/x-algorithm README](https://github.com/xai-org/x-algorithm) [PRIMARY]
- Later releases: 15 May 2026 added an inference pipeline, a mini Phoenix model, the "Grox" content-understanding service and ad blending. 13 Aug 2026 added scoring weights, visibility filters and the "Under the Hood" tool. Accounts with at least 10 posts a month and at least a year old (randomized pilot) can see visibility labels on their own account at x.com/i/jf/under_the_hood. — [Keywords Everywhere](https://keywordseverywhere.com/news/social-algorithm-updates/x-algorithm-open-source/); [ExplainX, 14 Aug 2026](https://explainx.ai/blog/x-algorithm-for-you-timeline-open-source-ranking-weights-august-2026) [VENDOR]
- Scoring formula, from the README: "Final Score = Σ (weight_i × P(action_i))". Weights multiply the *predicted probability* of each action for that viewer, not raw counts. The weights live in `home-mixer/params/param.rs`. — [README](https://github.com/xai-org/x-algorithm) [PRIMARY]
- Predicted actions: favorite, reply, repost, quote, share, share via DM, share via copy link, clicks (post, profile, link, photo expand, video open, quoted post), dwell, dwell time, click dwell time, video continuation seconds, profile visit seconds, follow author. Negative actions: not interested, mute author, block author, report, not dwelled. — [README](https://github.com/xai-org/x-algorithm) [PRIMARY]

**Current weights, read directly from `home-mixer/params/param.rs` on main, fetched 2026-11-07** [PRIMARY] — [param.rs](https://raw.githubusercontent.com/xai-org/x-algorithm/main/home-mixer/params/param.rs)
- Share via copy link 20.0 · Reply 5.0 · Bidirectional-follow (mutual) reply boost +15.0 · Quote 5.0 · Share via DM 5.0 · Follow author 4.0 · Share 2.118 · Repost 1.0 · Favorite (like) 0.708 · Continuous click dwell time 0.385 · Click 0.274 · Open link 0.2 · Dwell 0.05 · Photo expand 0.05 · Quoted click 0.05 · Post unexplored 0.015 · Continuous dwell time 0.0075 · Profile click 0.0 · Video open 0.0 · VQV (video quality view) 0.0 · Grok analyze 0.0
- Negative: Report -234.0 · Mute author -58.8 · Not interested -53.07 · Block author -31.2 · Not dwelled -0.02
- The file has no bookmark weight, so bookmarks appear to get no direct weight. It also has no verified/Premium/Blue parameter. One cold-start parameter: `ColdStartImpressionThreshold` = 200.
- The weights have changed since the 13 Aug 2026 disclosure. ExplainX's 14 Aug table showed like 0.5, share 2.0, not interested -43.2 and dwell time 0.004. The current file shows 0.708, 2.118, -53.07 and 0.0075. ExplainX's table also listed bookmark and profile click at zero weight. — [ExplainX](https://explainx.ai/blog/x-algorithm-for-you-timeline-open-source-ranking-weights-august-2026) vs [param.rs](https://raw.githubusercontent.com/xai-org/x-algorithm/main/home-mixer/params/param.rs)
- Late Aug to early Sep 2026 commits (secondary summary): dwell time entered the ranking weights and video quality views were dropped (25 Aug). Phoenix aggregation switched to a "long-dwell" variant by default (2 Sep). An LLM reply-spam classifier was added. The reply-spam follower threshold rose from 60k to 80k (21 Aug), then to 100k (24 Aug). Reply-spam classifiers now receive the replier's follower count and the original poster's bio (26 Aug). The legacy bot detector can file proactive reports (2 Sep). — [Keywords Everywhere](https://keywordseverywhere.com/news/social-algorithm-updates/x-algorithm-open-source/) [VENDOR summary of commits; not individually verified]

**Filters and adjustments (README)** [PRIMARY] — [README](https://github.com/xai-org/x-algorithm)
- AgeFilter removes posts older than **48 hours** from For You candidates.
- Author Diversity: an author's second and later posts in one feed session are multiplied by a decaying factor, down to a floor.
- Out-of-Network Discount: posts from accounts the viewer doesn't follow are multiplied by a factor below 1. No value is published.
- New-Author Boost: posts from authors below an impression threshold are lifted toward a target position.
- Other filters: muted keywords, blocked/muted authors, previously seen posts, duplicates.

**Older (2023) heavy ranker weights. Still widely quoted, now superseded.**
- The 2023 twitter/the-algorithm-ml repo listed reply ≈13.5, "reply engaged by author" ≈75, good profile click ≈12, retweet 1, like 0.5, negative feedback ≈-74, report ≈-369. — [twitter/the-algorithm-ml recap README](https://github.com/twitter/the-algorithm-ml/blob/main/projects/home/recap/README.md) [PRIMARY, 2023; not re-fetched this session, values from memory of the widely documented README — verify before quoting]. Many 2026 guides still cite these numbers. The 2026 code has **no separate "author replies to reply" weight**. The closest equivalent is the mutual-follow reply boost. — [PostEverywhere guide](https://posteverywhere.ai/blog/how-the-x-twitter-algorithm-works) [VENDOR] notes the older numbers.

**External links**
- Oct 2025: X product head Nikita Bier announced an iOS test in which links open in an overlay that keeps the Like, Repost and Reply buttons visible. He framed it as fixing the lower reach of link posts. — [Engadget](https://www.engadget.com/x-is-testing-a-new-way-of-opening-links-in-posts-to-improve-engagement-211210520.html?src=rss) [PRESS]; [Social Media Today](https://www.socialmediatoday.com/news/x-formerly-twitter-testing-links-in-app-link-post-penalties/803176/) [PRESS]
- Late July 2026: Bier told Mark Zuckerberg he no longer needs to put links in replies. Musk replied, "We haven't [penalized links] for over a year." Critics say the lower reach is emergent: link posts earn less dwell and in-app engagement, so the model learns to rank them lower without any explicit rule. — [PPC Land](https://ppc.land/x-drops-year-old-link-penalty-musk-tells-zuckerberg-on-platform/) [PRESS]; [Free Press Journal](https://freepressjournal.in/tech/x-product-head-nikita-bier-confirms-link-penalty-removed-over-a-year-ago-tells-mark-zuckerberg-he-can-post-them-directly) [PRESS]
- The current code gives "open link" a weight of 0.2. There is no explicit link penalty constant in param.rs. — [param.rs](https://raw.githubusercontent.com/xai-org/x-algorithm/main/home-mixer/params/param.rs) [PRIMARY]

**X Premium / verification**
- Buffer analysed about 18.8M posts from about 71k accounts (Aug 2024 to Aug 2025, about 27% with Premium). Median reach for free accounts was under 100 impressions per post. Premium averaged about 600 and Premium+ about 1,550. Basic tier was roughly the same as free. The median engagement rate for free accounts fell to 0% by early 2025. — [Social Media Today on Buffer report](https://www.socialmediatoday.com/news/report-shows-paying-for-x-twitter-premkum-has-significant-reach-benefits/801881) [DATASET via PRESS]; [Influencer Marketing Hub](https://influencermarketinghub.com/?p=222870)
- The 2026 open-source param file has no Premium/verified weight. — [param.rs](https://raw.githubusercontent.com/xai-org/x-algorithm/main/home-mixer/params/param.rs). Contradiction: Buffer's data shows a large Premium reach gap, but the published ranker code has no visible boost.

**User base (context)**
- Similarweb: X mobile app MAU about 302M (June 2026), mobile DAU 123.7M (July 2026, -7% YoY), web visits 4.7B/month (July 2026, +5.3% YoY). — [TechCrunch, 11 Aug 2026](https://techcrunch.com/2026/08/11/blueskys-active-user-base-is-shrinking-as-its-focus-expands-beyond-the-app/) [PRESS]

### Inferences
- Replies, quotes and DM/copy-link shares together far outweigh likes. Posts that invite a reply (a hot take with a clear stance, "settle this" polls in text, local debates) fit the model best. Likes alone barely move ranking.
- The funny, opinionated voice is a double-edged sword. A report is worth -234 and a mute -58.8, so one person who reports is roughly equal to 47 replies in predicted-probability terms. Edgy is fine, but the voice should not punch down or read as spammy or bait.
- Mutual-follow replies get a 4x reply weight (5 + 15). Building real two-way follow relationships with local accounts (other agents, lenders, local news, Myrtle Beach businesses) makes their replies worth much more.
- The LLM reply-spam classifier, which looks at follower counts and the original poster's bio, suggests that mass "reply guy" activity on big accounts is now actively policed. A few thoughtful replies are safer than volume.
- With the 48-hour age filter, evergreen posts stop circulating in For You after two days, so the account needs steady volume rather than occasional bursts.
- Premium is likely worth the cost for a brand account on the strength of Buffer's 2024-25 data, but the mechanism behind the gap is not visible in the 2026 code.

### Gaps
- I found no measured 2026 data on threads vs long posts, Articles, or Communities reach. The weights only show that "click to expand" (0.274 click, 0.385 click-dwell) and dwell carry modest value, which is consistent with long posts benefiting from dwell. Treat claims about thread vs long-post performance as **[FOLKLORE]**.
- The out-of-network discount and author-diversity values were not published in the files I fetched.
- Hashtag penalty: nothing in the 2026 code or official statements that I found. Claims that hashtags are penalized are unverified.
- I did not find primary text of Musk's 2025 statements about moving to Grok-based ranking. The repo itself is the evidence that ranking is Grok-based.
- Images and video: photo expand is 0.05 and video weights are 0 in the current blend, but video may still help through dwell. No 2026 dataset found.

## LinkedIn: the 2025-2026 feed, formats, profile vs Page, reach decline, pods

### Takeaway
LinkedIn's feed was rebuilt around LLMs in March 2026. The new system judges each post against the author's profile and expertise. Since Oct 2026, classifiers suppress "AI slop" (generic or repetitive posts) beyond first-degree connections, with a reported 40% cut in views for flagged posts. Organic reach for creators fell sharply between 2024 and 2026, by about 50% in views per van der Blom. Document carousels lead engagement benchmarks, and link posts lag. Automated (scripted or plugin-posted) comments are hidden or limited, and pods are a stated target.

### Cited Findings
**Ranking system and AI-content enforcement**
- A March 2026 feed overhaul rebuilt recommendations around LLMs that assess a post together with the author's profile, engagement history and expertise. — [SocialDay](https://socialday.live/features/linkedin-will-cut-reach-of-ai-generated-posts-with-94-precision-screening-every) [PRESS/trade]
- Oct 8, 2026: LinkedIn VP of Engineering Tim Jurka said AI-slop classifiers now screen **every post distributed beyond the author's immediate network**. The reported precision is 94% (recall not disclosed). Flagged posts are suppressed in recommendations beyond first-degree connections but are not removed. A "Seems like AI slop" report button got over 1M uses in three weeks, and views of classified content fell 40%. Slop is defined as "generic and/or repetitive posts that added no real insight". LinkedIn's CPO said AI use and slop are different things, and AI-assisted posts with specific examples or a clear point of view are not the target. — [SocialDay](https://socialday.live/features/linkedin-will-cut-reach-of-ai-generated-posts-with-94-precision-screening-every) [PRESS/trade, reporting official statements]
- Comments are now ranked by relevance. Pangram's analysis of public posts from April to June 2026 reportedly found that 30% of comments were entirely AI-generated. — [SocialDay](https://socialday.live/features/linkedin-ranks-comments-by-relevance-as-30-turn-out-to-be-ai-generated) [PRESS/trade; Pangram figure not verified at source]
- 16 Feb 2026: VP of Product Gyanda Sachdeva said comments posted "through a third party auto-script or a browser plugin" "without any human oversight or review" will be removed from the default "Most Relevant" comment view. They may also be limited to the commenter's own network, and members who keep doing it may have their accounts restricted. Pods are hard to fight because they organize off-platform, but LinkedIn says it is working to make them ineffective (efforts reported July 2025 and November 2025). — [Social Media Today](https://www.socialmediatoday.com/news/linkedin-outlines-more-measures-to-combat-engagement-pods/812290/) [PRESS, quoting official post]
- Vendor figures such as "-70% reach for pods" or "60-97% reach drops" have no traceable source. — [search summary of vendor pages incl. LinkBoost](https://www.linkboost.co/blog/overcome-linkedin-algorithm-suppression-2026/) [VENDOR/FOLKLORE]

**User Agreement (effective 3 Nov 2025)** [PRIMARY] — [LinkedIn User Agreement](https://www.linkedin.com/legal/user-agreement)
- §8.2 item 2: no software, scripts, robots, "crawlers, browser plugins and add-ons" to scrape or copy the Services.
- §8.2 item 13: no "bots or other unauthorized automated methods to access the Services". This covers automating adding contacts, sending messages, and liking or sharing posts, and members may not "drive inauthentic engagement".
- §8.2 item 16: no "manipulating algorithms" or spam.
- §8.2 has no clause specifically on AI-generated content. Item 18 bans misleading or deceptive content, including manipulated media. §3.6 says members are responsible for reviewing AI-generated content (from LinkedIn's own generative AI features) before sharing it.

**Reach decline (van der Blom)**
- Richard van der Blom's 2026 Algorithm Insights report (7th edition, 200+ pages, about 1.3M posts) reports organic views **-50%**, engagement **-25%** and follower growth **-59%** (period comparison as reported). — [Perroly, 23 Sep 2026](https://www.perroly.com/blog/linkedin-organic-2026-what-works) citing [Creator Science podcast #307](https://podcast.creatorscience.com/richard-van-der-blom-2/) [DATASET via secondary]
- Conflict: the 2025 edition sampled about 1.8M posts from 58k profiles. Another secondary source reads the report as showing an 18.8% drop in median reach, not 50%. — [ZoomSphere](https://www.zoomsphere.com/blog/linkedin-algorithm-2026-why-generic-ai-content-kills-your-organic-reach); [Meet-Lea](https://meet-lea.com/en/blog/linkedin-algorithm-explained) [VENDOR]. Treat the headline numbers as approximate.
- Widely repeated: posts with 0-3s dwell get 1.2% engagement vs 15.6% for 61s+. — [Meet-Lea](https://meet-lea.com/en/blog/linkedin-algorithm-explained) [VENDOR; could not be traced to the original report]

**Format benchmarks**
- Socialinsider 2026 benchmarks (business pages, engagement by impressions): native documents/carousels are the top format at 7.00% (+14% YoY). Video 5.90% (Q2 2026, flat vs Q1). Polls rose from 3.5% (Q1) to 4.5% (Q2 2026). Link posts fell from 3.7% to 3.3%. — [Socialinsider](https://www.socialinsider.io/blog/linkedin-content-study/) [DATASET]
- Metricool 2026 study (673,658 posts, Jan-Feb 2025 vs 2026, Pages and profiles): carousels, multi-image posts and polls outperform on company pages, video performance slipped, and "invisible interactions" are rising. — [Metricool press release](https://metricool.com/press-release-linkedin-study-2026/) [DATASET]
- Dataslayer compilation (Feb 2026): document/PDF carousel 6.6%, native video (30-90s) 5.6%, image + text 3.2%, text only 2.0%. External-link posts get about -60% reach (attribution unclear). — [Perroly](https://www.perroly.com/blog/linkedin-organic-2026-what-works), [Dataslayer](https://dataslayer.ai/blog/linkedin-algorithm-february-2026-whats-working-now) [VENDOR compilation]
- AuthoredUp data puts video at 0.86x the median reach. — cited by [Contentin](https://contentin.io/blog/linkedin-content-statistics/) [DATASET via VENDOR]

**Profile vs Company Page; golden hour; newsletters**
- Sources agree that personal profiles reach "far more" than Pages, but I found **no sourced 2026 multiplier**. — [Perroly](https://www.perroly.com/blog/linkedin-organic-2026-what-works)
- "Golden hour" (replying to comments within the first 60 minutes) is advice found everywhere, but I found no 2026 dataset quantifying it. — [Perroly](https://www.perroly.com/blog/linkedin-organic-2026-what-works) [FOLKLORE-grade]

### Inferences
- For an AI-drafting workflow, the October 2026 slop classifier is the single most important LinkedIn fact. Drafts must carry specific local data, real deals and anecdotes, and a clear opinion. Template-style "5 tips for first-time buyers" AI posts are exactly the kind of content that is flagged and down-ranked beyond first-degree connections.
- Never auto-post comments. Only originally authored posts should be scheduled. Comments should be typed and reviewed by a human, even if AI-suggested, because LinkedIn's test is "without any human oversight or review."
- The broker's and agents' personal profiles should carry the voice. The Company Page should republish or support it. Use document carousels (for example "What $400k buys in Myrtle Beach vs Charlotte") as the main format, and put links in comments or only occasionally.

### Gaps
- No primary LinkedIn Engineering post on 360Brew or the March 2026 overhaul was fetched. Details come via trade press.
- No sourced 2026 numbers for Company Page vs personal profile reach, newsletter performance, Hootsuite/Shield/Buffer LinkedIn datasets, or a measured "knowledge and advice" classifier (the term appears in older 2023-2024 LinkedIn statements; not verified this session).
- There is no official statement on how third-party schedulers are treated in ranking. Social Media Today notes that LinkedIn uses "where a post originates" as a signal, but LinkedIn did not confirm a scheduler penalty.

## Threads and Bluesky: size, feed ranking, fit for real estate or local business

### Takeaway
Threads is large and growing (147M DAU in July 2026). Bluesky is small and shrinking (about 10.4M mobile MAU in June 2026, down about 52% from its late-2024 peak). Threads ranking is a Meta AI prediction model similar to Instagram's. Bluesky relies on opt-in custom feeds and starter packs. I found no sourced evidence on how real estate or local business content performs on either platform.

### Cited Findings
- Threads DAU was 147M in July 2026 (+21.3% YoY), and web visits were 471.6M (+112% YoY). Stickiness (DAU/MAU) was about 29% in June 2026. — [TechCrunch, 11 Aug 2026 (Similarweb)](https://techcrunch.com/2026/08/11/blueskys-active-user-base-is-shrinking-as-its-focus-expands-beyond-the-app/) [PRESS/DATASET]
- Threads MAU claims range from 350M to 500M+ (a June 2026 "500M" claim is the weakest-sourced). — [SocialBee](https://socialbee.com/blog/bluesky-vs-threads-comparison/); [OpenTweet](https://opentweet.io/blog/twitter-vs-threads-vs-bluesky) [VENDOR]
- Bluesky has nearly 46M registered users and publishes no DAU/MAU figures. Similarweb: mobile MAU 10.4M (June 2026, -27.2% YoY), mobile DAU about 3M (July 2026, -25.6% YoY), quarterly average MAU 22.1M (Q4 2024) → 10.7M (Q2 2026), about -52%. New CEO Toni Schneider. The strategy is shifting toward the AT Protocol ecosystem (BlackSky, Eurosky, Skylight). — [TechCrunch](https://techcrunch.com/2026/08/11/blueskys-active-user-base-is-shrinking-as-its-focus-expands-beyond-the-app/) [PRESS]
- Threads ranking: per Meta's Transparency Center (as cited by guides), the model predicts the likelihood of liking, replying, tapping into the profile, time spent and scrolling past. Meta has not published weights. Feeds are For You (ranked), Following (reverse-chronological) and "Dear Algo" (users can steer For You with requests). Claims that the first 30-60 minutes of engagement decide reach are vendor lore. — [Outfy](https://www.outfy.com/blog/how-threads-algorithm-works/); [Vista Social](https://vistasocial.com/insights/threads-algorithm/) [VENDOR]
- Threads API: Meta's Threads API supports publishing posts, retrieving content, managing replies and insights. Scheduling is handled by third-party tools. — [PostEverywhere](https://posteverywhere.ai/blog/how-the-threads-algorithm-works) [VENDOR; verify at developers.facebook.com/docs/threads]
- Bluesky: starter packs launched June 2024 with up to 50 accounts and 3 custom feeds (a 2026 guide claims 150 accounts, unconfirmed). Custom feeds are open, subscribable, and often keyword- or hashtag-based. The Discover feed is algorithmic and has "Show more/less like this" controls. Third-party schedulers post through the open API. — [TechCrunch 2024](https://techcrunch.com/2024/06/27/bluesky-lets-you-curate-accounts-and-feeds-to-follow-with-its-starter-pack-feature) [PRESS, older]; [SocialKit](https://socialk.it/en/blog/bluesky-for-creators-guide) [VENDOR]

### Inferences
- Threads is the better secondary platform: it is larger, growing, and lets the brand reuse its Instagram audience. Bluesky's small and shrinking user base makes it a low priority for a local brokerage. A keyword-based custom feed ("Myrtle Beach") is about the only cheap local lever there.

### Gaps
- I found no evidence on real estate or local-business performance on Threads or Bluesky.
- I did not fetch Bluesky's official bot or automation policy. The AT Protocol API is open, and posting through it is common, but rate limits and labeling rules were not verified.
- I found no official Meta statement on Threads penalties for links or AI content in 2026.

## Reddit: self-promotion rules, target subreddits, role in Google and AI answers

### Takeaway
Reddit has no sitewide numeric self-promotion ratio anymore. The old 9:1 / 10% guideline survives only in individual subreddit rules. In practice, each subreddit's rules widget governs what is allowed. Google added Reddit quotes to AI Overviews through "Community Perspectives" (May 2026). Reddit's share of ChatGPT citations collapsed in Q3 2026. Since March 2026, Reddit requires human verification from suspicious accounts and labels legitimate bots.

### Cited Findings
- Reddit's Rules page and User Agreement contain **no numeric ratio**. They ask for authentic participation in communities where you have a personal interest, and no spam. The 9:1 guideline is historical and no longer enforced sitewide, though some subs cite it (r/gambling 9:1, r/defi 10%). Rule of thumb: "be a Redditor with a website, not a website with a Reddit account." — [ForkOff, 19 Aug 2026](https://forkoff.xyz/blog/reddit-marketing/reddit-self-promotion-rules-2026) [VENDOR, but a dated audit]
- In an audit of 43 subreddits on 27 Jul 2026, 39 had written rules and 4 had none. Some ban fully AI-written posts and comments (for example r/ethtrader: "fully AI-generated text is not allowed"), and others require disclosure when AI is used. Penalties include mod removal, sub bans, sitewide shadowbans by the spam system, and admin suspensions. — [ForkOff](https://forkoff.xyz/blog/reddit-marketing/reddit-self-promotion-rules-2026)
- On 25 Mar 2026 Reddit announced that accounts showing "automated" or "fishy" behaviour (rapid posting, coordinated multi-account activity) must complete human verification. Options under consideration include passkeys and third-party biometric or government ID checks. Starting 31 Mar 2026, app or bot labels appear on account profiles, with a new label for legitimate automated accounts. Reddit removes about 100k bot and spam accounts per day. There are no broad sitewide restrictions on AI-generated content; communities set their own rules. — [Help Net Security, 26 Mar 2026](https://www.helpnetsecurity.com/2026/03/26/reddit-human-verification-changes/); [TechSpot](https://www.techspot.com/news/111836-reddit-cracks-down-bots-new-labels-human-verification.html?rand=98523) [PRESS]
- Google added "Community Perspectives" (quotes from Reddit and forums) to AI Overviews and AI Mode on 6 May 2026. In Aug 2026 a Google spokesperson reportedly said Reddit "gets no special preference." One tracker found Reddit's citation share rising in Google AIO and AI Mode but falling in Gemini (-32%) and ChatGPT (-94%) from July to Sep 2026. Another source puts the ChatGPT drop at about -86%. — [AI Rank Lab](https://www.airanklab.com/blog/reddit-ai-search-visibility); [The HOTH](https://www.thehoth.com/blog/reddit-seo/); [LLM Pulse](https://llmpulse.ai/blog/reddit-ai-search/) [VENDOR; figures conflict]

### Inferences
- For a brokerage, Reddit is mostly a place to answer questions under a disclosed agent identity: Myrtle Beach relocation questions in r/MyrtleBeach and r/SameGrassButGreener, and buying-process questions in r/FirstTimeHomeBuyer and r/RealEstate. It is not a channel for broadcast posts. Because Google surfaces these threads in AI Overviews, good answers keep working long after they are posted.
- AI-drafted Reddit comments carry the highest risk of any platform: subreddit AI bans, community distaste, and bot-verification triggers for rapid posting. Use AI only for research and outlines, and write the comments by hand.

### Gaps
- **I did not retrieve the rules for r/MyrtleBeach, r/RealEstate, r/FirstTimeHomeBuyer, r/personalfinance, r/fatFIRE, r/realestateinvesting, r/airbnb_hosts or r/SameGrassButGreener.** Each must be checked at reddit.com/r/[name]/about/rules before posting. Some (for example r/personalfinance) are known for strict no-solicitation rules, but this was not verified this session.
- I did not fetch Reddit's own self-promotion wiki; it is bot-challenged.

## Automation and AI rules by platform, plus scheduling tools

### Takeaway
On every platform, scheduling your own original posts through official APIs or approved partners is allowed. The risk is in automated *engagement*: auto-replies, auto-comments, auto-likes, follow/unfollow, auto-DMs. X requires prior approval for AI reply bots and an "Automated" label for bots. LinkedIn bans unauthorized automation and hides scripted comments. Reddit verifies suspicious accounts. X API access is now pay-per-use, with link posts priced far higher than plain posts.

### Cited Findings
**X**
- Bots must enable the "Automated" profile label and disclose in their bio. Scraping, browser automation and other unofficial methods can lead to permanent suspension. AI-generated replies need prior approval through X's Policy Support form, and even approved bots may not impersonate humans. — [X Developer Guidelines, docs.x.com](https://docs.x.com/developer-guidelines) [PRIMARY, via search excerpt; help.x.com automation page returned 403]
- A vendor reports that since 23 Feb 2026, self-serve API replies are accepted only when the original author mentioned or quoted your account first, and that the automation rules were updated in April 2026. — [OpenTweet](https://opentweet.io/answers/does-x-allow-ai-generated-content) [VENDOR, unverified]
- Allowed: scheduling your own posts and threads, and recycling your own content. Restricted: unsolicited automated replies or mentions, bulk follow/like, engagement farming, unsolicited auto-DMs, undisclosed automation. — [OpenTweet](https://opentweet.io/how-to/x-api-rules-for-ai-agents-2026) [VENDOR]
- API pricing: pay-per-use became the default (reported Feb 2026). Legacy Basic ($200/mo) was force-migrated after 1 Jun 2026. Reported rates: about $0.005 per post read, $0.015 per post created, **$0.20 per post with a link** (about a 1,900% premium). The monthly read cap is 2M-3M (sources conflict), and Enterprise is about $42k/mo. A starter credit is rolling out (Oct 2026). — [Blotato](https://www.blotato.com/blog/twitter-api-pricing); [Postproxy](https://postproxy.dev/blog/x-api-pricing-2026/); [WebProNews](https://www.webpronews.com/xs-20-fold-api-surge-for-link-posts-hits-news-aggregators-and-developers-hard/) [VENDOR/PRESS; confirm at docs.x.com]

**LinkedIn**: see §8.2 above. No unauthorized bots, no automated likes, shares, messages or connection requests, no browser plugins that scrape. Scripted or plugin comments are hidden and accounts restricted (Feb 2026). — [User Agreement](https://www.linkedin.com/legal/user-agreement); [Social Media Today](https://www.socialmediatoday.com/news/linkedin-outlines-more-measures-to-combat-engagement-pods/812290/)

**Reddit**: human verification for suspicious accounts and profile labels for apps and bots (Mar 2026). AI rules are set per community. — [Help Net Security](https://www.helpnetsecurity.com/2026/03/26/reddit-human-verification-changes/)

**Threads / Bluesky**: official APIs support publishing (Threads API from Meta; open AT Protocol for Bluesky). — [PostEverywhere](https://posteverywhere.ai/blog/how-the-threads-algorithm-works); [SocialKit](https://socialk.it/en/blog/bluesky-for-creators-guide) [VENDOR]

### Inferences
- Safe architecture: AI drafts → human edits and approves → schedule through the native scheduler (LinkedIn, X and Threads all have native scheduling) or an official-API tool (Buffer, Typefully, Hypefury, Taplio). These publish only the account owner's own posts, which every platform allows. Turn off any tool features that auto-reply, auto-DM, auto-like, auto-retweet or auto-comment, or that use browser extensions on LinkedIn. Those features fall into the prohibited categories above.
- On X, avoid scheduling link posts through the API (the $0.20 premium on per-post cost). Post links natively or in replies.
- No platform requires disclosing that a human-reviewed post was AI-*assisted*. The AI disclosure and label rules apply to *automated accounts* (X, Reddit). The real penalty for AI content is reach (LinkedIn's slop classifier) and community norms (Reddit).

### Gaps
- I could not fetch X's help-center automation rules page (403). The X rules above come from a docs.x.com search excerpt and vendor summaries.
- I did not fetch Buffer, Typefully, Hypefury or Taplio partner statuses or LinkedIn's official partner list. Their safety is inferred from use of official APIs, not verified this session. Taplio's history with LinkedIn (browser-extension features) was not checked.
- I found no rigorous 2026 study showing that "AI-sounding" posts get lower reach on X or Threads, or measuring reader backlash. LinkedIn's 40% view reduction for classified slop is the only platform-reported figure.
