import {
  BOSS_THRESHOLD,
  DAMAGE_FLASH_FRAMES,
  DAMAGE_RESPAWN_FRAMES,
  EATEN_RESPAWN_FRAMES,
  FRIGHTENED_DURATION,
  INVULNERABLE_FRAMES,
  MAX_LIVES,
  BOSS_SPEED,
  NORMAL_SPEED,
  POWER_SPEED
} from "../core/constants.js";

export function collectPellet(state) {
  const cell = state.map[state.pacman.y]?.[state.pacman.x];
  if (cell === ".") {
    state.map[state.pacman.y][state.pacman.x] = " ";
    state.pelletsLeft -= 1;
    state.score += 10;
    state.audio.playChomp();
  } else if (cell === "o") {
    state.map[state.pacman.y][state.pacman.x] = " ";
    state.pelletsLeft -= 1;
    state.score += 50;
    activatePower(state, FRIGHTENED_DURATION);
    state.audio.playPower();
  }

  maybeReleaseBoss(state);
}

export function handleGhostCollisions(state) {
  if (state.invulnerableTimer > 0) return;

  for (const ghost of state.ghosts) {
    if (!didActorsCollide(state.pacman, ghost)) continue;

    if (ghost.frightened && !ghost.isBoss) {
      eatGhost(state, ghost);
      continue;
    }

    if (!ghost.isBoss && ghost.respawnTimer > 0) continue;
    damagePacman(state, ghost);
    return;
  }
}

export function updatePowerMode(state) {
  if (state.frightenedTimer > 0) {
    state.frightenedTimer -= 1;
  }

  const powerActive = state.frightenedTimer > 0;
  state.pacman.speed = powerActive ? getPoweredPacmanSpeed(state) : NORMAL_SPEED;
  state.ghosts.forEach((ghost) => {
    ghost.frightened = powerActive && !ghost.isBoss;
  });
}

export function updateSurvivalTimer(state) {
  if (state.frightenedTimer > 0 || state.gameOver || !state.started) return;
  state.safeTimer += 1;
}

export function activatePower(state, duration) {
  state.frightenedTimer = duration;
  state.safeTimer = 0;
  state.eatenGhostCombo = 0;
  state.pacman.speed = getPoweredPacmanSpeed(state);
  state.ghosts.forEach((ghost) => {
    if (!ghost.isBoss) ghost.frightened = true;
  });
}

export function resetRoundActors(state) {
  state.pacman.x = state.spawn.pacman.x;
  state.pacman.y = state.spawn.pacman.y;
  state.pacman.prevX = state.spawn.pacman.x;
  state.pacman.prevY = state.spawn.pacman.y;
  state.pacman.dir = "left";
  state.pacman.nextDir = "left";
  state.pacman.progress = 0;
}

export function hasWon(state) {
  if (state.pelletsLeft > 0) return false;
  return true;
}

function didActorsCollide(left, right) {
  return (
    (left.x === right.x && left.y === right.y)
    || (left.x === right.prevX && left.y === right.prevY
      && right.x === left.prevX && right.y === left.prevY)
  );
}

function eatGhost(state, ghost) {
  state.score += ghost.isBoss ? 0 : 200;
  state.audio.playEatGhost();
  state.eatenGhostCombo += 1;
  if (state.eatenGhostCombo >= 3 && state.lives < MAX_LIVES) {
    state.lives += 1;
    state.eatenGhostCombo = 0;
    state.audio.playExtraLife();
  }
  sendGhostToBase(ghost, EATEN_RESPAWN_FRAMES);
  ghost.frightened = state.frightenedTimer > 0;
}

function damagePacman(state, ghost) {
  state.lives -= 1;
  state.safeTimer = 0;
  state.eatenGhostCombo = 0;
  state.damageFlashTimer = DAMAGE_FLASH_FRAMES;
  state.invulnerableTimer = INVULNERABLE_FRAMES;
  state.audio.playAlert();

  if (state.lives <= 0) {
    state.lives = 0;
    state.gameOver = true;
    state.won = false;
    return;
  }

  resetRoundActors(state);
  if (ghost.isBoss) {
    sendBossToBase(ghost);
  } else {
    sendGhostToBase(ghost, DAMAGE_RESPAWN_FRAMES);
  }
}

function sendGhostToBase(ghost, respawnTimer) {
  ghost.x = ghost.homeX;
  ghost.y = ghost.homeY;
  ghost.prevX = ghost.homeX;
  ghost.prevY = ghost.homeY;
  ghost.progress = 0;
  ghost.dir = "left";
  ghost.chaseTimer = 0;
  ghost.freezeTimer = 0;
  ghost.respawnTimer = respawnTimer;
}

function sendBossToBase(ghost) {
  ghost.x = ghost.homeX;
  ghost.y = ghost.homeY;
  ghost.prevX = ghost.homeX;
  ghost.prevY = ghost.homeY;
  ghost.progress = 0;
  ghost.dir = "left";
}

function maybeReleaseBoss(state) {
  if (state.bossTriggered) return;
  const progress = state.totalPellets === 0
    ? 0
    : (state.totalPellets - state.pelletsLeft) / state.totalPellets;
  if (progress < BOSS_THRESHOLD) return;
  state.bossTriggered = true;
  state.bossIntroTimer = state.bossIntroDuration;
  state.audio.playBossIntro();
}

function getPoweredPacmanSpeed(state) {
  return state.ghosts.some((ghost) => ghost.isBoss) ? BOSS_SPEED : POWER_SPEED;
}
