"use client";

export default function AboutSidebar() {
  return (
    <aside className="left-sidebar">
      <div className="sidebar-panel">
        <h2 className="panel-title">📖 ABOUT</h2>
        <div className="panel-content">
          <p className="about-text">
            <strong>PIXEL RACER</strong> is a retro-style arcade racing game
            where you dodge obstacles on an endless highway.
          </p>
          <div className="about-section">
            <h3>🎮 GAMEPLAY</h3>
            <ul className="about-list">
              <li>Dodge incoming obstacles</li>
              <li>Jump over hazards</li>
              <li>Survive as long as possible</li>
              <li>Speed increases over time</li>
            </ul>
          </div>
          <div className="about-section">
            <h3>🕹️ CONTROLS</h3>
            <ul className="about-list">
              <li>
                <strong>SPACE</strong> - Start/Restart
              </li>
              <li>
                <strong>← →</strong> or <strong>A D</strong> - Move
              </li>
              <li>
                <strong>↑</strong> or <strong>W</strong> - Jump
              </li>
            </ul>
          </div>
          <div className="about-section">
            <h3>⚡ DIFFICULTY</h3>
            <p className="about-text">
              The game progressively gets harder! Speed increases from 1.0x to
              2.5x as you play. Watch the speed bar!
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
