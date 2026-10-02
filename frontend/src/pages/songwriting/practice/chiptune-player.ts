import { ALARM_SECONDS, makeChiptune } from "./chiptune-score.ts";
import type { AlarmMusic } from "./chiptune-score.ts";

export class ChiptunePlayer {
  private context: AudioContext | null = null;
  private voices = new Set<OscillatorNode>();
  private queueEndsAt = 0;

  async unlock(): Promise<void> {
    const Audio =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Audio) throw new Error("Audio is unavailable in this browser.");
    if (!this.context || this.context.state === "closed")
      this.context = new Audio();
    if (this.context.state !== "running") await this.context.resume();
    if (this.context.state !== "running")
      throw new Error("Sound is blocked. Try again to enable it.");
  }

  async play(music: AlarmMusic): Promise<number> {
    await this.unlock();
    const context = this.context!;
    const startsAt = Math.max(context.currentTime + 0.025, this.queueEndsAt);
    this.queueEndsAt = startsAt + ALARM_SECONDS;
    const bus = context.createGain();
    bus.gain.value = 0.28;
    bus.connect(context.destination);
    const score = makeChiptune(
      music,
      crypto.getRandomValues(new Uint32Array(1))[0],
    );
    let remaining = score.length;
    for (const note of score) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = startsAt + note.at;
      const endsAt = at + note.duration;
      oscillator.type = note.voice === "lead" ? "square" : "triangle";
      oscillator.frequency.value = 440 * 2 ** ((note.midi - 69) / 12);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(
        note.voice === "lead" ? 0.12 : 0.3,
        at + Math.min(0.004, note.duration / 3),
      );
      gain.gain.exponentialRampToValueAtTime(0.001, endsAt);
      gain.gain.setValueAtTime(0, endsAt);
      oscillator.connect(gain);
      gain.connect(bus);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
        this.voices.delete(oscillator);
        if (--remaining === 0) bus.disconnect();
      };
      this.voices.add(oscillator);
      oscillator.start(at);
      oscillator.stop(endsAt);
    }
    return (this.queueEndsAt - context.currentTime) * 1000;
  }

  stop(): void {
    for (const voice of this.voices) voice.stop();
    this.voices.clear();
    this.queueEndsAt = 0;
  }

  dispose(): void {
    this.stop();
    void this.context?.close();
    this.context = null;
  }
}
