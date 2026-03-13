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
}

function sanitizeNick(value) {
  return String(value || "").trim().slice(0, 16);
}
