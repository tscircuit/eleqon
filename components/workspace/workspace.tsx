"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { getEnglishBlogPost, getEnglishBlogPosts } from "@/lang/en/blogs";
import { enWorkspace } from "@/lang/en/workspace";
import type { BlogId, BlogPost } from "@/lib/blog";
import { createChatThread, parseChatThreadTitle, type ChatThread } from "@/lib/chat-thread";
import { ChatThreadStore } from "@/lib/chat-thread-store";
import { parseWorkspaceUrlState, serializeWorkspaceUrlState, type DocsUrlState, type HomeTab, type WorkspaceTab, type WorkspaceUrlState } from "@/lib/workspace-url-state";
import { HistoryDrawer } from "./history-drawer";
import { ArrowIcon, BoardIcon, CodeIcon, CubeIcon, HistoryIcon, PlusIcon, SchematicIcon } from "./icons";
import { Brand } from "./brand";
import styles from "./workspace.module.css";

type LibraryItem = Readonly<{ readonly title: string; readonly detail: string }>;
type LibraryItems = readonly [LibraryItem, ...LibraryItem[]];

const tabs: ReadonlyArray<{ readonly id: WorkspaceTab; readonly label: string; readonly icon: typeof CodeIcon }> = [
  { id: "code", label: enWorkspace.tabs.code, icon: CodeIcon },
  { id: "pcb", label: enWorkspace.tabs.pcb, icon: BoardIcon },
  { id: "schematic", label: enWorkspace.tabs.schematic, icon: SchematicIcon },
  { id: "model", label: enWorkspace.tabs.model, icon: CubeIcon },
];

/** Manages local threads and composes the workspace views. */
export function Workspace() {
  const [threads, setThreads] = useState<ReadonlyArray<ChatThread>>(() => typeof window === "undefined" ? [] : new ChatThreadStore(window.localStorage).read());
  const [workspaceState, setWorkspaceState] = useState<WorkspaceUrlState>(() => typeof window === "undefined" ? { kind: "home", homeTab: "agent" } : parseWorkspaceUrlState(window.location.search));
  const [historyOpen, setHistoryOpen] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => { const restoreWorkspaceState = () => setWorkspaceState(parseWorkspaceUrlState(window.location.search)); window.addEventListener("popstate", restoreWorkspaceState); return () => window.removeEventListener("popstate", restoreWorkspaceState); }, []);

  const navigate = (state: WorkspaceUrlState) => { window.history.pushState(null, "", `${window.location.pathname}${serializeWorkspaceUrlState(state)}`); setWorkspaceState(state); };
  const startThread = () => { setHistoryOpen(false); navigate({ kind: "home", homeTab: "agent" }); };
  const openBlog = (blogId: BlogId) => navigate({ kind: "home", homeTab: "docs", docs: { kind: "article", blogId } });
  const openBlogs = () => navigate({ kind: "home", homeTab: "docs", docs: { kind: "blogs" } });
  const selectThread = (thread: ChatThread) => { setHistoryOpen(false); navigate({ kind: "project", threadId: thread.id, activeTab: "code" }); };
  const submit = (prompt: string) => {
    startTransition(() => {
      const title = parseChatThreadTitle(prompt);
      if (title === null) return;
      const thread = createChatThread(title);
      new ChatThreadStore(window.localStorage).save(thread);
      setThreads((current) => [thread, ...current]);
      navigate({ kind: "project", threadId: thread.id, activeTab: "code" });
    });
  };
  const selectedThread = workspaceState.kind === "project" ? threads.find((thread) => thread.id === workspaceState.threadId) : undefined;

  return (
    <div className={styles.workspace} data-view={workspaceState.kind} data-history-open={historyOpen}>
      {workspaceState.kind === "home" ? <HomeNotch activeTab={workspaceState.homeTab} onSelect={(homeTab) => navigate(homeTab === "agent" ? { kind: "home", homeTab } : { kind: "home", homeTab, docs: { kind: "article", blogId: "tscircuit-framework" } })} /> : null}
      <aside className={styles.rail}>
        <nav className={styles.railControls} aria-label={enWorkspace.aria.workspaceNavigation}>
          <Brand className={styles.brand} />
          <RailButton label={enWorkspace.aria.newChat} icon={<PlusIcon />} onClick={startThread} active={workspaceState.kind === "home"} />
          <HistoryButton open={historyOpen} onClick={() => setHistoryOpen((current) => !current)} />
        </nav>
        <HistoryDrawer open={historyOpen} threads={threads} activeThreadId={workspaceState.kind === "project" ? workspaceState.threadId : null} onSelect={selectThread} />
      </aside>
      <main className={styles.main}>
        {workspaceState.kind === "home" ? workspaceState.homeTab === "agent" ? <Welcome onSubmit={submit} onOpenBlog={openBlog} /> : <DocsPage onSubmit={submit} docs={workspaceState.docs} onOpenBlog={openBlog} onOpenBlogs={openBlogs} /> : (
          <ProjectView activeTab={workspaceState.activeTab} thread={selectedThread} onSubmit={submit} onTab={(activeTab) => navigate({ ...workspaceState, activeTab })} />
        )}
      </main>
    </div>
  );
}

