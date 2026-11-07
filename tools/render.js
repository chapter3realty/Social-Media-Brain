#!/usr/bin/env node
/*
 * Turn a drafts JSON batch into a Markdown page the owner can read and mark up.
 *   node tools/render.js drafts/batch-001.json   writes drafts/batch-001.md
 */
"use strict";
const fs = require("fs");
const { loadRules, checkPost } = require("./check.js");

const NAMES = { x: "X", threads: "Threads", bluesky: "Bluesky", linkedin: "LinkedIn", reddit: "Reddit" };

function render(batch, rules) {
  const out = [`# ${batch.batch}`, "", batch.purpose || "", ""];
  for (const post of batch.posts || []) {
    const r = checkPost(post, rules, {});
    out.push(`## ${post.id}: ${post.idea}`, "");
    out.push(`Pillar: ${post.pillar} · Tier: ${post.tier} · Checker: **${r.verdict}**`, "");
    for (const [p, text] of Object.entries(post.platforms || {})) {
      out.push(`**${NAMES[p] || p}** (${r.platforms[p] ? r.platforms[p].length : "?"} characters)`, "");
      out.push(...text.split("\n").map(l => `> ${l}`), "");
      for (const f of (r.platforms[p] || { findings: [] }).findings) out.push(`- ${f.severity} \`${f.rule}\`: ${f.fix}`);
      if ((r.platforms[p] || { findings: [] }).findings.length) out.push("");
    }
    if (post.facts && post.facts.length) {
      out.push("Sources:", "", ...post.facts.map(f => `- ${f.claim}: ${f.source}`), "");
    }
    if (post.notes) out.push(`Note: ${post.notes}`, "");
  }
  return out.join("\n");
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) { console.error("usage: node tools/render.js <drafts/batch.json>"); process.exit(2); }
  const out = file.replace(/\.json$/, ".md");
  fs.writeFileSync(out, render(JSON.parse(fs.readFileSync(file, "utf8")), loadRules()));
  console.log(out);
}
module.exports = { render };
