import type {
  ChatThread,
  ChatThreadId,
  ChatThreadTimestamp,
  ChatThreadTitle,
} from "./chat-thread";

const CHAT_THREADS_STORAGE_KEY = "eleqon.chat-threads.v1";

/** The minimum storage API required to persist chat threads. */
export type ChatThreadStorage = Pick<Storage, "getItem" | "setItem">;

/** Persisted chat history with the most recently updated thread first. */
export class ChatThreadStore {
  constructor(private readonly storage: ChatThreadStorage) {}

  /** Return valid persisted threads, newest first. */
  read(): ReadonlyArray<ChatThread> {
    const rawThreads = this.storage.getItem(CHAT_THREADS_STORAGE_KEY);
    if (rawThreads === null) {
      return [];
    }

    return parseChatThreads(rawThreads);
  }

  /** Add a thread to the front of persisted history. */
  save(thread: ChatThread): ReadonlyArray<ChatThread> {
    const threads = [thread, ...this.read().filter(({ id }) => id !== thread.id)];
    this.storage.setItem(CHAT_THREADS_STORAGE_KEY, JSON.stringify(threads));
    return threads;
  }
}

/** Parse stored JSON into renderable chat threads. */
function parseChatThreads(rawThreads: string): ReadonlyArray<ChatThread> {
  try {
    const value: unknown = JSON.parse(rawThreads);
    if (!Array.isArray(value)) {
      return [];
    }

    return value.flatMap(parseChatThread);
  } catch {
    return [];
  }
}

/** Parse one persisted thread without allowing untrusted storage into the domain. */
function parseChatThread(value: unknown): ReadonlyArray<ChatThread> {
  if (!isThreadRecord(value)) {
    return [];
  }

  return [{
    id: toChatThreadId(value.id),
    title: toChatThreadTitle(value.title),
    createdAt: toChatThreadTimestamp(value.createdAt),
    updatedAt: toChatThreadTimestamp(value.updatedAt),
  }];
}

/** Narrow unknown local-storage values to the persisted thread shape. */
function isThreadRecord(
  value: unknown,
): value is Readonly<Record<"id" | "title" | "createdAt" | "updatedAt", string>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const record = value as Readonly<Record<string, unknown>>;
  return (
    typeof record.id === "string" &&
    record.id.length > 0 &&
    typeof record.title === "string" &&
    record.title.trim().length > 0 &&
    typeof record.createdAt === "string" &&
    Number.isFinite(Date.parse(record.createdAt)) &&
    typeof record.updatedAt === "string" &&
    Number.isFinite(Date.parse(record.updatedAt))
  );
}

/** Brand an identifier that has passed the persistence boundary. */
function toChatThreadId(value: string): ChatThreadId {
  // SAFETY: isThreadRecord verifies that persisted IDs are non-empty strings.
  return value as ChatThreadId;
}

/** Brand a title that has passed the persistence boundary. */
function toChatThreadTitle(value: string): ChatThreadTitle {
  // SAFETY: isThreadRecord verifies that persisted titles contain visible text.
  return value as ChatThreadTitle;
}

/** Brand a timestamp that has passed the persistence boundary. */
function toChatThreadTimestamp(value: string): ChatThreadTimestamp {
  // SAFETY: isThreadRecord verifies that persisted timestamps parse as dates.
  return value as ChatThreadTimestamp;
}
