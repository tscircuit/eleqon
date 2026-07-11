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

/** Parse one recognized article identifier from a URL boundary. */
export function parseBlogId(value: string | null): BlogId | null {
  if (value === "pcb-trace-widths" || value === "differential-pairs" || value === "ground-pours" || value === "tscircuit-framework") {
    return value;
  }

  return null;
}
