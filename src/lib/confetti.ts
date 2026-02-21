import confetti from "canvas-confetti";

export const fireConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"],
  });
};

export const fireConfettiBurst = () => {
  const end = Date.now() + 600;
  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};

export const fireStars = () => {
  confetti({
    particleCount: 50,
    spread: 360,
    ticks: 60,
    origin: { x: 0.5, y: 0.5 },
    shapes: ["star"],
    colors: ["#fbbf24", "#f59e0b", "#d97706"],
  });
};
