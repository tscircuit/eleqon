# Chat thread storage

`lib/chat-thread.ts` owns branded chat-thread values. Create a title with
`parseChatThreadTitle`; only a non-null title can create a `ChatThread`.

`lib/chat-thread-store.ts` owns browser persistence. Construct it in a client
component with `new ChatThreadStore(window.localStorage)`, call `read()` during
initialization, and call `save(thread)` after a valid prompt is submitted.

The versioned local-storage key is `eleqon.chat-threads.v1`. Reads discard
malformed records so UI code only receives valid, newest-first threads.
