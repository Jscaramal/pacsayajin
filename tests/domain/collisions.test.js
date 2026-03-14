import assert from "assert";
import { describe, it } from "mocha";
import { FRIGHTENED_DURATION, BOSS_SPEED, POWER_SPEED } from "../../src/core/constants.js";
import { createBoss, createGhost, createPacman } from "../../src/domain/entities.js";
import {
  activatePower,
  collectPellet,
  updateSurvivalTimer
} from "../../src/domain/collisions.js";

function createState() {
  return {
    map: [
      ["#", "#", "#"],
      ["#", ".", "#"],
      ["#", "#", "#"]
    ],
    pacman: createPacman(1, 1),
    ghosts: [createGhost(1, 1, 0)],
    pelletsLeft: 1,
    totalPellets: 1,
    safeTimer: 0,
    frightenedTimer: 0,
    eatenGhostCombo: 0,
    bossTriggered: false,
    bossIntroTimer: 0,
    bossIntroDuration: 60,
    gameOver: false,
    started: true,
    audio: {
      playBossIntro() {},
      playChomp() {},
      playPower() {}
    }
  };
}

describe("collisions", () => {
  it("collects a normal pellet and scores 10 points", () => {
    const state = createState();
    state.score = 0;

    collectPellet(state);

    assert.equal(state.map[1][1], " ");
    assert.equal(state.pelletsLeft, 0);
    assert.equal(state.score, 10);
  });

  it("collects a power pellet and enables power mode", () => {
    const state = createState();
    state.map[1][1] = "o";
    state.score = 0;

    collectPellet(state);

    assert.equal(state.map[1][1], " ");
    assert.equal(state.pelletsLeft, 0);
    assert.equal(state.score, 50);
    assert.equal(state.frightenedTimer, FRIGHTENED_DURATION);
    assert.equal(state.pacman.speed, POWER_SPEED);
    assert.equal(state.ghosts[0].frightened, true);
  });

  it("uses boss power speed when the boss is active", () => {
    const state = createState();
    state.ghosts = [createBoss(1, 1)];

    activatePower(state, FRIGHTENED_DURATION);

    assert.equal(state.pacman.speed, BOSS_SPEED);
    assert.equal(state.frightenedTimer, FRIGHTENED_DURATION);
  });

  it("does not activate power mode automatically over time", () => {
    const state = createState();

    for (let index = 0; index < 500; index += 1) {
      updateSurvivalTimer(state);
    }

    assert.equal(state.safeTimer, 500);
    assert.equal(state.frightenedTimer, 0);
  });
});
