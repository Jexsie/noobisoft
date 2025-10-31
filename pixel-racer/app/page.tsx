"use client";

import { useState } from "react";
import Header from "@/components/Header";
import AboutSidebar from "@/components/AboutSidebar";
import NFTCarSkins from "@/components/NFTCarSkins";
import GameCanvas from "@/components/GameCanvas";
import LeaderboardModal from "@/components/LeaderboardModal";
import SoundControls from "@/components/SoundControls";

export default function Home() {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [selectedCarColor, setSelectedCarColor] = useState("#00bfff");

  return (
    <>
      <Header onLeaderboardClick={() => setShowLeaderboard(true)} />

      <div className="main-content">
        <AboutSidebar />

        <GameCanvas carColor={selectedCarColor} />

        <NFTCarSkins
          selectedColor={selectedCarColor}
          onColorChange={setSelectedCarColor}
        />
      </div>

      <SoundControls />

      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}
    </>
  );
}
