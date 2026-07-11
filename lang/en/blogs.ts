import type { BlogId, BlogPost } from "@/lib/blog";

const blogPosts: Readonly<Record<BlogId, BlogPost>> = {
  "tscircuit-framework": {
    id: "tscircuit-framework",
    title: "What is tscircuit framework?",
    summary: "A toolkit for designing electronics with code, from components through to a reviewable PCB.",
    visits: "96K",
    body: [
      "tscircuit is a toolkit for defining electronic designs as code. Components, connections, board constraints, and manufacturing details live in one readable workflow.",
      "That makes design intent easier to review. A teammate can see why a component was selected, how a connection is constrained, and what the board needs before it reaches fabrication.",
      "Start with a circuit description, inspect the result in the workspace, then iterate with the same source of truth behind every artefact.",
    ],
  },
  "tscircuit-packages": {
    id: "tscircuit-packages",
    title: "tscircuit Packages",
    summary: "Publish board designs, components, and reusable building blocks with a link anyone can open.",
    visits: "18K",
    body: [
      "A tscircuit package is a small, reusable electronics project. It can contain a board, a component, or a focused design pattern that someone else can open and build from.",
      "Packages replace the separate npm package and GitHub repository workflow. Publish from tscircuit, get one shareable link, and keep the design, preview, and version together in one place.",
      "A package can begin as something personal—a Pico board, a Raspberry Pi accessory, or a useful chip breakout—then be shared in seconds as a reliable starting point for the next build.",
    ],
  },
  "pcb-trace-widths": {
    id: "pcb-trace-widths",
    title: "PCB trace widths: a practical guide",
    summary: "Choose widths from current, copper weight, temperature rise, and manufacturability—not guesswork.",
    visits: "42K",
    body: [
      "Trace width is a constraint, not decoration. Begin with the current a net carries, your copper weight, and an acceptable temperature rise.",
      "Set power and ground widths deliberately, then make high-speed geometry explicit as part of the board rules. Keep the values close to the design instead of collecting them in an untracked checklist.",
      "Finally, confirm the chosen widths are buildable with the board house. A manufacturable default is better than a theoretical value that cannot be fabricated consistently.",
    ],
  },
  "differential-pairs": {
    id: "differential-pairs",
    title: "Routing differential pairs without guesswork",
    summary: "Keep impedance, spacing, references, and length matching visible in the design rules.",
    visits: "31K",
    body: [
      "Differential pairs work as a system: the two traces, their spacing, the reference plane, and every discontinuity all affect the result.",
      "Declare pair width, gap, target impedance, and length tolerance before routing. Those rules turn a fragile manual process into something the whole team can inspect.",
      "When a pair must change layers, treat the transition as part of the signal path. Keep the return path continuous and make the exception visible in the review.",
    ],
  },
  "ground-pours": {
    id: "ground-pours",
    title: "Ground pours that make your board quieter",
    summary: "A continuous, intentional return path is usually more valuable than adding copper everywhere.",
    visits: "20K",
    body: [
      "A ground pour is useful when it gives signals a short, predictable return path. It is less useful when it becomes a collection of isolated copper islands.",
      "Start by protecting continuous reference planes under fast signals, then add stitching vias where layer changes would otherwise lengthen the return path.",
      "Review pours as part of the complete stackup and routing strategy. The question is not how much copper is present, but whether the current has a clear path home.",
    ],
  },
};

const blogOrder: readonly BlogId[] = [
  "tscircuit-framework",
  "tscircuit-packages",
  "pcb-trace-widths",
  "differential-pairs",
  "ground-pours",
];

/** Return the English article represented by a valid identifier. */
export function getEnglishBlogPost(id: BlogId): BlogPost {
  return blogPosts[id];
}

/** Return English articles in their Docs navigation order. */
export function getEnglishBlogPosts(): ReadonlyArray<BlogPost> {
  return blogOrder.map(getEnglishBlogPost);
}
