import type { Metadata } from "next"
import { PresentationV2Generator } from "@/components/presentation-v2/generator"

export const metadata: Metadata = {
  title: "Presentation Engine v2 (Beta)",
  description:
    "IR-first presentation compiler: AI plans the story, deterministic engines design, lay out, and export native PPTX, HTML, and PDF.",
}

export default function PresentationV2Page() {
  return (
    <main className="min-h-screen bg-background">
      <PresentationV2Generator />
    </main>
  )
}
