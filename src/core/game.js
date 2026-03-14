import {
  BOSS_BANNER_DURATION,
  BOSS_INTRO_DURATION,
  FPS,
  FRIGHTENED_DURATION,
  MAX_LIVES
} from "./constants.js";
import { LEVEL_01 } from "../data/level-01.js";
import { LEVEL_02 } from "../data/level-02.js";
import { LEVEL_03 } from "../data/level-03.js";
import { chooseGhostDir, updateGhostState } from "../domain/ghost-ai.js";
import {
  activatePower,
  collectPellet,
  handleGhostCollisions,
  hasWon,
  resetRoundActors,
  updatePowerMode,
  updateSurvivalTimer
} from "../domain/collisions.js";
import { buildLevel } from "../domain/level.js";
import { moveActor } from "../domain/movement.js";
import { createBoss } from "../domain/entities.js";
import { renderHud, renderRanking } from "../render/hud-renderer.js";

const LEVELS = {
  1: LEVEL_01,
  2: LEVEL_02,
  3: LEVEL_03
};

export class Game {
  constructor({ renderer, storage, audio, elements }) {
    this.renderer = renderer;
    this.storage = storage;
    this.audio = audio;
    this.elements = elements;
    this.state = this.createState();
    this.lastFrame = 0;
    this.accumulator = 0;
  }

  createState() {
    const state = {
      score: 0,
      highscore: this.storage.getHighscore(),
      lives: MAX_LIVES,
      frightenedTimer: 0,
      paused: false,
      startArmed: false,
      started: false,
      gameOver: false,
      won: false,
      nickname: this.storage.getLastNick(),
      secretDebugEnabled: false,
      ghostMovementLocked: false,
      scoreSaved: false,
      damageFlashTimer: 0,
      invulnerableTimer: 0,
      safeTimer: 0,
      eatenGhostCombo: 0,
      bossTriggered: false,
      bossIntroTimer: 0,
      bossIntroDuration: BOSS_INTRO_DURATION,
      bossBannerTimer: 0,
      currentLevel: 1,
      levelTransition: false,
      storage: this.storage,
      audio: this.audio
    };

    this.applyLevelToState(state, 1);
    return state;
  }

  applyLevelToState(state, levelNumber) {
    const levelMap = LEVELS[levelNumber] || LEVEL_01;
    const level = buildLevel(levelMap);
    const baseTileSet = new Set(level.baseTiles.map(({ x, y }) => `${x},${y}`));

    state.map = level.map;
    state.pacman = level.pacman;
    state.ghosts = level.ghosts;
    state.baseTiles = level.baseTiles;
    state.baseTileSet = baseTileSet;
    state.baseDoor = level.baseDoor;
    state.pelletsLeft = level.pelletsLeft;
    state.totalPellets = level.totalPellets;
    state.spawn = {
      pacman: { x: level.pacman.x, y: level.pacman.y },
      ghosts: level.ghosts.map((ghost) => ({ x: ghost.x, y: ghost.y }))
    };
    state.currentLevel = levelNumber;
    state.bossTriggered = false;
    state.bossIntroTimer = 0;
    state.bossBannerTimer = 0;
    state.frightenedTimer = 0;
    state.safeTimer = 0;
    state.eatenGhostCombo = 0;
    state.ghostMovementLocked = false;
  }

  syncHighscoreFromRanking() {
    this.state.highscore = this.storage.getHighscore();
  }

  armStart() {
    if (this.state.gameOver) return;
    this.state.startArmed = true;
    this.state.started = false;
    this.state.paused = false;
  }

  start() {
    if (!this.state.gameOver && this.state.startArmed) {
      this.state.started = true;
      this.state.levelTransition = false;
    }
  }

  restart() {
    this.state = this.createState();
    this.render();
  }

  togglePause() {
    if (!this.state.started || this.state.gameOver || this.state.bossIntroTimer > 0) return;
    this.state.paused = !this.state.paused;
  }

  setDirection(direction) {
    this.state.pacman.nextDir = direction;
  }

  setNickname(nickname) {
    this.state.nickname = nickname;
    this.storage.saveLastNick(nickname);
    this.updatePlayerHint();
  }

  toggleSecretDebug() {
    this.state.secretDebugEnabled = !this.state.secretDebugEnabled;
    if (!this.state.secretDebugEnabled) {
      this.state.score = 0;
      this.state.ghostMovementLocked = false;
      this.state.frightenedTimer = 0;
      this.disableBossTest(true);
    }
    this.updatePlayerHint();
    this.render();
  }

  updatePlayerHint() {
    if (this.state.secretDebugEnabled) {
      this.elements.playerHint.textContent = "Modo teste ativo. Esta partida nao salva ranking.";
      return;
    }

    this.elements.playerHint.textContent = this.state.nickname
      ? `Pontuacoes serao salvas para ${this.state.nickname}.`
      : "Defina seu nick para salvar o ranking.";
  }

  triggerBossTest() {
    const { state } = this;
    if (state.gameOver || !state.secretDebugEnabled) return;
    state.bossTriggered = true;
    state.bossIntroTimer = 0;
    state.bossBannerTimer = BOSS_BANNER_DURATION;
    state.ghosts = [createBoss(state.baseDoor.x, state.baseDoor.y + 1)];
    this.render();
  }

