import { enWorkspace } from "@/lang/en/workspace";

/** Displays the compact Eleqon mark. */
export function Brand({ className }: { readonly className: string }) {
  return <span className={className} aria-label={enWorkspace.aria.brand}>{enWorkspace.brand.mark}</span>;
}
