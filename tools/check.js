#!/usr/bin/env node
/*
 * Social Media Brain: check every platform version of every draft against the law,
 * Chapter3's business boundaries and the voice rules.
 *
 *   node tools/check.js drafts/batch-001.json            print the results
 *   node tools/check.js drafts/batch-001.json --report   also write drafts/batch-001.report.md
 *
 * Rules come from rules/social.json and rules/blog-claims.json (Blog Brain's claims, unchanged).
 * Exit code 1 if any post is blocked, so a blocked post cannot reach the owner's queue.
 *
 * Verdicts, worst first: block (cannot publish), fix (change it, or the owner overrides with a
 * logged reason), review (an amber topic: the owner reads it closely), pass.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const RANK = { pass: 0, review: 1, fix: 2, block: 3 };

/* Blog Brain severities mapped to social verdicts. */
const BLOG_SEVERITY = { critical: "block", high: "block", medium: "fix", low: "review" };
/* Blog Brain rules that do not apply to social posts. */
const BLOG_SKIP = new Set(["old-email"]);

const LIMITS = { x: 280, threads: 500, bluesky: 300, linkedin: 3000, reddit: 10000 };
const PLATFORMS = Object.keys(LIMITS);

function compile(rule, source) {
  const flags = rule.flags === undefined ? "i" : rule.flags;
  return {
    ...rule,
    source,
    res: rule.patterns.map(p => new RegExp(p, flags.includes("g") ? flags : flags + "g")),
    unlessRe: rule.unless ? new RegExp(rule.unless, "i") : null,
    ignoreRe: rule.ignore ? new RegExp(rule.ignore, "gi") : null,
  };
}

function loadRules(root = ROOT) {
  const social = JSON.parse(fs.readFileSync(path.join(root, "rules/social.json"), "utf8")).rules;
  const blog = JSON.parse(fs.readFileSync(path.join(root, "rules/blog-claims.json"), "utf8")).rules;
  return [
    ...social.map(r => compile(r, "social")),
    ...blog.filter(r => !BLOG_SKIP.has(r.id)).map(r => compile({ ...r, severity: BLOG_SEVERITY[r.severity] || "fix" }, "blog")),
  ];
}

/* X counts every link as 23 characters. Other platforms count it as written. */
function length(text, platform) {
  const t = platform === "x" ? text.replace(/https?:\/\/\S+/g, "x".repeat(23)) : text;
  return [...t].length;
}

const FIRM_RE = /\bChapter ?3 Realty\b|chapter3realty\.com/i;
/* Numbers that need a source: money, percentages, large counts, and counted units. */
const NUMBER_RE = /\$\s?\d|\d\s?%|\b\d+(?:\.\d+)?\s?percent\b|\b\d{1,3}(?:,\d{3})+\b|\b\d+(?:\.\d+)?\s?(?:months?|days|weeks|homes|listings|units|condos|sales)\b/i;
/* Numbers that are names, not claims. */
const NUMBER_NAMES_RE = /\bChapter ?3\b|\b(?:Highway|Hwy|US|SC|Route)\s?\d+\b|\b\d+ Bypass\b|\b24\/7\b|\b(?:19|20)\d{2}\b/gi;
const HASHTAG_RE = /(^|\s)#[A-Za-z]\w*/g;

function checkText(text, platform, post, rules, state = {}) {
  const findings = [];
  const add = (rule, severity, match, why, fix) => findings.push({ rule, severity, match, why, fix });

  for (const r of rules) {
    if (r.unlessField && post[r.unlessField]) continue;
    if (r.unlessRe && r.unlessRe.test(text)) continue;
    const scan = r.ignoreRe ? text.replace(r.ignoreRe, " ") : text;
    for (const re of r.res) {
      re.lastIndex = 0;
      const m = re.exec(scan);
      if (m) { add(r.id, r.severity, m[0], r.why, r.fix); break; }
    }
  }

  if (!FIRM_RE.test(text)) {
    add("firm-name", "block", "", "L-1, SC Code 40-57-135(E)(2): every post must name the brokerage or link to its homepage.",
      platform === "reddit" ? "Add the disclosure line: 'I work at Chapter3 Realty, a brokerage in Myrtle Beach.'" : "End with '— Gus, Chapter3 Realty'.");
  }

  const limit = LIMITS[platform];
  if (limit && length(text, platform) > limit) {
    add("length", "block", `${length(text, platform)} characters`, `${platform} allows ${limit} characters on a free account.`, "Cut it.");
  }

  const tags = text.match(HASHTAG_RE) || [];
  if (tags.length > 2) add("hashtags", "fix", tags.join(" ").trim(), "More than two hashtags reads as spam.", "Keep two at most.");

  const claimText = text.replace(NUMBER_NAMES_RE, " ");
  const num = claimText.match(NUMBER_RE);
  if (num && !(post.facts && post.facts.length)) {
    add("unsourced-number", "fix", num[0], "S-5: every number comes from a source on file.", "Add the source to the draft's facts list, or remove the number.");
  }

  if (state.killSwitch && !post.stormSafe) {
    add("kill-switch", "block", state.killSwitch, "A storm or flood alert is active for Horry or Georgetown County.", "Hold the post. Only posts marked stormSafe (literal safety or insurance information) may go out.");
  }
  return findings;
}

