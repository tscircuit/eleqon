import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Shared outline icon frame. */
function Icon({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" {...props}>
      {children}
    </svg>
  );
}

/** Creates a new thread. */
export function PlusIcon(props: IconProps) { return <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>; }
/** Opens thread history. */
export function HistoryIcon(props: IconProps) { return <Icon {...props}><path d="M3.5 12a8.5 8.5 0 1 0 2.4-5.94" /><path d="M3.5 4.5v3.9h3.9M12 7v5l3.2 2" /></Icon>; }
/** Sends the plan to the workspace. */
export function ArrowIcon(props: IconProps) { return <Icon {...props}><path d="M5 12h13M13 6l6 6-6 6" /></Icon>; }
/** Represents source code. */
export function CodeIcon(props: IconProps) { return <Icon {...props}><path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" /></Icon>; }
/** Represents a circuit board. */
export function BoardIcon(props: IconProps) { return <Icon {...props}><rect x="5" y="5" width="14" height="14" rx="2" /><path d="M9 9h.01M15 9h.01M9 15h6" /></Icon>; }
/** Represents a schematic. */
export function SchematicIcon(props: IconProps) { return <Icon {...props}><path d="M4 12h4l2-5 4 10 2-5h4M4 6h3M17 18h3" /></Icon>; }
/** Represents a three-dimensional model. */
export function CubeIcon(props: IconProps) { return <Icon {...props}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></Icon>; }
