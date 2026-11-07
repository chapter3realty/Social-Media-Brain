"use strict";
/* Every rule gets one text that must trip it and one that must not (the Blog Brain habit:
 * sanity-check a scanner before believing it). */
const test = require("node:test");
const assert = require("node:assert");
const { loadRules, checkText, checkPost, length } = require("../tools/check.js");
const { matching } = require("../tools/killswitch.js");

const rules = loadRules();
const SIGN = " — Gus, Chapter3 Realty";
const ids = (text, platform = "x", post = {}, state) => checkText(text, platform, post, rules, state).map(f => f.rule);

const controls = [
  // [rule, trips, does not trip]
  ["placeholder", "months of supply: {DATA:mos}", "months of supply is on the website"],
  ["street-address", "look at 1234 Ocean Boulevard before you buy", "look at Ocean Boulevard before you buy"],
  ["street-address", "see MLS #2512345", "the MLS is where agents list homes"],
  ["payment-terms", "your monthly payment would be $2,100", "rent here runs $1,800 a month"],
  ["payment-terms", "only 5% down", "the HOA fee went up 5% this year"],
  ["payment-terms", "a 30-year fixed is the norm", "the roof is 30 years old"],
  ["guarantee", "this condo is guaranteed to appreciate", "nothing about prices is certain"],
  ["guarantee", "beach condos always go up", "beach condo prices went down in 2008"],
  ["property-management", "we'll manage your rental for you", "a property manager runs the rental"],
  ["age-restricted", "a great 55+ community", "a community with a pool and a gym"],
  ["age-restricted", "adults only building", "the building has two pools"],
  ["fair-housing-social", "perfect for empty nesters", "two bedrooms, one floor, an elevator"],
  ["fair-housing-social", "a low-crime area", "a quiet street with a cul-de-sac"],
  ["fair-housing-social", "walking distance to church", "walking distance to the beach"],
  ["realtor-mark", "ask your realtor", "check Realtor.com"],
  ["free-service", "get a free CMA", "the investor tool on our site has no charge"],
  ["ai-vocabulary", "let's delve into the market", "here is the market"],
  ["ai-vocabulary", "navigate the buying journey", "buying takes about 45 days"],
  ["testimonial", "one client said we were great", "one buyer asked us about flood zones"],
  ["deal-claim", "we just sold a condo in Surfside", "we help people buy condos in Surfside"],
  ["named-firm", "Coastal Breeze Realty never calls back", "most agents never call back"],
  ["named-firm", "Zillow says your house is worth more", "online estimates have never seen your house"],
  ["named-building", "the Sea Watch Tower HOA is a mess", "an oceanfront tower's HOA budget"],
  ["prediction", "prices will drop next year", "prices dropped last year"],
  ["prediction", "the crash is coming", "the market slowed down"],
  ["commissions", "who pays the commission now?", "who pays the HOA transfer fee?"],
  ["politics", "city council voted on short-term rentals", "the HOA voted on short-term rentals"],
  ["do-not-joke", "hurricane season is here", "check the flood zone before you buy"],
  ["do-not-joke", "the house was flooded twice", "ask for the flood insurance quote"],
  ["named-building", "the Ocean Palms Villas HOA raised dues", "The HOA policy covers the building"],
  ["named-firm", "a call from Coastal Breeze Realty", "Gus, Chief Roof Inspector\nChapter3 Realty, Myrtle Beach"],
  ["team-mention", "Tim Nash has 30 years here", "our broker has 30 years here"],
  // Blog Brain rules, carried over unchanged.
  ["lender-identity", "we offer financing too", "BrickWood Mortgage is a separate company"],
  ["interest-rate", "mortgage rates are near 6.5%", "the cap rate is near 6.5%"],
  ["licence-claim", "talk to our MLO", "talk to your lender"],
  ["individual-named", "Devin built the tool", "our team built the tool"],
  ["superlative", "the best brokerage in Myrtle Beach", "a brokerage in Myrtle Beach"],
  ["fair-housing", "great schools nearby", "the school district's assignment page"],
];

