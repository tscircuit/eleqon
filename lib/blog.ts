/** An article identifier that can be safely represented in a URL. */
export type BlogId = "tscircuit-framework" | "pcb-trace-widths" | "differential-pairs" | "ground-pours";

/** Static article content shown in the small docs prototype. */
export type BlogPost = Readonly<{
  readonly id: BlogId;
  readonly title: string;
  readonly summary: string;
  readonly visits: string;
  readonly body: readonly [string, ...string[]];
}>;

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
  "pcb-trace-widths",
  "differential-pairs",
  "ground-pours",
];

/** Return the static article represented by a valid identifier. */
export function getBlogPost(id: BlogId): BlogPost {
  return blogPosts[id];
}

/** Return the static articles in their Docs navigation order. */
export function getBlogPosts(): ReadonlyArray<BlogPost> {
  return blogOrder.map(getBlogPost);
}

/** Parse one recognized article identifier from a URL boundary. */
export function parseBlogId(value: string | null): BlogId | null {
  if (value === "pcb-trace-widths" || value === "differential-pairs" || value === "ground-pours" || value === "tscircuit-framework") {
    return value;
  }

  return null;
}
