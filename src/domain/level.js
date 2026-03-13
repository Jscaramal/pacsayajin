import { createGhost, createPacman } from "./entities.js";

export function buildLevel(baseMap) {
  const map = baseMap.map((row) => row.split(""));
  let pacman = createPacman();
  const ghostMarkers = [];
  let pelletsLeft = 0;
  let baseDoor = null;

  for (let y = 0; y < map.length; y += 1) {
    for (let x = 0; x < map[y].length; x += 1) {
      const cell = map[y][x];
      if (cell === "." || cell === "o") pelletsLeft += 1;
      if (cell === "P") {
        pacman = createPacman(x, y);
        map[y][x] = " ";
      }
      if (cell === "G") {
        ghostMarkers.push({ x, y });
        map[y][x] = " ";
      }
      if (cell === "-") baseDoor = { x, y };
    }
  }

  const baseTiles = getBaseTiles(ghostMarkers, baseDoor);
  const ghosts = ghostMarkers.map((_, index) => {
    const slot = baseTiles[index % baseTiles.length];
    return createGhost(slot.x, slot.y, index);
  });

  return {
    map,
    pacman,
    ghosts,
    baseTiles,
    baseDoor,
    pelletsLeft,
    totalPellets: pelletsLeft
  };
}

function getBaseTiles(ghostMarkers, baseDoor) {
  if (!baseDoor) return ghostMarkers;

  const innerTiles = ghostMarkers
    .filter(({ y }) => y > baseDoor.y)
    .sort((left, right) => left.x - right.x);

  return innerTiles.length ? innerTiles : ghostMarkers;
}
