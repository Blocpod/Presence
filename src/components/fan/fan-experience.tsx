"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  AudioLines,
  BookOpen,
  Box,
  Check,
  ChevronRight,
  Fingerprint,
  LockKeyhole,
  Mic,
  Pause,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { api } from "@/lib/client";
import { BrowserVoiceProvider } from "@/lib/voice";
import type { PresenceState, Surface } from "@/lib/types";
import Sheet from "./sheet";
import "./fan.css";

const SpatialPreview = dynamic(() => import("./spatial-preview"), {
  ssr: false,
  loading: () => <div className="fan-space-loading">Opening the room…</div>,
});
const modes: {
  id: Surface;
  label: string;
  icon: typeof AudioLines;
  description: string;
}[] = [
  {
    id: "text",
    label: "Text",
    icon: BookOpen,
    description: "A quiet exchange. In your own words.",
  },
  {
    id: "voice",
    label: "Voice",
    icon: AudioLines,
    description: "Speak freely. Let the interface fall away.",
  },
  {
    id: "visual",
    label: "Visual",
    icon: Fingerprint,
    description: "A closer frame. The same familiar presence.",
  },
  {
    id: "spatial",
    label: "Spatial",
    icon: Box,
    description: "Step into a space made for the conversation.",
  },
];
type Panel = "memory" | "access" | "transcript" | "voice" | "about" | null;
type VoiceState = "quiet" | "listening" | "speaking";
const fanApi = (path: string, method = "GET", body?: unknown) =>
  api(`fan/${path}`, method, body);

