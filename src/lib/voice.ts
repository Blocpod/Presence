export const voiceDisclosure =
  "AI representation · generic system voice, not Mira’s voice";
export const recognitionDisclosure =
  "Microphone is optional. Your browser may send audio to its speech service. Review the transcript before sending.";

export type VoiceCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (message: string) => void;
};

export interface VoiceProvider {
  readonly id: string;
  readonly disclosure: string;
  readonly supported: { speech: boolean; recognition: boolean };
  speak(text: string, callbacks?: VoiceCallbacks): Promise<void>;
  listen(
    onTranscript: (text: string) => void,
    callbacks?: VoiceCallbacks,
  ): () => void;
  stop(): void;
}

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
};
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  abort(): void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

function recognitionConstructor() {
  if (typeof window === "undefined") return undefined;
  const browser = window as SpeechWindow;
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
}

/** Browser adapter. Governed text must be approved by the runtime before speak(). */
export class BrowserVoiceProvider implements VoiceProvider {
  readonly id = "browser-system-voice";
  readonly disclosure = voiceDisclosure;
  private recognition: Recognition | null = null;
  private finishRecognition: (() => void) | null = null;
  private finishSpeech: (() => void) | null = null;
  private utterance: SpeechSynthesisUtterance | null = null;

  get supported() {
    return {
      speech:
        typeof window !== "undefined" &&
        "speechSynthesis" in window &&
        "SpeechSynthesisUtterance" in window,
      recognition: Boolean(recognitionConstructor()),
    };
  }

  speak(text: string, callbacks: VoiceCallbacks = {}): Promise<void> {
    this.stop();
    if (!this.supported.speech) {
      callbacks.onError?.(
        "Speech playback is unavailable in this browser. The full conversation is available as text.",
      );
      return Promise.resolve();
    }
    if (!text.trim()) return Promise.resolve();
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        this.finishSpeech = null;
        this.utterance = null;
        callbacks.onEnd?.();
        resolve();
      };
      this.finishSpeech = finish;
      this.utterance = utterance;
      utterance.lang = "en-US";
      utterance.rate = 0.96;
      utterance.pitch = 1;
      // Prefer a local system voice, never imply creator voice cloning.
      const local = window.speechSynthesis
        .getVoices()
        .find((voice) => voice.localService && voice.lang.startsWith("en"));
      if (local) utterance.voice = local;
      utterance.onstart = () => callbacks.onStart?.();
      utterance.onend = finish;
      utterance.onerror = (event) => {
        if (event.error !== "canceled" && event.error !== "interrupted") {
          callbacks.onError?.(
            "Speech playback could not start. You can continue with text.",
          );
        }
        finish();
      };
      window.speechSynthesis.speak(utterance);
    });
  }

  listen(
    onTranscript: (text: string) => void,
    callbacks: VoiceCallbacks = {},
  ): () => void {
    this.stop();
    const Constructor = recognitionConstructor();
    if (!Constructor) {
      callbacks.onError?.(
        "Microphone transcription is unavailable in this browser. Type your message instead.",
      );
      return () => {};
    }
    const recognition = new Constructor();
    this.recognition = recognition;
    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      if (this.recognition === recognition) this.recognition = null;
      if (this.finishRecognition === finish) this.finishRecognition = null;
      recognition.onresult = null;
      recognition.onstart = null;
      recognition.onerror = null;
      recognition.onend = null;
      callbacks.onEnd?.();
    };
    this.finishRecognition = finish;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => callbacks.onStart?.();
    recognition.onresult = (event) => {
      const parts: string[] = [];
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        if (result.isFinal) parts.push(result[0].transcript);
      }
      if (parts.length) onTranscript(parts.join(" ").trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      const message =
        event.error === "not-allowed" || event.error === "service-not-allowed"
          ? "Microphone access was declined. You can continue by typing."
          : event.error === "no-speech"
            ? "No speech was detected. Try again or type your message."
            : "Transcription is unavailable right now. You can continue by typing.";
      callbacks.onError?.(message);
    };
    recognition.onend = finish;
    try {
      recognition.start();
    } catch {
      callbacks.onError?.(
        "Microphone could not start. You can continue by typing.",
      );
      finish();
    }
    return () => {
      finish();
      try {
        recognition.abort();
      } catch {
        /* Already ended by the browser. */
      }
    };
  }

  stop() {
    if (this.recognition) {
      const recognition = this.recognition;
      this.finishRecognition?.();
      try {
        recognition.abort();
      } catch {
        /* Already ended by the browser. */
      }
    }
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window &&
      this.utterance
    ) {
      window.speechSynthesis.cancel();
    }
    this.finishSpeech?.();
  }
}
