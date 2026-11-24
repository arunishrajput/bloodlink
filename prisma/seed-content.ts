import type { BlogCategory, NoticeCategory } from "@prisma/client";

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

export const BLOG_POSTS: {
  slug: string;
  title: string;
  excerpt: string;
  tag: string;
  category: BlogCategory;
  coverImage: string;
  coverAlt: string;
  body: string;
  publishedAt: Date;
}[] = [
  {
    slug: "first-time-donor-guide",
    title: "Your first donation: what actually happens",
    excerpt: "From the registration desk to the juice counter, a step-by-step walk through a first blood donation, and how to feel good afterwards.",
    tag: "First-timers",
    category: "AWARENESS",
    coverImage: "/covers/first-donation.svg",
    coverAlt: "Illustration of a blood bag with a heart",
    publishedAt: daysAgo(6),
    body: `Most people who hesitate to donate blood aren't scared of the needle. They just don't know what to expect. Here's the whole visit, start to finish.

## Before you leave home

- Eat a proper meal two to three hours before. Don't donate on an empty stomach.
- Drink an extra two or three glasses of water.
- Carry a photo ID. If you've donated before, bring your donor card.
- Sleep well the night before and skip alcohol for 24 hours.

## At the blood centre

**Registration.** You fill in a short form with your details and a health questionnaire. Answer honestly: the questions protect you as well as the patient.

**Mini check-up.** A staff member checks your weight, pulse, blood pressure, temperature and haemoglobin (a finger-prick test). Haemoglobin needs to be at least 12.5 g/dL.

**The donation itself.** You lie back in a reclining chair. The arm is cleaned and a new, sterile, single-use needle goes in. Collection takes six to ten minutes for one unit (about 350–450 ml).

**Rest and refreshments.** Stay seated for 10–15 minutes and have the snack and drink you're offered. Your body replaces the lost fluid within a day.

## After you donate

- Keep the bandage on for a few hours.
- Avoid heavy lifting or a hard workout for the rest of the day.
- Drink plenty of fluids for the next 24 hours.
- If you feel light-headed, lie down with your feet raised.

Men can donate again after three months and women after four. Register on BloodLink and we'll only contact you when someone nearby needs your blood group.`,
  },
  {
    slug: "donor-eligibility-checklist",
    title: "Can I donate? A plain-language eligibility checklist",
    excerpt: "Age, weight, haemoglobin, recent illness, tattoos, medicines: the common rules that decide whether you can donate today.",
    tag: "Eligibility",
    category: "AWARENESS",
    coverImage: "/covers/eligibility.svg",
    coverAlt: "Illustration of a checklist and a stethoscope",
    publishedAt: daysAgo(14),
    body: `Blood centres follow national donor-selection guidelines. The final call is always made by the medical officer on the day, but this checklist covers the most common rules.

## You can usually donate if you

- are between 18 and 65 years old
- weigh at least 45 kg
- have haemoglobin of 12.5 g/dL or more
- feel healthy today, with no fever, cold or infection
- last donated at least 3 months ago (4 months for women)

## You may need to wait if you

- had a tattoo, piercing or acupuncture in the last 12 months
- had major surgery or a blood transfusion in the last 12 months
- had malaria, typhoid or jaundice recently
- are on antibiotics (wait until the course ends and you feel well)
- are pregnant, recently delivered, or breastfeeding

## Things that usually don't stop you

- Well-controlled blood pressure on medication
- Being vegetarian
- Common vitamins and supplements

When in doubt, go along anyway. The screening is free, confidential and quick, and the staff will tell you whether today is the right day.`,
  },
  {
    slug: "blood-donation-myths",
    title: "Six blood donation myths, and what's actually true",
    excerpt: "\"It makes you weak.\" \"Vegetarians can't donate.\" We take on the myths that keep healthy people away from donating.",
    tag: "Myths & facts",
    category: "AWARENESS",
    coverImage: "/covers/myths.svg",
    coverAlt: "Illustration of a speech bubble with a question mark",
    publishedAt: daysAgo(28),
    body: `## "Donating blood makes you weak."
Your body replaces the fluid within 24 hours and the red cells within a few weeks. Healthy adults go back to normal activity the same day.

## "It hurts a lot."
You feel a quick pinch when the needle goes in. Most donors say the finger-prick haemoglobin test stings more.

## "Vegetarians don't have enough iron to donate."
What counts is your haemoglobin level, not your diet. Lots of vegetarians pass the check easily.

## "I can catch an infection by donating."
Every donation uses a new, sterile kit that's thrown away afterwards. You can't get an infection from giving blood.

## "My blood type is common, so nobody needs it."
Common groups are needed in the largest amounts precisely because most patients have them.

## "I have high blood pressure, so I can't donate."
If your blood pressure is under control and within limits on the day, you can usually donate.`,
  },
  {
    slug: "thalassemia-regular-donors",
    title: "Why thalassemia patients need regular donors",
    excerpt: "Children with thalassemia major may need a transfusion every two to four weeks for life. Here's how a regular donor group makes that easier.",
    tag: "Thalassemia",
    category: "AWARENESS",
    coverImage: "/covers/thalassemia.svg",
    coverAlt: "Illustration of a calendar with blood drops",
    publishedAt: daysAgo(45),
    body: `Thalassemia major is an inherited blood disorder in which the body can't make enough healthy haemoglobin. Most patients need transfusions every two to four weeks for life.

## What families go through

Every few weeks a family has to find compatible units, often at short notice. Blood from a small, steady group of donors lowers the risk of reactions and makes planning much easier.

## How you can help

- **Become a regular donor.** Donating every three to four months adds up to a lot over a year.
- **Use recurring requests.** On BloodLink, a family can mark a request as recurring so donors nearby know it's a long-term need.
- **Talk about carrier screening.** A simple blood test before marriage or pregnancy shows whether you carry the trait.

A regular donor turns a fortnightly emergency into a routine.`,
  },
  {
    slug: "blood-components-explained",
    title: "One unit, several patients: blood components explained",
    excerpt: "Red cells, plasma and platelets each help different patients. Here's how a single donation is separated and used.",
    tag: "How it works",
    category: "AWARENESS",
    coverImage: "/covers/components.svg",
    coverAlt: "Illustration of three test tubes with layered colours",
    publishedAt: daysAgo(70),
    body: `A unit of whole blood can be spun in a centrifuge and separated into layers, and each layer goes to a different kind of patient.

## Packed red blood cells
Used for anaemia, accident and surgery patients, and people with thalassemia. Stored chilled for up to 42 days.

## Plasma
The straw-coloured liquid part, rich in clotting factors. Used for burns, liver disease and bleeding disorders. Frozen, it keeps for up to a year.

## Platelets
Tiny cells that help blood clot, needed during cancer treatment, in dengue and after major surgery. They last only five days, so platelets are always in short supply.

That's why one donation can help up to three patients, and why blood centres with component-separation facilities matter so much.`,
  },
  {
    slug: "how-bloodlink-matches-donors",
    title: "How BloodLink matches a request with donors",
    excerpt: "Compatibility first, then distance, with a radius that widens until someone says yes. Here's how the matching works.",
    tag: "Product",
    category: "NEWS",
    coverImage: "/covers/matching.svg",
    coverAlt: "Illustration of a map pin with radiating circles",
    publishedAt: daysAgo(90),
    body: `When you raise a request on BloodLink, we do three things at once.

## 1. Check blood bank stock
We search blood banks near the patient for the requested group and every compatible group, sorted by distance. Banks with stock come first.

## 2. Find compatible donors
We look for registered donors whose group is compatible, who are marked available, haven't donated in the last 90 days, and live within the distance they told us they'd travel.

## 3. Widen the search
We start with donors within 10 km. If nobody accepts, we widen to 25, then 50, then 100 km, asking more donors each time.

## Privacy by default
Donors see the request: blood group, units, hospital and how urgent it is. You see a donor's name and number only after they accept. Until then, neither side's number is shared.`,
  },
];

