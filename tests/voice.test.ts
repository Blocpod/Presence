import assert from "node:assert/strict";
import test from "node:test";
import { BrowserVoiceProvider } from "../src/lib/voice";

test("browser voice falls back safely and cancels speech and recognition exactly once", async () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalUtterance = Object.getOwnPropertyDescriptor(globalThis, "SpeechSynthesisUtterance");
  const restore = (key: string, descriptor: PropertyDescriptor | undefined) => {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  };
  try {
    Reflect.deleteProperty(globalThis, "window");
    const unsupported = new BrowserVoiceProvider();
    assert.deepEqual(unsupported.supported, { speech: false, recognition: false });
    let unavailableMessage = "";
    await unsupported.speak("hello", { onError: (message) => { unavailableMessage = message; } });
    assert.match(unavailableMessage, /unavailable/);

    class FakeUtterance {
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      constructor(public text: string) {}
    }
    class FakeRecognition {
      static last: FakeRecognition;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onresult: ((event: { resultIndex: number; results: { isFinal: boolean; 0: { transcript: string } }[] }) => void) | null = null;
      constructor() { FakeRecognition.last = this; }
      start() { this.onstart?.(); }
      abort() { this.onend?.(); }
    }
    let playingUtterance: FakeUtterance | null = null;
    const fakeWindow = {
      SpeechSynthesisUtterance: FakeUtterance,
      SpeechRecognition: FakeRecognition,
      speechSynthesis: {
        getVoices: () => [],
        speak: (utterance: FakeUtterance) => { playingUtterance = utterance; utterance.onstart?.(); },
        cancel: () => { playingUtterance?.onerror?.({ error: "canceled" }); },
      },
    };
    Object.defineProperty(globalThis, "window", { configurable: true, value: fakeWindow });
    Object.defineProperty(globalThis, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    const voice = new BrowserVoiceProvider();
    assert.deepEqual(voice.supported, { speech: true, recognition: true });
    let speechEnds = 0;
    const playing = voice.speak("approved response", { onEnd: () => { speechEnds++; } });
    voice.stop();
    await playing;
    voice.stop();
    assert.equal(speechEnds, 1);

    let transcript = "";
    let listeningEnds = 0;
    voice.listen((text) => { transcript = text; }, { onEnd: () => { listeningEnds++; } });
    const first = FakeRecognition.last;
    first.onresult?.({ resultIndex: 0, results: [{ isFinal: true, 0: { transcript: "a draft message" } }] });
    assert.equal(transcript, "a draft message");
    voice.stop();
    assert.equal(listeningEnds, 1);
    assert.equal(first.onresult, null, "stopped recognition cannot deliver an obsolete draft");
    assert.equal(first.onend, null, "old end event cannot alter a new capture state");
    voice.stop();
    assert.equal(listeningEnds, 1);

    const stop = voice.listen(() => {}, { onEnd: () => { listeningEnds++; } });
    stop();
    stop();
    assert.equal(listeningEnds, 2, "returned cleanup is idempotent");
  } finally {
    restore("window", originalWindow);
    restore("SpeechSynthesisUtterance", originalUtterance);
  }
});
