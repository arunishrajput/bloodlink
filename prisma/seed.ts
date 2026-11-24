/**
 * Seeds a database for demos.
 *  - Blood banks: the real public directory snapshot in prisma/data/blood-banks.json (see `npm run sync:banks`).
 *  - Everything else is FICTIONAL: donors, camps, blog posts, notices, demo accounts, and the stock figures
 *    (real banks don't publish stock openly, so a share of them get simulated units; skip with SEED_DEMO_STOCK=false).
 * Donor/camp phone numbers use the invalid 0000 prefix so nobody real is ever called.
 */
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import { BLOOD_GROUPS } from "../src/lib/blood";
import { BLOG_POSTS, NOTICES } from "./seed-content";
import type { BankRow } from "../scripts/lib/osm-banks";
import { DEMO } from "../src/lib/demo";

const prisma = new PrismaClient();

// Deterministic PRNG so every seed run produces the same data.
let s = 42;
const rand = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = <T,>(a: readonly T[]) => a[Math.floor(rand() * a.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const jitter = (v: number, km: number) => v + ((rand() - 0.5) * 2 * km) / 111;

type City = { city: string; state: string; district: string; lat: number; lng: number; weight: number };

const CITIES: City[] = [
  { city: "New Delhi", state: "Delhi", district: "New Delhi", lat: 28.6139, lng: 77.209, weight: 4 },
  { city: "Delhi", state: "Delhi", district: "South Delhi", lat: 28.5355, lng: 77.241, weight: 3 },
  { city: "Delhi", state: "Delhi", district: "North West Delhi", lat: 28.7041, lng: 77.1025, weight: 2 },
  { city: "Delhi", state: "Delhi", district: "East Delhi", lat: 28.6279, lng: 77.2954, weight: 2 },
  { city: "Gurugram", state: "Haryana", district: "Gurgaon", lat: 28.4595, lng: 77.0266, weight: 2 },
  { city: "Faridabad", state: "Haryana", district: "Faridabad", lat: 28.4089, lng: 77.3178, weight: 1 },
  { city: "Noida", state: "Uttar Pradesh", district: "Gautam Buddha Nagar", lat: 28.5355, lng: 77.391, weight: 2 },
  { city: "Ghaziabad", state: "Uttar Pradesh", district: "Ghaziabad", lat: 28.6692, lng: 77.4538, weight: 1 },
  { city: "Mumbai", state: "Maharashtra", district: "Mumbai City", lat: 18.9388, lng: 72.8354, weight: 3 },
  { city: "Mumbai", state: "Maharashtra", district: "Mumbai Suburban", lat: 19.1197, lng: 72.8468, weight: 3 },
  { city: "Thane", state: "Maharashtra", district: "Thane", lat: 19.2183, lng: 72.9781, weight: 2 },
  { city: "Pune", state: "Maharashtra", district: "Pune", lat: 18.5204, lng: 73.8567, weight: 3 },
  { city: "Nagpur", state: "Maharashtra", district: "Nagpur", lat: 21.1458, lng: 79.0882, weight: 2 },
  { city: "Bengaluru", state: "Karnataka", district: "Bengaluru (Bangalore) Urban", lat: 12.9716, lng: 77.5946, weight: 4 },
  { city: "Mysuru", state: "Karnataka", district: "Mysuru (Mysore)", lat: 12.2958, lng: 76.6394, weight: 1 },
  { city: "Chennai", state: "Tamil Nadu", district: "Chennai", lat: 13.0827, lng: 80.2707, weight: 3 },
  { city: "Coimbatore", state: "Tamil Nadu", district: "Coimbatore", lat: 11.0168, lng: 76.9558, weight: 2 },
  { city: "Madurai", state: "Tamil Nadu", district: "Madurai", lat: 9.9252, lng: 78.1198, weight: 1 },
  { city: "Hyderabad", state: "Telangana", district: "Hyderabad", lat: 17.385, lng: 78.4867, weight: 4 },
  { city: "Warangal", state: "Telangana", district: "Warangal (Urban)", lat: 17.9689, lng: 79.5941, weight: 1 },
  { city: "Kolkata", state: "West Bengal", district: "Kolkata", lat: 22.5726, lng: 88.3639, weight: 3 },
  { city: "Howrah", state: "West Bengal", district: "Howrah", lat: 22.5958, lng: 88.2636, weight: 1 },
  { city: "Ahmedabad", state: "Gujarat", district: "Ahmedabad", lat: 23.0225, lng: 72.5714, weight: 3 },
  { city: "Surat", state: "Gujarat", district: "Surat", lat: 21.1702, lng: 72.8311, weight: 2 },
  { city: "Vadodara", state: "Gujarat", district: "Vadodara", lat: 22.3072, lng: 73.1812, weight: 1 },
  { city: "Rajkot", state: "Gujarat", district: "Rajkot", lat: 22.3039, lng: 70.8022, weight: 1 },
  { city: "Jaipur", state: "Rajasthan", district: "Jaipur", lat: 26.9124, lng: 75.7873, weight: 3 },
  { city: "Jodhpur", state: "Rajasthan", district: "Jodhpur", lat: 26.2389, lng: 73.0243, weight: 1 },
  { city: "Udaipur", state: "Rajasthan", district: "Udaipur", lat: 24.5854, lng: 73.7125, weight: 1 },
  { city: "Lucknow", state: "Uttar Pradesh", district: "Lucknow", lat: 26.8467, lng: 80.9462, weight: 3 },
  { city: "Kanpur", state: "Uttar Pradesh", district: "Kanpur Nagar", lat: 26.4499, lng: 80.3319, weight: 2 },
  { city: "Varanasi", state: "Uttar Pradesh", district: "Varanasi", lat: 25.3176, lng: 82.9739, weight: 2 },
  { city: "Agra", state: "Uttar Pradesh", district: "Agra", lat: 27.1767, lng: 78.0081, weight: 1 },
  { city: "Prayagraj", state: "Uttar Pradesh", district: "Allahabad", lat: 25.4358, lng: 81.8463, weight: 1 },
  { city: "Amritsar", state: "Punjab", district: "Amritsar", lat: 31.634, lng: 74.8723, weight: 1 },
  { city: "Ludhiana", state: "Punjab", district: "Ludhiana", lat: 30.901, lng: 75.8573, weight: 2 },
  { city: "Mohali", state: "Punjab", district: "Sahibzada Ajit Singh Nagar (Mohali)", lat: 30.7046, lng: 76.7179, weight: 1 },
  { city: "Jalandhar", state: "Punjab", district: "Jalandhar", lat: 31.326, lng: 75.5762, weight: 1 },
  { city: "Chandigarh", state: "Chandigarh", district: "Chandigarh", lat: 30.7333, lng: 76.7794, weight: 2 },
  { city: "Kochi", state: "Kerala", district: "Ernakulam", lat: 9.9312, lng: 76.2673, weight: 2 },
  { city: "Thiruvananthapuram", state: "Kerala", district: "Thiruvananthapuram", lat: 8.5241, lng: 76.9366, weight: 2 },
  { city: "Kozhikode", state: "Kerala", district: "Kozhikode", lat: 11.2588, lng: 75.7804, weight: 1 },
  { city: "Bhopal", state: "Madhya Pradesh", district: "Bhopal", lat: 23.2599, lng: 77.4126, weight: 2 },
  { city: "Indore", state: "Madhya Pradesh", district: "Indore", lat: 22.7196, lng: 75.8577, weight: 2 },
  { city: "Gwalior", state: "Madhya Pradesh", district: "Gwalior", lat: 26.2183, lng: 78.1828, weight: 1 },
  { city: "Patna", state: "Bihar", district: "Patna", lat: 25.5941, lng: 85.1376, weight: 2 },
  { city: "Gaya", state: "Bihar", district: "Gaya", lat: 24.7914, lng: 85.0002, weight: 1 },
  { city: "Bhubaneswar", state: "Odisha", district: "Khordha", lat: 20.2961, lng: 85.8245, weight: 2 },
  { city: "Cuttack", state: "Odisha", district: "Cuttack", lat: 20.4625, lng: 85.8828, weight: 1 },
  { city: "Guwahati", state: "Assam", district: "Kamrup Metropolitan", lat: 26.1445, lng: 91.7362, weight: 2 },
  { city: "Ranchi", state: "Jharkhand", district: "Ranchi", lat: 23.3441, lng: 85.3096, weight: 1 },
  { city: "Raipur", state: "Chhattisgarh", district: "Raipur", lat: 21.2514, lng: 81.6296, weight: 1 },
  { city: "Dehradun", state: "Uttarakhand", district: "Dehradun", lat: 30.3165, lng: 78.0322, weight: 1 },
  { city: "Shimla", state: "Himachal Pradesh", district: "Shimla", lat: 31.1048, lng: 77.1734, weight: 1 },
  { city: "Srinagar", state: "Jammu and Kashmir", district: "Srinagar", lat: 34.0837, lng: 74.7973, weight: 1 },
  { city: "Jammu", state: "Jammu and Kashmir", district: "Jammu", lat: 32.7266, lng: 74.857, weight: 1 },
  { city: "Panaji", state: "Goa", district: "North Goa", lat: 15.4909, lng: 73.8278, weight: 1 },
  { city: "Visakhapatnam", state: "Andhra Pradesh", district: "Visakhapatnam", lat: 17.6868, lng: 83.2185, weight: 2 },
  { city: "Vijayawada", state: "Andhra Pradesh", district: "Krishna", lat: 16.5062, lng: 80.648, weight: 1 },
  { city: "Guntur", state: "Andhra Pradesh", district: "Guntur", lat: 16.3067, lng: 80.4365, weight: 1 },
  { city: "Puducherry", state: "Puducherry", district: "Pondicherry", lat: 11.9416, lng: 79.8083, weight: 1 },
  { city: "Imphal", state: "Manipur", district: "Imphal West", lat: 24.817, lng: 93.9368, weight: 1 },
  { city: "Shillong", state: "Meghalaya", district: "East Khasi Hills", lat: 25.5788, lng: 91.8933, weight: 1 },
  { city: "Agartala", state: "Tripura", district: "West Tripura", lat: 23.8315, lng: 91.2868, weight: 1 },
  { city: "Gangtok", state: "Sikkim", district: "East Sikkim", lat: 27.3389, lng: 88.6065, weight: 1 },
  { city: "Leh", state: "Ladakh", district: "Leh", lat: 34.1526, lng: 77.5771, weight: 1 },
  { city: "Port Blair", state: "Andaman and Nicobar Islands", district: "South Andaman", lat: 11.6234, lng: 92.7265, weight: 1 },
];

const FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Ishaan", "Kabir", "Rohan", "Arjun", "Sai", "Ananya", "Diya", "Isha", "Kavya", "Meera", "Priya", "Riya", "Saanvi", "Tara", "Zoya", "Farhan", "Gurpreet", "Harleen", "Joseph", "Lakshmi", "Nikhil", "Pooja", "Rahul", "Sneha", "Tenzin", "Vikram", "Yash"];
const LAST_NAMES = ["Sharma", "Verma", "Iyer", "Nair", "Reddy", "Das", "Singh", "Kaur", "Khan", "Patel", "Mehta", "Gupta", "Joshi", "Menon", "Bose", "Rao", "Pillai", "Chopra", "Mishra", "Fernandes"];

// Rough share of each group in the Indian population, used to weight stock and donors.
const GROUP_WEIGHTS: Record<string, number> = { "O+": 32, "B+": 31, "A+": 22, "AB+": 8, "O-": 2, "B-": 2, "A-": 2, "AB-": 1 };
const weightedGroup = () => {
  let r = rand() * 100;
  for (const [g, w] of Object.entries(GROUP_WEIGHTS)) if ((r -= w) <= 0) return g;
  return "O+";
};
const weightedCity = (() => {
  const pool = CITIES.flatMap((c) => Array(c.weight).fill(c) as City[]);
  return () => pick(pool);
})();

const fakePhone = (n: number) => `0000${String(n).padStart(6, "0")}`;

const CAMPS = [
  ["Founders' Day Blood Donation Camp", "Rotary Club", "District Hospital Blood Centre"],
  ["Tech Park Corporate Blood Drive", "IT Employees Welfare Forum", "Lifeline Blood Centre"],
  ["University Youth Donor Camp", "NSS Unit", "Government Medical College Blood Bank"],
  ["Sunday Morning Voluntary Camp", "Lions Club", "Red Cross Blood Centre"],
  ["Riverside Community Blood Camp", "Residents' Welfare Association", "Civil Hospital Blood Centre"],
  ["Gurudwara Sewa Blood Camp", "Gurudwara Management Committee", "Sewa Sadan Blood Bank"],
  ["Traders' Association Blood Drive", "Traders' Federation", "Sanjeevani Blood Bank"],
  ["Thalassemia Support Blood Camp", "Thalassemia Parents' Society", "Jeevan Raksha Voluntary Blood Centre"],
  ["Railway Station Donor Camp", "Railway Employees Union", "District Hospital Blood Centre"],
  ["Marathon Weekend Blood Camp", "City Runners Club", "City Care Hospital Blood Centre"],
  ["Women's Day Blood Donation Drive", "Mahila Mandal", "Red Cross Blood Centre"],
  ["Police Commemoration Blood Camp", "City Police Welfare", "Government Medical College Blood Bank"],
] as const;
const VENUES = ["Community Hall", "Town Hall", "Main Market Grounds", "Central Park", "Exhibition Grounds", "Stadium Complex", "Bus Stand Plaza", "College Auditorium"];
const SLOTS = [["08:00", "13:00"], ["09:00", "14:00"], ["09:00", "16:00"], ["10:00", "15:00"], ["10:00", "17:00"], ["07:30", "12:30"]];

async function main() {
  console.log("Clearing existing data…");
  await prisma.$transaction([
    prisma.requestMatch.deleteMany(),
    prisma.bloodRequest.deleteMany(),
    prisma.stock.deleteMany(),
    prisma.bloodBank.deleteMany(),
    prisma.camp.deleteMany(),
    prisma.donorProfile.deleteMany(),
    prisma.user.deleteMany({ where: { OR: [{ phone: { startsWith: "0000" } }, { email: { in: [DEMO.org.email, DEMO.admin.email] } }] } }),
    prisma.organisation.deleteMany({ where: { name: DEMO.org.name } }),
    prisma.blogPost.deleteMany(),
    prisma.notice.deleteMany(),
  ]);

  console.log("Blood banks (public directory)…");
  const rows: BankRow[] = JSON.parse(readFileSync(new URL("./data/blood-banks.json", import.meta.url), "utf8"));
  await prisma.bloodBank.createMany({ data: rows.map((r) => ({ ...r, source: "osm" })) });

  if (process.env.SEED_DEMO_STOCK !== "false") {
    console.log("Simulated stock…");
    const all = await prisma.bloodBank.findMany({ select: { id: true } });
    const stockRows: { bankId: string; bloodGroup: string; units: number }[] = [];
    const touched: string[] = [];
    for (const b of all) {
      if (rand() > 0.45) continue;
      touched.push(b.id);
      const busy = rand();
      for (const g of BLOOD_GROUPS) {
        stockRows.push({ bankId: b.id, bloodGroup: g, units: busy < 0.12 || rand() < 0.15 ? 0 : Math.round((GROUP_WEIGHTS[g] / 10) * int(1, 12)) });
      }
    }
    await prisma.stock.createMany({ data: stockRows });
    for (let i = 0; i < touched.length; i += 200) {
      await prisma.bloodBank.updateMany({ where: { id: { in: touched.slice(i, i + 200) } }, data: { stockUpdatedAt: new Date(Date.now() - int(0, 72) * 3600000) } });
    }
  }

  let phoneN = 1;
  console.log("Camps…");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < 24; i++) {
    const c = weightedCity();
    const [name, organiser, conductor] = pick(CAMPS);
    const [startTime, endTime] = pick(SLOTS);
    await prisma.camp.create({
      data: {
        name: `${c.city} ${name}`,
        address: `${pick(VENUES)}, ${c.city}`,
        city: c.city,
        state: c.state,
        district: c.district,
        lat: jitter(c.lat, 5),
        lng: jitter(c.lng, 5),
        date: new Date(today.getTime() + (i < 4 ? i + 1 : int(2, 75)) * 86400000),
        startTime,
        endTime,
        organisedBy: `${organiser}, ${c.city}`,
        conductedBy: `${conductor}, ${c.city}`,
        contactPhone: fakePhone(phoneN++),
        imageUrl: `/camps/camp-${(i % 3) + 1}.svg`,
        expectedUnits: int(40, 300),
        verified: true,
      },
    });
  }

  console.log("Donors…");
  for (let i = 0; i < 600; i++) {
    const c = weightedCity();
    const first = pick(FIRST_NAMES);
    const female = ["Ananya", "Diya", "Isha", "Kavya", "Meera", "Priya", "Riya", "Saanvi", "Tara", "Zoya", "Harleen", "Lakshmi", "Pooja", "Sneha"].includes(first);
    await prisma.user.create({
      data: {
        phone: fakePhone(100000 + i),
        name: `${first} ${pick(LAST_NAMES)}`,
        donor: {
          create: {
            name: `${first} ${pick(LAST_NAMES)}`,
            dob: new Date(Date.now() - int(19, 58) * 365.25 * 86400000),
            gender: female ? "FEMALE" : "MALE",
            bloodGroup: weightedGroup(),
            weightKg: int(50, 95),
            heightCm: int(150, 188),
            state: c.state,
            district: c.district,
            lat: jitter(c.lat, 12),
            lng: jitter(c.lng, 12),
            contactCall: true,
            contactSms: rand() > 0.5,
            contactWhatsapp: rand() > 0.4,
            radiusKm: pick([10, 25, 50]),
            available: rand() > 0.1,
            lastDonatedAt: rand() > 0.6 ? new Date(Date.now() - int(20, 400) * 86400000) : null,
          },
        },
      },
    });
  }

  console.log("Blog posts and notices…");
  await prisma.blogPost.createMany({ data: BLOG_POSTS });
  await prisma.notice.createMany({ data: NOTICES });

  console.log("Demo accounts…");
  const delhi = { lat: 28.6315, lng: 77.2167 };
  const delhiBanks = await prisma.bloodBank.findMany({ where: { state: "Delhi", category: "GOVERNMENT" }, take: 2, orderBy: { name: "asc" } });
  const demoOrg = await prisma.organisation.create({ data: { name: DEMO.org.name } });
  await prisma.user.create({ data: { email: DEMO.org.email, name: "Demo Organiser", memberships: { create: { orgId: demoOrg.id, role: "OWNER" } } } });
  await prisma.user.create({ data: { email: DEMO.admin.email, name: "Demo Admin", role: "ADMIN" } });
  for (const b of delhiBanks) {
    await prisma.bloodBank.update({
      where: { id: b.id },
      data: { orgId: demoOrg.id, verified: true, stockUpdatedAt: new Date(), stock: { deleteMany: {}, create: BLOOD_GROUPS.map((g) => ({ bloodGroup: g, units: Math.round((GROUP_WEIGHTS[g] / 10) * int(2, 12)) })) } },
    });
  }
  await prisma.camp.create({
    data: {
      name: "Demo Organiser Community Blood Camp", address: "Community Hall, Connaught Place", city: "New Delhi", state: "Delhi", district: "New Delhi",
      ...delhi, date: new Date(Date.now() + 5 * 86400000), startTime: "09:00", endTime: "15:00", organisedBy: DEMO.org.name,
      conductedBy: delhiBanks[0]?.name ?? "Government blood centre", contactPhone: fakePhone(phoneN++), imageUrl: "/camps/camp-1.svg",
      expectedUnits: 120, verified: true, orgId: demoOrg.id,
    },
  });

  const demoDonor = await prisma.user.create({
    data: {
      phone: DEMO.donor.phone, name: "Aarav Demo",
      donor: { create: { name: "Aarav Demo", dob: new Date("1995-04-12"), gender: "MALE", bloodGroup: "O+", weightKg: 72, heightCm: 176, state: "Delhi", district: "New Delhi", ...delhi, contactCall: true, contactSms: true, contactWhatsapp: true, radiusKm: 25, available: true, lastDonatedAt: new Date(Date.now() - 130 * 86400000) } },
    },
  });
  const demoRequester = await prisma.user.create({ data: { phone: DEMO.requester.phone, name: "Meera Demo" } });
  const neighbour = await prisma.user.create({ data: { phone: fakePhone(990003), name: "Rahul Verma" } });
  const helpers = await prisma.user.findMany({ where: { phone: { startsWith: "0000" }, donor: { is: { state: "Delhi", bloodGroup: { in: ["O+", "O-"] } } } }, take: 3 });

  const hospital = delhiBanks[0]?.name ?? "City Hospital";
  const mine = await prisma.bloodRequest.create({
    data: {
      requesterId: demoRequester.id, patientName: "Sunita Devi", bloodGroup: "O+", units: 2, urgency: "URGENT", hospitalName: hospital,
      bankId: delhiBanks[0]?.id, state: "Delhi", district: "New Delhi", ...delhi, contactPhone: DEMO.requester.phone,
      note: "Surgery tomorrow morning, ask for the blood bank counter on the ground floor.", radiusKm: 25,
      expiresAt: new Date(Date.now() + 3 * 86400000), createdAt: new Date(Date.now() - 3 * 3600000),
    },
  });
  await prisma.requestMatch.createMany({
    data: helpers.map((h, i) => ({ requestId: mine.id, donorId: h.id, distanceKm: 3.2 + i * 2.4, status: i === 0 ? ("ACCEPTED" as const) : ("NOTIFIED" as const), notifiedAt: new Date(Date.now() - 2 * 3600000), respondedAt: i === 0 ? new Date(Date.now() - 3000000) : null })),
  });
  const incoming = await prisma.bloodRequest.create({
    data: {
      requesterId: neighbour.id, patientName: "Anil Verma", bloodGroup: "A+", units: 1, urgency: "CRITICAL", hospitalName: delhiBanks[1]?.name ?? hospital,
      bankId: delhiBanks[1]?.id, state: "Delhi", district: "New Delhi", lat: delhi.lat + 0.04, lng: delhi.lng + 0.03, contactPhone: fakePhone(990003),
      radiusKm: 25, expiresAt: new Date(Date.now() + 3 * 86400000), createdAt: new Date(Date.now() - 20 * 60000),
    },
  });
  await prisma.requestMatch.create({ data: { requestId: incoming.id, donorId: demoDonor.id, distanceKm: 5.4, notifiedAt: new Date(Date.now() - 15 * 60000) } });

  const [banks, camps, donors] = await Promise.all([prisma.bloodBank.count(), prisma.camp.count(), prisma.donorProfile.count()]);
  console.log(`Seeded ${banks} banks, ${camps} camps, ${donors} donors.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
