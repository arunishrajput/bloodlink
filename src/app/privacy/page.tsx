import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="15 November 2026"
      sections={[
        ["What we collect", [
          "Donors: mobile number, name, date of birth, gender, blood group, optional weight and height, home location (state, district and an approximate map point), contact preferences, availability, and last donation date.",
          "Requesters: mobile number, and for each request the patient's name, blood group, units, hospital, location and contact number.",
          "Organisations: team members' email addresses and the blood bank or camp details you publish.",
          "We also store pledges, camp-alert subscriptions and contact-form messages you choose to send.",
        ]],
        ["How we use it", [
          "To match blood requests with compatible donors and nearby blood banks, to send one-time sign-in codes and request alerts, and to keep the service secure.",
          "We never sell your data or use it for advertising.",
        ]],
        ["What others can see", [
          "Donors are never listed publicly. A requester sees only how many donors were found until a donor accepts; then they see that donor's name, blood group, approximate distance and chosen contact methods.",
          "A donor sees a request's blood group, units, hospital and urgency, and sees the patient's name and contact number only after accepting.",
          "Blood bank and camp details are public because they're published for that purpose.",
        ]],
        ["Location", ["We ask for your location only to search nearby. During a search it stays in your browser and is sent only with that search. It's stored only when you register as a donor or raise a request."]],
        ["Retention and deletion", ["You can delete your donor profile at any time from your profile page. Requests close automatically after three days. To delete your whole account, contact us."]],
        ["Security", ["Sign-in codes are stored only in hashed form and expire after 10 minutes. Sessions use signed, HTTP-only cookies."]],
        ["Contact", ["For privacy questions or data requests, use the contact page."]],
      ]}
    />
  );
}
