import { DIRS, FPS, TILE } from "../core/constants.js";

export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = true;
    this.pacmanSprites = createPacmanSpriteSet();
  }

  render(state) {
    this.drawMap(state);
    this.drawPacman(state.pacman, state.frightenedTimer);
    this.drawPacmanPowerTimer(state.pacman, state.frightenedTimer);
    state.ghosts.forEach((ghost) => this.drawGhost(ghost, state.frightenedTimer));
    this.drawOverlay(state);
  }

  drawMap(state) {
    const { ctx, canvas } = this;
    const bossActive = state.ghosts.some((ghost) => ghost.isBoss);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < state.map.length; y += 1) {
      for (let x = 0; x < state.map[y].length; x += 1) {
        const cell = state.map[y][x];
        const px = x * TILE;
        const py = y * TILE;

        if (cell === "#") {
          ctx.fillStyle = bossActive ? "#0b1d6b" : "#163cff";
          roundRect(ctx, px + 2, py + 2, TILE - 4, TILE - 4, 8, true, false);
          ctx.strokeStyle = bossActive ? "rgba(210, 220, 255, 0.28)" : "#77a0ff";
          ctx.lineWidth = 2;
          roundRect(ctx, px + 4, py + 4, TILE - 8, TILE - 8, 6, false, true);

          if (bossActive) {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = "rgba(228, 236, 255, 0.18)";
            ctx.strokeStyle = "rgba(228, 236, 255, 0.14)";
            ctx.lineWidth = 1.5;
            roundRect(ctx, px + 5, py + 5, TILE - 10, TILE - 10, 5, false, true);
            ctx.restore();
          }
        }

        if (cell === ".") {
          ctx.fillStyle = "#ffdca8";
          ctx.beginPath();
          ctx.arc(px + TILE / 2, py + TILE / 2, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        if (cell === "o") {
          ctx.fillStyle = "#fff0d4";
          ctx.beginPath();
          ctx.arc(px + TILE / 2, py + TILE / 2, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    state.baseTiles.forEach(({ x, y }) => {
      ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
      ctx.fillRect(x * TILE + 4, y * TILE + 4, TILE - 8, TILE - 8);
    });

    if (state.baseDoor) {
      ctx.strokeStyle = "#d4b6ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(state.baseDoor.x * TILE + 4, state.baseDoor.y * TILE + TILE / 2);
      ctx.lineTo(state.baseDoor.x * TILE + TILE - 4, state.baseDoor.y * TILE + TILE / 2);
      ctx.stroke();
    }
  }

  drawPacman(pacman, frightenedTimer) {
    const { ctx } = this;
    const pos = getActorDrawPosition(pacman);
    const radius = TILE * 0.45 * 0.85;
    const mouth = 0.18 + pacman.mouth * 0.3;
    const frame = getPacmanFrameIndex(mouth);
    const spriteSet = frightenedTimer > 0 ? this.pacmanSprites.ssj : this.pacmanSprites.normal;
    const sprite = spriteSet[frame];

    if (frightenedTimer > 0) {
      this.drawAura(pos, "rgba(255, 220, 70, 0.95)", 24, 0.42);
      this.drawAura(pos, "rgba(255, 180, 0, 0.72)", 38, 0.58);
    }

    if (sprite?.complete) {
      this.drawPacmanSprite(ctx, sprite, pos, radius, pacman.dir, frightenedTimer > 0);
      return;
    }

    if (frightenedTimer > 0) {
      this.drawSuperPacman(ctx, pos, radius, pacman);
      return;
    }

    ctx.fillStyle = "#ffd400";
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.arc(pos.x, pos.y, radius, getDirectionAngle(pacman.dir) + mouth, getDirectionAngle(pacman.dir) + (Math.PI * 2 - mouth));
    ctx.closePath();
    ctx.fill();
  }

  drawPacmanSprite(ctx, sprite, pos, radius, dir, powered) {
    const size = (powered ? TILE * 1.78 : TILE * 1.42) * 0.85;
    ctx.save();
    ctx.translate(pos.x, pos.y);
    if (dir === "left") {
      ctx.scale(-1, 1);
    } else if (dir === "up" || dir === "down") {
      ctx.rotate(getDirectionAngle(dir));
    }
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

  drawGhost(ghost, frightenedTimer) {
    const { ctx } = this;
    const pos = getActorDrawPosition(ghost);
    const w = ghost.isBoss ? TILE * 1.02 : TILE * 0.82;
    const h = ghost.isBoss ? TILE * 1.02 : TILE * 0.8;
    const left = pos.x - w / 2;
    const top = pos.y - h / 2 + 2;
    const flashingFrightened = frightenedTimer < 120 && Math.floor(frightenedTimer / 12) % 2 === 0;
    const color = ghost.isBoss
      ? "#030303"
      : ghost.frightened
        ? (flashingFrightened ? "#ffffff" : "#295bff")
        : ghost.color;

    if (ghost.chaseTimer > 0 && !ghost.isBoss) {
      this.drawAura(pos, "rgba(255, 80, 80, 0.75)", 16);
    }
    if (ghost.isBoss) {
      if (ghost.rushTimer > 0) {
        this.drawAura(pos, "rgba(255,40,40,0.9)", 34, 0.5);
        this.drawAura(pos, "rgba(255,90,90,0.7)", 46, 0.78);
      } else {
        this.drawAura(pos, "rgba(255,255,255,0.75)", 18, 0.22);
      }
    }

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, top + h * 0.35, w / 2, Math.PI, 0);
    ctx.lineTo(left + w, top + h * 0.85);
    ctx.lineTo(left + w * 0.8, top + h * 0.72);
    ctx.lineTo(left + w * 0.6, top + h * 0.85);
    ctx.lineTo(left + w * 0.4, top + h * 0.72);
    ctx.lineTo(left + w * 0.2, top + h * 0.85);
    ctx.lineTo(left, top + h * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.ellipse(pos.x - 6, pos.y - 3, 4, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(pos.x + 6, pos.y - 3, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const eyeOffset = DIRS[ghost.dir] || DIRS.left;
    ctx.fillStyle = "#16205f";
    ctx.beginPath();
    ctx.arc(pos.x - 6 + eyeOffset.x * 1.8, pos.y - 2 + eyeOffset.y * 1.8, 2.2, 0, Math.PI * 2);
    ctx.arc(pos.x + 6 + eyeOffset.x * 1.8, pos.y - 2 + eyeOffset.y * 1.8, 2.2, 0, Math.PI * 2);
    ctx.fill();

    this.drawGhostTimer(ghost, pos);
  }

  drawGhostTimer(ghost, pos) {
    const { ctx } = this;
    let text = "";
    let color = "#ff6d6d";

    if (ghost.chaseTimer > 0 && !ghost.isBoss) {
      text = `${Math.ceil(ghost.chaseTimer / FPS)}`;
    } else if (ghost.freezeTimer > 0 && !ghost.isBoss) {
      text = `${Math.ceil(ghost.freezeTimer / FPS)}`;
      color = "#6eb7ff";
    } else if (ghost.respawnTimer > 0) {
      text = `${Math.ceil(ghost.respawnTimer / FPS)}`;
      color = "#d0d0d0";
    } else if (ghost.isBoss && ghost.cooldownTimer > 0) {
      text = `${Math.ceil(ghost.cooldownTimer / FPS)}`;
      color = "#c9e3ff";
    }

    if (!text) return;

    ctx.save();
    ctx.font = "bold 12px Arial";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.strokeText(text, pos.x, pos.y - TILE * 0.8);
    ctx.fillStyle = color;
    ctx.fillText(text, pos.x, pos.y - TILE * 0.8);
    ctx.restore();
  }

  drawPacmanPowerTimer(pacman, frightenedTimer) {
    if (frightenedTimer <= 0) return;

    const { ctx } = this;
    const pos = getActorDrawPosition(pacman);
    const seconds = Math.ceil(frightenedTimer / FPS);

    ctx.save();
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillStyle = "#ffe44d";
    ctx.font = "bold 16px Arial";
    ctx.strokeText(`${seconds}s`, pos.x, pos.y - TILE * 0.95);
    ctx.fillText(`${seconds}s`, pos.x, pos.y - TILE * 0.95);
    ctx.restore();
  }

  drawAura(pos, color, blur, radiusScale = 0.22) {
    const { ctx } = this;
    ctx.save();
    ctx.shadowBlur = blur;
    ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, TILE * radiusScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawSuperPacman(ctx, pos, radius, pacman) {
    const pulse = 0.85 + Math.sin(pacman.auraPulse * 2.2) * 0.25;

    ctx.save();
    ctx.translate(pos.x, pos.y);

    this.drawAura({ x: 0, y: 0 }, "rgba(255, 220, 70, 0.95)", 28 + pulse * 12, 0.5);
    this.drawAura({ x: 0, y: 0 }, "rgba(255, 180, 0, 0.75)", 44 + pulse * 16, 0.72);
    drawSaiyanHair(ctx, radius, pulse);
    drawPacmanSphere(ctx, { x: 0, y: radius * 0.08 }, radius * 0.95);

    drawPacmanEye(ctx, -radius * 0.24, -radius * 0.04, radius * 0.16, -0.14);
    drawPacmanEye(ctx, radius * 0.24, -radius * 0.04, radius * 0.16, 0.14);

    ctx.strokeStyle = "#1a1208";
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.4, -radius * 0.2);
    ctx.lineTo(-radius * 0.12, -radius * 0.28);
    ctx.moveTo(radius * 0.4, -radius * 0.2);
    ctx.lineTo(radius * 0.12, -radius * 0.28);
    ctx.stroke();

    ctx.strokeStyle = "#301706";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, radius * 0.18, radius * 0.22, Math.PI * 0.1, Math.PI * 0.9);
    ctx.stroke();
    ctx.restore();
  }

  drawOverlay(state) {
    if (state.started && !state.paused && !state.gameOver && state.bossIntroTimer === 0 && state.bossBannerTimer === 0) {
      return;
    }

    const { ctx, canvas } = this;
    ctx.save();
    ctx.fillStyle = state.bossIntroTimer > 0 ? "rgba(0, 0, 0, 0.72)" : "rgba(0, 0, 0, 0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffe44d";
    ctx.font = "bold 34px Arial";

    if (!state.startArmed) {
      ctx.fillText("PAC-SAYAJIN", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
      ctx.strokeText("Insira seu Nick no campo e clique em Start.", canvas.width / 2, canvas.height / 2 + 26);
      ctx.fillText("Insira seu Nick no campo e clique em Start.", canvas.width / 2, canvas.height / 2 + 26);
    } else if (!state.started) {
      ctx.fillText("PRONTO!", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
      ctx.strokeText("Pressione uma seta ou WASD para comecar", canvas.width / 2, canvas.height / 2 + 26);
      ctx.fillText("Pressione uma seta ou WASD para comecar", canvas.width / 2, canvas.height / 2 + 26);
    } else if (state.bossIntroTimer > 0) {
      const step = Math.max(1, Math.ceil((state.bossIntroTimer / state.bossIntroDuration) * 3));
      ctx.fillStyle = "#fff";
      ctx.fillText(String(step), canvas.width / 2, canvas.height / 2 - 4);
      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#ff6e6e";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
      ctx.strokeText("Boss incoming", canvas.width / 2, canvas.height / 2 + 34);
      ctx.fillText("Boss incoming", canvas.width / 2, canvas.height / 2 + 34);
    } else if (state.bossBannerTimer > 0) {
      ctx.fillText("Boss released", canvas.width / 2, canvas.height / 2);
    } else if (state.paused) {
      ctx.fillText("PAUSADO", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
      ctx.strokeText("Pressione espaco para continuar", canvas.width / 2, canvas.height / 2 + 26);
      ctx.fillText("Pressione espaco para continuar", canvas.width / 2, canvas.height / 2 + 26);
    } else if (state.won) {
      ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
      ctx.strokeText("Clique em Reiniciar para jogar de novo", canvas.width / 2, canvas.height / 2 + 26);
      ctx.fillText("Clique em Reiniciar para jogar de novo", canvas.width / 2, canvas.height / 2 + 26);
    } else if (state.gameOver) {
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 18px Arial";
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(0, 0, 0, 0.92)";
      ctx.strokeText("Clique em Reiniciar para jogar de novo", canvas.width / 2, canvas.height / 2 + 26);
      ctx.fillText("Clique em Reiniciar para jogar de novo", canvas.width / 2, canvas.height / 2 + 26);
    }

    ctx.restore();
  }
}

function createPacmanSpriteSet() {
  return {
    normal: [
      loadImage(new URL("../assets/pacman-normal-0.png", import.meta.url).href),
      loadImage(new URL("../assets/pacman-normal-1.png", import.meta.url).href),
      loadImage(new URL("../assets/pacman-normal-2.png", import.meta.url).href)
    ],
    ssj: [
      loadImage(new URL("../assets/pacman-ssj-0.png", import.meta.url).href),
      loadImage(new URL("../assets/pacman-ssj-1.png", import.meta.url).href),
      loadImage(new URL("../assets/pacman-ssj-2.png", import.meta.url).href)
    ]
  };
}

function loadImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

function getPacmanFrameIndex(mouth) {
  if (mouth < 0.24) return 0;
  if (mouth < 0.37) return 1;
  return 2;
}

function drawPacmanSphere(ctx, pos, radius) {
  const gradient = ctx.createRadialGradient(
    pos.x - radius * 0.32,
    pos.y - radius * 0.35,
    radius * 0.12,
    pos.x,
    pos.y,
    radius
  );
  gradient.addColorStop(0, "#fff26a");
  gradient.addColorStop(0.45, "#ffd400");
  gradient.addColorStop(1, "#ef9a00");

  ctx.save();
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(194, 114, 0, 0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.beginPath();
  ctx.ellipse(pos.x - radius * 0.35, pos.y - radius * 0.4, radius * 0.24, radius * 0.13, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPacmanEye(ctx, x, y, radius, tilt = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.ellipse(0, 0, radius * 0.75, radius, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(-radius * 0.18, -radius * 0.28, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSaiyanHair(ctx, radius, pulse) {
  const spikes = [
    { x: -0.82, y: -0.05, size: 0.82 },
    { x: -0.56, y: -0.48, size: 1.02 },
    { x: -0.2, y: -0.78, size: 1.18 },
    { x: 0.15, y: -0.92, size: 1.24 },
    { x: 0.48, y: -0.64, size: 1.02 },
    { x: 0.78, y: -0.18, size: 0.86 }
  ];

  ctx.save();
  spikes.forEach((spike) => {
    const height = radius * spike.size * (1.06 + pulse * 0.06);
    const width = radius * 0.42 * spike.size;
    const x = spike.x * radius;
    const y = spike.y * radius;
    const gradient = ctx.createLinearGradient(x, y - height, x, y + height * 0.25);
    gradient.addColorStop(0, "#fffef7");
    gradient.addColorStop(0.25, "#fff37b");
    gradient.addColorStop(0.65, "#ffc400");
    gradient.addColorStop(1, "#ff8c00");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + width, y + height * 0.08);
    ctx.lineTo(x, y + height * 0.26);
    ctx.lineTo(x - width, y + height * 0.08);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function getActorDrawPosition(actor) {
  const dir = DIRS[actor.dir] || DIRS.left;
  const progressRatio = actor.speed > 0 ? actor.progress / actor.speed : 0;
  return {
    x: actor.x * TILE + TILE / 2 + dir.x * progressRatio * TILE,
    y: actor.y * TILE + TILE / 2 + dir.y * progressRatio * TILE
  };
}

function getDirectionAngle(dir) {
  const angles = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
  return angles[dir] ?? 0;
}

function roundRect(context, x, y, width, height, radius, fill, stroke) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
  if (fill) context.fill();
  if (stroke) context.stroke();
}