/** Switches the home-screen context between agent and documentation. */
function HomeNotch({ activeTab, onSelect }: { readonly activeTab: HomeTab; readonly onSelect: (tab: HomeTab) => void }) {
  return <div className={styles.notch} role="tablist" aria-label={enWorkspace.aria.homeContext}><button className={styles.notchButton} data-active={activeTab === "agent"} type="button" role="tab" aria-selected={activeTab === "agent"} onClick={() => onSelect("agent")}>{enWorkspace.homeTabs.agent}</button><button className={styles.notchButton} data-active={activeTab === "docs"} type="button" role="tab" aria-selected={activeTab === "docs"} onClick={() => onSelect("docs")}>{enWorkspace.homeTabs.docs}</button></div>;
}

/** Renders a rail navigation control. */
function RailButton({ label, icon, onClick, active }: { readonly label: string; readonly icon: React.ReactNode; readonly onClick: () => void; readonly active: boolean }) {
  return <button className={styles.railButton} data-active={active} type="button" onClick={onClick} aria-label={label}>{icon}</button>;
}

/** Toggles the drawer of locally stored chat threads. */
function HistoryButton({ open, onClick }: { readonly open: boolean; readonly onClick: () => void }) {
  return <button className={styles.railButton} data-active={open} type="button" onClick={onClick} aria-controls="workspace-history" aria-expanded={open} aria-label={enWorkspace.aria.history}><HistoryIcon /></button>;
}

/** Renders the first-chat prompt. */
function Welcome({ onSubmit, onOpenBlog }: { readonly onSubmit: (prompt: string) => void; readonly onOpenBlog: (blogId: BlogId) => void }) {
  const [atTop, setAtTop] = useState(true);
  return <section className={`${styles.frame} ${styles.welcome}`} onScroll={(event) => setAtTop(event.currentTarget.scrollTop < 24)}><div className={styles.homeContent}><div className={styles.composerWrap}><WelcomeHeadline /><Composer onSubmit={onSubmit} /><TrendingPcbBlogs onOpenBlog={onOpenBlog} /><HomeLibrary showFeatureFade={atTop} onOpenBlog={onOpenBlog} /></div></div></section>;
}

/** Renders the featured explainer and browsable tscircuit work. */
function HomeLibrary({ showFeatureFade, onOpenBlog }: { readonly showFeatureFade: boolean; readonly onOpenBlog: (blogId: BlogId) => void }) {
  const frameworkBlog = getEnglishBlogPost("tscircuit-framework");
  return <div className={styles.homeLibrary}><section className={styles.featuredStory} data-faded={showFeatureFade}><div className={styles.featuredVisual} aria-hidden="true"><span>{enWorkspace.brand.productName}</span></div><article className={styles.featuredCopy}><h2>{frameworkBlog.title}</h2><p>{enWorkspace.library.featureDescription}</p><button className={styles.featuredReadMore} type="button" onClick={() => onOpenBlog(frameworkBlog.id)}>{enWorkspace.library.readMore} <span aria-hidden="true">{enWorkspace.symbols.forward}</span></button></article></section><LibrarySection title={enWorkspace.library.researchTitle} items={enWorkspace.library.researchItems} className={styles.researchGrid} /><LibrarySection title={enWorkspace.library.orderedBoardsTitle} items={enWorkspace.library.orderedBoards} className={styles.boardGrid} /><WorkspaceFooter /></div>;
}

