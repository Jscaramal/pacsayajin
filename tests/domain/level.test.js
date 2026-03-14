import assert from "assert";
import { describe, it } from "mocha";
import { LEVEL_03 } from "../../src/data/level-03.js";
import { buildLevel } from "../../src/domain/level.js";

describe("buildLevel", () => {
  it("builds level 3 with consistent spawn data", () => {
    const level = buildLevel(LEVEL_03);

    assert.equal(level.map.length, 21);
    assert.equal(level.map[0].length, 21);
    assert.equal(level.pacman.x, 10);
    assert.equal(level.pacman.y, 15);
    assert.equal(level.ghosts.length, 4);
    assert.deepEqual(level.baseDoor, { x: 10, y: 10 });
    assert.equal(level.baseTiles.length, 3);
    assert.equal(level.totalPellets, level.pelletsLeft);
    assert.ok(level.totalPellets > 0);
  });
});
