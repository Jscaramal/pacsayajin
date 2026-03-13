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
  let secretBuffer = "";

  window.addEventListener("keydown", (event) => {
    if (isEditableTarget(event.target)) return;

    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (event.key.length === 1) {
      secretBuffer = `${secretBuffer}${key}`.slice(-8);
      if (secretBuffer === "_pop") {
        game.toggleSecretDebug();
        secretBuffer = "";
        return;
      }
      const levelShortcut = secretBuffer.match(/l(\d+)$/);
      if (levelShortcut) {
        game.goToLevelTest(Number(levelShortcut[1]));
        secretBuffer = "";
        return;
      }
    }

    if (key === "b") {
      event.preventDefault();
      game.triggerBossTest();
      return;
    }

    if (key === "p") {
      event.preventDefault();
      game.triggerPowerTest();
      return;
    }

    if (key === "h") {
      event.preventDefault();
      game.restoreLifeTest();
      return;
    }

    if (key === "n") {
      event.preventDefault();
      game.disableBossTest();
      return;
    }

    if (key === "g") {
      event.preventDefault();
      game.toggleGhostMovementTest();
      return;
    }

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
