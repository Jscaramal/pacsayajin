import assert from "assert";
import { describe, it, beforeEach, afterEach } from "mocha";
import { bindKeyboard } from "../../src/input/keyboard.js";

describe("bindKeyboard", () => {
  let keydownHandler;
  let originalWindow;
  let originalHTMLElement;

  beforeEach(() => {
    keydownHandler = null;
    originalWindow = global.window;
    originalHTMLElement = global.HTMLElement;
    global.window = {
      addEventListener(type, handler) {
        if (type === "keydown") keydownHandler = handler;
      }
    };
    global.HTMLElement = class HTMLElement {};
  });

  afterEach(() => {
    global.window = originalWindow;
    global.HTMLElement = originalHTMLElement;
  });

  it("toggles secret mode after typing _pop", () => {
    const calls = [];
    const game = createGameStub(calls);

    bindKeyboard(game);
    dispatchKeys("_pop");

    assert.deepEqual(calls, [["toggleSecretDebug"]]);
  });

  it("routes level shortcuts after the secret sequence", () => {
    const calls = [];
    const game = createGameStub(calls);

    bindKeyboard(game);
    dispatchKeys("_popl3");

    assert.deepEqual(calls, [
      ["toggleSecretDebug"],
      ["goToLevelTest", 3]
    ]);
  });

  it("starts movement with keyboard input when the game is armed", () => {
    const calls = [];
    const game = createGameStub(calls);
    game.state.startArmed = true;

    bindKeyboard(game);
    dispatchKey("ArrowRight");

    assert.deepEqual(calls, [
      ["audio.ensure"],
      ["start"],
      ["setDirection", "right"]
    ]);
  });

  it("ignores shortcuts while typing in an input", () => {
    const calls = [];
    const game = createGameStub(calls);
    const target = new global.HTMLElement();
    target.tagName = "INPUT";

    bindKeyboard(game);
    dispatchKey("b", target);

    assert.deepEqual(calls, []);
  });

  function dispatchKeys(sequence) {
    sequence.split("").forEach((key) => dispatchKey(key));
  }

  function dispatchKey(key, target = null) {
    const event = {
      key,
      target,
      preventDefault() {}
    };
    keydownHandler(event);
  }
});

function createGameStub(calls) {
  const state = {
    startArmed: false,
    secretDebugEnabled: false
  };

  return {
    state,
    audio: {
      ensure() {
        calls.push(["audio.ensure"]);
      }
    },
    toggleSecretDebug() {
      state.secretDebugEnabled = !state.secretDebugEnabled;
      calls.push(["toggleSecretDebug"]);
    },
    goToLevelTest(level) {
      calls.push(["goToLevelTest", level]);
    },
    triggerBossTest() {
      if (!state.secretDebugEnabled) return;
      calls.push(["triggerBossTest"]);
    },
    triggerPowerTest() {
      if (!state.secretDebugEnabled) return;
      calls.push(["triggerPowerTest"]);
    },
    restoreLifeTest() {
      if (!state.secretDebugEnabled) return;
      calls.push(["restoreLifeTest"]);
    },
    disableBossTest() {
      if (!state.secretDebugEnabled) return;
      calls.push(["disableBossTest"]);
    },
    toggleGhostMovementTest() {
      if (!state.secretDebugEnabled) return;
      calls.push(["toggleGhostMovementTest"]);
    },
    togglePause() {
      calls.push(["togglePause"]);
    },
    start() {
      calls.push(["start"]);
    },
    setDirection(direction) {
      calls.push(["setDirection", direction]);
    }
  };
}