function verdictOf(findings) {
  return findings.reduce((v, f) => (RANK[f.severity] > RANK[v] ? f.severity : v), "pass");
}

function checkPost(post, rules, state) {
  const results = {};
  const versions = post.platforms || {};
  const problems = [];
  if (!post.id) problems.push({ rule: "draft-shape", severity: "block", match: "", why: "Every draft needs an id.", fix: "Add an id." });
  if (!Object.keys(versions).length) problems.push({ rule: "draft-shape", severity: "block", match: "", why: "The draft has no platform versions.", fix: "Add at least one platform." });
  for (const p of Object.keys(versions)) {
    if (!PLATFORMS.includes(p)) {
      problems.push({ rule: "draft-shape", severity: "block", match: p, why: `Unknown platform "${p}".`, fix: `Use one of: ${PLATFORMS.join(", ")}.` });
      continue;
    }
    const findings = checkText(versions[p], p, post, rules, state);
    results[p] = { verdict: verdictOf(findings), findings, length: length(versions[p], p) };
  }
  const all = [...problems, ...Object.values(results).flatMap(r => r.findings)];
  return { id: post.id, verdict: verdictOf(all), problems, platforms: results };
}

function readState(root = ROOT) {
  try {
    const s = JSON.parse(fs.readFileSync(path.join(root, "state/killswitch.json"), "utf8"));
    return s.active ? { killSwitch: s.reason || "active" } : {};
  } catch { return {}; }
}

function report(batch, results) {
  const lines = [`# Check report: ${batch.batch || "batch"}`, "", `Checked ${new Date().toISOString().slice(0, 10)} by tools/check.js.`, ""];
  const count = v => results.filter(r => r.verdict === v).length;
  lines.push(`| Verdict | Posts |`, `|---|---|`, ...["block", "fix", "review", "pass"].map(v => `| ${v} | ${count(v)} |`), "");
  for (const r of results) {
    lines.push(`## ${r.id}: ${r.verdict}`, "");
    for (const f of r.problems) lines.push(`- **${f.severity}** \`${f.rule}\` ${f.why} ${f.fix}`);
    for (const [p, res] of Object.entries(r.platforms)) {
      lines.push(`- **${p}** (${res.length} chars): ${res.verdict}`);
      for (const f of res.findings) lines.push(`  - ${f.severity} \`${f.rule}\`${f.match ? ` "${f.match}"` : ""}: ${f.fix}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function main(argv) {
  const file = argv.find(a => !a.startsWith("--"));
  if (!file) { console.error("usage: node tools/check.js <drafts/batch.json> [--report]"); return 2; }
  const batch = JSON.parse(fs.readFileSync(file, "utf8"));
  const rules = loadRules();
  const state = readState();
  const results = (batch.posts || []).map(p => checkPost(p, rules, state));
  for (const r of results) {
    console.log(`${r.verdict.toUpperCase().padEnd(6)} ${r.id}`);
    for (const f of r.problems) console.log(`         ${f.severity} ${f.rule}: ${f.why}`);
    for (const [p, res] of Object.entries(r.platforms)) {
      for (const f of res.findings) console.log(`         ${p}: ${f.severity} ${f.rule}${f.match ? ` "${f.match}"` : ""}`);
    }
  }
  if (argv.includes("--report")) {
    const out = file.replace(/\.json$/, ".report.md");
    fs.writeFileSync(out, report(batch, results) + "\n");
    console.log(`\nreport: ${out}`);
  }
  return results.some(r => r.verdict === "block") ? 1 : 0;
}

module.exports = { loadRules, checkText, checkPost, verdictOf, length, LIMITS };
if (require.main === module) process.exitCode = main(process.argv.slice(2));
