import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function Page() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="15 November 2026"
      sections={[
        ["1. About BloodLink", ["BloodLink is an online service that helps people find blood banks and voluntary blood donors, and helps blood banks and organisers list their stock and donation camps. By using BloodLink you agree to these terms."]],
        ["2. Not a medical service", [
          "BloodLink is not a hospital, blood bank or emergency service. We don't collect, test, store or supply blood. Stock levels are published by blood banks and may be out of date; always confirm by phone.",
          "All decisions about compatibility, cross-matching and transfusion are made by qualified medical professionals. In an emergency, contact your nearest hospital or dial 112.",
        ]],
        ["3. Accounts", ["You sign in with a one-time code sent to your mobile number or email. Keep access to it secure. You're responsible for activity on your account and for the accuracy of what you submit."]],
        ["4. Donors", [
          "Donating is always voluntary. You may decline any request, change your availability, or delete your donor profile at any time.",
          "You confirm the eligibility information you give is true to the best of your knowledge. The blood bank's medical officer makes the final decision on whether you can donate.",
        ]],
        ["5. Requesters", ["Raise requests only for a genuine, current medical need. Never offer or ask for payment for blood. Selling blood is illegal and will lead to your account being removed."]],
        ["6. Blood banks and organisers", ["Organisations must hold the licences required to collect blood and must keep stock and camp details accurate. We may verify, hide or remove listings at our discretion."]],
        ["7. Acceptable use", ["Don't misuse contact details shared through BloodLink, send spam, impersonate others, scrape the service, or interfere with how it works."]],
        ["8. Liability", ["BloodLink is provided \"as is\". To the extent permitted by law, we aren't liable for losses arising from the availability or accuracy of listings, or from interactions between users."]],
        ["9. Changes", ["We may update these terms. Material changes will be announced on the site. Continuing to use BloodLink after changes means you accept them."]],
        ["10. Governing law", ["These terms are governed by the laws of India."]],
      ]}
    />
  );
}
