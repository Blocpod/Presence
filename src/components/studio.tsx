"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Box,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Eye,
  Fingerprint,
  Heart,
  History,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MessageCircle,
  Mic,
  Play,
  Plus,
  Power,
  Radio,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Users,
  Volume2,
  Wallet,
  X,
} from "lucide-react";
import type { CreatorPatch, Fan, PresenceState, Surface } from "@/lib/types";
import { api } from "@/lib/client";
import {
  BrowserVoiceProvider,
  voiceDisclosure,
  recognitionDisclosure,
} from "@/lib/voice";
const SpatialStage = dynamic(() => import("./spatial-stage"), {
  ssr: false,
  loading: () => <div className="spatial-loading">Preparing your space…</div>,
});
type Page =
  | "Overview"
  | "My Presence"
  | "Relationships"
  | "Live sessions"
  | "Revenue"
  | "Integrations"
  | "Settings";
const nav = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "My Presence", icon: Fingerprint },
  { name: "Relationships", icon: Users },
  { name: "Live sessions", icon: Radio },
  { name: "Revenue", icon: Wallet },
  { name: "Integrations", icon: Layers3 },
] as const;
const surfaces: Surface[] = ["text", "voice", "visual", "spatial"];
const surfaceIcons = {
  text: MessageCircle,
  voice: AudioLines,
  visual: Eye,
  spatial: Box,
};
const money = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(cents / 100);
const time = (s: string) =>
  new Date(s).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
