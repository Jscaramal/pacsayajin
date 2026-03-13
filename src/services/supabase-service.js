export class SupabaseRankingService {
  constructor({ url, anonKey, table = "ranking" } = {}) {
    this.url = String(url || "").replace(/\/+$/, "");
    this.anonKey = String(anonKey || "");
    this.table = table;
  }

  isConfigured() {
    return Boolean(this.url && this.anonKey);
  }

  async fetchRanking(limit = 20) {
    const query = new URLSearchParams({
      select: "nome,pontuacao,created_at",
      order: "pontuacao.desc,created_at.asc",
      limit: String(limit)
    });
    const response = await fetch(`${this.url}/rest/v1/${this.table}?${query.toString()}`, {
      method: "GET",
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error(`Supabase ranking fetch failed: ${response.status}`);
    }

    const rows = await response.json();
    return Array.isArray(rows)
      ? rows.map((row) => ({
          name: row.nome,
          score: Number(row.pontuacao) || 0,
          date: Date.parse(row.created_at || "") || Date.now()
        }))
      : [];
  }

  async saveRankingEntry(name, score) {
    const response = await fetch(`${this.url}/rest/v1/${this.table}`, {
      method: "POST",
      headers: {
        ...this.getHeaders(),
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify([
        {
          nome: String(name).slice(0, 16),
          pontuacao: Number(score) || 0
        }
      ])
    });

    if (!response.ok) {
      throw new Error(`Supabase ranking insert failed: ${response.status}`);
    }
  }

  getHeaders() {
    return {
      apikey: this.anonKey,
      Authorization: `Bearer ${this.anonKey}`
    };
  }
}
