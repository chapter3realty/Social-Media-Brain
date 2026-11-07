#!/usr/bin/env node
/*
 * Storm kill switch. Reads active National Weather Service alerts (free, no key) and, if a
 * storm or flood alert covers Horry or Georgetown County, writes state/killswitch.json with
 * active: true. While it is active, tools/check.js blocks every post not marked stormSafe.
 *
 *   node tools/killswitch.js          check the alerts and update the state
 *   node tools/killswitch.js --clear  a human lifts the pause after the storm
 *
 * The switch never turns itself off. A cheerful post the morning after landfall is the risk,
 * so a person decides when jokes come back.
 */
"use strict";
const fs = require("fs");
const path = require("path");

const STATE = path.join(__dirname, "..", "state", "killswitch.json");
const COUNTIES = /\b(?:Horry|Georgetown)\b/i;
const EVENTS = /\b(?:Hurricane|Tropical Storm|Storm Surge|Flash Flood (?:Warning|Emergency)|Coastal Flood Warning|Tornado Warning|Extreme Wind)\b/i;
const URL = "https://api.weather.gov/alerts/active?area=SC";

function matching(features) {
  return (features || [])
    .map(f => f.properties || {})
    .filter(p => COUNTIES.test(p.areaDesc || "") && EVENTS.test(p.event || ""))
    .map(p => ({ event: p.event, area: p.areaDesc, ends: p.ends || p.expires || null }));
}

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE, "utf8")); } catch { return { active: false }; }
}

function writeState(s) {
  fs.mkdirSync(path.dirname(STATE), { recursive: true });
  fs.writeFileSync(STATE, JSON.stringify(s, null, 2) + "\n");
}

async function main(argv) {
  const now = new Date().toISOString();
  if (argv.includes("--clear")) {
    writeState({ active: false, clearedAt: now, clearedBy: "owner" });
    console.log("Kill switch cleared. Joke posts may go out again.");
    return 0;
  }
  const res = await fetch(URL, { headers: { "User-Agent": "chapter3-social-media-brain", Accept: "application/geo+json" } });
  if (!res.ok) { console.error(`NWS returned ${res.status}. State unchanged.`); return 2; }
  const alerts = matching((await res.json()).features);
  const prev = readState();
  if (alerts.length) {
    const reason = alerts.map(a => a.event).filter((e, i, all) => all.indexOf(e) === i).join(", ");
    writeState({ active: true, reason, since: prev.active ? prev.since : now, checkedAt: now, alerts });
    console.log(`KILL SWITCH ON: ${reason}. Only stormSafe posts pass the checker.`);
  } else if (prev.active) {
    writeState({ ...prev, checkedAt: now, alerts: [] });
    console.log(`No active alerts, but the switch stays on until a person runs: node tools/killswitch.js --clear`);
  } else {
    writeState({ active: false, checkedAt: now });
    console.log("No storm or flood alerts for Horry or Georgetown County.");
  }
  return 0;
}

module.exports = { matching };
if (require.main === module) main(process.argv.slice(2)).then(c => { process.exitCode = c; });
