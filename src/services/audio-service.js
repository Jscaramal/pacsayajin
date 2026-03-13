export class AudioService {
  constructor() {
    this.audioCtx = null;
    this.powerLoop = null;
    this.powerLoopOn = false;
  }

  ensure() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  sync(state) {
    if (!this.audioCtx) return;
    if (state.frightenedTimer > 0 && !this.powerLoopOn) {
      this.startPowerLoop();
    } else if (state.frightenedTimer <= 0 && this.powerLoopOn) {
      this.stopPowerLoop();
    }
  }

  beep(freq, duration, type = "square", volume = 0.03, slideTo = null, delay = 0) {
    if (!this.audioCtx) return;
    const now = this.audioCtx.currentTime + delay;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playChomp() {
    this.beep(220, 0.04, "square", 0.02, 180);
  }

  playPower() {
    this.beep(140, 0.16, "sawtooth", 0.018, 220);
    this.beep(220, 0.22, "triangle", 0.02, 440, 0.04);
    this.beep(330, 0.28, "sawtooth", 0.014, 660, 0.08);
  }

  playEatGhost() {
    this.beep(600, 0.07, "sawtooth", 0.03, 420);
    this.beep(760, 0.08, "sawtooth", 0.025, 500, 0.045);
  }

  playAlert() {
    this.beep(900, 0.08, "square", 0.035, 700);
    this.beep(520, 0.1, "square", 0.028, 420, 0.1);
  }

  playBossIntro() {
    this.beep(190, 0.35, "sawtooth", 0.03, 140);
    this.beep(160, 0.35, "triangle", 0.024, 120, 0.15);
    this.beep(120, 0.45, "sine", 0.03, 90, 0.32);
  }

  playExtraLife() {
    this.beep(523.25, 0.09, "square", 0.03, 659.25);
    this.beep(659.25, 0.09, "square", 0.03, 783.99, 0.08);
    this.beep(783.99, 0.1, "square", 0.03, 1046.5, 0.16);
    this.beep(1046.5, 0.15, "triangle", 0.032, 1174.66, 0.25);
  }

  playWin() {
    [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
      this.beep(note, 0.16, "triangle", 0.03, note * 1.03, index * 0.12);
    });
  }

  startPowerLoop() {
    if (!this.audioCtx || this.powerLoopOn) return;

    const baseGain = this.audioCtx.createGain();
    baseGain.gain.value = 0.018;
    baseGain.connect(this.audioCtx.destination);

    const oscA = this.audioCtx.createOscillator();
    oscA.type = "triangle";
    oscA.frequency.value = 196;
    oscA.connect(baseGain);

    const oscB = this.audioCtx.createOscillator();
    oscB.type = "sine";
    oscB.frequency.value = 293.66;
    oscB.connect(baseGain);

    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.frequency.value = 5.4;
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain);
    lfoGain.connect(oscB.frequency);

    oscA.start();
    oscB.start();
    lfo.start();

    this.powerLoop = { oscA, oscB, lfo, baseGain };
    this.powerLoopOn = true;
  }

  stopPowerLoop() {
    if (!this.powerLoop) return;
    const now = this.audioCtx.currentTime;
    this.powerLoop.baseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    this.powerLoop.oscA.stop(now + 0.1);
    this.powerLoop.oscB.stop(now + 0.1);
    this.powerLoop.lfo.stop(now + 0.1);
    this.powerLoop = null;
    this.powerLoopOn = false;
  }
}
