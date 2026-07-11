/** A nominal identifier for a persisted chat thread. */
export type ChatThreadId = string & { readonly __brand: "ChatThreadId" };

/** A non-empty, display-ready title for a chat thread. */
export type ChatThreadTitle = string & { readonly __brand: "ChatThreadTitle" };

/** An ISO-8601 timestamp created or parsed at the persistence boundary. */
export type ChatThreadTimestamp = string & {
  readonly __brand: "ChatThreadTimestamp";
};

/** A chat thread that can be rendered in history. */
export type ChatThread = Readonly<{
  readonly id: ChatThreadId;
  readonly title: ChatThreadTitle;
  readonly createdAt: ChatThreadTimestamp;
  readonly updatedAt: ChatThreadTimestamp;
}>;

/** Parse a submitted prompt into a display-ready thread title. */
export function parseChatThreadTitle(prompt: string): ChatThreadTitle | null {
  const title = prompt.trim();
  if (title.length === 0) {
    return null;
  }

  // SAFETY: the empty branch above excludes empty titles from the branded type.
  return title as ChatThreadTitle;
}

/** Create a new thread with a generated identifier and timestamp. */
export function createChatThread(
  title: ChatThreadTitle,
  now: Date = new Date(),
): ChatThread {
  const timestamp = createChatThreadTimestamp(now);

  return {
    id: createChatThreadId(),
    title,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/** Create an opaque identifier for a new chat thread. */
export function createChatThreadId(): ChatThreadId {
  // SAFETY: randomUUID always produces an opaque, globally unique string identifier.
  return crypto.randomUUID() as ChatThreadId;
}

/** Create a timestamp trusted by the chat-thread domain. */
export function createChatThreadTimestamp(now: Date): ChatThreadTimestamp {
  // SAFETY: Date#toISOString always returns a valid ISO-8601 timestamp.
  return now.toISOString() as ChatThreadTimestamp;
}
