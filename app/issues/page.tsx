import type { Metadata } from "next"
import { IssueBoard } from "@/components/issues/IssueBoard"

export const metadata: Metadata = {
  title: "Issues",
  description: "Linear-style issue board — track and triage failures from LLM traces.",
}

export const dynamic = "force-dynamic"

export default function IssuesPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden sm:rounded-2xl bg-(--surface-1)">
      <IssueBoard />
    </div>
  )
}
