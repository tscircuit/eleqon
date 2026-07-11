# tscircuit workspace

## Purpose

This is a dark-only local-first engineering workspace. The initial prompt starts a chat, then presents code, PCB, schematic, and 3D workspace tabs.

## Ownership and data flow

`app/page.tsx` is a server component and renders the client boundary at `components/workspace/workspace.tsx`. The current screen, home context, opaque project thread ID, and active artefact tab are URL-backed; its small composed children render the rail, thread panel, composer, and canvas.

`lib/workspace-url-state.ts` owns the typed parse/serialize boundary for reproducible URLs. `lib/blog.ts` owns blog IDs, types, and parsing; `lang/en/blogs.ts` owns the English article catalog. `lib/chat-thread-store.ts` remains the local history cache, storing versioned threads under `tscircuit.chat-threads.v1` in browser localStorage.

`lang/en/workspace.ts` owns all rendered English workspace copy, including metadata, navigation, labels, library content, and footer text. Do not add user-visible English strings to components or runtime modules.

## Extension points

- Add real generation through the `makeThread` workflow, preserving the `ChatThread` discriminated message model.
- Keep browser-only APIs behind the workspace client boundary.
- Add an artefact renderer per `WorkspaceTab`; do not add mode booleans to `Workspace`.

## Verification

Run `npm run lint` and `npm run build`. Manually create a thread, reload, and confirm the thread remains in history. Check the compact rail at a narrow viewport.