const steps = [
  [
    "Meet your Presence",
    "One fictional identity. One inspectable license. Every interaction traces back to the creator.",
    "My Presence",
  ],
  [
    "Set the boundaries",
    "Control behavior, memory and surfaces. The runtime enforces changes on every interaction.",
    "My Presence",
  ],
  [
    "Make it personal",
    "Open Alex’s conversation, then Jordan’s. Each relationship has its own approved memories.",
    "Relationships",
  ],
  [
    "Be there in every form",
    "Move from text to browser voice, a visual portrait, or the spatial prototype.",
    "Live sessions",
  ],
  [
    "The real you, on cue",
    "Join an active conversation. The fan sees that the human creator is now in control.",
    "Live sessions",
  ],
  [
    "See the economic layer",
    "Every delivered interaction creates a sandbox metering event. Explore the platform model.",
    "Revenue",
  ],
  [
    "Always yours to control",
    "Pause or revoke the license. New interactions stop across every surface.",
    "My Presence",
  ],
] as const;
export default function Studio() {
  const [state, setState] = useState<PresenceState | null>(null),
    [page, setPage] = useState<Page>("Overview"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [menu, setMenu] = useState(false),
    [onboard, setOnboard] = useState(false),
    [tour, setTour] = useState<number | null>(null),
    [chatFan, setChatFan] = useState<string | null>(null),
    [sessionId, setSessionId] = useState<string | null>(null),
    [surface, setSurface] = useState<Surface>("text");
  const refresh = useCallback(async () => {
    try {
      setState(await api("state"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    let live = true;
    api("state")
      .catch(() => api("demo", "POST", { role: "creator" }))
      .then((s) => {
        if (live) setState(s);
      })
      .catch((e) => {
        if (live) setError(e.message);
      });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 3000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [refresh]);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  const mutate = async (
    path: string,
    method: string,
    body?: unknown,
    success?: string,
  ) => {
    setBusy(true);
    setError("");
    try {
      const s = await api(path, method, body);
      setState(s);
      if (success) setNotice(success);
      return s;
    } catch (e) {
      setError((e as Error).message);
      return null;
    } finally {
      setBusy(false);
    }
  };
  const navigate = (p: Page) => {
    setPage(p);
    setMenu(false);
  };
  const openChat = async (fanId: string, kind: Surface = "text") => {
    if (!state?.creator.enabled) {
      setOnboard(true);
      return;
    }
    const existing = state.sessions.find(
      (s) => s.fanId === fanId && s.surface === kind && s.status === "active",
    );
    let id = existing?.id;
    if (!id) {
      const result = await mutate("sessions", "POST", { fanId, surface: kind });
      id = result?.sessionId;
    }
    if (id) {
      setError("");
      setSurface(kind);
      setSessionId(id);
      setChatFan(fanId);
    }
  };
  const patch = async (
    body: CreatorPatch,
    success = "Presence updated. Changes apply to the next interaction.",
  ) => mutate("creator", "PATCH", body, success);
  const exportData = () => {
    if (!state) return;
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "presence-demo-export.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice("Demo workspace exported.");
  };
  if (!state)
    return (
      <main className="loading-screen">
        <Logo />
        <div className="loading-line" />
        <p>{error || "Opening your studio…"}</p>
        {error && (
          <button className="button primary" onClick={() => location.reload()}>
            Try again
          </button>
        )}
      </main>
    );
  const active =
    state.creator.enabled && state.creator.licenseStatus === "active";
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className={`sidebar ${menu ? "mobile-open" : ""}`}>
        <div className="sidebar-brand">
          <Logo />
          <button
            className="icon-button mobile-only"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <button
          className="workspace-switch"
          onClick={() => navigate("My Presence")}
        >
          <div className="workspace-avatar">
            <Image
              src="/mira-vale.png"
              alt="Fictional creator Mira Vale"
              fill
              sizes="40px"
            />
          </div>
          <span>
            <strong>Mira’s studio</strong>
            <small>Creator workspace</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <button
              key={n.name}
              className={`nav-link ${page === n.name ? "selected" : ""}`}
              onClick={() => navigate(n.name)}
            >
              <n.icon size={18} />
              <span>{n.name}</span>
              {n.name === "Live sessions" &&
                state.metrics.concurrentRelationships > 0 && (
                  <em>{state.metrics.concurrentRelationships}</em>
                )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="studio-note">
            <div className="orbit-symbol">✳</div>
            <strong>
              Your presence.
              <br />
              Your possibilities.
            </strong>
            <p>Every connection, on your terms.</p>
            <button
              onClick={() => {
                setTour(0);
                navigate("My Presence");
              }}
            >
              Explore the demo <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className={`nav-link ${page === "Settings" ? "selected" : ""}`}
            onClick={() => navigate("Settings")}
          >
            <Settings2 size={18} />
            Settings & audit
          </button>
          <button
            className="nav-link"
            onClick={() => {
              setTour(0);
              navigate("My Presence");
            }}
          >
            <CircleHelp size={18} />
            Demo guide <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-footer">
            <span className="tiny-dot" />
            LOCAL DEMO <span>v0.1</span>
          </div>
        </div>
      </aside>
      {menu && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-only"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="top-actions">
            <span className="sandbox-label">
              <span />
              Sandbox mode
            </span>
            <button
              className="button compact"
              onClick={() => {
                setTour(0);
                navigate("My Presence");
              }}
            >
              <Play size={13} fill="currentColor" />
              Executive demo
            </button>
            <button
              className="account-avatar"
              aria-label="Open creator profile"
              onClick={() => navigate("My Presence")}
            >
              MV
            </button>
          </div>
        </header>
        <main id="main" className="main-content">
          {error && (
            <div className="alert error" role="alert">
              <ShieldCheck size={18} />
              <span>{error}</span>
              <button
                className="icon-button"
                aria-label="Dismiss error"
                onClick={() => setError("")}
              >
                <X size={16} />
              </button>
            </div>
          )}
          {tour !== null && (
            <div className="tour-panel">
              <div className="tour-number">
                0{tour + 1}
                <span>/ 07</span>
              </div>
              <div>
                <small>THE PRESENCE STORY</small>
                <h3>{steps[tour][0]}</h3>
                <p>{steps[tour][1]}</p>
              </div>
              <div className="tour-actions">
                {tour > 0 && (
                  <button
                    className="button compact"
                    onClick={() => {
                      setTour(tour - 1);
                      navigate(steps[tour - 1][2]);
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  className="button primary compact"
                  onClick={() => {
                    if (tour === 6) {
                      setTour(null);
                      return;
                    }
                    setTour(tour + 1);
                    navigate(steps[tour + 1][2]);
                  }}
                >
                  {tour === 6 ? "Finish demo" : "Next chapter"}
                  <ArrowRight size={15} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Close demo guide"
                  onClick={() => setTour(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          )}
          {page === "Overview" && (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">YOUR PRESENCE, AT A GLANCE</div>
                  <h1>A little more everywhere.</h1>
                  <p>Your world keeps growing. Your Presence grows with it.</p>
                </div>
                <button className="button" onClick={() => void refresh()}>
                  <RefreshCw size={15} />
                  Refresh activity
                </button>
              </div>
              <div className="overview-top">
                <section className="presence-hero">
                  <Image
                    src="/mira-vale.png"
                    alt="Mira Vale, a fictional 28-year-old creator, in her studio"
                    fill
                    priority
                    sizes="(max-width: 850px) 100vw, 65vw"
                  />
                  <div className="hero-shade" />
                  <div className="hero-top">
                    <span className="pill dark">
                      <span
                        className={active ? "status-dot" : "status-dot muted"}
                      />
                      {active
                        ? "YOUR PRESENCE IS LIVE"
                        : "YOUR PRESENCE IS READY"}
                    </span>
                    <span className="hero-version">MIRA / 001</span>
                  </div>
                  <div className="hero-copy">
                    <span className="hero-kicker">
                      YOU, WITHOUT THE LIMITS.
                    </span>
                    <h2>
                      Be there.
                      <br />
                      <em>Even when you’re not.</em>
                    </h2>
                    <p>
                      A familiar voice. A shared memory.
                      <br />A thousand connections that still feel personal.
                    </p>
                    <button
                      className="button cream"
                      onClick={() =>
                        active
                          ? void openChat(state.fans[0].id)
                          : setOnboard(true)
                      }
                    >
                      {active
                        ? "Experience your Presence"
                        : "Activate your Presence"}
                      <ArrowUpRight size={17} />
                    </button>
                  </div>
                  <div className="hero-foot">
                    <span>
                      <ShieldCheck size={14} />
                      Fictional identity · creator-governed
                    </span>
                    <span>AI, always disclosed</span>
                  </div>
                </section>
                <section className="status-panel">
                  <div className="section-top">
                    <h3>Your Presence</h3>
                    <Fingerprint size={21} />
                  </div>
                  <div className="presence-identity">
                    <div className="identity-photo">
                      <Image src="/mira-vale.png" alt="" fill sizes="58px" />
                    </div>
                    <div>
                      <h3>
                        Mira Vale <CheckCheck size={16} />
                      </h3>
                      <p>Photographer. Storyteller. Explorer.</p>
                    </div>
                  </div>
                  <div className="status-line">
                    <span>Status</span>
                    <span className={`pill ${active ? "green" : "neutral"}`}>
                      <span
                        className={active ? "status-dot" : "status-dot muted"}
                      />
                      {active
                        ? "Live & available"
                        : state.creator.licenseStatus === "revoked"
                          ? "License revoked"
                          : "Awaiting activation"}
                    </span>
                  </div>
                  <div className="status-line">
                    <span>Identity</span>
                    <strong>
                      Fictional demo <ShieldCheck size={14} />
                    </strong>
                  </div>
                  <div className="status-line">
                    <span>Creator control</span>
                    <strong>
                      Always on <LockKeyhole size={13} />
                    </strong>
                  </div>
                  <div className="surface-status">
                    {surfaces.map((s) => {
                      const Icon = surfaceIcons[s];
                      return (
                        <button
                          key={s}
                          onClick={() => void openChat(state.fans[0].id, s)}
                          aria-label={`Try ${s} Presence`}
                        >
                          <Icon size={20} />
                          <span>{s}</span>
                          <i
                            className={
                              state.creator.surfaces.includes(s)
                                ? "available"
                                : ""
                            }
                          />
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="button full"
                    onClick={() => navigate("My Presence")}
                  >
                    <SlidersHorizontal size={15} />
                    Manage Presence
                    <ArrowRight size={15} />
                  </button>
                  <p className="micro-copy">
                    One identity. Every surface. Your rules.
                  </p>
                </section>
              </div>
              <div className="metrics-grid">
                <Metric
                  label="Presence earnings"
                  value={money(state.metrics.sandboxRevenueCents)}
                  detail="Metered sandbox interactions"
                  icon={<Wallet size={16} />}
                />
                <Metric
                  label="Connected fans"
                  value={String(state.metrics.activeFans)}
                  detail={`${state.fans.length} distinct demo relationships`}
                  icon={<Users size={16} />}
                />
                <Metric
                  label="Conversations"
                  value={String(state.metrics.sessions)}
                  detail={`${state.metrics.aiMessages} AI replies delivered`}
                  icon={<MessageCircle size={16} />}
                />
                <Metric
                  label="Time given back"
                  value={`${state.metrics.creatorHoursSaved.toFixed(1)}h`}
                  detail="Estimate · 30 sec per AI reply"
                  icon={<History size={16} />}
                />
              </div>
              <div className="overview-bottom">
                <section className="panel relationships-preview">
                  <div className="section-top">
                    <div>
                      <h3>Every connection has a story.</h3>
                      <p>Different people. A Presence that remembers.</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => navigate("Relationships")}
                    >
                      View all <ArrowUpRight size={15} />
                    </button>
                  </div>
                  {state.fans.map((f) => (
                    <button
                      key={f.id}
                      className="fan-row"
                      onClick={() => void openChat(f.id)}
                    >
                      <Avatar fan={f} />
                      <span className="fan-row-name">
                        <strong>{f.name}</strong>
                        <small>
                          {state.memories.find((m) => m.fanId === f.id)?.text ||
                            "A new story starts here."}
                        </small>
                      </span>
                      <span className="membership">{f.membership}</span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                  <div className="panel-foot">
                    <LockKeyhole size={13} />
                    Memories are private to each creator–fan relationship.
                  </div>
                </section>
                <section className="opportunity-panel">
                  <div className="eyebrow">THE BIGGER PICTURE</div>
                  <div className="opportunity-art" aria-hidden="true">
                    <div />
                    <div />
                    <div />
                    <span>p.</span>
                  </div>
                  <h3>
                    Your time is finite.
                    <br />
                    Your impact doesn’t have to be.
                  </h3>
                  <p>
                    See what a little more presence could mean for your
                    creators, fans, and platform.
                  </p>
                  <button
                    className="text-button"
                    onClick={() => navigate("Revenue")}
                  >
                    Explore the economic model <ArrowUpRight size={16} />
                  </button>
                </section>
              </div>
            </>
          )}
          {page === "My Presence" && (
            <PresenceSettings
              state={state}
              patch={patch}
              busy={busy}
              activate={() => setOnboard(true)}
              preview={() => void openChat(state.fans[0].id)}
            />
          )}
          {page === "Relationships" && (
            <Relationships state={state} openChat={openChat} mutate={mutate} />
          )}
          {page === "Live sessions" && (
            <>
              <PageHeading
                eyebrow="THE RELATIONSHIP, IN REAL TIME"
                title="A world of conversations."
                description="One Presence. Independent memories. Room for the real you."
                action={
                  <button
                    className="button primary"
                    onClick={() => void openChat(state.fans[0].id)}
                  >
                    <Plus size={16} />
                    New session
                  </button>
                }
              />
              <div className="session-grid">
                {state.fans.map((f) => {
                  const ss = state.sessions.filter(
                    (s) => s.fanId === f.id && s.status === "active",
                  );
                  return (
                    <section className="panel session-card" key={f.id}>
                      <div className="section-top">
                        <Avatar fan={f} />
                        <span className="pill green">
                          {ss.length
                            ? `${ss.length} active`
                            : "Ready to connect"}
                        </span>
                      </div>
                      <h2>{f.name}</h2>
                      <p>{f.interests.join(" · ")}</p>
                      <div className="session-last">
                        {ss[0]?.messages.at(-1)?.text ||
                          state.memories.find((m) => m.fanId === f.id)?.text ||
                          "Start a conversation."}
                      </div>
                      <div className="session-surfaces">
                        {surfaces.map((s) => {
                          const Icon = surfaceIcons[s];
                          return (
                            <button
                              key={s}
                              className="button compact"
                              onClick={() => void openChat(f.id, s)}
                            >
                              <Icon size={16} />
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <button
                        className="text-button"
                        onClick={() => void openChat(f.id)}
                      >
                        Open conversation <ArrowUpRight size={16} />
                      </button>
                    </section>
                  );
                })}
              </div>
              <div className="principle-banner">
                <Radio size={24} />
                <div>
                  <h3>The right moment for the real you.</h3>
                  <p>
                    Open a conversation and select “Join as creator”. AI pauses,
                    and every human message is clearly labeled.
                  </p>
                </div>
              </div>
            </>
          )}
          {page === "Revenue" && (
            <Economics state={state} exportData={exportData} />
          )}
          {page === "Integrations" && (
            <Integrations state={state} notify={setNotice} />
          )}
          {page === "Settings" && (
            <Settings state={state} mutate={mutate} exportData={exportData} />
          )}
          <footer className="main-footer">
            <span>
              PRESENCE <span className="footer-separator">/</span> Be there
              without being there.
            </span>
            <span>
              <span className="tiny-dot" />
              Fictional identities. Sandbox transactions.
            </span>
          </footer>
        </main>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Check size={18} />
          {notice}
        </div>
      )}
      {onboard && (
        <Onboarding
          state={state}
          close={() => setOnboard(false)}
          busy={busy}
          authorize={async () => {
            const s = await patch(
              {
                licenseStatus: "active",
                enabled: true,
                likenessAuthorized: true,
                voiceAuthorized: true,
              },
              "Mira’s Presence is live. You stay in control.",
            );
            if (s) setOnboard(false);
          }}
        />
      )}
      {chatFan && sessionId && (
        <Conversation
          state={state}
          fanId={chatFan}
          sessionId={sessionId}
          surface={surface}
          close={() => {
            setChatFan(null);
            setSessionId(null);
          }}
          changeSurface={(s) => void openChat(chatFan, s)}
          mutate={mutate}
          busy={busy}
          error={error}
        />
      )}
    </div>
  );
}
function Logo() {
  return (
    <div className="logo">
      <span className="brand-symbol">
        <i />
        <i />
        <i />
      </span>
      <span>
        PRESENCE<span className="logo-period">.</span>
      </span>
    </div>
  );
}
function Avatar({ fan }: { fan: Fan }) {
  return (
    <span className="fan-avatar" style={{ background: fan.color }}>
      {fan.initials}
    </span>
  );
}
function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <section className="metric">
      <div>
        <span>{label}</span>
        {icon}
      </div>
      <strong>{value}</strong>
      <small>{detail}</small>
    </section>
  );
}
function Toggle({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        {description && <p>{description}</p>}
      </div>
      <button
        type="button"
        className={`toggle ${checked ? "on" : ""}`}
        role="switch"
        aria-label={label}
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
function PresenceSettings({
  state,
  patch,
  busy,
  activate,
  preview,
}: {
  state: PresenceState;
  patch: (p: CreatorPatch, s?: string) => Promise<PresenceState | null>;
  busy: boolean;
  activate: () => void;
  preview: () => void;
}) {
  const c = state.creator;
  const [tone, setTone] = useState(c.tone),
    [facts, setFacts] = useState(c.facts.join("\n")),
    [boundaries, setBoundaries] = useState(c.boundaries.join("\n")),
    [topics, setTopics] = useState(c.forbiddenTopics.join(", "));
  return (
    <>
      <PageHeading
        eyebrow="LICENSED. PERSONAL. ALWAYS YOURS."
        title="You set the presence."
        description="Shape how you show up. Decide where, when, and what stays private."
        action={
          <button className="button primary" onClick={preview}>
            <Play size={14} />
            Preview experience
          </button>
        }
      />
      <div className="settings-layout">
        <div>
          <section className="panel identity-header">
            <div className="large-avatar">
              <Image
                src="/mira-vale.png"
                alt="Mira Vale, fictional demo identity"
                fill
                sizes="100px"
              />
            </div>
            <div>
              <div className="eyebrow">YOUR DIGITAL IDENTITY</div>
              <h2>
                Mira Vale <ShieldCheck size={21} />
              </h2>
              <p>{c.bio}</p>
              <span className="pill neutral">
                Fictional adult creator · age {c.age}
              </span>
            </div>
          </section>
          <section className="panel form-section">
            <div className="section-top">
              <div>
                <h3>A personality with intention.</h3>
                <p>
                  Facts, style, and boundaries stay distinct and inspectable.
                </p>
              </div>
              <span className="version">POLICY V{c.policyVersion}</span>
            </div>
            <p className="help-text">
              The local adapter demonstrates approved topics and explicit
              controls. Freeform facts and boundaries are versioned context;
              arbitrary instructions need a production model and evaluation.
            </p>
            <label className="field">
              Communication tone
              <select value={tone} onChange={(e) => setTone(e.target.value)}>
                <option value={c.tone}>{c.tone}</option>
                {[
                  "Warm, thoughtful and gently playful",
                  "Calm, concise and grounded",
                  "Curious, energetic and encouraging",
                ]
                  .filter((x) => x !== c.tone)
                  .map((t) => (
                    <option key={t}>{t}</option>
                  ))}
              </select>
            </label>
            <label className="field">
              Approved facts{" "}
              <span>One fact per line. Only creator-approved information.</span>
              <textarea
                rows={4}
                value={facts}
                onChange={(e) => setFacts(e.target.value)}
              />
            </label>
            <div className="personality-columns">
              <div>
                <h4>STYLE</h4>
                {c.style.map((s) => (
                  <p key={s}>{s}</p>
                ))}
              </div>
              <div>
                <h4>BEHAVIOR</h4>
                {c.behavior.map((s) => (
                  <p key={s}>{s}</p>
                ))}
              </div>
            </div>
            <label className="field">
              Personal boundaries
              <textarea
                rows={3}
                value={boundaries}
                onChange={(e) => setBoundaries(e.target.value)}
              />
            </label>
            <label className="field">
              Forbidden topics <span>Separate topics with commas.</span>
              <input
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
              />
            </label>
            <button
              className="button primary"
              disabled={busy}
              onClick={() =>
                void patch({
                  tone,
                  facts: facts.split("\n").filter(Boolean),
                  boundaries: boundaries.split("\n").filter(Boolean),
                  forbiddenTopics: topics
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
            >
              <Check size={16} />
              Save personality & boundaries
            </button>
          </section>
          <section className="panel form-section">
            <h3>Where your Presence can go.</h3>
            <p className="section-description">
              Every surface carries the same identity, policy and fan memory.
            </p>
            {surfaces.map((s) => (
              <Toggle
                key={s}
                label={`${s.charAt(0).toUpperCase() + s.slice(1)} Presence`}
                description={
                  s === "text"
                    ? "Governed conversation with persistent context"
                    : s === "voice"
                      ? "Browser speech · generic system voice, never a clone"
                      : s === "visual"
                        ? "Editorial portrait · not live synthetic video"
                        : "Interactive 3D space · WebXR where supported"
                }
                checked={c.surfaces.includes(s)}
                disabled={busy}
                onChange={() =>
                  void patch({
                    surfaces: c.surfaces.includes(s)
                      ? c.surfaces.filter((x) => x !== s)
                      : [...c.surfaces, s],
                  })
                }
              />
            ))}
          </section>
        </div>
        <div className="settings-side">
          <section className="panel form-section">
            <div className="section-top">
              <h3>Your license</h3>
              <ShieldCheck size={20} />
            </div>
            <span
              className={`pill ${c.licenseStatus === "active" ? "green" : "neutral"}`}
            >
              {c.licenseStatus}
            </span>
            <dl className="details">
              <div>
                <dt>Identity</dt>
                <dd>Fictional demo</dd>
              </div>
              <div>
                <dt>License version</dt>
                <dd>{c.licenseVersion}</dd>
              </div>
              <div>
                <dt>Source</dt>
                <dd>Generated demo portrait</dd>
              </div>
              <div>
                <dt>Expires</dt>
                <dd>{new Date(c.expiresAt).toLocaleDateString()}</dd>
              </div>
              <div>
                <dt>AI disclosure</dt>
                <dd>Always required</dd>
              </div>
            </dl>
            <p className="help-text">
              This demonstrates authorization; it does not verify a real
              person’s identity.
            </p>
            {c.licenseStatus !== "active" ? (
              <button className="button primary full" onClick={activate}>
                Review & activate <ArrowRight size={15} />
              </button>
            ) : (
              <Toggle
                label="Presence available"
                checked={c.enabled}
                disabled={busy}
                onChange={() =>
                  void patch(
                    { enabled: !c.enabled },
                    c.enabled
                      ? "Presence paused. New interactions are blocked."
                      : "Presence resumed.",
                  )
                }
              />
            )}
          </section>
          <section className="panel form-section">
            <h3>Representation rules</h3>
            <div className="representation-rules">
              {[
                ["Relationship", c.relationshipRules],
                ["Appearance", c.appearanceRules],
                ["Voice", c.voiceRules],
              ].map(([label, rules]) => (
                <div key={String(label)}>
                  <h4>{label}</h4>
                  {(rules as string[]).map((rule) => (
                    <p key={rule}>{rule}</p>
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="panel form-section">
            <h3>Remember with care.</h3>
            <Toggle
              label="Relationship memory"
              description="Only explicit, non-sensitive fan-approved memories."
              checked={c.memoryEnabled}
              disabled={busy}
              onChange={() => void patch({ memoryEnabled: !c.memoryEnabled })}
            />
            <label className="field">
              Memory retention
              <select
                value={c.memoryRetentionDays}
                onChange={(e) =>
                  void patch({ memoryRetentionDays: Number(e.target.value) })
                }
              >
                <option value={7}>7 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={365}>365 days</option>
              </select>
            </label>
            <p className="help-text">
              Fans can inspect and delete memories. Use fictional preferences
              only; basic sensitivity checks apply.
            </p>
          </section>
          <section className="panel form-section">
            <h3>Commercial permissions</h3>
            <Toggle
              label="Brand endorsements"
              description="Off by default. Unapproved claims remain blocked."
              checked={c.brandEndorsements}
              disabled={busy}
              onChange={() =>
                void patch({ brandEndorsements: !c.brandEndorsements })
              }
            />
            <label className="field">
              Base price per reply (USD)
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={c.pricePerMessageCents / 100}
                onChange={(e) =>
                  void patch({
                    pricePerMessageCents: Math.round(
                      Number(e.target.value) * 100,
                    ),
                  })
                }
              />
            </label>
            <p className="help-text">
              Sandbox metering only. Your platform owns checkout.
            </p>
          </section>
          <section className="revocation-panel">
            <Power size={21} />
            <h3>Always in your hands.</h3>
            <p>
              Revoking the license immediately blocks interactions and closes
              active sessions.
            </p>
            <button
              className="button danger full"
              disabled={busy || c.licenseStatus === "revoked"}
              onClick={() =>
                void patch(
                  { licenseStatus: "revoked", enabled: false },
                  "License revoked. All sessions are stopped.",
                )
              }
            >
              Revoke Presence
            </button>
          </section>
        </div>
      </div>
    </>
  );
}
function Relationships({
  state,
  openChat,
  mutate,
}: {
  state: PresenceState;
  openChat: (f: string, s?: Surface) => Promise<void>;
  mutate: Mutation;
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState(state.fans[0].id),
    [memory, setMemory] = useState("");
  const fan = state.fans.find((f) => f.id === selected)!;
  return (
    <>
      <PageHeading
        eyebrow="FAMILIARITY, WITHOUT THE GUESSWORK"
        title="Every fan, their own story."
        description="A relationship is more than a chat history. Remember only what matters."
      />
      <div className="relationship-layout">
        <section className="panel fan-list">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label="Search fans"
              placeholder="Find a relationship…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {state.fans
            .filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))
            .map((f) => (
              <button
                className={`fan-select ${f.id === selected ? "active" : ""}`}
                key={f.id}
                onClick={() => setSelected(f.id)}
              >
                <Avatar fan={f} />
                <span>
                  <strong>{f.name}</strong>
                  <small>
                    {f.membership} ·{" "}
                    {state.memories.filter((m) => m.fanId === f.id).length}{" "}
                    memories
                  </small>
                </span>
                <ChevronRight size={16} />
              </button>
            ))}
        </section>
        <section className="panel relationship-detail">
          <div className="relationship-header">
            <Avatar fan={fan} />
            <div>
              <h2>{fan.name}</h2>
              <p>{fan.interests.join(" · ")}</p>
            </div>
            <button
              className="button primary"
              onClick={() => void openChat(fan.id)}
            >
              Start conversation <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="relationship-meta">
            <span className="pill neutral">{fan.membership} membership</span>
            <span className="pill green">
              <ShieldCheck size={13} />
              Demo adult · {fan.age}
            </span>
            <span className="pill neutral">{fan.surfaces.join(" / ")}</span>
          </div>
          <Toggle
            label="Fan-approved memory"
            description="Opting out deletes existing memories and prevents new storage."
            checked={fan.memoryConsent}
            onChange={() =>
              void mutate(`fans/${fan.id}`, "PATCH", {
                memoryConsent: !fan.memoryConsent,
              })
            }
          />
          <div className="section-top memory-heading">
            <h3>What your Presence remembers</h3>
            <span className="version">PRIVATE TO THIS RELATIONSHIP</span>
          </div>
          <div className="memory-list">
            {state.memories
              .filter((m) => m.fanId === fan.id)
              .map((m) => (
                <div className="memory-item" key={m.id}>
                  <div className="memory-icon">
                    <BookOpen size={17} />
                  </div>
                  <div>
                    <p>{m.text}</p>
                    <small>
                      {m.seeded ? "Seeded demo memory" : m.source} ·{" "}
                      {Math.round(m.confidence * 100)}% confidence ·{" "}
                      {m.sensitivity}
                      <br />
                      Expires {new Date(m.expiresAt).toLocaleDateString()}
                    </small>
                  </div>
                  <button
                    className="icon-button"
                    aria-label={`Delete memory: ${m.text}`}
                    onClick={() =>
                      void mutate(
                        `memories/${m.id}`,
                        "DELETE",
                        undefined,
                        "Memory deleted. It will no longer be retrieved.",
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            {!state.memories.some((m) => m.fanId === fan.id) && (
              <p className="empty-state">
                A clean slate. Add an approved preference to start.
              </p>
            )}
          </div>
          <form
            className="memory-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const result = await mutate(
                "memories",
                "POST",
                { fanId: fan.id, text: memory },
                "Memory saved for this relationship.",
              );
              if (result) setMemory("");
            }}
          >
            <label className="field">
              Add a fan-approved memory{" "}
              <span>
                Preferences or milestones only. No private or sensitive details.
              </span>
              <input
                placeholder="e.g. I enjoy quiet morning photography walks"
                value={memory}
                maxLength={300}
                onChange={(e) => setMemory(e.target.value)}
                required
                disabled={!fan.memoryConsent}
              />
            </label>
            <button
              className="button"
              disabled={!fan.memoryConsent || !memory.trim()}
            >
              <Plus size={16} />
              Save memory
            </button>
          </form>
          <div className="panel-foot">
            <LockKeyhole size={14} />
            Mira’s other fan relationships cannot retrieve these memories.
          </div>
        </section>
      </div>
    </>
  );
}
type Mutation = (
  path: string,
  method: string,
  body?: unknown,
  success?: string,
) => Promise<(PresenceState & { sessionId?: string }) | null>;
function Economics({
  state,
  exportData,
}: {
  state: PresenceState;
  exportData: () => void;
}) {
  const [creators, setCreators] = useState(1000),
    [fans, setFans] = useState(500),
    [adoption, setAdoption] = useState(15),
    [arpu, setArpu] = useState(20),
    [take, setTake] = useState(20),
    [retention, setRetention] = useState(5);
  const annual = creators * fans * (adoption / 100) * arpu * 12,
    platform = (annual * take) / 100,
    creator = annual - platform;
  const compact = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  return (
    <>
      <PageHeading
        eyebrow="MORE CONNECTION. MEASURABLE VALUE."
        title="The economics of being there."
        description="Your platform owns the payments. Presence makes the interactions possible."
        action={
          <button className="button" onClick={exportData}>
            <Download size={16} />
            Export demo data
          </button>
        }
      />
      <div className="metrics-grid">
        <Metric
          label="Sandbox gross revenue"
          value={money(state.metrics.sandboxRevenueCents)}
          detail="Actual events from this demo"
          icon={<Wallet size={16} />}
        />
        <Metric
          label="Creator earnings"
          value={money(state.metrics.creatorRevenueCents)}
          detail="After configured platform share"
          icon={<Heart size={16} />}
        />
        <Metric
          label="Platform share"
          value={money(state.metrics.platformRevenueCents)}
          detail="No real funds move"
          icon={<Layers3 size={16} />}
        />
        <Metric
          label="Revenue per active fan"
          value={money(
            state.metrics.sandboxRevenueCents /
              Math.max(1, state.metrics.activeFans),
          )}
          detail={`${state.metrics.activeFans} connected demo fans`}
          icon={<Users size={16} />}
        />
      </div>
      <section className="economic-model">
        <div className="model-controls">
          <div className="eyebrow">THE PLATFORM OPPORTUNITY</div>
          <h2>
            What if this
            <br />
            were your platform?
          </h2>
          <p>Move the inputs. See the possibility.</p>
          <div className="simulation-label">
            <Activity size={14} />
            Illustrative model · not a forecast
          </div>
          <Range
            label="Creators on the platform"
            value={creators}
            min={100}
            max={10000}
            step={100}
            set={setCreators}
          />
          <Range
            label="Paying fans per creator"
            value={fans}
            min={50}
            max={5000}
            step={50}
            set={setFans}
          />
          <Range
            label="Presence adoption"
            value={adoption}
            min={1}
            max={100}
            suffix="%"
            set={setAdoption}
          />
          <Range
            label="Monthly Presence ARPU"
            value={arpu}
            min={1}
            max={100}
            prefix="$"
            set={setArpu}
          />
          <Range
            label="Platform take rate"
            value={take}
            min={1}
            max={50}
            suffix="%"
            set={setTake}
          />
          <Range
            label="Potential retention uplift"
            value={retention}
            min={0}
            max={20}
            suffix="%"
            set={setRetention}
          />
        </div>
        <div className="model-result">
          <div className="eyebrow">POTENTIAL ANNUAL GROSS VALUE</div>
          <div className="annual-number">{compact(annual)}</div>
          <p>
            From{" "}
            {Math.round((creators * fans * adoption) / 100).toLocaleString()}{" "}
            participating fan relationships.
          </p>
          <div className="revenue-split">
            <div style={{ width: `${100 - take}%` }} />
            <div style={{ width: `${take}%` }} />
          </div>
          <div className="split-labels">
            <div>
              <span>
                <i />
                Creator earnings
              </span>
              <strong>{compact(creator)}</strong>
              <small>{100 - take}% of gross</small>
            </div>
            <div>
              <span>
                <i />
                Platform revenue
              </span>
              <strong>{compact(platform)}</strong>
              <small>{take}% of gross</small>
            </div>
          </div>
          <div className="retention-result">
            <Heart size={20} />
            <div>
              <strong>
                {Math.round(
                  (((creators * fans * adoption) / 100) * retention) / 100,
                ).toLocaleString()}{" "}
                potential retained relationships
              </strong>
              <p>
                Illustrative uplift only. Excluded from the revenue calculation.
              </p>
            </div>
          </div>
          <div className="model-formula">
            {creators.toLocaleString()} creators × {fans.toLocaleString()} fans
            × {adoption}% adoption × ${arpu}/month × 12
          </div>
          <p className="model-caveat">
            Gross scenario excludes inference costs, fees, taxes, refunds, churn
            and cannibalization. Validate willingness to pay and margins in a
            controlled pilot.
          </p>
        </div>
      </section>
      <section className="panel ledger">
        <div className="section-top">
          <div>
            <h3>The interaction ledger</h3>
            <p>
              Real demo events. Simulated money. An integration-ready record.
            </p>
          </div>
          <span className="pill neutral">SANDBOX</span>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Interaction</th>
                <th>Fan</th>
                <th>Surface</th>
                <th>Gross</th>
                <th>Creator</th>
                <th>Platform</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {state.events
                .slice()
                .reverse()
                .slice(0, 30)
                .map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="event-type">
                        <span className="tiny-dot" />
                        {e.type === "human_message"
                          ? "Creator takeover"
                          : "Presence reply"}
                      </span>
                    </td>
                    <td>{state.fans.find((f) => f.id === e.fanId)?.name}</td>
                    <td className="capitalize">{e.surface}</td>
                    <td>{money(e.amountCents)}</td>
                    <td>{money(e.creatorCents)}</td>
                    <td>{money(e.platformCents)}</td>
                    <td>{time(e.createdAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {!state.events.length && (
            <div className="empty-state">
              <Wallet size={26} />
              <h3>Your first connection starts the story.</h3>
              <p>
                Send a message to a Presence to create your first sandbox event.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
function Range({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  prefix = "",
  set,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  set: (n: number) => void;
}) {
  return (
    <label className="range-field">
      <span>
        {label}
        <strong>
          {prefix}
          {value.toLocaleString()}
          {suffix}
        </strong>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
    </label>
  );
}
function Integrations({
  state,
  notify,
}: {
  state: PresenceState;
  notify: (s: string) => void;
}) {
  const code = `// Platform-owned identity, entitlement and checkout\nconst presence = await instantiatePresence({\n  creatorId: "creator-mira",\n  fanId: "fan-alex",\n  surface: "voice",\n  permissions: ["conversation", "approved-memory"]\n});\n\n// Same relationship. Any authorized surface.\n// Proposed partner SDK contract — see docs/API.md`;
  return (
    <>
      <PageHeading
        eyebrow="YOUR PLATFORM. THEIR PRESENCE."
        title="A layer, not another destination."
        description="Keep your creators, fan relationships and checkout. Add licensed digital presence."
      />
      <div className="integration-hero">
        <div>
          <div className="eyebrow">BUILT TO BELONG</div>
          <h2>
            One identity.
            <br />
            <em>Anywhere people connect.</em>
          </h2>
          <p>
            Text today. Voice, visual and spatial experiences next. The
            identity, permissions and relationship move together.
          </p>
          <span className="pill dark">
            <Layers3 size={14} />
            Platform-independent runtime
          </span>
        </div>
        <div className="integration-diagram">
          <div className="diagram-input">Your creator platform</div>
          <div className="diagram-line" />
          <div className="diagram-presence">
            <Logo />
            <small>IDENTITY · POLICY · MEMORY · METERING</small>
          </div>
          <div className="diagram-line" />
          <div className="diagram-surfaces">
            {surfaces.map((s) => {
              const Icon = surfaceIcons[s];
              return (
                <span key={s}>
                  <Icon size={21} />
                  {s}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="integration-grid">
        <section className="panel form-section">
          <div className="section-top">
            <div>
              <h3>One integration. Many manifestations.</h3>
              <p>Proposed partner SDK; local REST API is implemented.</p>
            </div>
            <button
              className="icon-button"
              aria-label="Copy integration example"
              onClick={() => {
                void navigator.clipboard
                  .writeText(code)
                  .then(() => notify("Integration example copied."))
                  .catch(() =>
                    notify(
                      "Clipboard unavailable. Select the example to copy.",
                    ),
                  );
              }}
            >
              <Copy size={17} />
            </button>
          </div>
          <pre className="code-block">
            <code>{code}</code>
          </pre>
          <div className="api-endpoints">
            <div>
              <span>POST</span>
              <code>/api/v1/sessions</code>
              <small>Instantiate</small>
            </div>
            <div>
              <span>POST</span>
              <code>/api/v1/sessions/:id/messages</code>
              <small>Interact</small>
            </div>
            <div>
              <span>PATCH</span>
              <code>/api/v1/creator</code>
              <small>Govern</small>
            </div>
          </div>
        </section>
        <section className="panel form-section">
          <h3>Provider readiness</h3>
          <p className="section-description">
            Adapters are replaceable. Capability labels reflect what runs here.
          </p>
          {[
            {
              name: "Conversation",
              value: state.capabilities.provider,
              icon: MessageCircle,
            },
            {
              name: "Voice",
              value: state.capabilities.voice,
              icon: AudioLines,
            },
            { name: "Visual", value: state.capabilities.visual, icon: Eye },
            { name: "Spatial", value: state.capabilities.spatial, icon: Box },
            {
              name: "Billing",
              value: state.capabilities.billing,
              icon: Wallet,
            },
          ].map((p) => (
            <div className="provider-row" key={p.name}>
              <p.icon size={19} />
              <div>
                <strong>{p.name}</strong>
                <small>{p.value}</small>
              </div>
            </div>
          ))}
        </section>
      </div>
      <div className="principle-banner">
        <ShieldCheck size={25} />
        <div>
          <h3>
            OnlyFans is the integration thesis, not an existing partnership.
          </h3>
          <p>
            No platform API, brand endorsement, or commercial agreement is
            implied. Partner SSO, production verification and webhook delivery
            are pilot work.
          </p>
        </div>
      </div>
    </>
  );
}
function Settings({
  state,
  mutate,
  exportData,
}: {
  state: PresenceState;
  mutate: Mutation;
  exportData: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageHeading
        eyebrow="TRUST, MADE INSPECTABLE"
        title="Nothing behind the curtain."
        description="Trace every policy change, consent decision and interaction to its source."
        action={
          <button className="button" onClick={exportData}>
            <Download size={16} />
            Export workspace
          </button>
        }
      />
      <div className="settings-summary">
        <section className="panel form-section">
          <ShieldCheck size={25} />
          <h3>Local demo workspace</h3>
          <p>Signed session cookie · isolated workspace · creator operator.</p>
          <p className="help-text">
            This is a local demonstration, not production authentication or real
            identity verification. All three fans are fictional adults.
          </p>
        </section>
        <section className="panel form-section">
          <LockKeyhole size={25} />
          <h3>Privacy by relationship</h3>
          <p>
            Only approved preferences and milestones. Never an indiscriminate
            transcript archive.
          </p>
          <div className="row-buttons">
            {state.fans.map((f) => (
              <button
                className="button compact"
                key={f.id}
                onClick={() =>
                  void mutate(
                    `fans/${f.id}/memories`,
                    "DELETE",
                    undefined,
                    `${f.name}’s relationship data deleted.`,
                  )
                }
              >
                <Trash2 size={13} />
                Clear {f.name.split(" ")[0]}
              </button>
            ))}
          </div>
        </section>
      </div>
      <section className="panel ledger">
        <div className="section-top">
          <div>
            <h3>Audit trail</h3>
            <p>Content-free activity records for this demo workspace.</p>
          </div>
          <span className="pill neutral">{state.audit.length} events</span>
        </div>
        <div className="audit-list">
          {state.audit
            .slice()
            .reverse()
            .slice(0, 60)
            .map((a) => (
              <div key={a.id}>
                <span className="audit-icon">
                  <History size={15} />
                </span>
                <span>
                  <strong>
                    {a.action.replaceAll("_", " ").replaceAll(".", " / ")}
                  </strong>
                  <small>{a.detail}</small>
                </span>
                <span className="audit-actor">{a.actor}</span>
                <time>{time(a.createdAt)}</time>
              </div>
            ))}
        </div>
      </section>
      <section className="reset-panel">
        <div>
          <h3>A fresh start for your next demo.</h3>
          <p>
            Reset this workspace’s license, sessions, memories and sandbox
            ledger.
          </p>
        </div>
        {confirm ? (
          <div className="row-buttons">
            <button className="button" onClick={() => setConfirm(false)}>
              Cancel
            </button>
            <button
              className="button danger"
              onClick={async () => {
                await mutate(
                  "reset",
                  "POST",
                  {},
                  "Demo reset to its original state.",
                );
                setConfirm(false);
              }}
            >
              Confirm reset
            </button>
          </div>
        ) : (
          <button className="button" onClick={() => setConfirm(true)}>
            <RefreshCw size={15} />
            Reset demo
          </button>
        )}
      </section>
    </>
  );
}
function Onboarding({
  state,
  close,
  busy,
  authorize,
}: {
  state: PresenceState;
  close: () => void;
  busy: boolean;
  authorize: () => Promise<void>;
}) {
  const [consent, setConsent] = useState(false);
  return (
    <Modal
      close={close}
      label="Activate your Presence"
      className="onboarding-modal"
    >
      <div className="onboarding-image">
        <Image
          src="/mira-vale.png"
          alt="Fictional creator Mira Vale"
          fill
          sizes="480px"
        />
        <div>
          <span className="pill dark">FICTIONAL DEMO IDENTITY</span>
          <h2>
            Your presence.
            <br />
            On your terms.
          </h2>
        </div>
      </div>
      <div className="onboarding-content">
        <div className="eyebrow">A LICENSE, NOT A LEAP OF FAITH</div>
        <h2>Let’s make it yours.</h2>
        <p>
          Activate Mira Vale’s fictional Presence and see how creator
          authorization works.
        </p>
        <div className="consent-checks">
          <div>
            <ShieldCheck />
            <span>
              <strong>Identity & ownership</strong>
              <small>
                Mira is a fictional 28-year-old creator. No real person is being
                replicated.
              </small>
            </span>
          </div>
          <div>
            <Eye />
            <span>
              <strong>Authorized appearance & voice</strong>
              <small>
                Generated portrait and generic browser voice. No voice clone or
                live synthetic video.
              </small>
            </span>
          </div>
          <div>
            <SlidersHorizontal />
            <span>
              <strong>Creator-defined boundaries</strong>
              <small>
                Approved topics, opt-in memory, surface permissions and
                immediate revocation.
              </small>
            </span>
          </div>
          <div>
            <Wallet />
            <span>
              <strong>Always a sandbox</strong>
              <small>
                Every transaction is simulated. No real funds or paid APIs.
              </small>
            </span>
          </div>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>
            I authorize this fictional demo Presence under the displayed rules
            and understand that all fan interactions are disclosed as AI.
          </span>
        </label>
        <button
          className="button primary full"
          disabled={!consent || busy}
          onClick={() => void authorize()}
        >
          {busy
            ? "Activating…"
            : state.creator.licenseStatus === "revoked"
              ? "Reauthorize demo Presence"
              : "Activate demo Presence"}
          <ArrowRight size={17} />
        </button>
        <p className="micro-copy">
          You can pause or revoke your Presence at any time.
        </p>
      </div>
    </Modal>
  );
}
function Modal({
  children,
  close,
  label,
  className = "",
}: {
  children: React.ReactNode;
  close: () => void;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  }, [close]);
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const backgrounds = [
      ...document.querySelectorAll<HTMLElement>(".workspace, .sidebar"),
    ].map((element) => ({ element, inert: element.inert }));
    backgrounds.forEach(({ element }) => {
      element.inert = true;
    });
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
      if (e.key === "Tab") {
        const list = ref.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]),input:not([disabled]),select,textarea,a[href],[tabindex="0"]',
        );
        if (!list?.length) return;
        const first = list[0],
          last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", key);
      backgrounds.forEach(({ element, inert }) => {
        element.inert = inert;
      });
      before?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        ref={ref}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
      >
        <button
          className="modal-close icon-button"
          aria-label={`Close ${label}`}
          onClick={close}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}
function Conversation({
  state,
  fanId,
  sessionId,
  surface,
  close,
  changeSurface,
  mutate,
  busy,
  error,
}: {
  state: PresenceState;
  fanId: string;
  sessionId: string;
  surface: Surface;
  close: () => void;
  changeSurface: (s: Surface) => void;
  mutate: Mutation;
  busy: boolean;
  error: string;
}) {
  const fan = state.fans.find((f) => f.id === fanId)!,
    session = state.sessions.find((s) => s.id === sessionId);
  const [draft, setDraft] = useState(""),
    [speaking, setSpeaking] = useState(false),
    [listening, setListening] = useState(false),
    [voiceOn, setVoiceOn] = useState(false),
    [voiceError, setVoiceError] = useState("");
  const playbackGeneration = useRef(0);
  const voice = useRef<BrowserVoiceProvider | null>(null),
    stopListen = useRef<(() => void) | null>(null),
    end = useRef<HTMLDivElement>(null);
  const allowed =
    state.creator.enabled &&
    state.creator.licenseStatus === "active" &&
    state.creator.surfaces.includes(surface) &&
    session?.status === "active";
  useEffect(() => {
    voice.current = new BrowserVoiceProvider();
    return () => {
      playbackGeneration.current += 1;
      voice.current?.stop();
      voice.current = null;
      stopListen.current?.();
    };
  }, []);
  useEffect(() => {
    playbackGeneration.current += 1;
    voice.current?.stop();
    stopListen.current?.();
  }, [fanId, surface, allowed, session?.mode, voiceOn]);
  useEffect(() => {
    if (!session?.messages.length) return;
    end.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [session?.messages.length]);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || busy || !allowed) return;
    const text = draft;
    const generation = playbackGeneration.current;
    setDraft("");
    const result = await mutate(`sessions/${sessionId}/messages`, "POST", {
      text,
      requestId: crypto.randomUUID(),
    });
    if (!result) {
      setDraft(text);
      return;
    }
    const last = result.sessions
      .find((s) => s.id === sessionId)
      ?.messages.at(-1);
    if (
      voiceOn &&
      generation === playbackGeneration.current &&
      voice.current &&
      last?.role === "ai" &&
      !last.blocked
    ) {
      void voice.current
        ?.speak(last.text, {
          onStart: () => setSpeaking(true),
          onEnd: () => setSpeaking(false),
          onError: setVoiceError,
        })
        .catch((e) => setVoiceError(e.message));
    }
  };
  const mic = () => {
    if (listening) {
      stopListen.current?.();
      setListening(false);
      return;
    }
    setVoiceError("");
    try {
      stopListen.current =
        voice.current?.listen(
          (text) => setDraft((d) => (d ? `${d} ${text}` : text)),
          {
            onStart: () => setListening(true),
            onEnd: () => setListening(false),
            onError: setVoiceError,
          },
        ) || null;
    } catch (e) {
      setVoiceError((e as Error).message);
    }
  };
  return (
    <Modal
      label="Presence conversation"
      close={close}
      className="conversation-modal"
    >
      <div
        className={`conversation-visual ${surface === "text" ? "text-visual" : ""}`}
      >
        {surface === "spatial" ? (
          <SpatialStage speaking={speaking} active={allowed} />
        ) : (
          <>
            <Image
              src="/mira-vale.png"
              alt="Generated editorial portrait of fictional Mira Vale; not live video"
              fill
              priority
              sizes="(max-width: 700px) 100vw, 50vw"
            />
            <div className="conversation-image-shade" />
            <div className="visual-top">
              <span className="pill dark">
                <span className="status-dot" />
                {session?.mode === "human"
                  ? "HUMAN CREATOR · DEMO"
                  : "AI PRESENCE"}
              </span>
            </div>
            <div className="visual-caption">
              <span className="eyebrow">A LITTLE CLOSER, EVEN FROM HERE.</span>
              <h2>
                Mira Vale<span>.</span>
              </h2>
              <p>
                {surface === "voice"
                  ? "A familiar conversation, in a new dimension."
                  : surface === "visual"
                    ? "The same Presence. A more personal perspective."
                    : "Every connection starts with a conversation."}
              </p>
              {surface === "voice" && (
                <div className={`voice-wave ${speaking ? "speaking" : ""}`}>
                  {Array.from({ length: 23 }, (_, i) => (
                    <i
                      key={i}
                      style={{
                        height: `${10 + Math.sin(i * 1.5) ** 2 * 28}px`,
                        animationDelay: `${i * 0.045}s`,
                      }}
                    />
                  ))}
                </div>
              )}
              <div className="portrait-disclosure">
                <Eye size={13} />
                Generated still portrait · no live video
              </div>
            </div>
          </>
        )}
      </div>
      <div className="conversation-panel">
        <div className="conversation-header">
          <div>
            <h3>
              {session?.mode === "human"
                ? "Mira has joined."
                : "A moment with Mira."}
            </h3>
            <p>
              {session?.mode === "human"
                ? "Human creator messages · simulated operator"
                : "AI representation · not the human creator"}
            </p>
          </div>
          <span className="pill neutral">SANDBOX</span>
        </div>
        <div
          className="surface-tabs"
          role="tablist"
          aria-label="Presence surface"
        >
          {surfaces.map((s) => {
            const Icon = surfaceIcons[s];
            return (
              <button
                role="tab"
                aria-selected={s === surface}
                key={s}
                className={s === surface ? "active" : ""}
                disabled={!state.creator.surfaces.includes(s)}
                onClick={() => changeSurface(s)}
              >
                <Icon size={15} />
                {s}
              </button>
            );
          })}
        </div>
        <div className="chat-context">
          <Avatar fan={fan} />
          <div>
            <strong>Previewing {fan.name.split(" ")[0]}’s relationship</strong>
            <small>
              {state.memories.filter((m) => m.fanId === fanId).length} approved
              memories · {fan.membership}
            </small>
          </div>
          <LockKeyhole size={15} />
        </div>
        <div
          className="chat-messages"
          role="log"
          aria-label="Conversation messages"
          aria-live="polite"
        >
          {!session?.messages.length && (
            <div className="chat-welcome">
              <Sparkles size={25} />
              <h3>Hey, {fan.name.split(" ")[0]}.</h3>
              <p>
                I’m Mira’s AI Presence. We can pick up a shared interest or
                start somewhere new.
              </p>
              {state.memories
                .filter((m) => m.fanId === fanId)
                .slice(0, 1)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDraft("What do you remember about me?")}
                  >
                    <BookOpen size={14} />
                    {m.text}
                    <ArrowUpRight size={14} />
                  </button>
                ))}
            </div>
          )}
          {session?.messages.map((m) => (
            <div
              key={m.id}
              className={`message ${m.role} ${m.blocked ? "blocked" : ""}`}
            >
              <span>
                {m.role === "ai"
                  ? "MIRA’S AI"
                  : m.role === "human"
                    ? "MIRA · HUMAN CREATOR"
                    : m.role === "system"
                      ? "PRESENCE"
                      : fan.name.split(" ")[0].toUpperCase()}
              </span>
              <p>{m.text}</p>
              <small>
                {time(m.createdAt)}
                {m.role === "ai" && ` · policy v${m.policyVersion}`}
                {m.memoryIds.length > 0 && ` · ${m.memoryIds.length} memories`}
              </small>
            </div>
          ))}
          <div ref={end} />
        </div>
        {!allowed && (
          <div className="session-blocked">
            <LockKeyhole size={17} />
            This Presence is unavailable. The creator’s rules apply here too.
          </div>
        )}
        {(surface === "voice" || voiceOn) && (
          <div className="voice-disclosures">
            <p>{voiceDisclosure}</p>
            <p>{recognitionDisclosure}</p>
          </div>
        )}
        {error && (
          <p className="voice-error" role="alert">
            {error}
          </p>
        )}
        {voiceError && (
          <p className="voice-error" role="status">
            {voiceError}
          </p>
        )}
        <form className="chat-composer" onSubmit={send}>
          <input
            aria-label={
              session?.mode === "human"
                ? "Message as creator"
                : "Message Mira’s Presence"
            }
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              session?.mode === "human"
                ? "Write as the human creator…"
                : "Tell me what’s on your mind…"
            }
            maxLength={2000}
            disabled={!allowed || busy}
          />
          {surface === "voice" && (
            <button
              type="button"
              className={`icon-button ${listening ? "listening" : ""}`}
              aria-label={listening ? "Stop microphone" : "Dictate a message"}
              onClick={mic}
              disabled={!allowed}
            >
              <Mic size={19} />
            </button>
          )}
          <button
            className="send-button"
            aria-label="Send message"
            disabled={!allowed || busy || !draft.trim()}
          >
            <ArrowRight size={20} />
          </button>
        </form>
        <div className="conversation-controls">
          <button
            className="text-button"
            disabled={!allowed || busy}
            onClick={() =>
              void mutate(`sessions/${sessionId}/takeover`, "POST", {
                mode: session?.mode === "human" ? "ai" : "human",
              })
            }
          >
            {session?.mode === "human" ? (
              <>
                <Sparkles size={14} />
                Hand back to AI
              </>
            ) : (
              <>
                <Radio size={14} />
                Join as creator
              </>
            )}
          </button>
          <button
            className={`text-button ${voiceOn ? "voice-active" : ""}`}
            disabled={!allowed}
            onClick={() => {
              setVoiceOn(!voiceOn);
              if (voiceOn) voice.current?.stop();
            }}
          >
            <Volume2 size={14} />
            {voiceOn ? "Voice on" : "Enable voice"}
          </button>
        </div>
        <p className="chat-price">
          Sandbox ·{" "}
          {money(
            state.creator.pricePerMessageCents *
              (session?.mode === "human" ? 4 : surface === "text" ? 1 : 2),
          )}{" "}
          per delivered reply · no real charge
        </p>
      </div>
    </Modal>
  );
}
