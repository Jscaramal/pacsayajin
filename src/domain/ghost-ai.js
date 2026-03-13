import {
  BOSS_COOLDOWN_FRAMES,
  BOSS_RUSH_FRAMES,
  DIRS,
  GHOST_CHASE_DURATION,
  GHOST_FREEZE_DURATION,
  GHOST_SIGHT_RANGE
} from "../core/constants.js";
import { distance, getAvailableGhostDirs, isWall } from "./movement.js";

export function updateGhostState(state, ghost) {
  if (ghost.isBoss) {
    updateBossState(ghost);
    return;
  }

  if (ghost.respawnTimer > 0) {
    ghost.respawnTimer -= 1;
    return;
  }

  if (ghost.freezeTimer > 0) {
    ghost.freezeTimer -= 1;
    return;
  }

  if (ghost.chaseTimer > 0) {
    ghost.chaseTimer -= 1;
    if (ghost.chaseTimer === 0) {
      ghost.freezeTimer = GHOST_FREEZE_DURATION;
    }
    return;
  }

  if (canSeePacman(state, ghost)) {
    ghost.chaseTimer = GHOST_CHASE_DURATION;
  }
}

export function chooseGhostDir(state, ghost) {
  const dirs = getAvailableGhostDirs(state.map, ghost, state.baseTileSet, state.baseDoor);
  if (!dirs.length) return ghost.dir;

  if (ghost.frightened && !ghost.isBoss) {
    return randomDir(dirs);
  }

  if (ghost.isBoss || ghost.chaseTimer > 0) {
    return chooseTowardPacman(state, ghost, dirs);
  }

  return randomDir(dirs);
}

function chooseTowardPacman(state, ghost, dirs) {
  const target = { x: state.pacman.x, y: state.pacman.y };
  dirs.sort((left, right) => {
    const leftPos = { x: ghost.x + DIRS[left].x, y: ghost.y + DIRS[left].y };
    const rightPos = { x: ghost.x + DIRS[right].x, y: ghost.y + DIRS[right].y };
    return distance(leftPos, target) - distance(rightPos, target);
  });
  return dirs[0];
}

function randomDir(dirs) {
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function canSeePacman(state, ghost) {
  const dx = state.pacman.x - ghost.x;
  const dy = state.pacman.y - ghost.y;
  const alignedHorizontally = ghost.y === state.pacman.y && Math.abs(dx) <= GHOST_SIGHT_RANGE;
  const alignedVertically = ghost.x === state.pacman.x && Math.abs(dy) <= GHOST_SIGHT_RANGE;

  if (!alignedHorizontally && !alignedVertically) return false;

  const stepX = Math.sign(dx);
  const stepY = Math.sign(dy);
  const steps = Math.max(Math.abs(dx), Math.abs(dy));

  for (let offset = 1; offset < steps; offset += 1) {
    const x = ghost.x + stepX * offset;
    const y = ghost.y + stepY * offset;
    if (isWall(state.map, x, y)) return false;
  }

  return true;
}

function updateBossState(ghost) {
  if (ghost.respawnTimer > 0) {
    ghost.respawnTimer -= 1;
  }

  if (ghost.rushTimer > 0) {
    ghost.rushTimer -= 1;
    ghost.speed = ghost.rushSpeed;
    if (ghost.rushTimer === 0) {
      ghost.cooldownTimer = BOSS_COOLDOWN_FRAMES;
      ghost.speed = ghost.cooldownSpeed;
    }
    return;
  }

  ghost.speed = ghost.cooldownSpeed;
  if (ghost.cooldownTimer > 0) {
    ghost.cooldownTimer -= 1;
  }
  if (ghost.cooldownTimer === 0) {
    ghost.rushTimer = BOSS_RUSH_FRAMES;
    ghost.speed = ghost.rushSpeed;
  }
}
