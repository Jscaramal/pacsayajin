const KEY_TO_DIR = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down"
};

export function bindKeyboard(game) {
  window.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) return;

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === " ") {
      event.preventDefault();
      game.togglePause();
      return;
    }

    const direction = KEY_TO_DIR[key];
    if (!direction) return;

    event.preventDefault();
    if (!game.state.startArmed) return;
    game.audio.ensure();
    game.start();
    game.setDirection(direction);
  });
}

function isEditableTarget(target) {
  return target instanceof HTMLElement
    && (target.tagName === "INPUT"
      || target.tagName === "TEXTAREA"
      || target.isContentEditable);
}
