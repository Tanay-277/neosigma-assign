import type { Issue, IssueStatus } from "@/lib/types"

let nextNumber = 8
let issues: Issue[] = [
  {
    id: "ISS-001",
    title: "customer_support_agent failure",
    status: "open",
    priority: "high",
    assignee: "Unassigned",
    traceId: "trace_g0116",
    traceName: "customer_support_agent",
    error: "OpenAI API returned 500 Internal Server Error for chat completion request after 3 retries",
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    description: "The customer support agent failed to generate a response due to an upstream API outage. The error occurred during the LLM generation span after the context retrieval phase completed successfully. All 3 retry attempts failed with the same 500 error.",
  },
  {
    id: "ISS-002",
    title: "rag_doc_qa hallucinated answer",
    status: "open",
    priority: "urgent",
    assignee: "Unassigned",
    traceId: "trace_g0220",
    traceName: "rag_doc_qa",
    error: "Answer confidence 0.32 below threshold 0.7 — model generated unsupported claims about refund policy",
    createdAt: new Date(Date.now() - 7_200_000).toISOString(),
    description: "The RAG pipeline retrieved 3 documents but the model generated an answer that was not grounded in any of the retrieved chunks. The confidence score was 0.32, well below the 0.7 threshold. This is a hallucination risk that needs immediate investigation.",
  },
  {
    id: "ISS-003",
    title: "sql_analyst_agent query timeout",
    status: "in_progress",
    priority: "high",
    assignee: "alice@neosigma.ai",
    traceId: "trace_g0108",
    traceName: "sql_analyst_agent",
    error: "Query execution exceeded 30s timeout on table 'orders_2024' (estimated 12M rows)",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    description: "The SQL analyst agent attempted to run an unoptimized query on the orders table without using indexes. The query was cancelled after 30 seconds. Need to optimize the query generation to include index hints and WHERE clause filters.",
  },
  {
    id: "ISS-004",
    title: "content_summarizer token overflow",
    status: "in_progress",
    priority: "medium",
    assignee: "bob@neosigma.ai",
    traceId: "trace_g0128",
    traceName: "content_summarizer",
    error: "Input context 18,432 tokens exceeds model limit of 16,384 tokens for gpt-4-turbo",
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    description: "The content summarizer received a document that was too long for the configured model. The token counting logic did not correctly estimate the chunk size. Need to implement proper chunking with overlap or switch to a model with larger context window.",
  },
  {
    id: "ISS-005",
    title: "code_review_agent parse error",
    status: "resolved",
    priority: "medium",
    assignee: "carol@neosigma.ai",
    traceId: "trace_01HX8R3T",
    traceName: "code_review_agent",
    error: "SyntaxError: Unexpected token '}' at line 147 in review_file.py — AST parsing failed",
    createdAt: new Date(Date.now() - 259_200_000).toISOString(),
    description: "The code review agent failed to parse a Python file with a syntax error. The AST-based analysis crashed before any review could be generated. The submitted code had a trailing comma after the last dict entry which caused the parser to fail.",
  },
  {
    id: "ISS-006",
    title: "translation_batch quality regression",
    status: "resolved",
    priority: "low",
    assignee: "carol@neosigma.ai",
    traceId: "trace_g0178",
    traceName: "translation_batch",
    error: "BLEU score dropped from 0.72 to 0.48 after model deployment v2.3.1 — Japanese translations affected",
    createdAt: new Date(Date.now() - 345_600_000).toISOString(),
    description: "After deploying model version 2.3.1, the Japanese translation quality degraded significantly. The BLEU score dropped by 33%. Investigation revealed the new tokenizer was splitting Japanese characters incorrectly. Rolled back to v2.3.0 and pinned the tokenizer version.",
  },
  {
    id: "ISS-007",
    title: "multi_agent_orchestrator deadlock",
    status: "open",
    priority: "urgent",
    assignee: "Unassigned",
    traceId: "trace_g0370",
    traceName: "multi_agent_orchestrator",
    error: "Agent coordination timeout — researcher agent waiting for reviewer agent which is waiting for researcher (circular dependency detected after 120s)",
    createdAt: new Date(Date.now() - 600_000).toISOString(),
    description: "The multi-agent orchestrator entered a deadlock state where the researcher agent was waiting for the reviewer's analysis, while the reviewer was waiting for the researcher's output. This circular dependency was not caught by the dependency graph validation. Need to add cycle detection before agent execution.",
  },
]

export function createIssue(params: {
  traceId: string
  traceName: string
  error: string
}): Issue {
  const num = nextNumber++
  const issue: Issue = {
    id: `ISS-${String(num).padStart(3, "0")}`,
    title: params.traceName,
    status: "open",
    priority: "medium",
    assignee: "Unassigned",
    traceId: params.traceId,
    traceName: params.traceName,
    error: params.error,
    createdAt: new Date().toISOString(),
    description: params.error || `Investigate failure in ${params.traceName}`,
  }
  issues = [issue, ...issues]
  return issue
}

export function getAllIssues(): Issue[] {
  return issues
}

export function getIssueById(id: string): Issue | undefined {
  return issues.find((i) => i.id === id)
}

export function updateIssueStatus(id: string, status: IssueStatus): Issue | undefined {
  const idx = issues.findIndex((i) => i.id === id)
  if (idx === -1) return undefined
  issues[idx] = { ...issues[idx], status }
  return issues[idx]
}

export function updateIssue(id: string, updates: Partial<Issue>): Issue | undefined {
  const idx = issues.findIndex((i) => i.id === id)
  if (idx === -1) return undefined
  issues[idx] = { ...issues[idx], ...updates }
  return issues[idx]
}
