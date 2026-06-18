import type { Metadata } from "next"

interface Props {
  params: Promise<{ id: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { getIssueById } = await import("@/lib/data/issues")
  const issue = getIssueById(id)
  return {
    title: issue ? `${issue.id} — ${issue.title}` : "Issue not found",
  }
}

export default async function IssueDetailPage({ params }: Props) {
  const { id } = await params
  const { IssueDetailLoader } = await import("@/components/issues/IssueDetailLoader")

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl">
      <IssueDetailLoader id={id} />
    </div>
  )
}
