import { FPS } from "../core/constants.js";

export function renderHud(state, elements) {
  elements.score.textContent = String(state.score);
  elements.highscore.textContent = String(state.highscore);
  elements.lives.innerHTML = state.lives > 0
    ? '<span class="heart">♥</span>'.repeat(state.lives)
    : "-";
  elements.canvas.classList.toggle("damage-flash", state.damageFlashTimer > 0);

  if (!state.startArmed) {
    elements.status.textContent = "Aguardando Start";
  } else if (state.bossIntroTimer > 0) {
    elements.status.textContent = "Boss chegando";
  } else if (!state.started) {
    elements.status.textContent = "Pronto";
  } else if (state.paused) {
    elements.status.textContent = "Pausado";
  } else if (state.gameOver && state.won) {
    elements.status.textContent = "Vitoria";
  } else if (state.gameOver) {
    elements.status.textContent = "Game Over";
  } else if (state.frightenedTimer > 0) {
    elements.status.textContent = `Super Sayajin ${Math.ceil(state.frightenedTimer / FPS)}s`;
  } else {
    elements.status.textContent = "Jogando";
  }

  if (state.secretDebugEnabled) {
    elements.status.textContent = `${elements.status.textContent} [TESTE]`;
  }
}

export function renderRanking(storage, container) {
  const ranking = storage.getRanking();
  if (!ranking.length) {
    container.innerHTML = '<div class="empty-ranking">Ainda nao ha pontuacoes salvas.</div>';
    return;
  }

  container.innerHTML = ranking.map((entry, index) => `
    <div class="ranking-item">
      <div class="ranking-pos">${index + 1}</div>
      <div class="ranking-name">${entry.name}</div>
      <div class="ranking-score">${entry.score}</div>
    </div>
  `).join("");
}
