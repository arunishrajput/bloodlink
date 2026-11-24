import type { Metadata } from "next";
import { RequestStatus } from "./RequestStatus";

export const metadata: Metadata = { title: "Your blood request" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestStatus id={id} />;
}
