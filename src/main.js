import { Game } from "./core/game.js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_RANKING_TABLE,
  SUPABASE_URL
} from "./config/supabase-config.js";
import { bindKeyboard } from "./input/keyboard.js";
import { CanvasRenderer } from "./render/canvas-renderer.js";
import { AudioService } from "./services/audio-service.js";
import { StorageService } from "./services/storage-service.js";
import { SupabaseRankingService } from "./services/supabase-service.js";
import { bindUi } from "./ui/bindings.js";

const elements = {
  canvas: document.getElementById("game"),
  score: document.getElementById("score"),
  highscore: document.getElementById("highscore"),
  lives: document.getElementById("lives"),
  status: document.getElementById("status"),
  restartBtn: document.getElementById("restartBtn"),
  startBtn: document.getElementById("startBtn"),
  nickname: document.getElementById("nicknameInput"),
  rankingList: document.getElementById("rankingList"),
  playerHint: document.getElementById("playerHint")
};

const remoteRankingService = new SupabaseRankingService({
  url: SUPABASE_URL,
  anonKey: SUPABASE_ANON_KEY,
  table: SUPABASE_RANKING_TABLE
});
const storage = new StorageService({ remoteRankingService });
const audio = new AudioService();
const renderer = new CanvasRenderer(elements.canvas);

const game = new Game({
  renderer,
  storage,
  audio,
  elements
});

bindKeyboard(game);
bindUi(game, elements);
game.mount();
