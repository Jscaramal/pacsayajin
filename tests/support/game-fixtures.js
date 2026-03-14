import { Game } from "../../src/core/game.js";

export function createGame(overrides = {}) {
  const renderer = overrides.renderer || { render() {} };
  const storage = overrides.storage || createStorage();
  const audio = overrides.audio || createAudio();
  const elements = overrides.elements || createElements();

  return new Game({
    renderer,
    storage,
    audio,
    elements
  });
}

export function createAudio() {
  return {
    ensure() {},
    sync() {},
    playAlert() {},
    playBossIntro() {},
    playChomp() {},
    playEatGhost() {},
    playExtraLife() {},
    playPower() {},
    playWin() {}
  };
}

export function createElements() {
  return {
    score: { textContent: "" },
    highscore: { textContent: "" },
    lives: { textContent: "", innerHTML: "" },
    status: { textContent: "" },
    canvas: {
      classList: {
        toggle() {}
      }
    },
    rankingList: {
      innerHTML: ""
    },
    playerHint: { textContent: "" }
  };
}

export function createStorage() {
  return {
    getHighscore() {
      return 0;
    },
    getLastNick() {
      return "";
    },
    getRanking() {
      return [];
    },
    loadRanking() {
      return Promise.resolve([]);
    },
    saveRankingEntry() {
      return Promise.resolve();
    },
    saveLastNick() {}
  };
}
