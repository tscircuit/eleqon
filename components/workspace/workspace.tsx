"use client";

import { useEffect, useState, useTransition } from "react";
import { createChatThread, parseChatThreadTitle, type ChatThread } from "@/lib/chat-thread";
import { ChatThreadStore } from "@/lib/chat-thread-store";
import { ArrowIcon, BoardIcon, CodeIcon, CubeIcon, HistoryIcon, PlusIcon, SchematicIcon } from "./icons";
import { Brand } from "./brand";
import styles from "./workspace.module.css";

type WorkspaceTab = "code" | "pcb" | "schematic" | "model";
type View = { readonly kind: "welcome" } | { readonly kind: "thread"; readonly threadId: ChatThread["id"] };
type HomeTab = "agent" | "docs";

const tabs: ReadonlyArray<{ readonly id: WorkspaceTab; readonly label: string; readonly icon: typeof CodeIcon }> = [
  { id: "code", label: "Code", icon: CodeIcon },
  { id: "pcb", label: "PCB", icon: BoardIcon },
  { id: "schematic", label: "Schematic", icon: SchematicIcon },
  { id: "model", label: "3D", icon: CubeIcon },
];

const welcomePrompts = [
  "What are you planning to build today?",
  "Ask a question about the tscircuit docs.",
  "Create a new PCB with tscircuit.",
] as const;

const trendingPcbBlogs = [
  { title: "PCB trace widths: a practical guide", clicks: "42K clicks" },
  { title: "Routing differential pairs without guesswork", clicks: "31K clicks" },
  { title: "Ground pours that make your board quieter", clicks: "20K clicks" },
] as const;

/** Manages local threads and composes the workspace views. */
export function Workspace() {
  const [threads, setThreads] = useState<ReadonlyArray<ChatThread>>(() => typeof window === "undefined" ? [] : new ChatThreadStore(window.localStorage).read());
  const [view, setView] = useState<View>({ kind: "welcome" });
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("code");
  const [homeTab, setHomeTab] = useState<HomeTab>("agent");
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
      {view.kind === "welcome" ? <HomeNotch activeTab={homeTab} onSelect={setHomeTab} /> : null}
      <nav className={styles.rail} aria-label="Workspace navigation">
        <Brand className={styles.brand} />
        <RailButton label="New" icon={<PlusIcon />} onClick={startThread} active={view.kind === "welcome"} />
        <RailButton label="History" icon={<HistoryIcon />} onClick={() => { const latest = threads[0]; if (latest) selectThread(latest.id); }} active={view.kind === "thread"} />
      </nav>
      <main className={styles.main}>
        {view.kind === "welcome" ? <Welcome onSubmit={submit} /> : (
          <ProjectView activeTab={activeTab} thread={threads.find((thread) => thread.id === view.threadId)} onSubmit={submit} onTab={setActiveTab} />
        )}
      </main>
    </div>
  );
}

/** Switches the home-screen context between agent and documentation. */
function HomeNotch({ activeTab, onSelect }: { readonly activeTab: HomeTab; readonly onSelect: (tab: HomeTab) => void }) {
  return <div className={styles.notch} role="tablist" aria-label="Home context"><button className={styles.notchButton} data-active={activeTab === "agent"} type="button" role="tab" aria-selected={activeTab === "agent"} onClick={() => onSelect("agent")}>Agent</button><button className={styles.notchButton} data-active={activeTab === "docs"} type="button" role="tab" aria-selected={activeTab === "docs"} onClick={() => onSelect("docs")}>Docs</button></div>;
}

/** Renders a rail navigation control. */
function RailButton({ label, icon, onClick, active }: { readonly label: string; readonly icon: React.ReactNode; readonly onClick: () => void; readonly active: boolean }) {
  return <button className={styles.railButton} data-active={active} type="button" onClick={onClick} aria-label={label}>{icon}</button>;
}

/** Renders the first-chat prompt. */
function Welcome({ onSubmit }: { readonly onSubmit: (prompt: string) => void }) {
  return <section className={`${styles.frame} ${styles.welcome}`}><div className={styles.composerWrap}><WelcomeHeadline /><Composer onSubmit={onSubmit} /><TrendingPcbBlogs /></div></section>;
}

/** Renders lightweight, popular PCB reading suggestions. */
function TrendingPcbBlogs() {
  return <section className={styles.trendingBlogs} aria-labelledby="trending-pcb-blogs"><h2 id="trending-pcb-blogs" className={styles.trendingHeading}>Trending PCB blogs</h2><div className={styles.trendingGrid}>{trendingPcbBlogs.map((blog) => <article key={blog.title} className={styles.trendingCard}><p className={styles.trendingTitle}>{blog.title}</p><span className={styles.trendingClicks}>{blog.clicks}</span></article>)}</div></section>;
}

/** Cycles through the welcome prompts at a calm, readable pace. */
function WelcomeHeadline() {
  const [promptIndex, setPromptIndex] = useState(0);

  useEffect(() => {
    let currentIndex = 0;
    let hasPausedOnBuildPrompt = false;
    let timer = 0;
    const showNextPrompt = () => {
      const delay = currentIndex === 0 && hasPausedOnBuildPrompt ? 30000 : 3000;
      timer = window.setTimeout(() => {
        currentIndex = (currentIndex + 1) % welcomePrompts.length;
        hasPausedOnBuildPrompt ||= currentIndex === 0;
        setPromptIndex(currentIndex);
        showNextPrompt();
      }, delay);
    };

    showNextPrompt();
    return () => window.clearTimeout(timer);
  }, []);

  const prompt = welcomePrompts[promptIndex];
  return <h1 className={styles.welcomeHeadline}><span key={prompt} className={styles.welcomeHeadlineText}>{prompt}</span></h1>;
}

/** Renders the split chat and engineering workspace. */
function ProjectView({ activeTab, thread, onSubmit, onTab }: { readonly activeTab: WorkspaceTab; readonly thread: ChatThread | undefined; readonly onSubmit: (prompt: string) => void; readonly onTab: (tab: WorkspaceTab) => void }) {
  return <section className={`${styles.frame} ${styles.project}`}><aside className={styles.chatPanel} aria-label="Chat area"><div className={styles.chatArea}>{thread ? <p className={styles.chatMessage}>{thread.title}</p> : null}</div><div className={styles.chatInput}><Composer onSubmit={onSubmit} /></div></aside><section className={styles.canvas}><div className={styles.tabs} role="tablist" aria-label="Build artefacts">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={styles.tab} data-active={activeTab === id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTab(id)}><Icon />{label}</button>)}</div><div className={styles.content} /></section></section>;
}

/** Captures a non-empty build prompt. */
function Composer({ onSubmit }: { readonly onSubmit: (prompt: string) => void }) {
  const [draft, setDraft] = useState("");
  const send = () => { const prompt = draft.trim(); if (prompt) { onSubmit(prompt); setDraft(""); } };
  return <div className={styles.composer}><textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Ask tscircuit agent" aria-label="Project description" /><div className={styles.composerFooter}><button className={styles.attach} type="button" aria-label="Add context">+</button><button className={styles.send} type="button" onClick={send} disabled={!draft.trim()} aria-label="Start chat"><ArrowIcon /></button></div></div>;
}
