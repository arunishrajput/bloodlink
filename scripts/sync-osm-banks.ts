/**
 * Refresh the blood bank directory from OpenStreetMap (many entries there come from India's
 * open government data release). Usage:
 *   npm run sync:banks              fetch live data, update the DB and the bundled snapshot
 *   npm run sync:banks -- --no-save fetch and update the DB only
 *   npm run sync:banks -- --from-file overpass.json   use a saved Overpass response
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";
import { fetchOsmElements, normalizeElements, upsertBanks } from "./lib/osm-banks";

const prisma = new PrismaClient();

async function main() {
  const fileArg = process.argv.indexOf("--from-file");
  console.log(fileArg > 0 ? "Reading saved Overpass response…" : "Fetching blood banks from OpenStreetMap…");
  const elements = fileArg > 0 ? JSON.parse(readFileSync(process.argv[fileArg + 1], "utf8")).elements : await fetchOsmElements();
  const rows = normalizeElements(elements);
  console.log(`${rows.length} usable listings.`);
  if (!process.argv.includes("--no-save")) {
    writeFileSync(new URL("../prisma/data/blood-banks.json", import.meta.url), JSON.stringify(rows));
    console.log("Snapshot written to prisma/data/blood-banks.json");
  }
  const r = await upsertBanks(prisma, rows);
  console.log(`Created ${r.created}, updated ${r.updated}.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
