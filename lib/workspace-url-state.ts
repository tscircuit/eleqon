import { parseChatThreadId, type ChatThreadId } from "./chat-thread";
import { parseBlogId, type BlogId } from "./blog";

/** An artefact tab that can be reproduced in a project URL. */
export type WorkspaceTab = "code" | "pcb" | "schematic" | "model";

/** A home context that can be reproduced in a home URL. */
export type HomeTab = "agent" | "docs";

/** The reproducible article shown while the Docs home context is active. */
export type DocsUrlState = Readonly<{ readonly kind: "article"; readonly blogId: BlogId }>;

/** The complete shareable workspace state for the small URL-backed prototype. */
export type WorkspaceUrlState =
  | Readonly<{ readonly kind: "home"; readonly homeTab: "agent" }>
  | Readonly<{ readonly kind: "home"; readonly homeTab: "docs"; readonly docs: DocsUrlState }>
  | Readonly<{ readonly kind: "project"; readonly threadId: ChatThreadId; readonly activeTab: WorkspaceTab }>;

/** Parse browser query parameters into a valid reproducible workspace state. */
export function parseWorkspaceUrlState(search: string): WorkspaceUrlState {
  const params = new URLSearchParams(search);
  const thread = params.get("thread");

  if (params.get("screen") === "project" && thread !== null) {
    const threadId = parseChatThreadId(thread);
    if (threadId !== null) {
      return { kind: "project", threadId, activeTab: parseWorkspaceTab(params.get("tab")) };
    }
  }

  if (params.get("screen") === "docs" || params.get("context") === "docs") {
    const blogId = parseBlogId(params.get("blog"));
    return { kind: "home", homeTab: "docs", docs: { kind: "article", blogId: blogId ?? "tscircuit-framework" } };
  }

  return { kind: "home", homeTab: "agent" };
}

/** Convert a valid workspace state into its compact URL query string. */
export function serializeWorkspaceUrlState(state: WorkspaceUrlState): string {
  const params = new URLSearchParams();

  if (state.kind === "project") {
    params.set("screen", "project");
    params.set("thread", state.threadId);
    params.set("tab", state.activeTab);
  } else if (state.homeTab === "docs") {
    params.set("screen", "docs");
    if (state.docs.kind === "article") {
      params.set("blog", state.docs.blogId);
    }
  } else {
    params.set("screen", "home");
    params.set("context", "agent");
  }

  return `?${params.toString()}`;
}

/** Map an unknown URL value to a valid workspace tab. */
function parseWorkspaceTab(value: string | null): WorkspaceTab {
  if (value === "pcb" || value === "schematic" || value === "model") {
    return value;
  }

  return "code";
}
