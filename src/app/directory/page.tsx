import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { Directory } from "./Directory";

export const metadata: Metadata = { title: "Blood Bank Directory", description: "Search live stock at blood banks near you by blood group and location." };

export default function Page() {
  return (
    <>
      <PageHeader title="Find a nearby blood bank" sub="Search live stock at registered blood banks by blood group and location." />
      <Directory />
    </>
  );
}
