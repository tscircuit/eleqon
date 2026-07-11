import type { BlogId } from "@/lib/blog";
import type { WorkspaceTab } from "@/lib/workspace-url-state";

type LibraryItem = Readonly<{ readonly title: string; readonly detail: string }>;

/** All rendered English copy for the workspace. */
export const enWorkspace = {
  app: {
    title: "Eleqon",
    description: "A local-first engineering workspace",
    language: "en",
  },
  brand: {
    mark: "e",
    productName: "tscircuit",
    docsName: "tscircuit docs",
  },
  homeTabs: {
    agent: "Agent",
    docs: "Docs",
  },
  tabs: {
    code: "Code",
    pcb: "PCB",
    schematic: "Schematic",
    model: "3D",
  } satisfies Readonly<Record<WorkspaceTab, string>>,
  welcomePrompts: [
    "What are you planning to build today?",
    "Create a new PCB with tscircuit.",
    "Are vias allowed in a PCB?",
  ],
  composer: {
    placeholder: "Ask tscircuit agent",
  },
  symbols: {
    add: "+",
    previous: "←",
    forward: "→",
  },
  library: {
    featureDescription: "tscircuit is a toolkit for designing electronics with code. Define components, connections, board constraints, and manufacturing details in one workflow. It helps teams move from an idea to a reviewable PCB without losing the reasoning behind each design choice.",
    readMore: "Read more",
    researchTitle: "Research",
    orderedBoardsTitle: "Ordered boards",
    researchItems: [
      { title: "Autorouter", detail: "Route your board in minutes" },
      { title: "Differential pairs", detail: "Match high-speed signals" },
      { title: "Design rules", detail: "Make constraints explicit" },
      { title: "Component search", detail: "Find parts that fit" },
      { title: "BOM tools", detail: "Keep sourcing organized" },
      { title: "3D preview", detail: "Inspect the completed board" },
    ] satisfies readonly [LibraryItem, ...LibraryItem[]],
    orderedBoards: [
      { title: "Sensor hub", detail: "Four-layer controller" },
      { title: "USB interface", detail: "Compact reference board" },
      { title: "Motor driver", detail: "Power and control layout" },
      { title: "Audio module", detail: "Low-noise signal path" },
    ] satisfies readonly [LibraryItem, ...LibraryItem[]],
    trendingTitle: "Trending PCB blogs",
    trendingBlogIds: ["pcb-trace-widths", "differential-pairs", "ground-pours"] satisfies ReadonlyArray<BlogId>,
  },
  docs: {
    introTitle: "Intro",
    blogsTitle: "Blogs",
    allPosts: "All posts",
    blogsSummary: "Practical notes for designing, reviewing, and building electronics with code.",
    visitCount: (visits: string) => `${visits} visits`,
  },
  footer: {
    tagline: "Electronics, engineered with code.",
    copyright: "© 2026 tscircuit, Inc.",
    columns: [
      { title: "Product", links: ["Agent", "Docs", "PCB workspace", "Library"] },
      { title: "Resources", links: ["Quickstart", "Examples", "Design rules", "Blog"] },
      { title: "Community", links: ["GitHub", "Discord", "YouTube", "X"] },
      { title: "Company", links: ["About", "Privacy", "Contact"] },
    ],
  },
  aria: {
    brand: "Eleqon",
    workspaceNavigation: "Workspace navigation",
    homeContext: "Home context",
    newChat: "New",
    history: "History",
    previous: (title: string) => `Previous ${title}`,
    next: (title: string) => `Next ${title}`,
    buildArtifacts: "Build artefacts",
    docsArticles: "Docs articles",
    chatArea: "Chat area",
    projectDescription: "Project description",
    addContext: "Add context",
    startChat: "Start chat",
  },
} as const;
