export type SoundCategory = 'DEFAULT' | 'REMINDER' | 'SUCCESS' | 'ALERT' | 'TIMER' | 'SILENT';

class AudioService {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public playSound(type: SoundCategory) {
    if (type === 'SILENT') return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'SUCCESS') {
        // High upbeat fanfare 3-tone arpeggio (C5 -> E5 -> G5)
        this.playTone(ctx, 523.25, now, 0.1, 'sine');
        this.playTone(ctx, 659.25, now + 0.08, 0.1, 'sine');
        this.playTone(ctx, 783.99, now + 0.16, 0.2, 'sine');
      } else if (type === 'REMINDER') {
        // Gentle double chime (A4 -> C5)
        this.playTone(ctx, 440.0, now, 0.12, 'sine');
        this.playTone(ctx, 523.25, now + 0.14, 0.18, 'sine');
      } else if (type === 'ALERT') {
        // Distinct warning tone (E5 -> D#5)
        this.playTone(ctx, 659.25, now, 0.15, 'triangle');
        this.playTone(ctx, 622.25, now + 0.15, 0.25, 'triangle');
      } else if (type === 'TIMER') {
        // Workout rest timer completion double-beep
        this.playTone(ctx, 880.0, now, 0.08, 'square');
        this.playTone(ctx, 880.0, now + 0.1, 0.12, 'square');
      } else {
        // DEFAULT subtle notification chime (G4 -> C5)
        this.playTone(ctx, 392.0, now, 0.1, 'sine');
        this.playTone(ctx, 523.25, now + 0.1, 0.15, 'sine');
      }
    } catch (e) {
      console.warn('[AudioService] Play error:', e);
    }
  }

  private playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = 'sine'
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audioService = new AudioService();
