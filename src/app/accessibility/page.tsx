import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function Page() {
  return (
    <LegalPage
      title="Accessibility Statement"
      updated="15 November 2026"
      sections={[
        ["Our commitment", ["BloodLink should be usable by everyone, often under stress and on a phone. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA."]],
        ["What we do", [
          "Pages work with keyboard navigation, with a skip-to-content link and visible focus states.",
          "Form fields have labels, errors are announced, and colour is never the only way information is conveyed.",
          "Text keeps sufficient contrast, layouts work from 320px wide, and the site respects reduced-motion settings.",
          "Content is available in English and Hindi.",
        ]],
        ["Known limitations", ["The interactive maps are a visual aid. Every result shown on a map is also listed as text with its distance and address."]],
        ["Feedback", ["If something on BloodLink is hard for you to use, please tell us through the contact page and we'll work to fix it."]],
      ]}
    />
  );
}
