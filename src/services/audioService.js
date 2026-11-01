/**
 * Web Audio API Emergency Siren Synthesizer
 * Generates an authentic dual-tone emergency flood warning siren
 * using standard HTML5 AudioContext (no external audio files needed).
 */

class EmergencyAudioService {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.lfo = null;
    this.isPlaying = false;
    this.isMuted = false;
  }

  _initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startSiren() {
    if (this.isMuted || this.isPlaying) return;

    try {
      this._initContext();
      if (!this.audioCtx) return;

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.25, this.audioCtx.currentTime + 0.3);
      this.gainNode.connect(this.audioCtx.destination);

      // Main siren carrier oscillator (sawtooth / triangle for piercing emergency alert tone)
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(850, this.audioCtx.currentTime);

      // Frequency Modulator (LFO) for the classic rising/falling siren sweep
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.type = 'triangle';
      this.lfo.frequency.setValueAtTime(0.5, this.audioCtx.currentTime); // 2-second cycle

      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(320, this.audioCtx.currentTime); // Modulate between ~530Hz and ~1170Hz

      this.lfo.connect(lfoGain);
      lfoGain.connect(this.oscillator.frequency);

      this.oscillator.connect(this.gainNode);

      this.oscillator.start();
      this.lfo.start();
      this.isPlaying = true;
    } catch (err) {
      console.warn('Emergency siren audio initialization blocked by browser policy:', err);
    }
  }

  stopSiren() {
    if (!this.isPlaying) return;

    try {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.2);
      }
      setTimeout(() => {
        if (this.oscillator) {
          try { this.oscillator.stop(); } catch (e) {}
          this.oscillator.disconnect();
          this.oscillator = null;
        }
        if (this.lfo) {
          try { this.lfo.stop(); } catch (e) {}
          this.lfo.disconnect();
          this.lfo = null;
        }
        this.isPlaying = false;
      }, 250);
    } catch (err) {
      this.isPlaying = false;
    }
  }

  testSiren(durationSeconds = 3) {
    this.startSiren();
    setTimeout(() => {
      this.stopSiren();
    }, durationSeconds * 1000);
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlaying) {
      this.stopSiren();
    }
    return this.isMuted;
  }
}

export const audioService = new EmergencyAudioService();