export const NOTICES: { title: string; category: NoticeCategory; body: string; publishedAt: Date }[] = [
  {
    title: "Donor quarterly newsletter: October–December edition",
    category: "NEWSLETTER",
    publishedAt: daysAgo(10),
    body: "This edition covers the year-end camp calendar, a profile of three regular donors, and reminders about the gap between donations. Blood centres that would like to be featured can write to the BloodLink team.",
  },
  {
    title: "Updated donor selection and deferral guidance",
    category: "GUIDELINES",
    publishedAt: daysAgo(25),
    body: "Blood centres should follow the latest national donor selection criteria. Key reminders: minimum haemoglobin 12.5 g/dL, minimum weight 45 kg, age 18–65, and a 12-month deferral after tattoos, piercings or major surgery. The medical officer's decision on the day is final.",
  },
  {
    title: "Processing charges for blood and blood components",
    category: "CHARGES",
    publishedAt: daysAgo(40),
    body: "Blood itself is never sold. Blood centres may charge only a processing fee, covering testing, separation and storage, within the limits set by the regulator. Patients who are asked for more than the notified processing charge should report it to the state blood transfusion council.",
  },
  {
    title: "Guidelines for organising a voluntary blood donation camp",
    category: "GUIDELINES",
    publishedAt: daysAgo(60),
    body: "A camp must be conducted by a licensed blood centre. Organisers should arrange a ventilated venue, a waiting area, refreshments for donors, and at least one coordinator to handle registration. List your camp on BloodLink at least a week ahead so nearby donors can plan.",
  },
  {
    title: "BloodLink now shows live stock for registered blood banks",
    category: "UPDATES",
    publishedAt: daysAgo(75),
    body: "Registered blood banks can now publish units available for each blood group from their organisation dashboard. Searches show the time the stock was last updated so requesters know how fresh the information is.",
  },
  {
    title: "Special leave for employees who donate blood",
    category: "UPDATES",
    publishedAt: daysAgo(120),
    body: "Many employers, including government departments, grant special leave on the day of a voluntary blood donation. Check your organisation's leave policy and keep your donation certificate as proof.",
  },
  {
    title: "Donor newsletter: World Blood Donor Day special",
    category: "NEWSLETTER",
    publishedAt: daysAgo(150),
    body: "Highlights from the World Blood Donor Day camps held across the country on 14 June, and a thank-you to the volunteers and blood centres who made them happen.",
  },
  {
    title: "Deferral after vaccination: current guidance",
    category: "GUIDELINES",
    publishedAt: daysAgo(200),
    body: "Most routine vaccines need only a short deferral or none at all. Live vaccines may need a longer wait. Tell the screening staff about any vaccine you had in the last four weeks and they'll advise you.",
  },
];