/** Renders a named group of smoothly scrollable library cards. */
function LibrarySection({ title, items, className }: { readonly title: string; readonly items: LibraryItems; readonly className: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const scrollCards = (direction: -1 | 1) => listRef.current?.scrollBy({ left: direction * listRef.current.clientWidth, behavior: "smooth" });

  return <section className={styles.librarySection}><div className={styles.libraryHeader}><h2>{title}</h2><div className={styles.libraryControls}><button className={styles.libraryControl} type="button" onClick={() => scrollCards(-1)} aria-label={enWorkspace.aria.previous(title)}>{enWorkspace.symbols.previous}</button><button className={styles.libraryControl} type="button" onClick={() => scrollCards(1)} aria-label={enWorkspace.aria.next(title)}>{enWorkspace.symbols.forward}</button></div></div><div ref={listRef} className={className}>{items.map((item) => <article key={item.title} className={styles.libraryCard}><div className={styles.cardVisual} aria-hidden="true" /><h3>{item.title}</h3><p>{item.detail}</p></article>)}</div></section>;
}

/** Restores the lightweight PCB reading list on the home page. */
function TrendingPcbBlogs({ onOpenBlog }: { readonly onOpenBlog: (blogId: BlogId) => void }) {
  return <section className={styles.trendingBlogs} aria-labelledby="trending-pcb-blogs"><h2 id="trending-pcb-blogs" className={styles.trendingHeading}>{enWorkspace.library.trendingTitle}</h2><div className={styles.trendingGrid}>{enWorkspace.library.trendingBlogIds.map((blogId) => { const post = getEnglishBlogPost(blogId); return <button key={post.id} className={styles.trendingCard} type="button" onClick={() => onOpenBlog(post.id)}><span className={styles.trendingTitle}>{post.title}</span><span className={styles.trendingClicks}>{enWorkspace.docs.visitCount(post.visits)}</span></button>; })}</div></section>;
}

/** Renders the home library footer and supporting links. */
function WorkspaceFooter() {
  return <footer className={styles.footer}><div className={styles.footerContent}><section className={styles.footerBrand}><strong>{enWorkspace.brand.productName}</strong><p>{enWorkspace.footer.tagline}</p></section>{enWorkspace.footer.columns.map((column) => <section key={column.title} className={styles.footerColumn}><h2>{column.title}</h2><ul>{column.links.map((link) => <li key={link}>{link}</li>)}</ul></section>)}</div><p className={styles.footerCopyright}>{enWorkspace.footer.copyright}</p></footer>;
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
        currentIndex = (currentIndex + 1) % enWorkspace.welcomePrompts.length;
        hasPausedOnBuildPrompt ||= currentIndex === 0;
        setPromptIndex(currentIndex);
        showNextPrompt();
      }, delay);
    };

    showNextPrompt();
    return () => window.clearTimeout(timer);
  }, []);

  const prompt = enWorkspace.welcomePrompts[promptIndex];
  return <h1 className={styles.welcomeHeadline}><span key={prompt} className={styles.welcomeHeadlineText}>{prompt}</span></h1>;
}

/** Renders the split chat and engineering workspace. */
function ProjectView({ activeTab, thread, onSubmit, onTab }: { readonly activeTab: WorkspaceTab; readonly thread: ChatThread | undefined; readonly onSubmit: (prompt: string) => void; readonly onTab: (tab: WorkspaceTab) => void }) {
  return <section className={`${styles.frame} ${styles.project}`}><ChatColumn thread={thread} onSubmit={onSubmit} /><section className={styles.canvas}><div className={styles.tabs} role="tablist" aria-label={enWorkspace.aria.buildArtifacts}>{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={styles.tab} data-active={activeTab === id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTab(id)}><Icon />{label}</button>)}</div><div className={styles.content} /></section></section>;
}

/** Renders Docs navigation beside its article or blog index. */
function DocsPage({ onSubmit, docs, onOpenBlog, onOpenBlogs }: { readonly onSubmit: (prompt: string) => void; readonly docs: DocsUrlState; readonly onOpenBlog: (blogId: BlogId) => void; readonly onOpenBlogs: () => void }) {
  return <section className={`${styles.frame} ${styles.project} ${styles.docsPage}`}><ChatColumn onSubmit={onSubmit} /><section className={styles.docsCanvas}><DocsSidebar docs={docs} onOpenBlog={onOpenBlog} onOpenBlogs={onOpenBlogs} /><section className={styles.docsArticlePane}>{docs.kind === "article" ? <BlogArticle key={docs.blogId} blog={getEnglishBlogPost(docs.blogId)} /> : <BlogsIndex onOpenBlog={onOpenBlog} />}</section></section></section>;
}

