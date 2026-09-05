"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

type Capability = "checking" | "available" | "unavailable";
type StageRuntime = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  room: THREE.Group;
  session: XRSession | null;
};
type Props = { speaking?: boolean; active?: boolean; onClose?: () => void };

const buttonStyle = {
  border: "1px solid #d9ddcb4d",
  background: "#18231ee8",
  color: "#f0eee3",
  padding: "10px 15px",
  borderRadius: 24,
  font: "inherit",
  fontSize: 12,
  cursor: "pointer",
};

/** A portable renderer, deliberately independent of identity and conversation storage. */
export default function SpatialStage({
  speaking = false,
  active = true,
  onClose,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const runtime = useRef<StageRuntime | null>(null);
  const speakingRef = useRef(speaking);
  const [error, setError] = useState("");
  const [vr, setVr] = useState<Capability>("checking");
  const [ar, setAr] = useState<Capability>("checking");
  const [immersive, setImmersive] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  useEffect(() => {
    if (!active || !hostRef.current) return;
    const host = hostRef.current;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      queueMicrotask(() => {
        if (!disposed)
          setError(
            "This browser could not create a 3D canvas. Your text conversation remains available.",
          );
      });
      return () => {
        disposed = true;
      };
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local");
    renderer.domElement.style.cssText =
      "display:block;width:100%;height:100%;touch-action:none;outline-offset:-4px";
    renderer.domElement.setAttribute(
      "aria-label",
      "3D room with fictional AI portrait. Drag to orbit, scroll to zoom.",
    );
    renderer.domElement.tabIndex = 0;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#111715");
    scene.fog = new THREE.Fog("#111715", 6, 15);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 40);
    camera.position.set(0, 1.6, 4.4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.25, -1.1);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 8;
    controls.minPolarAngle = Math.PI * 0.26;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.minAzimuthAngle = -Math.PI * 0.38;
    controls.maxAzimuthAngle = Math.PI * 0.38;
    controls.update();

    const room = new THREE.Group();
    scene.add(room);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      new THREE.MeshBasicMaterial({ color: "#151d18" }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.015;
    room.add(floor);
    const grid = new THREE.GridHelper(24, 40, "#4d5845", "#28342b");
    grid.material.transparent = true;
    grid.material.opacity = 0.36;
    room.add(grid);

    const portraitGroup = new THREE.Group();
    portraitGroup.position.set(0, 1.35, -1.4);
    scene.add(portraitGroup);
    const backing = new THREE.Mesh(
      new THREE.BoxGeometry(1.86, 2.62, 0.045),
      new THREE.MeshBasicMaterial({ color: "#73806a" }),
    );
    portraitGroup.add(backing);
    const portraitMaterial = new THREE.MeshBasicMaterial({
      color: "#e4dfd1",
      side: THREE.FrontSide,
    });
    const portrait = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 2.56),
      portraitMaterial,
    );
    portrait.position.z = 0.025;
    portraitGroup.add(portrait);
    const texture = new THREE.TextureLoader().load(
      "/mira-vale.png",
      (loaded) => {
        if (disposed) {
          loaded.dispose();
          return;
        }
        loaded.colorSpace = THREE.SRGBColorSpace;
        const aspect = loaded.image.width / loaded.image.height;
        const planeAspect = 1.8 / 2.56;
        if (aspect > planeAspect) {
          loaded.repeat.x = planeAspect / aspect;
          loaded.offset.x = (1 - loaded.repeat.x) / 2;
        } else {
          loaded.repeat.y = aspect / planeAspect;
          loaded.offset.y = (1 - loaded.repeat.y) / 2;
        }
        portraitMaterial.map = loaded;
        portraitMaterial.needsUpdate = true;
      },
      undefined,
      () => {
        if (!disposed)
          setError(
            "The portrait could not load. The spatial room is still interactive.",
          );
      },
    );

    // AI disclosure is also rendered in-world, so it survives immersive mode.
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 1024;
    labelCanvas.height = 160;
    const context = labelCanvas.getContext("2d");
    if (context) {
      context.fillStyle = "#111715";
      context.fillRect(0, 0, 1024, 160);
      context.textAlign = "center";
      context.fillStyle = "#e8e9db";
      context.font = "36px sans-serif";
      context.fillText("MIRA VALE · AI REPRESENTATION", 512, 60);
      context.fillStyle = "#aab8a1";
      context.font = "26px sans-serif";
      context.fillText(
        "Fictional adult · spatial portrait · not live video",
        512,
        110,
      );
    }
    const labelTexture = new THREE.CanvasTexture(labelCanvas);
    labelTexture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(1.86, 0.29),
      new THREE.MeshBasicMaterial({
        map: labelTexture,
        side: THREE.DoubleSide,
      }),
    );
    label.position.set(0, -1.49, 0.04);
    portraitGroup.add(label);

    const rings: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.4 + i * 0.45, 1.407 + i * 0.45, 120),
        new THREE.MeshBasicMaterial({
          color: "#b5c692",
          transparent: true,
          opacity: 0.34 - i * 0.07,
          side: THREE.DoubleSide,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.006 + i * 0.002, -1.4);
      scene.add(ring);
      rings.push(ring);
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const resize = new ResizeObserver(() => {
      if (disposed || renderer.xr.isPresenting) return;
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      setCompact(height < 340);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    resize.observe(host);
    const frame = (time: number) => {
      if (disposed) return;
      controls.enabled = !renderer.xr.isPresenting;
      if (!renderer.xr.isPresenting) controls.update();
      for (let i = 0; i < rings.length; i++) {
        const pulse = reducedMotion.matches
          ? 0
          : Math.sin(time * 0.0015 - i * 0.7) *
            (speakingRef.current ? 0.055 : 0.009);
        rings[i].scale.setScalar(1 + pulse);
        rings[i].material.opacity =
          (speakingRef.current ? 0.56 : 0.28) - i * 0.06;
      }
      renderer.render(scene, camera);
    };
    renderer.setAnimationLoop(frame);
    const current: StageRuntime = { renderer, scene, room, session: null };
    runtime.current = current;
    const xr = navigator.xr;
    const detect = async () => {
      const [supportsVR, supportsAR] =
        xr && window.isSecureContext
          ? await Promise.all([
              xr.isSessionSupported("immersive-vr").catch(() => false),
              xr.isSessionSupported("immersive-ar").catch(() => false),
            ])
          : [false, false];
      if (!disposed) {
        setVr(supportsVR ? "available" : "unavailable");
        setAr(supportsAR ? "available" : "unavailable");
      }
    };
    void detect();
    const onKey = (event: KeyboardEvent) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home"].includes(
          event.key,
        )
      )
        return;
      event.preventDefault();
      if (event.key === "Home") camera.position.set(0, 1.6, 4.4);
      else if (event.key === "ArrowLeft") camera.position.x -= 0.25;
      else if (event.key === "ArrowRight") camera.position.x += 0.25;
      else if (event.key === "ArrowUp") camera.position.z -= 0.25;
      else camera.position.z += 0.25;
      controls.update();
    };
    renderer.domElement.addEventListener("keydown", onKey);
    return () => {
      disposed = true;
      runtime.current = null;
      if (current.session) void current.session.end().catch(() => {});
      renderer.setAnimationLoop(null);
      resize.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener("keydown", onKey);
      texture.dispose();
      labelTexture.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [active]);

  async function enterXR(mode: "immersive-vr" | "immersive-ar") {
    const current = runtime.current;
    if (!current || !navigator.xr || requesting) return;
    setRequesting(true);
    setError("");
    let session: XRSession | null = null;
    try {
      session = await navigator.xr.requestSession(mode, {
        optionalFeatures: ["local-floor"],
      });
      if (runtime.current !== current) {
        await session.end();
        return;
      }
      current.session = session;
      // A local reference space starts at the viewer's initial eye position.
      current.scene.position.y = -1.2;
      current.scene.background =
        mode === "immersive-ar" ? null : new THREE.Color("#111715");
      current.room.visible = mode !== "immersive-ar";
      session.addEventListener(
        "end",
        () => {
          current.session = null;
          current.scene.position.y = 0;
          current.scene.background = new THREE.Color("#111715");
          current.room.visible = true;
          if (runtime.current === current) {
            setImmersive(false);
            setRequesting(false);
          }
        },
        { once: true },
      );
      await current.renderer.xr.setSession(session);
      setImmersive(true);
    } catch {
      if (session) await session.end().catch(() => {});
      current.scene.position.y = 0;
      current.scene.background = new THREE.Color("#111715");
      current.room.visible = true;
      setError(
        "Immersive mode could not start. Check device access and continue exploring the 3D preview.",
      );
    } finally {
      setRequesting(false);
    }
  }

  if (!active)
    return (
      <div className="spatial-paused" style={{ padding: 32, color: "#c9d1c3" }}>
        Spatial presence is paused.
      </div>
    );

  return (
    <section
      className="spatial-stage"
      aria-label="Spatial presence preview"
      style={{
        position: "relative",
        minHeight: 180,
        height: "100%",
        background: "#111715",
        overflow: "hidden",
        borderRadius: 20,
        color: "#eeeee3",
      }}
    >
      <div ref={hostRef} style={{ position: "absolute", inset: 0 }} />
      <div
        style={{
          position: "absolute",
          top: compact ? 14 : 22,
          left: compact ? 18 : 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "start",
          pointerEvents: "none",
        }}
      >
        <div>
          <div
            style={{
              fontSize: compact ? 9 : 10,
              letterSpacing: ".19em",
              textTransform: "uppercase",
              color: "#b5c692",
            }}
          >
            Spatial presence
          </div>
          <p style={{ margin: "8px 0", fontSize: compact ? 10 : 12 }}>
            Mira Vale · AI representation
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            aria-label="Close spatial preview"
            onClick={onClose}
            style={{ ...buttonStyle, pointerEvents: "auto" }}
          >
            Close ×
          </button>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: compact ? "16px 18px 10px" : "45px 24px 22px",
          background: "linear-gradient(transparent, #111715 55%)",
        }}
      >
        {!compact && <p style={{ fontSize: 12, margin: "0 0 6px" }}>
          One identity. A new dimension.
        </p>}
        <p
          style={{
            color: "#a9b2a3",
            fontSize: compact ? 10 : 11,
            lineHeight: 1.6,
            margin: compact ? 0 : "0 0 12px",
          }}
        >
          {compact ? "3D portrait · not live video · drag to orbit" : "Interactive 3D portrait, not live video. Drag to orbit · scroll to zoom · arrow keys to explore."}
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {vr === "available" && (
            <button
              type="button"
              disabled={requesting || immersive}
              onClick={() => void enterXR("immersive-vr")}
              style={buttonStyle}
            >
              Enter VR ↗
            </button>
          )}
          {ar === "available" && (
            <button
              type="button"
              disabled={requesting || immersive}
              onClick={() => void enterXR("immersive-ar")}
              style={buttonStyle}
            >
              Place in AR ↗
            </button>
          )}
          {immersive && (
            <button
              type="button"
              onClick={() => void runtime.current?.session?.end()}
              style={buttonStyle}
            >
              Exit immersive view
            </button>
          )}
        </div>
        <p
          role="status"
          style={{
            color: error ? "#e9c1a5" : "#a9b2a3",
            fontSize: compact ? 9 : 10,
            lineHeight: 1.5,
            margin: compact ? "3px 0 0" : "10px 0 0",
          }}
        >
          {error ||
            (requesting
              ? "Waiting for device permission…"
              : vr === "checking" || ar === "checking"
                ? "Checking immersive device support…"
                : vr === "unavailable" && ar === "unavailable"
                  ? compact ? "AR / VR requires a compatible WebXR device." : "3D preview available · AR / VR needs a compatible WebXR device and secure connection."
                  : "Immersive preview available. Your device will request permission to enter.")}
        </p>
      </div>
    </section>
  );
}
