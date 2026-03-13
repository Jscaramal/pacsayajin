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

  bindTouchControls(game, elements);
}

function sanitizeNick(value) {
  return String(value || "").trim().slice(0, 16);
}

function bindTouchControls(game, elements) {
  bindTouchButton(elements.touchPause, () => {
    game.audio.ensure();
    game.togglePause();
  });
  bindCanvasSwipe(game, elements.canvas);
}

function bindTouchButton(button, onPress) {
  if (!button) return;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    onPress();
  });

  button.addEventListener("click", (event) => {
    event.preventDefault();
  });
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
}
