import { renderRanking } from "../render/hud-renderer.js";

export function bindUi(game, elements) {
  elements.nickname.value = game.state.nickname;
  renderRanking(game.storage, elements.rankingList);

  elements.startBtn.addEventListener("click", () => {
    const nickname = sanitizeNick(elements.nickname.value);
    game.setNickname(nickname);
    game.audio.ensure();
    game.armStart();
  });

  elements.restartBtn.addEventListener("click", () => {
    game.audio.ensure();
    game.restart();
  });

  elements.nickname.addEventListener("change", () => {
    const nickname = sanitizeNick(elements.nickname.value);
    elements.nickname.value = nickname;
    game.setNickname(nickname);
  });

  bindInfoModal(elements);
  bindTouchControls(game, elements);
}

function sanitizeNick(value) {
  return String(value || "").trim().slice(0, 16);
}

function bindTouchControls(game, elements) {
  bindCanvasSwipe(game, elements.canvas);
}

function move(game, direction) {
  if (!game.state.startArmed) return;
  game.audio.ensure();
  game.start();
  game.setDirection(direction);
}

function bindCanvasSwipe(game, canvas) {
  if (!canvas) return;

  let startX = 0;
  let startY = 0;
  let activePointerId = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;
  let lastTapAt = 0;

  canvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
  });

  canvas.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch" || event.pointerId !== activePointerId) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const threshold = 18;

    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move(game, deltaX > 0 ? "right" : "left");
    } else {
      move(game, deltaY > 0 ? "down" : "up");
    }

    startX = event.clientX;
    startY = event.clientY;
  });

  const clearPointer = (event) => {
    if (event.pointerId === activePointerId) activePointerId = null;
  };

  canvas.addEventListener("pointerup", clearPointer);
  canvas.addEventListener("pointercancel", clearPointer);

  canvas.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    const now = Date.now();
    if (now - lastTapAt < 280) {
      event.preventDefault();
      game.audio.ensure();
      game.togglePause();
      lastTapAt = 0;
      touchActive = false;
      return;
    }

    lastTapAt = now;
    touchActive = true;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: false });

  canvas.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];
    if (!touch || !touchActive) return;

    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;
    const threshold = 18;

    if (Math.abs(deltaX) < threshold && Math.abs(deltaY) < threshold) return;

    event.preventDefault();
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      move(game, deltaX > 0 ? "right" : "left");
    } else {
      move(game, deltaY > 0 ? "down" : "up");
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: false });

  const clearTouch = () => {
    touchActive = false;
  };

  canvas.addEventListener("touchend", clearTouch, { passive: true });
  canvas.addEventListener("touchcancel", clearTouch, { passive: true });
}

function bindInfoModal(elements) {
  const open = () => {
    elements.infoModal.classList.remove("hidden");
    elements.infoModal.setAttribute("aria-hidden", "false");
  };

  const close = () => {
    elements.infoModal.classList.add("hidden");
    elements.infoModal.setAttribute("aria-hidden", "true");
  };

  elements.infoBtn.addEventListener("click", open);
  elements.closeInfoBtn.addEventListener("click", close);
  elements.infoModal.addEventListener("click", (event) => {
    if (event.target === elements.infoModal) close();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
