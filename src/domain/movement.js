import { COLS, DIRS, OPPOSITE, ROWS } from "../core/constants.js";

export function isWall(map, x, y) {
  const row = map[y];
  if (!row) return true;
  const cell = row[x];
  return cell === "#";
}

export function isBaseTile(baseTiles, x, y) {
  return baseTiles.has(`${x},${y}`);
}

export function isBlockedCell(map, actor, x, y, baseTiles, baseDoor) {
  if (isWall(map, x, y)) return true;
  if (actor.isGhost || actor.isBoss) return false;
  if (baseDoor && x === baseDoor.x && y === baseDoor.y) return true;
  return isBaseTile(baseTiles, x, y);
}

export function wrapTunnel(actor) {
  if (actor.x < 0) actor.x = COLS - 1;
  if (actor.x >= COLS) actor.x = 0;
  if (actor.y < 0) actor.y = ROWS - 1;
  if (actor.y >= ROWS) actor.y = 0;
}

export function canTurn(map, actor, dirName, baseTiles, baseDoor) {
  const direction = DIRS[dirName];
  if (!direction) return false;
  const nextX = actor.x + direction.x;
  const nextY = actor.y + direction.y;
  if (nextX < 0 || nextX >= COLS) return true;
  return !isBlockedCell(map, actor, nextX, nextY, baseTiles, baseDoor);
}

export function moveActor(map, actor, baseTiles, baseDoor, desiredDir = actor.dir) {
  if (actor.progress === 0) {
    if (desiredDir && canTurn(map, actor, desiredDir, baseTiles, baseDoor)) {
      actor.dir = desiredDir;
    } else if (!canTurn(map, actor, actor.dir, baseTiles, baseDoor)) {
      return;
    }
  }

  actor.progress += 1;
  if (actor.progress < actor.speed) return;

  actor.progress = 0;
  const direction = DIRS[actor.dir];
  actor.prevX = actor.x;
  actor.prevY = actor.y;
  actor.x += direction.x;
  actor.y += direction.y;
  wrapTunnel(actor);
}

export function getAvailableGhostDirs(map, ghost, baseTiles, baseDoor) {
  const dirs = Object.keys(DIRS).filter((dir) => canTurn(map, ghost, dir, baseTiles, baseDoor));
  const filtered = dirs.filter((dir) => dir !== OPPOSITE[ghost.dir]);
  return filtered.length ? filtered : dirs;
}

export function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
