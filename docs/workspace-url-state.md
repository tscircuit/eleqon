# Workspace URL state

`lib/workspace-url-state.ts` is the source of truth for the reproducible workspace state. It parses browser query parameters into a discriminated union before UI code reads them, then serializes only valid states back to the URL.

| Screen | URL | Reproduces |
| --- | --- | --- |
| Agent home | `?screen=home&context=agent` | Agent home context |
| Docs home | `?screen=docs&article=tscircuit-framework` | Docs with its selected article |
| Docs article | `?screen=docs&article=pcb-trace-widths` | Selected static Docs article |
| Docs blogs | `?screen=docs&view=blogs` | The Docs blog index |
| Packages | `?screen=packages` | Searchable local package catalog |
| Project | `?screen=project&thread=<uuid>&tab=pcb` | Opaque thread reference and active artefact tab |

The URL is updated with `history.pushState`, and browser back/forward restores it with `popstate`. Local storage resolves the opaque thread ID, so this small-scale version reopens a project safely in the same browser without leaking its prompt or attachments.

This small-scale prototype intentionally leaves transient composer input and animation timing out of the URL. Cross-browser sharing needs a server-side thread store that resolves an opaque share ID with access controls and expiry.
