"use client";

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

export default function MobileControls({
  onMoveLeft,
  onMoveRight,
}: MobileControlsProps) {
  return (
    <div className="mobile-controls" id="mobileControls">
      <button className="mobile-btn" onClick={onMoveLeft}>
        ◄
      </button>
      <button className="mobile-btn" onClick={onMoveRight}>
        ►
      </button>
    </div>
  );
}
