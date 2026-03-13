import {
  AUTO_POWER_INTERVAL,
  BOSS_BANNER_DURATION,
  BOSS_INTRO_DURATION,
  FPS,
  MAX_LIVES
} from "./constants.js";
import { LEVEL_01 } from "../data/level-01.js";
import { chooseGhostDir, updateGhostState } from "../domain/ghost-ai.js";
import {
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
    const level = buildLevel(LEVEL_01);
    const baseTileSet = new Set(level.baseTiles.map(({ x, y }) => `${x},${y}`));

    return {
      map: level.map,
      pacman: level.pacman,
      ghosts: level.ghosts,
      baseTiles: level.baseTiles,
      baseTileSet,
      baseDoor: level.baseDoor,
      pelletsLeft: level.pelletsLeft,
      totalPellets: level.totalPellets,
      spawn: {
        pacman: { x: level.pacman.x, y: level.pacman.y },
        ghosts: level.ghosts.map((ghost) => ({ x: ghost.x, y: ghost.y }))
      },
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
      scoreSaved: false,
      damageFlashTimer: 0,
      invulnerableTimer: 0,
      safeTimer: 0,
      autoPowerInterval: AUTO_POWER_INTERVAL,
      eatenGhostCombo: 0,
      bossTriggered: false,
      bossIntroTimer: 0,
      bossIntroDuration: BOSS_INTRO_DURATION,
      bossBannerTimer: 0,
      storage: this.storage,
      audio: this.audio
    };
  }

  armStart() {
    if (this.state.gameOver) return;
    this.state.startArmed = true;
    this.state.started = false;
    this.state.paused = false;
  }

  start() {
    if (!this.state.gameOver && this.state.startArmed) this.state.started = true;
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
    this.elements.playerHint.textContent = nickname
      ? `Pontuacoes serao salvas para ${nickname}.`
      : "Defina seu nick para salvar o ranking.";
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
        this.persistScore();
        return;
      }
    }

    state.pacman.anim += 0.22;
    state.pacman.mouth = (Math.sin(state.pacman.anim) + 1) / 2;

    state.ghosts.forEach((ghost) => {
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
    if (this.state.nickname) {
      this.storage
        .saveRankingEntry(this.state.nickname, this.state.score)
        .finally(() => renderRanking(this.storage, this.elements.rankingList));
    }
    this.state.scoreSaved = true;
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
      .finally(() => renderRanking(this.storage, this.elements.rankingList));
    this.render();
    window.requestAnimationFrame(this.loop);
  }
}
