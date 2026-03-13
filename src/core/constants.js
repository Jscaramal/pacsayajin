export const TILE = 28;
export const ROWS = 21;
export const COLS = 21;
export const FPS = 60;
export const NORMAL_SPEED = 20;
export const POWER_SPEED = 17;
export const GHOST_SPEED = NORMAL_SPEED / 1.025;
export const BOSS_SPEED = 13;
export const BOSS_COOLDOWN_SPEED = 20;
export const FRIGHTENED_DURATION = FPS * 10;
export const AUTO_POWER_DURATION = 300;
export const AUTO_POWER_INTERVAL = FPS * 60;
export const DAMAGE_RESPAWN_FRAMES = 120;
export const EATEN_RESPAWN_FRAMES = 260;
export const GHOST_CHASE_DURATION = FPS * 10;
export const GHOST_FREEZE_DURATION = FPS * 4;
export const BOSS_INTRO_DURATION = FPS * 2;
export const BOSS_BANNER_DURATION = FPS;
export const BOSS_COOLDOWN_FRAMES = FPS * 10;
export const BOSS_RUSH_FRAMES = FPS * 5;
export const DAMAGE_FLASH_FRAMES = 42;
export const INVULNERABLE_FRAMES = 90;
export const MAX_LIVES = 3;
export const BOSS_THRESHOLD = 0.9;
export const GHOST_SIGHT_RANGE = 6;

export const DIRS = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 }
};

export const OPPOSITE = {
  left: "right",
  right: "left",
  up: "down",
  down: "up"
};

export const GHOST_COLORS = ["#ff4d6d", "#4de1ff", "#ff9cf5", "#ffb84d"];
