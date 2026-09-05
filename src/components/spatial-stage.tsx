"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import fanStyles from "./fan/spatial-preview.module.css";

type Capability = "checking" | "available" | "unavailable";
type StageRuntime = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  room: THREE.Group;
  session: XRSession | null;
  requestRender: () => void;
  resetView: () => void;
  orbit: (direction: number) => void;
};
type Props = {
  speaking?: boolean;
  active?: boolean;
  onClose?: () => void;
  variant?: "studio" | "fan";
};

const buttonStyle = {
  border: "1px solid #dadbdd4d",
  background: "#202123e8",
  color: "#edeef0",
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
  variant = "studio",
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
    runtime.current?.requestRender();
  }, [speaking]);

  useEffect(() => {
    if (!active || !hostRef.current) return;
    const host = hostRef.current;
    const fanView = variant === "fan";
    let disposed = false;
    let invalidate = () => {};
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
    if (fanView) {
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
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
    scene.background = new THREE.Color("#151618");
    scene.fog = new THREE.Fog("#151618", fanView ? 9 : 6, fanView ? 23 : 15);
    const camera = new THREE.PerspectiveCamera(fanView ? 36 : 42, 1, 0.05, 40);
    camera.position.set(
      fanView ? 0.15 : 0,
      fanView ? 1.72 : 1.6,
      fanView ? 4.35 : 4.4,
    );
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.25, -1.1);
    controls.enableDamping = !fanView;
    controls.enablePan = false;
    controls.minDistance = 2.8;
    controls.maxDistance = 8;
    controls.minPolarAngle = Math.PI * 0.26;
    controls.maxPolarAngle = Math.PI * 0.55;
    controls.minAzimuthAngle = -Math.PI * 0.38;
    controls.maxAzimuthAngle = Math.PI * 0.38;
    controls.update();
    controls.saveState();

    const room = new THREE.Group();
    scene.add(room);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 30),
      fanView
        ? new THREE.MeshStandardMaterial({
            color: "#858486",
            roughness: 0.88,
            metalness: 0.08,
          })
        : new THREE.MeshBasicMaterial({ color: "#1a1b1d" }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.015;
    floor.receiveShadow = fanView;
    room.add(floor);
    const grid = new THREE.GridHelper(24, 40, "#545557", "#303133");
    grid.material.transparent = true;
    grid.material.opacity = 0.36;
    if (!fanView) room.add(grid);
    else {
      grid.geometry.dispose();
      grid.material.dispose();
      scene.add(new THREE.HemisphereLight("#ece7e1", "#657081", 1.65));
      const keyLight = new THREE.DirectionalLight("#f4f1eb", 2.7);
      keyLight.position.set(-3, 5, 1);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = keyLight.shadow.camera.bottom = -7;
      keyLight.shadow.camera.right = keyLight.shadow.camera.top = 7;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 22;
      keyLight.shadow.normalBias = 0.03;
      keyLight.shadow.bias = -0.0002;
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight("#acc2e3", 0.8);
      fillLight.position.set(4, 2, 1);
      scene.add(fillLight);
      const wallMaterial = new THREE.MeshStandardMaterial({
        color: "#727577",
        roughness: 0.96,
      });
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(15, 7, 0.25),
        wallMaterial,
      );
      wall.position.set(0, 3.3, -4.7);
      wall.receiveShadow = true;
      room.add(wall);
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(2.5, 2.55, 0.065, 96),
        new THREE.MeshStandardMaterial({ color: "#aca9a5", roughness: 0.9 }),
      );
      plinth.position.set(0, 0.02, -1.4);
      plinth.receiveShadow = true;
      plinth.castShadow = true;
      room.add(plinth);
      for (const side of [-1, 1]) {
        const pier = new THREE.Mesh(
          new THREE.BoxGeometry(0.75, 5.5, 2.9),
          new THREE.MeshStandardMaterial({ color: "#878785", roughness: 0.94 }),
        );
        pier.position.set(side * 3.15, 2.65, -3.2);
        pier.castShadow = true;
        pier.receiveShadow = true;
        room.add(pier);
        const reveal = new THREE.Mesh(
          new THREE.PlaneGeometry(0.025, 4.7),
          new THREE.MeshBasicMaterial({
            color: side < 0 ? "#d5d5d3" : "#b2c1cf",
          }),
        );
        reveal.position.set(side * 2.72, 2.4, -4.54);
        room.add(reveal);
      }
      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(7.1, 0.24, 3),
        new THREE.MeshStandardMaterial({ color: "#777779", roughness: 0.92 }),
      );
      lintel.position.set(0, 4.6, -3.2);
      lintel.castShadow = true;
      lintel.receiveShadow = true;
      room.add(lintel);
      // A static light wash gives depth without an ambient animation loop.
      const glowCanvas = document.createElement("canvas");
      glowCanvas.width = glowCanvas.height = 128;
      const glowContext = glowCanvas.getContext("2d");
      if (glowContext) {
        const gradient = glowContext.createRadialGradient(
          64,
          64,
          8,
          64,
          64,
          64,
        );
        gradient.addColorStop(0, "rgba(239,229,211,0.38)");
        gradient.addColorStop(1, "rgba(239,229,211,0)");
        glowContext.fillStyle = gradient;
        glowContext.fillRect(0, 0, 128, 128);
      }
      const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(7, 6),
        new THREE.MeshBasicMaterial({
          map: new THREE.CanvasTexture(glowCanvas),
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      glow.position.set(-1, 2.3, -4.54);
      room.add(glow);
    }

    const portraitGroup = new THREE.Group();
    portraitGroup.position.set(0, 1.35, -1.4);
    scene.add(portraitGroup);
    const backing = new THREE.Mesh(
      new THREE.BoxGeometry(1.86, 2.62, 0.045),
      fanView
        ? new THREE.MeshStandardMaterial({
            color: "#777d86",
            roughness: 0.7,
            metalness: 0.2,
          })
        : new THREE.MeshBasicMaterial({ color: "#7b7c7e" }),
    );
    portraitGroup.add(backing);
    backing.castShadow = fanView;
    const portraitMaterial = new THREE.MeshBasicMaterial({
      color: fanView ? "#ffffff" : "#dedfe1",
      side: THREE.FrontSide,
      toneMapped: !fanView,
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
        invalidate();
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
      context.fillStyle = "#151618";
      context.fillRect(0, 0, 1024, 160);
      context.textAlign = "center";
      context.fillStyle = "#e7e8ea";
      context.font = "36px sans-serif";
      context.fillText("MIRA VALE · AI REPRESENTATION", 512, 60);
      context.fillStyle = "#b3b4b6";
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
    label.position.set(0, -1.12, 0.04);
    label.visible = !fanView;
    portraitGroup.add(label);

    const rings: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>[] = [];
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.4 + i * 0.45, 1.407 + i * 0.45, 120),
        new THREE.MeshBasicMaterial({
          color: fanView ? "#d2dfec" : "#bebfc1",
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
      setCompact(height < (fanView ? 520 : 340));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (fanView) {
        camera.fov = height < 340 ? 44 : height < 520 ? 38 : 36;
        // Reserve a quiet lower band for controls without pushing the portrait away.
        camera.setViewOffset(
          width,
          height,
          0,
          Math.round(height * (height < 340 ? 0.06 : 0.1)),
          width,
          height,
        );
      }
      camera.updateProjectionMatrix();
      invalidate();
    });
    resize.observe(host);
    let rendering = false;
    const frame = (time: number) => {
      if (disposed || rendering) return;
      rendering = true;
      controls.enabled = !renderer.xr.isPresenting;
      label.visible = !fanView || renderer.xr.isPresenting;
      if (!renderer.xr.isPresenting) controls.update();
      for (let i = 0; i < rings.length; i++) {
        const pulse =
          reducedMotion.matches || (fanView && !speakingRef.current)
            ? 0
            : Math.sin(time * 0.0015 - i * 0.7) *
              (speakingRef.current ? 0.055 : 0.009);
        rings[i].scale.setScalar(1 + pulse);
        rings[i].material.opacity =
          (speakingRef.current ? 0.56 : 0.28) - i * 0.06;
      }
      renderer.render(scene, camera);
      rendering = false;
    };
    let running = false;
    invalidate = () => {
      if (disposed) return;
      const animate =
        !document.hidden &&
        (renderer.xr.isPresenting ||
          !fanView ||
          (speakingRef.current && !reducedMotion.matches));
      if (!document.hidden) frame(performance.now());
      if (animate !== running) {
        running = animate;
        renderer.setAnimationLoop(animate ? frame : null);
      }
    };
    const orbit = (direction: number) => {
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), direction * 0.13);
      camera.position.copy(controls.target).add(offset);
      controls.update();
      invalidate();
    };
    const resetView = () => {
      controls.reset();
      invalidate();
    };
    controls.addEventListener("change", invalidate);
    document.addEventListener("visibilitychange", invalidate);
    reducedMotion.addEventListener("change", invalidate);
    renderer.xr.addEventListener("sessionstart", invalidate);
    renderer.xr.addEventListener("sessionend", invalidate);
    invalidate();
    const current: StageRuntime = {
      renderer,
      scene,
      room,
      session: null,
      requestRender: invalidate,
      resetView,
      orbit,
    };
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
      if (event.key === "Home") {
        controls.reset();
        invalidate();
        return;
      } else if (event.key === "ArrowLeft") camera.position.x -= 0.25;
      else if (event.key === "ArrowRight") camera.position.x += 0.25;
      else if (event.key === "ArrowUp") camera.position.z -= 0.25;
      else camera.position.z += 0.25;
      controls.update();
      invalidate();
    };
    renderer.domElement.addEventListener("keydown", onKey);
    return () => {
      disposed = true;
      runtime.current = null;
      if (current.session) void current.session.end().catch(() => {});
      renderer.setAnimationLoop(null);
      resize.disconnect();
      controls.removeEventListener("change", invalidate);
      document.removeEventListener("visibilitychange", invalidate);
      reducedMotion.removeEventListener("change", invalidate);
      renderer.xr.removeEventListener("sessionstart", invalidate);
      renderer.xr.removeEventListener("sessionend", invalidate);
      controls.dispose();
      renderer.domElement.removeEventListener("keydown", onKey);
      texture.dispose();
      labelTexture.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.DirectionalLight) object.shadow.dispose();
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.LineSegments
        ) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => {
            if (
              material instanceof THREE.MeshBasicMaterial &&
              material.map &&
              material.map !== texture &&
              material.map !== labelTexture
            )
              material.map.dispose();
            material.dispose();
          });
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [active, variant]);

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
        mode === "immersive-ar" ? null : new THREE.Color("#151618");
      current.room.visible = mode !== "immersive-ar";
      session.addEventListener(
        "end",
        () => {
          current.session = null;
          current.scene.position.y = 0;
          current.scene.background = new THREE.Color("#151618");
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
      current.scene.background = new THREE.Color("#151618");
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
      <div
        className={variant === "fan" ? fanStyles.paused : "spatial-paused"}
        style={{ padding: 32, color: "#cdced0" }}
      >
        {variant === "fan" ? (
          <>
            <span className={fanStyles.eyebrow}>SPATIAL PRESENCE</span>
            <h2>The room is resting.</h2>
            <p>
              This Presence is currently unavailable. The creator’s permissions
              apply in every space.
            </p>
            {onClose && (
              <button className={fanStyles.button} onClick={onClose}>
                Return to Mira
              </button>
            )}
          </>
        ) : (
          "Spatial presence is paused."
        )}
      </div>
    );

  if (variant === "fan")
    return (
      <section
        className={fanStyles.stage}
        aria-label="Spatial Presence preview"
        data-compact={compact}
      >
        <div ref={hostRef} className={fanStyles.canvas} />
        {error.includes("3D canvas") && (
          <div
            className={fanStyles.fallback}
            role="img"
            aria-label="Fictional Mira Vale, still AI portrait fallback"
          />
        )}
        <header className={fanStyles.header}>
          <div>
            <span className={fanStyles.eyebrow}>PRESENCE / IN YOUR SPACE</span>
            <p>Mira Vale · AI representation</p>
          </div>
          {onClose && (
            <button
              type="button"
              className={fanStyles.button}
              onClick={onClose}
              aria-label="Return from spatial preview"
            >
              ↙ Return
            </button>
          )}
        </header>
        <div className={fanStyles.footer}>
          <span className={fanStyles.eyebrow}>SPATIAL PRESENCE PREVIEW</span>
          <h2>The listening room.</h2>
          <p className={fanStyles.description}>
            A little distance from everywhere else.
            <br />
            The same Mira. The same thread between you.
          </p>
          <p className={fanStyles.disclosure}>
            AI still portrait in a 3D space · not live video.
          </p>
          <div
            className={fanStyles.controls}
            aria-label="Spatial view controls"
          >
            <button
              type="button"
              className={`${fanStyles.button} ${fanStyles.orbitButton}`}
              disabled={error.includes("3D canvas")}
              aria-label="Orbit view left"
              onClick={() => runtime.current?.orbit(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className={`${fanStyles.button} ${fanStyles.orbitButton}`}
              disabled={error.includes("3D canvas")}
              aria-label="Orbit view right"
              onClick={() => runtime.current?.orbit(1)}
            >
              →
            </button>
            <button
              type="button"
              className={fanStyles.button}
              disabled={error.includes("3D canvas")}
              onClick={() => runtime.current?.resetView()}
            >
              Reset view
            </button>
            {vr === "available" && (
              <button
                type="button"
                className={fanStyles.button}
                disabled={requesting || immersive}
                onClick={() => void enterXR("immersive-vr")}
              >
                Enter VR ↗
              </button>
            )}
            {ar === "available" && (
              <button
                type="button"
                className={fanStyles.button}
                disabled={requesting || immersive}
                onClick={() => void enterXR("immersive-ar")}
              >
                Place in AR ↗
              </button>
            )}
            {immersive && (
              <button
                type="button"
                className={fanStyles.button}
                onClick={() => void runtime.current?.session?.end()}
              >
                Exit immersive view
              </button>
            )}
            <span className={fanStyles.instruction}>
              Drag or use arrow keys to explore
            </span>
          </div>
          <p
            role="status"
            className={`${fanStyles.status} ${error ? fanStyles.error : ""}`}
          >
            {error ||
              (requesting
                ? "Your device is opening the space…"
                : vr === "checking" || ar === "checking"
                  ? "Checking your device’s immersive capabilities…"
                  : vr === "unavailable" && ar === "unavailable"
                    ? "Explore here. AR / VR opens on compatible WebXR devices."
                    : "Your device supports an immersive preview. Enter when you’re ready.")}
          </p>
        </div>
      </section>
    );

  return (
    <section
      className="spatial-stage"
      aria-label="Spatial presence preview"
      style={{
        position: "relative",
        minHeight: 180,
        height: "100%",
        background: "#151618",
        overflow: "hidden",
        borderRadius: 20,
        color: "#ecedef",
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
              color: "#bebfc1",
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
          background: "linear-gradient(transparent, #151618 55%)",
        }}
      >
        {!compact && (
          <p style={{ fontSize: 12, margin: "0 0 6px" }}>
            One identity. A new dimension.
          </p>
        )}
        <p
          style={{
            color: "#aeafb1",
            fontSize: compact ? 10 : 11,
            lineHeight: 1.6,
            margin: compact ? 0 : "0 0 12px",
          }}
        >
          {compact
            ? "3D portrait · not live video · drag to orbit"
            : "Interactive 3D portrait, not live video. Drag to orbit · scroll to zoom · arrow keys to explore."}
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
            color: error ? "#e9c1a5" : "#aeafb1",
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
                  ? compact
                    ? "AR / VR requires a compatible WebXR device."
                    : "3D preview available · AR / VR needs a compatible WebXR device and secure connection."
                  : "Immersive preview available. Your device will request permission to enter.")}
        </p>
      </div>
    </section>
  );
}
