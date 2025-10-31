/**
 * Sound Manager for Pixel Racer
 * Generates retro 8-bit style sounds using Web Audio API
 * No external audio files needed!
 */

interface VolumeSettings {
  master: number;
  music: number;
  sfx: number;
}

interface MelodyNote {
  freq: number;
  duration: number;
}

class SoundManager {
  audioContext: AudioContext | null = null;
  masterGain: GainNode | null = null;
  musicGain: GainNode | null = null;
  sfxGain: GainNode | null = null;
  isInitialized: boolean = false;
  isMusicPlaying: boolean = false;
  musicOscillators: OscillatorNode[] = [];
  musicTimeout: ReturnType<typeof setTimeout> | null = null;

  // Volume settings (0.0 to 1.0)
  volumes: VolumeSettings = {
    master: 0.5,
    music: 0.3,
    sfx: 0.4,
  };

  /**
   * Initialize the audio context
   * Must be called after user interaction due to browser autoplay policies
   */
  init(): void {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create gain nodes for volume control
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = this.volumes.master;
      this.masterGain.connect(this.audioContext.destination);

      this.musicGain = this.audioContext.createGain();
      this.musicGain.gain.value = this.volumes.music;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = this.volumes.sfx;
      this.sfxGain.connect(this.masterGain);

      this.isInitialized = true;
      console.log("🔊 Sound Manager initialized!");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
    }
  }

  /**
   * Play a retro beep sound for movement (left/right)
   */
  playMoveSound(direction: "left" | "right" = "left"): void {
    if (!this.isInitialized || !this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    // Different frequencies for left and right
    oscillator.frequency.value = direction === "left" ? 400 : 500;
    oscillator.type = "square"; // Retro square wave

    // Quick beep envelope
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    oscillator.start(now);
    oscillator.stop(now + 0.08);

    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Play a jump sound effect
   */
  playJumpSound(): void {
    if (!this.isInitialized || !this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    // Rising pitch for jump effect
    oscillator.frequency.setValueAtTime(200, now);
    oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    oscillator.type = "sawtooth";

    // Jump envelope
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    oscillator.start(now);
    oscillator.stop(now + 0.2);

    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Play a celebration sound for new high score
   */
  playCelebrationSound(): void {
    if (!this.isInitialized || !this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Play a triumphant ascending melody
    const notes = [
      { freq: 523.25, time: 0 }, // C5
      { freq: 659.25, time: 0.15 }, // E5
      { freq: 783.99, time: 0.3 }, // G5
      { freq: 1046.5, time: 0.45 }, // C6
    ];

    notes.forEach((note) => {
      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.sfxGain!);

      oscillator.frequency.value = note.freq;
      oscillator.type = "triangle"; // Warm, pleasant sound

      const startTime = now + note.time;

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);

      // Clean up
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    });
  }

  /**
   * Play a crash/collision sound
   */
  playCrashSound(): void {
    if (!this.isInitialized || !this.audioContext || !this.sfxGain) return;

    const now = this.audioContext.currentTime;

    // Create noise for crash effect
    const bufferSize = this.audioContext.sampleRate * 0.3;
    const buffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const data = buffer.getChannelData(0);

    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = this.audioContext.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.3);

    // Clean up
    noise.onended = () => {
      noise.disconnect();
      filter.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Start playing background music
   * Simple retro melody loop
   */
  startBackgroundMusic(): void {
    if (!this.isInitialized || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.playMusicLoop();
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic(): void {
    if (!this.isMusicPlaying) return;

    this.isMusicPlaying = false;

    // Stop all music oscillators
    this.musicOscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Oscillator might already be stopped
      }
    });
    this.musicOscillators = [];

    // Clear timeout
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  /**
   * Play a simple retro melody loop
   */
  playMusicLoop(): void {
    if (!this.isMusicPlaying || !this.audioContext || !this.musicGain) return;

    // Simple melody notes (C major scale pattern)
    const melody: MelodyNote[] = [
      { freq: 523.25, duration: 0.3 }, // C5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 783.99, duration: 0.3 }, // G5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 698.46, duration: 0.3 }, // F5
      { freq: 783.99, duration: 0.3 }, // G5
      { freq: 880.0, duration: 0.6 }, // A5
      { freq: 783.99, duration: 0.3 }, // G5
      { freq: 659.25, duration: 0.3 }, // E5
      { freq: 523.25, duration: 0.6 }, // C5
    ];

    const now = this.audioContext.currentTime;
    let currentTime = now;

    melody.forEach((note, index) => {
      if (!this.isMusicPlaying) return;

      const oscillator = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.musicGain!);

      oscillator.frequency.value = note.freq;
      oscillator.type = "square"; // Retro square wave

      // Envelope for each note
      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(
        0.15,
        currentTime + note.duration * 0.7
      );
      gainNode.gain.linearRampToValueAtTime(0.01, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);

      this.musicOscillators.push(oscillator);

      // Clean up when note ends
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
        const idx = this.musicOscillators.indexOf(oscillator);
        if (idx > -1) {
          this.musicOscillators.splice(idx, 1);
        }
      };

      currentTime += note.duration;
    });

    // Calculate total loop duration
    const totalDuration = melody.reduce((sum, note) => sum + note.duration, 0);

    // Schedule next loop
    this.musicTimeout = setTimeout(() => {
      if (this.isMusicPlaying) {
        this.playMusicLoop();
      }
    }, totalDuration * 1000);
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(value: number): void {
    if (!this.isInitialized || !this.masterGain) return;
    this.volumes.master = Math.max(0, Math.min(1, value));
    this.masterGain.gain.value = this.volumes.master;
  }

  /**
   * Set music volume (0.0 to 1.0)
   */
  setMusicVolume(value: number): void {
    if (!this.isInitialized || !this.musicGain) return;
    this.volumes.music = Math.max(0, Math.min(1, value));
    this.musicGain.gain.value = this.volumes.music;
  }

  /**
   * Set sound effects volume (0.0 to 1.0)
   */
  setSfxVolume(value: number): void {
    if (!this.isInitialized || !this.sfxGain) return;
    this.volumes.sfx = Math.max(0, Math.min(1, value));
    this.sfxGain.gain.value = this.volumes.sfx;
  }

  /**
   * Toggle background music on/off
   */
  toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
    return this.isMusicPlaying;
  }

  /**
   * Clean up and release resources
   */
  cleanup(): void {
    this.stopBackgroundMusic();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
