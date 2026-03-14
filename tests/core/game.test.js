import assert from "assert";
import { describe, it } from "mocha";
import { createGame } from "../support/game-fixtures.js";

describe("Game", () => {
  it("advances to the next level during normal play", () => {
    const game = createGame();
    game.state.map = [
      ["#", "#", "#"],
      ["#", ".", "#"],
      ["#", "#", "#"]
    ];
    game.state.pacman.x = 1;
    game.state.pacman.y = 1;
    game.state.pacman.prevX = 1;
    game.state.pacman.prevY = 1;
    game.state.baseTileSet = new Set();
    game.state.baseDoor = null;
    game.state.pelletsLeft = 1;
    game.state.totalPellets = 1;
    game.state.ghosts = [];
    game.state.startArmed = true;
    game.state.started = true;

    game.tick();

    assert.equal(game.state.currentLevel, 2);
    assert.equal(game.state.levelTransition, true);
    assert.equal(game.state.started, false);
  });

  it("wins the game after the last pellet on the final level", () => {
    const game = createGame();
    game.applyLevelToState(game.state, 3);
    game.state.map = [
      ["#", "#", "#"],
      ["#", ".", "#"],
      ["#", "#", "#"]
    ];
    game.state.pacman.x = 1;
    game.state.pacman.y = 1;
    game.state.pacman.prevX = 1;
    game.state.pacman.prevY = 1;
    game.state.baseTileSet = new Set();
    game.state.baseDoor = null;
    game.state.pelletsLeft = 1;
    game.state.totalPellets = 1;
    game.state.ghosts = [];
    game.state.startArmed = true;
    game.state.started = true;

    game.tick();

    assert.equal(game.state.currentLevel, 3);
    assert.equal(game.state.won, true);
    assert.equal(game.state.gameOver, true);
  });

  it("keeps level test shortcuts locked outside secret mode", () => {
    const game = createGame();

    game.goToLevelTest(2);

    assert.equal(game.state.currentLevel, 1);
  });

  it("allows level test shortcuts after enabling secret mode", () => {
    const game = createGame();
    game.toggleSecretDebug();

    game.goToLevelTest(2);

    assert.equal(game.state.currentLevel, 2);
    assert.equal(game.state.levelTransition, true);
  });
});
