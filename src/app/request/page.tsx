import type { Metadata } from "next";
import { RequestFlow } from "./RequestFlow";

export const metadata: Metadata = { title: "Find Blood" };

export default function RequestPage() {
  return <RequestFlow />;
}
