const SCOREBOARD_KEY = "pac-sayajin-ranking";
const LAST_NICK_KEY = "pac-sayajin-last-nick";

export class StorageService {
  constructor({ remoteRankingService = null } = {}) {
    this.remoteRankingService = remoteRankingService;
    this.ranking = this.readLocalRanking();
  }

  getHighscore() {
    return Number(this.ranking[0]?.score || 0);
  }

  getLastNick() {
    return localStorage.getItem(LAST_NICK_KEY) || "";
  }

  saveLastNick(nick) {
    localStorage.setItem(LAST_NICK_KEY, nick);
  }

  getRanking() {
    return [...this.ranking];
  }

  async loadRanking() {
    if (!this.remoteRankingService?.isConfigured()) {
      this.ranking = this.readLocalRanking();
      return this.getRanking();
    }

    try {
      const remoteRanking = await this.remoteRankingService.fetchRanking();
      this.ranking = remoteRanking;
      this.writeLocalRanking(remoteRanking);
      return this.getRanking();
    } catch {
      this.ranking = this.readLocalRanking();
      return this.getRanking();
    }
  }

  async saveRankingEntry(name, score) {
    if (!name) return;

    const entry = {
      name: String(name).slice(0, 16),
      score: Number(score) || 0,
      date: Date.now()
    };

    const ranking = [...this.ranking, entry];
    ranking.sort((a, b) => (b.score - a.score) || (a.date - b.date));
    this.ranking = ranking.slice(0, 20);
    this.writeLocalRanking(this.ranking);

    if (!this.remoteRankingService?.isConfigured()) return;

    try {
      await this.remoteRankingService.saveRankingEntry(entry.name, entry.score);
      await this.loadRanking();
    } catch {
      // Fallback local ja persistido.
    }
  }

  readLocalRanking() {
    try {
      const raw = localStorage.getItem(SCOREBOARD_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  writeLocalRanking(ranking) {
    localStorage.setItem(SCOREBOARD_KEY, JSON.stringify(ranking));
  }
}
