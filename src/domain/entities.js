import {
  BOSS_COOLDOWN_FRAMES,
  BOSS_COOLDOWN_SPEED,
  BOSS_RUSH_FRAMES,
  BOSS_SPEED,
  GHOST_COLORS,
  GHOST_SPEED,
  NORMAL_SPEED
} from "../core/constants.js";

export function createPacman(x = 0, y = 0) {
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    dir: "left",
    nextDir: "left",
    progress: 0,
    speed: NORMAL_SPEED,
    mouth: 0,
    anim: 0,
    auraPulse: 0
  };
}

export function createGhost(x, y, index) {
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    homeX: x,
    homeY: y,
    dir: "left",
    progress: 0,
    speed: GHOST_SPEED,
    color: GHOST_COLORS[index % GHOST_COLORS.length],
    isGhost: true,
    frightened: false,
    respawnTimer: 0,
    chaseTimer: 0,
    freezeTimer: 0,
    isBoss: false,
    rushTimer: 0,
    cooldownTimer: 0
  };
}

export function createBoss(x, y) {
  return {
    x,
    y,
    prevX: x,
    prevY: y,
    homeX: x,
    homeY: y,
    dir: "left",
    progress: 0,
    speed: BOSS_COOLDOWN_SPEED,
    color: "#050505",
    isGhost: true,
    frightened: false,
    respawnTimer: 0,
    chaseTimer: 0,
    freezeTimer: 0,
    isBoss: true,
    rushTimer: 0,
    cooldownTimer: BOSS_COOLDOWN_FRAMES,
    rushSpeed: BOSS_SPEED,
    cooldownSpeed: BOSS_COOLDOWN_SPEED
  };
}
