/**
 * Import real blood banks from a CSV file.
 *
 *   npm run import:banks -- path/to/banks.csv [--replace-seed]
 *
 * Required columns (header row, any order): name, category, address, state, district, lat, lng, phone
 * Optional: pincode, email, licenseNo, hasComponents (true/false)
 * category: GOVERNMENT | PRIVATE | CHARITABLE | RED_CROSS (anything else becomes PRIVATE)
 * --replace-seed deletes the fictional seed banks (phone numbers starting 0000) first.
 */
import { readFileSync } from "fs";
import { PrismaClient, type BankCategory } from "@prisma/client";
import { BLOOD_GROUPS } from "../src/lib/blood";
import { isValidLocation } from "../src/lib/geo";

const prisma = new PrismaClient();

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

const CATEGORIES = ["GOVERNMENT", "PRIVATE", "CHARITABLE", "RED_CROSS"];

async function main() {
  const [file, ...flags] = process.argv.slice(2);
  if (!file) throw new Error("Usage: npm run import:banks -- banks.csv [--replace-seed]");
  const [header, ...rows] = parseCsv(readFileSync(file, "utf8"));
  const col = (name: string) => header.findIndex((h) => h.trim().toLowerCase() === name.toLowerCase());
  const idx = Object.fromEntries(["name", "category", "address", "state", "district", "lat", "lng", "phone", "pincode", "email", "licenseNo", "hasComponents"].map((k) => [k, col(k)]));
  for (const k of ["name", "address", "state", "district", "lat", "lng", "phone"]) if (idx[k] < 0) throw new Error(`Missing column: ${k}`);

  if (flags.includes("--replace-seed")) {
    const { count } = await prisma.bloodBank.deleteMany({ where: { phone: { startsWith: "0000" } } });
    console.log(`Removed ${count} seed banks`);
  }

  let ok = 0;
  const skipped: string[] = [];
  for (const [n, r] of rows.entries()) {
    const get = (k: string) => (idx[k] >= 0 ? r[idx[k]]?.trim() ?? "" : "");
    const lat = Number(get("lat"));
    const lng = Number(get("lng"));
    if (!isValidLocation(get("state"), get("district")) || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      skipped.push(`row ${n + 2}: ${get("name")} (invalid state/district or coordinates)`);
      continue;
    }
    const cat = get("category").toUpperCase().replace(/[^A-Z]/g, "_");
    await prisma.bloodBank.create({
      data: {
        name: get("name"),
        category: (CATEGORIES.includes(cat) ? cat : "PRIVATE") as BankCategory,
        address: get("address"),
        state: get("state"),
        district: get("district"),
        lat,
        lng,
        phone: get("phone"),
        pincode: get("pincode") || null,
        email: get("email") || null,
        licenseNo: get("licenseNo") || null,
        hasComponents: get("hasComponents").toLowerCase() === "true",
        verified: true,
        stock: { create: BLOOD_GROUPS.map((g) => ({ bloodGroup: g, units: 0 })) },
      },
    });
    ok++;
  }
  console.log(`Imported ${ok} banks. Skipped ${skipped.length}.`);
  skipped.slice(0, 50).forEach((s) => console.log("  " + s));
}

main()
  .catch((e) => {
    console.error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
