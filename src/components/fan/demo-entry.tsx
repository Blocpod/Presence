"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Pause,
  Play,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/client";
import type { PresenceState } from "@/lib/types";
import "./demo.css";
export default function DemoEntry() {
  const [state, setState] = useState<PresenceState | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    api("fan/demo", "POST", {})
      .then(() => api("state"))
      .then((s) => {
        if (live.current) setState(s);
      })
      .catch((e) => {
        if (live.current) setError(e.message);
      });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible")
        api("state")
          .then((s) => {
            if (live.current) setState(s);
          })
          .catch(() => {});
    }, 1800);
    return () => {
      live.current = false;
      clearInterval(timer);
    };
  }, []);
  const session = state?.sessions
    .filter((s) => s.fanId === "fan-alex" && s.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const run = async (action: () => Promise<PresenceState>, message: string) => {
    setBusy(true);
    setError("");
    try {
      setState(await action());
      setNotice(message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const arrive = async () => {
    if (!session)
      throw new Error(
        "Enter Mira’s Presence in the fan view first, then return here.",
      );
    await api(`sessions/${session.id}/takeover`, "POST", { mode: "human" });
    return api(`sessions/${session.id}/messages`, "POST", {
      text: "Alex, it’s Mira’s creator operator here. I’ve joined this demo conversation personally. Tell me how the Kyoto plans are coming along.",
      requestId: crypto.randomUUID(),
    });
  };
  return (
    <main className="demo-entry">
      <header>
        <Link href="/" className="demo-logo">
          p. <span>PRESENCE</span>
        </Link>
        <span>THE TWO SIDES OF BEING THERE</span>
        <Link href="/presence/mira">
          Enter fan view <ArrowRight size={16} />
        </Link>
      </header>
      <section className="demo-intro">
        <span className="demo-eyebrow">
          A FICTIONAL CREATOR. A REAL WORKING RUNTIME.
        </span>
        <h1>
          One presence.
          <br />
          <em>Two perspectives.</em>
        </h1>
        <p>
          For Mira, control. For Alex, a connection that continues.
          <br />
          Experience both sides of a licensed digital presence.
        </p>
      </section>
      <div className="demo-perspectives">
        <Link className="demo-fan-card" href="/presence/mira">
          <Image
            src="/mira-vale.png"
            alt="Fictional creator Mira Vale"
            fill
            priority
            sizes="(max-width:700px) 100vw,50vw"
          />
          <div>
            <span>01 / THE FAN EXPERIENCE</span>
            <h2>Be a little closer.</h2>
            <p>Enter as Alex. Pick up a memory. Find a new form of presence.</p>
            <strong>
              Spend time with Mira <ArrowRight size={20} />
            </strong>
          </div>
        </Link>
        <Link className="demo-studio-card" href="/studio">
          <ShieldCheck size={32} />
          <span>02 / THE CREATOR STUDIO</span>
          <h2>
            Always on
            <br />
            <em>your terms.</em>
          </h2>
          <p>
            The identity, the boundaries, the relationship.
            <br />
            Mira decides how her Presence shows up.
          </p>
          <strong>
            Open creator studio <ArrowRight size={20} />
          </strong>
        </Link>
      </div>
      <section className="demo-director">
        <div>
          <span className="demo-eyebrow">DEMO DIRECTOR / CREATOR OPERATOR</span>
          <h2>Change the moment.</h2>
          <p>
            Keep the fan view open in another tab. These controls change the
            actual shared workspace. Alex’s fan account cannot perform them.
          </p>
          <p className="demo-session-state">
            {session
              ? `${session.surface} session · ${session.mode === "human" ? "creator operator joined" : "AI Presence"}`
              : "Enter the fan experience to begin a session."}
          </p>
        </div>
        <div className="demo-actions">
          {state?.creator.licenseStatus !== "active" ? (
            <button
              disabled={busy || !state}
              onClick={() =>
                void run(
                  () =>
                    api("creator", "PATCH", {
                      licenseStatus: "active",
                      likenessAuthorized: true,
                      voiceAuthorized: true,
                      enabled: true,
                    }),
                  "Fictional demo license authorized. Enter the fan view to begin a new session.",
                )
              }
            >
              <ShieldCheck size={18} />
              <span>
                Authorize fictional Mira
                <small>Local demo identity and likeness only</small>
              </span>
              <ArrowRight size={17} />
            </button>
          ) : (
            <button
              disabled={busy || !state}
              onClick={() =>
                void run(
                  () =>
                    api("creator", "PATCH", {
                      enabled: !state?.creator.enabled,
                    }),
                  state.creator.enabled
                    ? "Mira’s Presence is paused. Fan interaction is blocked."
                    : "Mira’s Presence is available again.",
                )
              }
            >
              {state?.creator.enabled ? (
                <Pause size={18} />
              ) : (
                <Play size={18} />
              )}
              <span>
                {state?.creator.enabled ? "Pause Presence" : "Resume Presence"}
                <small>Watch the fan view respond</small>
              </span>
              <ArrowRight size={17} />
            </button>
          )}
          <button
            disabled={busy || !session || !state?.creator.enabled}
            onClick={() =>
              void run(
                session?.mode === "human"
                  ? () =>
                      api(`sessions/${session.id}/takeover`, "POST", {
                        mode: "ai",
                      })
                  : arrive,
                session?.mode === "human"
                  ? "AI Presence has resumed."
                  : "Mira’s creator operator has joined. Return to the fan view.",
              )
            }
          >
            <Radio size={18} />
            <span>
              {session?.mode === "human"
                ? "Return to AI Presence"
                : "Mira arrives"}
              <small>Simulate the human creator joining</small>
            </span>
            <ArrowRight size={17} />
          </button>
          <button
            disabled={busy || !state}
            onClick={() =>
              void run(
                () =>
                  api("fans/fan-alex", "PATCH", {
                    surfaces:
                      state?.fans.find((f) => f.id === "fan-alex")?.surfaces
                        .length === 4
                        ? ["text"]
                        : ["text", "voice", "visual", "spatial"],
                  }),
                "Alex’s sandbox access changed. The runtime enforces it immediately.",
              )
            }
          >
            <Check size={18} />
            <span>
              {state?.fans.find((f) => f.id === "fan-alex")?.surfaces.length ===
              4
                ? "Limit access to text"
                : "Restore all four modes"}
              <small>Sandbox entitlements · no purchase</small>
            </span>
            <ArrowRight size={17} />
          </button>
        </div>
      </section>
      {notice ? (
        <p className="demo-notice" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="demo-notice demo-error" role="alert">
          {error}
        </p>
      ) : null}
      <footer>
        Fictional adult identities · deterministic AI · optional browser voice ·
        still portrait · spatial preview · sandbox billing
      </footer>
    </main>
  );
}
