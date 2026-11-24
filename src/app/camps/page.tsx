import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Camps } from "./Camps";

export const metadata: Metadata = { title: "Blood Donation Camps", description: "Find upcoming voluntary blood donation camps near you." };

export default function Page() {
  return (
    <>
      <PageHeader title="Find a camp" sub="Upcoming voluntary blood donation camps across the country. Walk in, donate, and help stock your local blood bank." />
      <Camps />
    </>
  );
}