for (const [rule, bad, good] of controls) {
  test(`${rule}: trips on "${bad}"`, () => assert.ok(ids(bad + SIGN).includes(rule), `expected ${rule}`));
  test(`${rule}: passes "${good}"`, () => assert.ok(!ids(good + SIGN).includes(rule), `did not expect ${rule}`));
}

test("firm-name: required on every platform", () => {
  assert.ok(ids("read the reserve study. i'm watching.").includes("firm-name"));
  assert.ok(!ids("read the reserve study." + SIGN).includes("firm-name"));
  assert.ok(!ids("details at https://chapter3realty.com/hoa/").includes("firm-name"));
  assert.ok(ids("I read reserve studies for work.", "reddit").includes("firm-name"));
});

test("length: X counts a link as 23 characters", () => {
  assert.strictEqual(length("see https://chapter3realty.com/hoa/reserves/explained-in-plain-words/", "x"), 4 + 23);
  assert.ok(ids("a".repeat(270) + SIGN).includes("length"));
  assert.ok(!ids("a".repeat(270) + SIGN, "threads").includes("length"));
});

test("unsourced-number: needs a facts entry; road names and years do not count", () => {
  assert.ok(ids("HOA fees rose 12% this year." + SIGN).includes("unsourced-number"));
  assert.ok(!ids("HOA fees rose 12% this year." + SIGN, "x", { facts: [{ claim: "12%", source: "x" }] }).includes("unsourced-number"));
  assert.ok(!ids("the 17 Bypass in July, 2026 edition" + SIGN).includes("unsourced-number"));
});

test("hashtags: two allowed, three is a fix", () => {
  assert.ok(!ids("#MyrtleBeach #RealEstate" + SIGN).includes("hashtags"));
  assert.ok(ids("#MyrtleBeach #RealEstate #Condos" + SIGN).includes("hashtags"));
});

test("unlessField: verified 55+ community and listing authorization lift the block", () => {
  assert.ok(!ids("a 55+ community" + SIGN, "x", { verified55: true }).includes("age-restricted"));
  assert.ok(!ids("1234 Ocean Boulevard, listed by Chapter3 Realty", "x", { listingAuthorization: "Chapter3 Realty" }).includes("street-address"));
});

test("kill switch blocks joke posts, not storm-safe ones", () => {
  const state = { killSwitch: "Hurricane Warning" };
  assert.ok(ids("bypass traffic is a joke" + SIGN, "x", {}, state).includes("kill-switch"));
  assert.ok(!ids("where to find your flood zone" + SIGN, "x", { stormSafe: true }, state).includes("kill-switch"));
});

test("checkPost: worst verdict wins and bad shapes block", () => {
  const r = checkPost({ id: "a", platforms: { x: "read the reserve study." + SIGN, linkedin: "Ask your realtor. Chapter3 Realty" } }, rules, {});
  assert.strictEqual(r.platforms.x.verdict, "pass");
  assert.strictEqual(r.platforms.linkedin.verdict, "fix");
  assert.strictEqual(r.verdict, "fix");
  assert.strictEqual(checkPost({ id: "b", platforms: { myspace: "hi" } }, rules, {}).verdict, "block");
  assert.strictEqual(checkPost({ id: "c" }, rules, {}).verdict, "block");
});

test("killswitch: matches storm alerts for Horry or Georgetown only", () => {
  const f = (event, areaDesc) => ({ properties: { event, areaDesc } });
  assert.strictEqual(matching([f("Hurricane Warning", "Coastal Horry; Inland Horry")]).length, 1);
  assert.strictEqual(matching([f("Hurricane Warning", "Charleston; Berkeley")]).length, 0);
  assert.strictEqual(matching([f("Heat Advisory", "Coastal Horry")]).length, 0);
  assert.strictEqual(matching([f("Flash Flood Warning", "Georgetown")]).length, 1);
});