/** Renders the navigation inside the Docs canvas. */
function DocsSidebar({ docs, onOpenBlog, onOpenBlogs }: { readonly docs: DocsUrlState; readonly onOpenBlog: (blogId: BlogId) => void; readonly onOpenBlogs: () => void }) {
  const frameworkBlog = getEnglishBlogPost("tscircuit-framework");
  const blogs = getEnglishBlogPosts().filter(({ id }) => id !== frameworkBlog.id);

  return <nav className={styles.docsSidebar} aria-label={enWorkspace.aria.docsArticles}><section className={styles.docsNavSection}><p className={styles.docsSidebarHeading}>{enWorkspace.docs.introTitle}</p><div className={styles.docsNav}><button className={styles.docsNavButton} data-active={docs.kind === "article" && docs.blogId === frameworkBlog.id} type="button" onClick={() => onOpenBlog(frameworkBlog.id)}>{frameworkBlog.title}</button></div></section><section className={styles.docsNavSection}><p className={styles.docsSidebarHeading}>{enWorkspace.docs.blogsTitle}</p><div className={styles.docsNav}><button className={styles.docsNavButton} data-active={docs.kind === "blogs"} type="button" onClick={onOpenBlogs}>{enWorkspace.docs.allPosts}</button>{blogs.map((blog) => <button key={blog.id} className={styles.docsNavButton} data-active={docs.kind === "article" && docs.blogId === blog.id} type="button" onClick={() => onOpenBlog(blog.id)}>{blog.title}</button>)}</div></section></nav>;
}

/** Renders a selected article in the docs workspace. */
function BlogArticle({ blog }: { readonly blog: BlogPost }) {
  return <article className={styles.blogArticle}><p className={styles.blogEyebrow}>{enWorkspace.brand.docsName}</p><h1>{blog.title}</h1><p className={styles.blogSummary}>{blog.summary}</p><div className={styles.blogBody}>{blog.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>;
}

/** Renders the Docs blog index. */
function BlogsIndex({ onOpenBlog }: { readonly onOpenBlog: (blogId: BlogId) => void }) {
  const blogs = getEnglishBlogPosts().filter(({ id }) => id !== "tscircuit-framework");
  return <article className={styles.blogsIndex}><p className={styles.blogEyebrow}>{enWorkspace.brand.docsName}</p><h1>{enWorkspace.docs.blogsTitle}</h1><p className={styles.blogSummary}>{enWorkspace.docs.blogsSummary}</p><div className={styles.blogsIndexList}>{blogs.map((blog) => <button key={blog.id} className={styles.blogsIndexRow} type="button" onClick={() => onOpenBlog(blog.id)}><span>{blog.title}</span><small>{enWorkspace.docs.visitCount(blog.visits)}</small></button>)}</div></article>;
}

/** Keeps chat and input layout consistent across workspace views. */
function ChatColumn({ thread, onSubmit }: { readonly thread?: ChatThread; readonly onSubmit: (prompt: string) => void }) {
  return <aside className={styles.chatPanel} aria-label={enWorkspace.aria.chatArea}><div className={styles.chatArea}>{thread ? <p className={styles.chatMessage}>{thread.title}</p> : null}</div><div className={styles.chatInput}><Composer onSubmit={onSubmit} /></div></aside>;
}

/** Captures a non-empty build prompt. */
function Composer({ onSubmit }: { readonly onSubmit: (prompt: string) => void }) {
  const [draft, setDraft] = useState("");
  const send = () => { const prompt = draft.trim(); if (prompt) { onSubmit(prompt); setDraft(""); } };
  return <div className={styles.composer}><textarea autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder={enWorkspace.composer.placeholder} aria-label={enWorkspace.aria.projectDescription} /><div className={styles.composerFooter}><button className={styles.attach} type="button" aria-label={enWorkspace.aria.addContext}>{enWorkspace.symbols.add}</button><button className={styles.send} type="button" onClick={send} disabled={!draft.trim()} aria-label={enWorkspace.aria.startChat}><ArrowIcon /></button></div></div>;
}
