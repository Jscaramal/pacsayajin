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
  bindTouchButton(elements.touchUp, () => move(game, "up"));
  bindTouchButton(elements.touchLeft, () => move(game, "left"));
  bindTouchButton(elements.touchRight, () => move(game, "right"));
  bindTouchButton(elements.touchDown, () => move(game, "down"));
  bindTouchButton(elements.touchPause, () => {
    game.audio.ensure();
    game.togglePause();
  });
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
