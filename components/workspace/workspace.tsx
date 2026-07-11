"use client";

import { useEffect, useState, useTransition } from "react";
import { createChatThread, parseChatThreadTitle, type ChatThread } from "@/lib/chat-thread";
import { ChatThreadStore } from "@/lib/chat-thread-store";
import { ArrowIcon, BoardIcon, CodeIcon, CubeIcon, HistoryIcon, PlusIcon, SchematicIcon } from "./icons";
import { Brand } from "./brand";
import styles from "./workspace.module.css";

type WorkspaceTab = "code" | "pcb" | "schematic" | "model";
type View = { readonly kind: "welcome" } | { readonly kind: "thread"; readonly threadId: ChatThread["id"] };

const tabs: ReadonlyArray<{ readonly id: WorkspaceTab; readonly label: string; readonly icon: typeof CodeIcon }> = [
  { id: "code", label: "Code", icon: CodeIcon },
  { id: "pcb", label: "PCB", icon: BoardIcon },
  { id: "schematic", label: "Schematic", icon: SchematicIcon },
  { id: "model", label: "3D", icon: CubeIcon },
];

/** Manages local threads and composes the workspace views. */
export function Workspace() {
  const [threads, setThreads] = useState<ReadonlyArray<ChatThread>>(() => typeof window === "undefined" ? [] : new ChatThreadStore(window.localStorage).read());
  const [view, setView] = useState<View>({ kind: "welcome" });
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("code");
  const [, startTransition] = useTransition();

  useEffect(() => { const store = new ChatThreadStore(window.localStorage); threads.toReversed().forEach((thread) => store.save(thread)); }, [threads]);

  const startThread = () => setView({ kind: "welcome" });
  const selectThread = (threadId: ChatThread["id"]) => setView({ kind: "thread", threadId });
  const submit = (prompt: string) => {
    startTransition(() => {
      const title = parseChatThreadTitle(prompt);
      if (title === null) return;
      const thread = createChatThread(title);
      setThreads((current) => [thread, ...current]);
      setView({ kind: "thread", threadId: thread.id });
    });
  };

  return (
    <div className={styles.workspace} data-view={view.kind}>
      <nav className={styles.rail} aria-label="Workspace navigation">
        <Brand className={styles.brand} />
        <RailButton label="New" icon={<PlusIcon />} onClick={startThread} active={view.kind === "welcome"} />
        <RailButton label="History" icon={<HistoryIcon />} onClick={() => { const latest = threads[0]; if (latest) selectThread(latest.id); }} active={view.kind === "thread"} />
      </nav>
      <main className={styles.main}>
        {view.kind === "welcome" ? <Welcome onSubmit={submit} /> : (
          <ProjectView threads={threads} selectedId={view.threadId} activeTab={activeTab} onNew={startThread} onSelect={selectThread} onTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}

/** Renders a rail navigation control. */
function RailButton({ label, icon, onClick, active }: { readonly label: string; readonly icon: React.ReactNode; readonly onClick: () => void; readonly active: boolean }) {
  return <button className={styles.railButton} data-active={active} type="button" onClick={onClick} aria-label={label}>{icon}</button>;
}

/** Renders the first-chat prompt. */
function Welcome({ onSubmit }: { readonly onSubmit: (prompt: string) => void }) {
  return <section className={`${styles.frame} ${styles.welcome}`}><div className={styles.composerWrap}><strong className={styles.eyebrow}>What are you planning to build?</strong><Composer onSubmit={onSubmit} /></div></section>;
}

/** Renders an active engineering thread. */
function ProjectView({ threads, selectedId, activeTab, onNew, onSelect, onTab }: { readonly threads: ReadonlyArray<ChatThread>; readonly selectedId: ChatThread["id"]; readonly activeTab: WorkspaceTab; readonly onNew: () => void; readonly onSelect: (id: ChatThread["id"]) => void; readonly onTab: (tab: WorkspaceTab) => void }) {
  const selected = threads.find((thread) => thread.id === selectedId);
  return <section className={`${styles.frame} ${styles.project}`}><aside className={styles.threadPanel}><p className={styles.threadTitle}>Threads</p><div className={styles.threadList}>{threads.map((thread) => <button key={thread.id} type="button" className={styles.thread} data-selected={selectedId === thread.id} onClick={() => onSelect(thread.id)}>{thread.title}</button>)}</div><button className={styles.newThread} type="button" onClick={onNew}>+ New chat</button></aside><section className={styles.canvas}><div className={styles.tabs} role="tablist" aria-label="Build artefacts">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={styles.tab} data-active={activeTab === id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTab(id)}><Icon />{label}</button>)}</div><div className={styles.content}>{selected ? <Thread thread={selected} activeTab={activeTab} /> : null}</div></section></section>;
}

/** Displays messages and a compact follow-up composer. */
function Thread({ thread, activeTab }: { readonly thread: ChatThread; readonly activeTab: WorkspaceTab }) {
  return <><article className={styles.message}><span className={styles.author}>Project brief</span>{thread.title}</article><article className={`${styles.message} ${styles.assistant}`}><span className={styles.author}>Eleqon</span>Project created. Choose a workspace tab to begin building.</article><p className={styles.workspaceNote}>The {activeTab === "model" ? "3D model" : activeTab} workspace will appear here as the project develops.</p></>;
}

/** Captures a non-empty build prompt. */
function Composer({ onSubmit }: { readonly onSubmit: (prompt: string) => void }) {
  const [draft, setDraft] = useState("");
  const send = () => { const prompt = draft.trim(); if (prompt) { onSubmit(prompt); setDraft(""); } };
  return <div className={styles.composer}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Work on anything" aria-label="Project description" /><div className={styles.composerFooter}><button className={styles.attach} type="button" aria-label="Add context">+</button><button className={styles.send} type="button" onClick={send} disabled={!draft.trim()} aria-label="Start chat"><ArrowIcon /></button></div></div>;
}
