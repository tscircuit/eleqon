import { enWorkspace } from "@/lang/en/workspace";
import type { ChatThread, ChatThreadId } from "@/lib/chat-thread";
import styles from "./workspace.module.css";

/** Shows the locally saved threads available from the workspace rail. */
export function HistoryDrawer({ open, threads, activeThreadId, onSelect }: { readonly open: boolean; readonly threads: ReadonlyArray<ChatThread>; readonly activeThreadId: ChatThreadId | null; readonly onSelect: (thread: ChatThread) => void }) {
  return <section id="workspace-history" className={styles.historyDrawer} aria-label={enWorkspace.history.title} aria-hidden={!open}><h2>{enWorkspace.history.title}</h2>{threads.length === 0 ? <p className={styles.historyEmpty}>{enWorkspace.history.empty}</p> : <div className={styles.historyList}>{threads.slice(0, enWorkspace.history.visibleThreadCount).map((thread) => <button key={thread.id} className={styles.historyThread} data-active={thread.id === activeThreadId} type="button" onClick={() => onSelect(thread)} tabIndex={open ? 0 : -1}><span>{enWorkspace.history.startingMessage}</span><strong>{thread.title}</strong></button>)}</div>}</section>;
}
