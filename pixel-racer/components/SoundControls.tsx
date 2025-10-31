"use client";

import { useState, useEffect } from "react";
import soundManager from "@/lib/soundManager";

export default function SoundControls() {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Initialize sound on component mount
    // Note: Some browsers require user interaction before playing audio
    const handleFirstInteraction = () => {
      if (!soundManager.isInitialized) {
        soundManager.init();
      }
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const toggleMusic = () => {
    if (!soundManager.isInitialized) {
      soundManager.init();
    }

    const playing = soundManager.toggleMusic();
    setIsMusicPlaying(playing);
  };

  const toggleMute = () => {
    if (!soundManager.isInitialized) return;

    if (isMuted) {
      soundManager.setMasterVolume(0.5);
      setIsMuted(false);
    } else {
      soundManager.setMasterVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="sound-controls">
      <button
        className="sound-toggle-btn"
        onClick={() => setShowControls(!showControls)}
        title="Sound Settings"
      >
        {isMuted ? "🔇" : "🔊"}
      </button>

      {showControls && (
        <div className="sound-panel">
          <div className="sound-option">
            <button className="sound-btn" onClick={toggleMusic}>
              {isMusicPlaying ? "⏸️" : "▶️"} Music
            </button>
          </div>
          <div className="sound-option">
            <button className="sound-btn" onClick={toggleMute}>
              {isMuted ? "🔇" : "🔊"} {isMuted ? "Unmute" : "Mute"}
            </button>
          </div>
          <div className="sound-info">
            <small>🎵 Retro 8-bit soundtrack</small>
          </div>
        </div>
      )}
    </div>
  );
}
