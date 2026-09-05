import type { Creator, Fan, Memory, Surface } from "../types";
export type PresenceContext = {
  creator: Creator;
  fan: Fan;
  memories: Memory[];
  text: string;
  surface: Surface;
};
export interface PresenceProvider {
  readonly id: string;
  generate(context: PresenceContext): string;
}
type Tone = "warm" | "calm" | "curious" | "reflective";
function resolveTone(value: string): Tone {
  const tone = value.toLowerCase();
  if (/reflective/.test(tone)) return "reflective";
  if (/calm|grounded|concise/.test(tone)) return "calm";
  if (/energetic|encouraging/.test(tone)) return "curious";
  if (/warm|playful/.test(tone)) return "warm";
  return /curious/.test(tone) ? "curious" : "warm";
}
/** Credential-free adapter: facts are quoted from creator configuration, never inferred. */
export class DeterministicProvider implements PresenceProvider {
  readonly id = "deterministic-demo";
  generate({ creator, fan, memories, text }: PresenceContext): string {
    const lower = text.toLowerCase();
    const recall = memories[0]?.text;
    const name = fan.name.split(" ")[0];
    const tone = resolveTone(creator.tone);
    const greeting = {
      warm: `${name}, it’s good to make a little space for this. `,
      calm: `${name}, let’s keep it simple. `,
      curious: `${name}, let’s try a small creative experiment. `,
      reflective: `${name}, let’s slow down and notice the detail. `,
    }[tone];
    if (/who are you|are you real|are you mira|tell me about yourself|what are your interests|your (biography|background|story)/.test(lower)) {
      const facts = creator.facts.length
        ? ` The creator-approved facts are: ${creator.facts.join("; ")}.`
        : " No additional biographical facts have been approved.";
      return `${greeting}I'm ${creator.name}'s disclosed AI Presence, a fictional creator demonstration. I am not a live human.${facts}`;
    }
    if (/remember|know about me|last time|memory/.test(lower))
      return recall
        ? `${greeting}Your saved note says: “${recall}” We can pick up there, or you can delete that note in your memory controls.`
        : `${greeting}I don't have a saved note for this relationship. You can explicitly save a preference if you'd like continuity next time.`;
    if (/photo|camera|kyoto|travel|film|light/.test(lower)) {
      const idea = tone === "calm"
        ? "Choose one frame. Notice the light. Wait for the scene to settle."
        : tone === "curious"
          ? "Try photographing the same quiet doorway three ways: close up, from across the street, and through a reflection. Which version changes the story?"
          : tone === "reflective"
            ? "Give yourself one frame and ten minutes. Notice what the light reveals, and what you want to leave outside the picture."
            : "Give yourself one frame and ten minutes. Look for the way light falls across a quiet doorway, then wait for the scene to change.";
      return `${greeting}${idea}${recall ? ` Your saved context: “${recall}”` : ""} What detail would you want that photograph to hold?`;
    }
    if (/run|race|marathon|training/.test(lower))
      return `${greeting}A photo diary could make that journey meaningful: one picture before each outing, one small observation afterward.${recall ? ` I have your saved note: “${recall}”` : ""} I can help with creative reflection; qualified professionals should guide training or health decisions.`;
    if (/music|ambient|sound|playlist/.test(lower)) {
      const idea = tone === "calm"
        ? "Start with three tracks: a quiet opening, a textured middle, and room to breathe at the end."
        : tone === "curious"
          ? "Try building a sound postcard: one field recording, one warm texture, and one unexpected rhythm."
          : tone === "reflective"
            ? "Imagine a place you miss. Choose a sound for its light, another for its pace, and leave a little silence between them."
            : "Build a small listening ritual: a soft opening, a textured middle, and a final track with room to breathe.";
      return `${greeting}${idea}${recall ? ` Your note says “${recall}” — we can use that as the creative direction.` : ""} What kind of place should the sound evoke?`;
    }
    return `${greeting}${recall ? `Your saved context is “${recall}”. ` : ""}I can explore photography, travel storytelling, and music with you. What would you like to create or reflect on?`;
  }
}
export function getProvider(): PresenceProvider {
  // External providers intentionally unavailable until a reviewed, explicitly configured adapter exists.
  if (process.env.PRESENCE_PROVIDER && process.env.PRESENCE_PROVIDER !== "demo")
    throw new Error("External providers are not configured. Set PRESENCE_PROVIDER=demo.");
  return new DeterministicProvider();
}
