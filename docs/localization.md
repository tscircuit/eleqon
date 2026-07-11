# Localization

All rendered English copy belongs under `lang/en`. UI behavior and domain modules must reference locale exports instead of embedding display text.

| File | Owns |
| --- | --- |
| `lang/en/workspace.ts` | Workspace chrome, prompts, navigation, library, docs labels, footer, metadata, and accessibility labels |
| `lang/en/blogs.ts` | English blog titles, summaries, visit counts, and article bodies |

`lib/blog.ts` deliberately has no article copy. It defines only the stable article IDs, the article shape, and parsing needed by URL state. When adding a language, reproduce the same exported structures in a new locale folder and select it at the app boundary.
