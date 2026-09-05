import FanExperience from "@/components/fan/fan-experience";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mira Vale — PRESENCE",
  description:
    "A moment away from everything. A little closer to Mira’s fictional AI Presence.",
};
export default function MiraPage() {
  return <FanExperience />;
}
