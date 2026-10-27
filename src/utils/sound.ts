/**
 * Web Audio API Sound Synthesizer for Retro Arcade Tetris
 * Works without external MP3 files - 100% reliable and zero latency
 */

class SoundController {
  private ctx: AudioContext | null = null;
  public sfxEnabled: boolean = true;
  public bgmEnabled: boolean = false;
  private bgmOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private bgmIntervalId: any = null;

  constructor() {
    // Read user preferences if available
    try {
      const savedSfx = localStorage.getItem('tetris_sfx');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      const savedBgm = localStorage.getItem('tetris_bgm');
      if (savedBgm !== null) this.bgmEnabled = savedBgm === 'true';
    } catch (e) {
      // ignore
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfx(enabled: boolean) {
    this.sfxEnabled = enabled;
    try {
      localStorage.setItem('tetris_sfx', String(enabled));
    } catch (e) {}
  }

  public setBgm(enabled: boolean) {
    this.bgmEnabled = enabled;
    try {
      localStorage.setItem('tetris_bgm', String(enabled));
    } catch (e) {}

    if (enabled) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  }

  public playMove() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  public playRotate() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch (e) {}
  }

  public playHold() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  public playHardDrop() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {}
  }

  public playClear(lineCount: number) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      if (lineCount >= 4) {
        // TETRIS 4-Line Clear Fanfare!
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const start = this.ctx!.currentTime + idx * 0.08;
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.09, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(start);
          osc.stop(start + 0.25);
        });
      } else {
        // Standard line clear
        const notes = [392.00, 523.25, 659.25].slice(0, lineCount + 1);
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const start = this.ctx!.currentTime + idx * 0.06;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);
          osc.start(start);
          osc.stop(start + 0.18);
        });
      }
    } catch (e) {}
  }

  public playLevelUp() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const freqs = [330, 392, 494, 659];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const time = this.ctx!.currentTime + i * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, time);
        gain.gain.setValueAtTime(0.09, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(time);
        osc.stop(time + 0.15);
      });
    } catch (e) {}
  }

  public playGameOver() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const freqs = [440, 370, 311, 220];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const time = this.ctx!.currentTime + i * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, time);
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(time);
        osc.stop(time + 0.2);
      });
    } catch (e) {}
  }

  public startBGM() {
    this.stopBGM();
    this.initContext();
    if (!this.ctx) return;

    // Iconic Russian Korobeiniki theme / Tetris A type theme synthesizer loop
    // Notes frequencies in Hz
    const melody: [number, number][] = [
      [659.25, 0.4], [493.88, 0.2], [523.25, 0.2], [587.33, 0.4], [523.25, 0.2], [493.88, 0.2],
      [440.00, 0.4], [440.00, 0.2], [523.25, 0.2], [659.25, 0.4], [587.33, 0.2], [523.25, 0.2],
      [493.88, 0.6], [523.25, 0.2], [587.33, 0.4], [659.25, 0.4],
      [523.25, 0.4], [440.00, 0.4], [440.00, 0.4], [0, 0.2],
      [587.33, 0.4], [698.46, 0.2], [880.00, 0.4], [783.99, 0.2], [698.46, 0.2],
      [659.25, 0.6], [523.25, 0.2], [659.25, 0.4], [587.33, 0.2], [523.25, 0.2],
      [493.88, 0.4], [493.88, 0.2], [523.25, 0.2], [587.33, 0.4], [659.25, 0.4],
      [523.25, 0.4], [440.00, 0.4], [440.00, 0.4], [0, 0.2]
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.bgmEnabled || !this.ctx) return;
      const [freq, dur] = melody[noteIdx];
      noteIdx = (noteIdx + 1) % melody.length;

      if (freq > 0) {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur * 0.95);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + dur * 0.95);
        } catch (e) {}
      }

      this.bgmIntervalId = setTimeout(playNextNote, dur * 1000);
    };

    playNextNote();
  }

  public stopBGM() {
    if (this.bgmIntervalId) {
      clearTimeout(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
  }
}

export const sound = new SoundController();