  triggerPowerTest() {
    if (this.state.gameOver || !this.state.secretDebugEnabled) return;
    activatePower(this.state, FRIGHTENED_DURATION);
    this.render();
  }

  restoreLifeTest() {
    if (this.state.gameOver || !this.state.secretDebugEnabled) return;
    this.state.lives = Math.min(MAX_LIVES, this.state.lives + 1);
    this.render();
  }

  disableBossTest(force = false) {
    const { state } = this;
    if (state.gameOver || (!state.secretDebugEnabled && !force)) return;

    const level = buildLevel(LEVELS[this.state.currentLevel] || LEVEL_01);
    state.ghosts = level.ghosts;
    state.spawn.ghosts = level.ghosts.map((ghost) => ({ x: ghost.x, y: ghost.y }));
    state.bossTriggered = false;
    state.bossIntroTimer = 0;
    state.bossBannerTimer = 0;
    state.ghosts.forEach((ghost) => {
      ghost.frightened = state.frightenedTimer > 0;
    });
    if (!force) this.render();
  }

  toggleGhostMovementTest() {
    const { state } = this;
    if (state.gameOver || !state.secretDebugEnabled) return;
    state.ghostMovementLocked = !state.ghostMovementLocked;
    if (state.ghostMovementLocked) {
      state.ghosts.forEach((ghost) => {
        ghost.progress = 0;
      });
    }
    this.render();
  }

  goToLevel(levelNumber, force = false) {
    if (this.state.gameOver || (!this.state.secretDebugEnabled && !force)) return;
    if (!LEVELS[levelNumber]) return;

    this.state.started = false;
    this.state.startArmed = true;
    this.state.paused = false;
    this.applyLevelToState(this.state, levelNumber);
    this.state.levelTransition = true;
    this.render();
  }

  goToLevelTest(levelNumber) {
    this.goToLevel(levelNumber);
  }

  tick() {
    const { state } = this;
    if (!state.started || state.paused || state.gameOver) return;

    if (state.damageFlashTimer > 0) state.damageFlashTimer -= 1;
    if (state.invulnerableTimer > 0) state.invulnerableTimer -= 1;
    state.pacman.auraPulse += 0.18;

    if (state.bossIntroTimer > 0) {
      state.bossIntroTimer -= 1;
      if (state.bossIntroTimer === 0) {
        state.ghosts = [createBoss(state.baseDoor.x, state.baseDoor.y + 1)];
        state.bossBannerTimer = BOSS_BANNER_DURATION;
      }
      return;
    }

    updatePowerMode(state);
    updateSurvivalTimer(state);

    if (state.bossBannerTimer > 0) state.bossBannerTimer -= 1;

    moveActor(state.map, state.pacman, state.baseTileSet, state.baseDoor, state.pacman.nextDir);

    if (state.pacman.progress === 0) {
      collectPellet(state);
      if (hasWon(state)) {
        if (LEVELS[state.currentLevel + 1]) {
          this.advanceToNextLevel();
        } else {
          state.won = true;
          state.gameOver = true;
          state.audio.playWin();
          this.persistScore();
        }
        return;
      }
    }

    state.pacman.anim += 0.22;
    state.pacman.mouth = (Math.sin(state.pacman.anim) + 1) / 2;

    state.ghosts.forEach((ghost) => {
      if (state.ghostMovementLocked) {
        ghost.progress = 0;
        return;
      }

      updateGhostState(state, ghost);
      if (ghost.respawnTimer > 0 || ghost.freezeTimer > 0) {
        ghost.progress = 0;
        return;
      }

      if (ghost.progress === 0) {
        ghost.dir = chooseGhostDir(state, ghost);
      }
      moveActor(state.map, ghost, state.baseTileSet, state.baseDoor, ghost.dir);
    });

    handleGhostCollisions(state);
    if (state.gameOver) {
      this.persistScore();
      return;
    }
  }

  persistScore() {
    if (this.state.scoreSaved) return;
    if (this.state.nickname && !this.state.secretDebugEnabled) {
      this.storage
        .saveRankingEntry(this.state.nickname, this.state.score)
        .finally(() => {
          this.syncHighscoreFromRanking();
          renderRanking(this.storage, this.elements.rankingList);
        });
    }
    this.state.scoreSaved = true;
  }

  advanceToNextLevel() {
    this.goToLevel(this.state.currentLevel + 1, true);
  }

  render() {
    renderHud(this.state, {
      score: this.elements.score,
      highscore: this.elements.highscore,
      lives: this.elements.lives,
      status: this.elements.status,
      canvas: this.elements.canvas
    });
    this.audio.sync(this.state);
    this.renderer.render(this.state);
  }

  loop = (timestamp) => {
    if (!this.lastFrame) this.lastFrame = timestamp;
    const frameTime = timestamp - this.lastFrame;
    this.lastFrame = timestamp;
    this.accumulator += frameTime;

    const step = 1000 / FPS;
    while (this.accumulator >= step) {
      this.tick();
      this.accumulator -= step;
    }

    this.render();
    window.requestAnimationFrame(this.loop);
  };

  mount() {
    resetRoundActors(this.state);
    this.setNickname(this.state.nickname);
    this.storage
      .loadRanking()
      .finally(() => {
        this.syncHighscoreFromRanking();
        renderRanking(this.storage, this.elements.rankingList);
      });
    this.render();
    window.requestAnimationFrame(this.loop);
  }
}