export default function FanExperience() {
  const [state, setState] = useState<PresenceState | null>(null);
  const [entered, setEntered] = useState(false);
  const [surface, setSurface] = useState<Surface>("voice");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [draft, setDraft] = useState("");
  const [visualWriting, setVisualWriting] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [connected, setConnected] = useState(true);
  const [sound, setSound] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("quiet");
  const [arrival, setArrival] = useState(false);
  const provider = useRef<BrowserVoiceProvider | null>(null);
  const generation = useRef(0);
  const alive = useRef(true);
  const busyRef = useRef(false);
  const pendingRequest = useRef<{
    sessionId: string;
    text: string;
    id: string;
  } | null>(null);
  const sessionRef = useRef<string | null>(null);
  const modeRef = useRef<"human" | "ai">("ai");
  const portrait = useRef<HTMLDivElement>(null);
  const thread = useRef<SVGSVGElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLButtonElement>(null);
  const fan = state?.fans.find((f) => f.id === state.actor.fanId);
  const session = state?.sessions.find((s) => s.id === sessionId);
  const human = session?.mode === "human";
  const memory =
    fan?.memoryConsent && state?.creator.memoryEnabled
      ? state?.memories[0]
      : undefined;
  const currentReply = session?.messages
    .filter((m) => m.role === "ai" || m.role === "human" || m.blocked)
    .at(-1);
  const latest =
    currentReply ||
    state?.sessions
      .flatMap((s) => s.messages)
      .filter((m) => m.role === "ai" || m.role === "human" || m.blocked)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .at(-1);
  const excerpt =
    latest && latest.text.length > 180
      ? latest.text.slice(0, 180).replace(/\s+\S*$/, "") + "…"
      : latest?.text;
  const hasFullReply = !!latest && latest.text.length > 180;
  const hasAccess =
    !!fan?.surfaces.includes(surface) &&
    !!state?.creator.surfaces.includes(surface) &&
    (surface !== "voice" || !!state?.creator.voiceAuthorized);
  const available =
    !!state?.creator.enabled &&
    state.creator.licenseStatus === "active" &&
    state.creator.likenessAuthorized &&
    Date.parse(state.creator.expiresAt) > Date.now() &&
    !!fan?.interactionConsent;
  const usable = available && hasAccess && session?.status !== "revoked";
  const stop = useCallback(() => {
    generation.current++;
    provider.current?.stop();
    setVoiceState("quiet");
  }, []);
  const openPanel = (next: Panel) => {
    stop();
    setPanel(next);
  };
  const refresh = useCallback(async () => {
    try {
      const next = await fanApi("state");
      if (alive.current) {
        setState(next);
        setConnected(true);
      }
    } catch {
      if (alive.current) {
        setConnected(false);
        stop();
      }
    }
  }, [stop]);
  useEffect(() => {
    alive.current = true;
    provider.current = new BrowserVoiceProvider();
    fanApi("demo", "POST", {})
      .then((s) => {
        if (alive.current) {
          setState(s);
          setError("");
        }
      })
      .catch((e) => {
        if (alive.current) setError(e.message);
      });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 1800);
    const visibility = () => {
      if (document.visibilityState === "hidden") stop();
      else void refresh();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive.current = false;
      // This is a monotonic cancellation token, not a DOM ref.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      generation.current++;
      provider.current?.stop();
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [refresh, stop]);
  useEffect(() => {
    sessionRef.current = sessionId;
  }, [sessionId]);
  useEffect(() => {
    if (human && modeRef.current !== "human") {
      setArrival(true);
      stop();
      modeRef.current = "human";
    }
    modeRef.current = human ? "human" : "ai";
  }, [human, stop]);
  useEffect(() => {
    // Synchronize the imperative speech service with policy and availability.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    stop();
  }, [
    usable,
    connected,
    state?.creator.policyVersion,
    state?.creator.licenseVersion,
    stop,
  ]);
  useEffect(() => {
    const world = portrait.current;
    const root = world?.parentElement;
    const svg = thread.current;
    if (!root || !svg) return;
    const draw = () => {
      const bounds = root.getBoundingClientRect();
      const start = root
        .querySelector(
          entered ? ".fan-memory-cue .thread-node" : ".fan-invitation-line",
        )
        ?.getBoundingClientRect();
      const end = root
        .querySelector(entered ? ".fan-subtitle" : ".fan-enter")
        ?.getBoundingClientRect();
      if (!start || !end) return;
      const x = start.left - bounds.left + start.width / 2,
        y = start.top - bounds.top + start.height / 2;
      const endX = end.left - bounds.left - 12,
        endY = end.top - bounds.top + 10;
      svg.setAttribute("viewBox", `0 0 ${bounds.width} ${bounds.height}`);
      const path = `M ${x} ${y} L ${x} ${Math.max(y, endY - 45)} Q ${x} ${endY} ${endX + 38} ${endY} L ${endX + 65} ${endY}`;
      svg
        .querySelectorAll("path")
        .forEach((node) => node.setAttribute("d", path));
      const circles = svg.querySelectorAll("circle");
      circles[0]?.setAttribute("cx", String(x));
      circles[0]?.setAttribute("cy", String(y));
      circles[1]?.setAttribute("cx", String(endX + 65));
      circles[1]?.setAttribute("cy", String(endY));
    };
    const observer = new ResizeObserver(draw);
    observer.observe(root);
    const subtitle = root.querySelector(".fan-subtitle");
    if (subtitle) observer.observe(subtitle);
    draw();
    window.addEventListener("resize", draw);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", draw);
    };
  }, [entered, latest?.id, surface, hasFullReply, visualWriting, human]);
  const mutate = async (path: string, method: string, body?: unknown) => {
    try {
      const next = await fanApi(path, method, body);
      if (alive.current) setState(next);
      return next;
    } catch (e) {
      if (alive.current) setError((e as Error).message);
      return null;
    }
  };
  const start = async (kind: Surface = surface) => {
    if (busyRef.current) return;
    stop();
    setError("");
    const entryGeneration = generation.current;
    busyRef.current = true;
    setBusy(true);
    try {
      const next = await fanApi("sessions", "POST", {
        fanId: fan?.id,
        surface: kind,
      });
      if (alive.current && generation.current === entryGeneration) {
        setState(next);
        setSessionId(next.sessionId!);
        sessionRef.current = next.sessionId!;
        setSurface(kind);
        setVisualWriting(false);
        setEntered(true);
        setPanel(null);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const switchMode = async (kind: Surface) => {
    if (kind === surface) return;
    if (
      !fan?.surfaces.includes(kind) ||
      !state?.creator.surfaces.includes(kind) ||
      (kind === "voice" && !state.creator.voiceAuthorized)
    ) {
      openPanel("access");
      return;
    }
    if (human) {
      setError(
        "Mira is with you here. Return to AI Presence before changing the session’s surface.",
      );
      return;
    }
    if (entered) await start(kind);
    else setSurface(kind);
  };
  const speak = async (text: string) => {
    const version = generation.current;
    await provider.current?.speak(text, {
      onStart: () => {
        if (version === generation.current && alive.current)
          setVoiceState("speaking");
      },
      onEnd: () => {
        if (version === generation.current && alive.current)
          setVoiceState("quiet");
      },
      onError: (message) => {
        if (version === generation.current && alive.current) setError(message);
      },
    });
  };
  const send = async (text: string) => {
    if (
      !text.trim() ||
      busyRef.current ||
      !sessionRef.current ||
      !usable ||
      !connected
    )
      return;
    stop();
    const version = generation.current;
    busyRef.current = true;
    setBusy(true);
    setError("");
    if (human) setArrival(false);
    const currentId = sessionRef.current;
    if (
      pendingRequest.current?.sessionId !== currentId ||
      pendingRequest.current.text !== text.trim()
    )
      pendingRequest.current = {
        sessionId: currentId,
        text: text.trim(),
        id: crypto.randomUUID(),
      };
    const requestId = pendingRequest.current.id;
    try {
      const next = await fanApi(`sessions/${currentId}/messages`, "POST", {
        text: text.trim(),
        requestId,
      });
      if (!alive.current) return;
      setState(next);
      pendingRequest.current = null;
      setDraft("");
      const updated = next.sessions.find((s) => s.id === currentId);
      const reply = updated?.messages.at(-1);
      if (
        version === generation.current &&
        sound &&
        surface === "voice" &&
        updated?.mode === "ai" &&
        reply?.role === "ai" &&
        !reply.blocked
      )
        void speak(reply.text);
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      busyRef.current = false;
      if (alive.current) setBusy(false);
    }
  };
  const listen = () => {
    if (voiceState !== "quiet") {
      stop();
      return;
    }
    if (!voiceConsent) {
      openPanel("voice");
      return;
    }
    if (!provider.current?.supported.recognition) {
      setError(
        "Voice input is unavailable in this browser. You can type below and enable spoken replies.",
      );
      inputRef.current?.focus();
      return;
    }
    stop();
    const version = generation.current;
    provider.current.listen(
      (text) => {
        if (alive.current && version === generation.current) {
          setDraft(text);
          void send(text);
        }
      },
      {
        onStart: () => {
          if (alive.current && version === generation.current)
            setVoiceState("listening");
        },
        onEnd: () => {
          if (alive.current && version === generation.current)
            setVoiceState("quiet");
        },
        onError: (message) => {
          if (alive.current && version === generation.current)
            setError(message);
        },
      },
    );
  };
  const leave = () => {
    stop();
    setEntered(false);
    setSessionId(null);
    sessionRef.current = null;
    setArrival(false);
    setTimeout(() => returnFocus.current?.focus(), 0);
  };
  const greeting = memory
    ? "There’s a thread to pick up."
    : "A little time, just for this.";
  const status = !connected
    ? "Reconnecting…"
    : !available
      ? state?.creator.licenseStatus === "revoked"
        ? "Presence withdrawn"
        : "Taking a pause"
      : human
        ? "Creator joined · demo"
        : voiceState === "listening"
          ? "Listening to you"
          : voiceState === "speaking"
            ? "AI Presence · speaking"
            : busy
              ? "Finding the words…"
              : "AI Presence · available";
  const spoken = latest?.blocked
    ? "PRESENCE / A BOUNDARY"
    : !currentReply && latest
      ? "CARRIED FROM YOUR LAST MOMENT"
      : latest?.role === "human"
        ? "MIRA / CREATOR OPERATOR"
        : latest?.role === "ai"
          ? "MIRA / AI PRESENCE"
          : "YOUR SHARED THREAD";
  return (
    <main
      className={`fan-experience ${entered ? "is-entered" : "is-entry"} mode-${surface} ${human ? "is-human" : ""} ${arrival && human ? "has-arrival" : ""} ${latest ? "has-reply" : ""} voice-${voiceState} ${!available && state ? "is-unavailable" : ""}`}
    >
      <div
        className="fan-world"
        ref={portrait}
        onPointerMove={(e) => {
          if (
            e.pointerType !== "mouse" ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
          )
            return;
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--look-x",
            `${((e.clientX - r.left) / r.width - 0.5) * 8}px`,
          );
          e.currentTarget.style.setProperty(
            "--look-y",
            `${((e.clientY - r.top) / r.height - 0.5) * 5}px`,
          );
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.setProperty("--look-x", "0px");
          e.currentTarget.style.setProperty("--look-y", "0px");
        }}
      >
        <div className="fan-portrait">
          <Image
            src="/mira-vale.png"
            alt="Mira Vale, an original fictional adult creator, seated in soft window light"
            fill
            priority
            sizes="(max-width: 700px) 240vw, 120vw"
            quality={75}
          />
        </div>
        <div className="fan-shade" />
        <svg
          ref={thread}
          className="presence-thread"
          viewBox="0 0 700 800"
          fill="none"
          aria-hidden="true"
        >
          <path
            className="thread-guide"
            d="M 42 0 L 42 330 C 42 405 82 426 82 475 L 82 600 C 82 680 170 724 275 724 L 700 724"
          />
          <path
            className="thread-signal"
            d="M 42 0 L 42 330 C 42 405 82 426 82 475 L 82 600 C 82 680 170 724 275 724 L 700 724"
          />
          <circle cx="42" cy="330" r="3" />
          <circle cx="275" cy="724" r="3" />
        </svg>
      </div>
      <header className="fan-header">
        <Link
          className="fan-wordmark"
          href="/demo"
          aria-label="Presence demo home"
        >
          <span className="fan-mark">p.</span> PRESENCE
        </Link>
        <div className="fan-header-right">
          <Link href="/studio" className="fan-studio-link">
            Creator studio <ArrowRight size={14} />
          </Link>
          <button
            className="fan-avatar"
            onClick={() => openPanel("access")}
            aria-label="Alex’s access"
          >
            A
          </button>
        </div>
      </header>
      <div className="fan-rail">
        <span>ONE IDENTITY. EVERY FORM.</span>
        <i />
        <span>01 / MIRA VALE</span>
      </div>
      <section className="fan-content" aria-label="Mira’s Presence">
        <div className="fan-status">
          <span className={`fan-status-dot ${human ? "human" : ""}`} />
          <span role="status">
            {state ? status : "Connecting to Mira’s Presence…"}
          </span>
          <button
            onClick={() => openPanel("about")}
            aria-label="About this AI Presence"
          >
            <Sparkles size={13} />
          </button>
        </div>
        {!entered ? (
          <div className="fan-entry-copy">
            <div className="fan-entry-kicker">
              A FAMILIAR PRESENCE. A NEW KIND OF CLOSE.
            </div>
            <h1>
              Mira <em>Vale.</em>
            </h1>
            <p className="fan-intro">
              A moment away from everything.
              <br />A little closer to Mira.
            </p>
            <div className="fan-invitation">
              <span className="fan-invitation-line" />
              <p>
                Welcome back, {fan?.name.split(" ")[0] || "Alex"}.<br />
                <span>
                  {memory
                    ? "Your conversation still has a thread."
                    : "Make a little space for a conversation."}
                </span>
              </p>
            </div>
            <button
              ref={returnFocus}
              className="fan-enter"
              onClick={() => void start(hasAccess ? surface : "text")}
              disabled={!state || !available || busy}
            >
              {" "}
              {busy ? "OPENING YOUR PRESENCE…" : "SPEND TIME WITH MIRA"}
              <ArrowRight size={20} />
            </button>
            <div className="fan-entry-foot">
              <span>{fan?.membership || "Patron"} access</span>
              <span>AI representation</span>
              <span>Fictional demo</span>
            </div>
          </div>
        ) : (
          <>
            <div className="fan-session-heading">
              <button
                className="fan-icon"
                onClick={leave}
                aria-label="Leave session"
              >
                <ArrowLeft size={20} />
              </button>
              <h1>
                Mira <em>Vale.</em>
              </h1>
              <button
                className="fan-icon fan-sound"
                onClick={() => {
                  if (sound) {
                    setSound(false);
                    stop();
                  } else openPanel("voice");
                }}
                aria-label={
                  sound ? "Mute spoken replies" : "Enable spoken replies"
                }
              >
                {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
              </button>
            </div>
            {surface === "spatial" && usable ? (
              <div className="fan-spatial">
                <SpatialPreview
                  speaking={voiceState === "speaking"}
                  active={usable && connected}
                  onClose={() => void switchMode("visual")}
                />
              </div>
            ) : null}
            <button
              className="fan-memory-cue"
              onClick={() => openPanel("memory")}
            >
              <span className="thread-node" />
              <span>
                <small>
                  {memory ? "THE THREAD CONTINUES" : "YOUR SHARED THREAD"}
                </small>
                {memory ? memory.text : "Only what you choose to remember."}
              </span>
              <ChevronRight size={15} />
            </button>
            <div className="fan-session-bottom">
              {!usable ? (
                <div className="fan-unavailable" role="status">
                  <Pause size={22} />
                  <h2>
                    {!available
                      ? "A pause in the moment."
                      : "This space is resting."}
                  </h2>
                  <p>
                    {!available
                      ? "Mira’s creator controls have made this Presence unavailable. Your conversation stays here."
                      : "Your access to this mode has changed. Choose another available form of Presence."}
                  </p>
                  <Link href="/studio">
                    View creator controls <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <div
                  className="fan-subtitle"
                  aria-live="polite"
                  aria-atomic="true"
                  key={latest?.id || sessionId}
                >
                  <span className="fan-eyebrow">
                    {voiceState === "listening" ? "I’M LISTENING" : spoken}
                  </span>
                  <p>
                    {voiceState === "listening"
                      ? "Take your time. I’m listening."
                      : surface === "spatial" &&
                          latest &&
                          latest.text.length > 105
                        ? latest.text.slice(0, 105).replace(/\s+\S*$/, "") + "…"
                        : excerpt || greeting}
                  </p>
                  {(hasFullReply ||
                    (surface === "spatial" &&
                      !!latest &&
                      latest.text.length > 105)) &&
                  voiceState !== "listening" ? (
                    <button
                      className="fan-read-reply"
                      onClick={() => openPanel("transcript")}
                    >
                      Read full reply <ArrowRight size={13} />
                    </button>
                  ) : null}
                  {!latest && memory ? (
                    <button
                      className="fan-pickup"
                      onClick={() =>
                        void send("What do you remember about me?")
                      }
                      disabled={busy}
                    >
                      Pick up where we left off <ArrowUp size={14} />
                    </button>
                  ) : null}
                  {human ? (
                    <span className="fan-human-note">
                      Human operator messages · fictional creator demonstration
                    </span>
                  ) : null}
                </div>
              )}
              <div className="fan-controls">
                <div className="fan-mode-row" aria-label="Presence modes">
                  {modes.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => void switchMode(id)}
                      aria-pressed={surface === id}
                      disabled={busy}
                      className={surface === id ? "selected" : ""}
                    >
                      <Icon size={17} />
                      <span>{label}</span>
                      {!fan?.surfaces.includes(id) ||
                      !state?.creator.surfaces.includes(id) ? (
                        <LockKeyhole size={10} />
                      ) : null}
                    </button>
                  ))}
                </div>
                {surface === "voice" && !human ? (
                  <div className="fan-voice-turn">
                    <button
                      type="button"
                      className={`fan-voice-primary ${voiceState !== "quiet" ? "active" : ""}`}
                      disabled={!usable || !connected || busy}
                      onClick={listen}
                      aria-label={
                        voiceState === "listening"
                          ? "Stop listening"
                          : voiceState === "speaking"
                            ? "Interrupt Mira"
                            : "Speak to Mira"
                      }
                    >
                      {voiceState !== "quiet" ? (
                        <span className="fan-wave">
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : (
                        <Mic size={26} />
                      )}
                    </button>
                    <span>
                      {voiceState === "listening"
                        ? "Listening. Tap to pause."
                        : voiceState === "speaking"
                          ? "Speaking. Tap to interrupt."
                          : "Your voice. Your pace."}
                    </span>
                  </div>
                ) : null}
                {surface === "visual" && !visualWriting ? (
                  <button
                    className="fan-visual-write"
                    disabled={!usable || !connected}
                    onClick={() => {
                      setVisualWriting(true);
                      requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                  >
                    Write a thought <ArrowUp size={16} />
                  </button>
                ) : null}
                <form
                  hidden={surface === "visual" && !visualWriting}
                  className="fan-composer"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void send(draft);
                  }}
                >
                  <input
                    ref={inputRef}
                    aria-label="Message Mira"
                    placeholder={
                      human ? "Write to Mira…" : "Say what’s on your mind…"
                    }
                    value={draft}
                    maxLength={2000}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!usable || !connected || busy}
                  />
                  <button
                    type="submit"
                    className="fan-send"
                    disabled={!usable || !connected || busy || !draft.trim()}
                    aria-label="Send message"
                  >
                    <ArrowUp size={20} />
                  </button>
                </form>
                <div className="fan-tools">
                  <button onClick={() => openPanel("transcript")}>
                    Conversation <ArrowDown size={12} />
                  </button>
                  <span>
                    {surface === "voice"
                      ? sound
                        ? "Generic system voice on"
                        : "Voice is optional · sound off"
                      : surface === "visual"
                        ? "Animated still portrait · not live video"
                        : surface === "spatial"
                          ? "Same identity. A new dimension."
                          : "Your words. The same Presence."}
                  </span>
                  <button onClick={() => openPanel("access")}>
                    {fan?.membership} <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
      {!entered && state && !available ? (
        <div className="fan-entry-notice">
          Mira’s Presence is{" "}
          {state.creator.licenseStatus === "pending"
            ? "awaiting creator authorization"
            : "currently unavailable"}
          .{" "}
          <Link href="/studio">
            Open creator controls <ArrowRight size={13} />
          </Link>
        </div>
      ) : null}
      {error ? (
        <div className="fan-error" role="alert">
          <span>{error}</span>
          <button aria-label="Dismiss error" onClick={() => setError("")}>
            <X size={17} />
          </button>
          {!state ? (
            <button onClick={() => window.location.reload()}>Try again</button>
          ) : null}
        </div>
      ) : null}
      <footer className="fan-footer">
        <span>BE THERE WITHOUT BEING THERE.</span>
        <button onClick={() => openPanel("about")}>
          About this Presence <ArrowRight size={13} />
        </button>
      </footer>
      {arrival && human && usable ? (
        <div className="fan-arrival" role="status" aria-live="polite">
          <div className="arrival-line" />
          <Radio size={27} />
          <span>THE CREATOR HAS JOINED</span>
          <h2>
            Mira is <em>here.</em>
          </h2>
          <p>
            AI has stepped aside.
            <br />
            The creator operator has joined your conversation.
          </p>
          <small>Fictional creator · live takeover demonstration</small>
          <button onClick={() => setArrival(false)}>
            Be here <ArrowRight size={17} />
          </button>
        </div>
      ) : null}
      {panel ? (
        <Sheet
          title={
            panel === "memory"
              ? "A thread worth keeping."
              : panel === "access"
                ? "A little more presence."
                : panel === "transcript"
                  ? "The conversation so far."
                  : panel === "voice"
                    ? "Let’s hear each other."
                    : "A presence, honestly."
          }
          onClose={() => setPanel(null)}
        >
          {panel === "memory" ? (
            <>
              <p className="fan-sheet-lead">
                The things you choose to share can travel with you, in every
                form of Mira’s Presence.
              </p>
              <label className="fan-toggle">
                <span>
                  Let Mira remember <small>Only notes you choose to save</small>
                </span>
                <input
                  type="checkbox"
                  checked={fan?.memoryConsent || false}
                  disabled={!state?.creator.memoryEnabled}
                  onChange={(e) =>
                    void mutate(`fans/${fan?.id}`, "PATCH", {
                      memoryConsent: e.target.checked,
                    })
                  }
                />
              </label>
              {!state?.creator.memoryEnabled ? (
                <p>Memory is paused by Mira’s creator.</p>
              ) : null}
              <div className="fan-notes">
                {state?.memories.map((m) => (
                  <article key={m.id}>
                    <span className="thread-node" />
                    <div>
                      <p>{m.text}</p>
                      <small>
                        {m.seeded ? "Fictional shared history" : "Saved by you"}{" "}
                        · kept until{" "}
                        {new Date(m.expiresAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </small>
                    </div>
                    <button
                      className="fan-icon"
                      aria-label={`Forget ${m.text}`}
                      onClick={() => void mutate(`memories/${m.id}`, "DELETE")}
                    >
                      <X size={17} />
                    </button>
                  </article>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void mutate("memories", "POST", {
                    fanId: fan?.id,
                    text: note,
                  }).then((result) => {
                    if (result) setNote("");
                  });
                }}
              >
                <label className="fan-field">
                  Something you’d like Mira to remember
                  <textarea
                    maxLength={300}
                    placeholder="A trip you’re planning. Something you love."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={
                      !fan?.memoryConsent || !state?.creator.memoryEnabled
                    }
                  />
                </label>
                <button
                  className="fan-panel-primary"
                  disabled={
                    !note.trim() ||
                    !fan?.memoryConsent ||
                    !state?.creator.memoryEnabled
                  }
                >
                  Keep this thread <Check size={17} />
                </button>
              </form>
              <button
                className="fan-text-action"
                onClick={() =>
                  void mutate(`fans/${fan?.id}/memories`, "DELETE")
                }
              >
                Forget all shared notes and conversation history
              </button>
            </>
          ) : null}
          {panel === "access" ? (
            <>
              <p className="fan-sheet-lead">
                {fan?.name.split(" ")[0]}, you have{" "}
                <strong>{fan?.membership} access.</strong> One relationship,
                with more ways to be here.
              </p>
              <div className="fan-access-list">
                {modes.map(({ id, label, icon: Icon, description }) => {
                  const allowed =
                    fan?.surfaces.includes(id) &&
                    state?.creator.surfaces.includes(id) &&
                    (id !== "voice" || state?.creator.voiceAuthorized);
                  return (
                    <div key={id}>
                      <Icon size={21} />
                      <span>
                        <strong>{label}</strong>
                        <small>{description}</small>
                      </span>
                      {allowed ? (
                        <Check size={18} />
                      ) : (
                        <LockKeyhole size={16} />
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="fan-sandbox">
                Demo access · no purchase or real charges.{" "}
                {state?.events.length || 0} sandbox interactions recorded.
                Membership and creator permissions govern availability.
              </p>
              <Link className="fan-panel-primary" href="/demo">
                Explore the two-sided demo <ArrowRight size={17} />
              </Link>
            </>
          ) : null}
          {panel === "transcript" ? (
            <>
              <p className="fan-sheet-lead">
                Every form of Presence shares your relationship. Earlier
                sessions are here too.
              </p>
              <div className="fan-transcript">
                {state?.sessions
                  .flatMap((s) =>
                    s.messages.map((m) => ({ ...m, surface: s.surface })),
                  )
                  .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
                  .map((m) => (
                    <article key={m.id} className={`author-${m.role}`}>
                      <small>
                        {m.role === "fan"
                          ? "YOU"
                          : m.role === "human"
                            ? "MIRA · CREATOR OPERATOR"
                            : m.role === "ai"
                              ? "MIRA · AI PRESENCE"
                              : "PRESENCE"}
                        <span>{m.surface}</span>
                      </small>
                      <p>{m.text}</p>
                    </article>
                  ))}
                {!state?.sessions.some((s) => s.messages.length) ? (
                  <p>Your conversation begins with a word.</p>
                ) : null}
              </div>
            </>
          ) : null}
          {panel === "voice" ? (
            <>
              <AudioLines className="fan-voice-symbol" size={58} />
              <p className="fan-sheet-lead">
                A spoken conversation, at your pace.
              </p>
              <p>
                Replies use a generic system voice, not Mira’s voice. Microphone
                input is optional; your browser may send audio to its speech
                service.
              </p>
              <label className="fan-toggle">
                <span>
                  Send when I finish speaking
                  <small>
                    After each microphone tap, recognized words are sent to
                    Mira’s AI automatically.
                  </small>
                </span>
                <input
                  type="checkbox"
                  checked={voiceConsent}
                  onChange={(e) => {
                    stop();
                    setVoiceConsent(e.target.checked);
                  }}
                />
              </label>
              <button
                className="fan-panel-primary"
                onClick={() => {
                  setSound(true);
                  setPanel(null);
                }}
              >
                Enable spoken replies <Volume2 size={18} />
              </button>
              <button
                className="fan-text-action"
                onClick={() => {
                  setPanel(null);
                  inputRef.current?.focus();
                }}
              >
                Keep the moment quiet. I’ll type.
              </button>
            </>
          ) : null}
          {panel === "about" ? (
            <>
              <p className="fan-sheet-lead">
                Mira Vale is an original fictional adult creator. This is her
                governed AI Presence.
              </p>
              <div className="fan-honesty">
                <p>
                  <strong>A portrait with presence.</strong> The visual is an
                  animated still photograph, not live video or a realtime
                  digital human.
                </p>
                <p>
                  <strong>A voice by choice.</strong> Optional browser speech
                  uses a generic system voice. No voice cloning is involved.
                </p>
                <p>
                  <strong>A relationship you control.</strong> Only your chosen
                  notes enter memory. You can inspect or forget them at any
                  time.
                </p>
                <p>
                  <strong>A creator in control.</strong> Availability, permitted
                  modes, and human takeover all follow the same creator runtime.
                  Conversation uses a deterministic demo provider.
                </p>
              </div>
              <Link className="fan-panel-primary" href="/demo">
                See both sides of Presence <ArrowRight size={17} />
              </Link>
            </>
          ) : null}
        </Sheet>
      ) : null}
    </main>
  );
}
