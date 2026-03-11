(function () {
  const STORAGE_KEY = "hp_escape_timer_v1";
  const WINDOW_NAME_KEY = "__hp_escape_timer_v1__";
  const DIFFICULTIES = {
    test: { label: "Test", minutes: 1 },
    expert: { label: "Expert", minutes: 10 },
    normaal: { label: "Normaal", minutes: 20 },
    makkelijk: { label: "Makkelijk", minutes: 30 }
  };

  function readWindowNameBag() {
    try {
      const raw = window.name || "";
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") {
        return {};
      }
      return parsed;
    } catch (_) {
      return {};
    }
  }

  function writeWindowNameBag(bag) {
    try {
      window.name = JSON.stringify(bag || {});
    } catch (_) {}
  }

  function readRawState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return raw;
      }
    } catch (_) {}

    const bag = readWindowNameBag();
    return typeof bag[WINDOW_NAME_KEY] === "string" ? bag[WINDOW_NAME_KEY] : null;
  }

  function readState() {
    try {
      const raw = readRawState();
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.endsAt || !parsed.modeKey) {
        return null;
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function writeState(state) {
    const raw = JSON.stringify(state);
    try {
      localStorage.setItem(STORAGE_KEY, raw);
    } catch (_) {}

    const bag = readWindowNameBag();
    bag[WINDOW_NAME_KEY] = raw;
    writeWindowNameBag(bag);
  }

  function clearState() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}

    const bag = readWindowNameBag();
    if (bag[WINDOW_NAME_KEY]) {
      delete bag[WINDOW_NAME_KEY];
      writeWindowNameBag(bag);
    }
  }

  function startTimer(modeKey) {
    const selected = DIFFICULTIES[modeKey] || DIFFICULTIES.normaal;
    const now = Date.now();
    const endsAt = now + selected.minutes * 60 * 1000;

    const state = {
      modeKey,
      modeLabel: selected.label,
      durationMinutes: selected.minutes,
      startedAt: now,
      endsAt
    };

    writeState(state);
    return state;
  }

  function remainingMs(state) {
    if (!state) {
      return null;
    }
    return Math.max(0, state.endsAt - Date.now());
  }

  function formatMs(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
  }

  function ensureTimerNode() {
    let node = document.getElementById("gameTimer");
    if (node) {
      return node;
    }

    node = document.createElement("aside");
    node.id = "gameTimer";
    node.innerHTML = '<div class="timer-mode">Geen timer actief</div><div class="timer-value">--:--</div>';
    document.body.appendChild(node);
    return node;
  }

  function ensureLockOverlay() {
    let overlay = document.getElementById("timerLock");
    if (overlay) {
      return overlay;
    }

    overlay = document.createElement("div");
    overlay.id = "timerLock";
    overlay.className = "timer-lock";
    overlay.innerHTML =
      '<div class="timer-lock-card">' +
      "<h2>Tijd is om</h2>" +
      "<p>De tijd is verstreken. Je kunt alleen opnieuw starten.</p>" +
      '<a href="index.html">Terug naar start</a>' +
      "</div>";
    document.body.appendChild(overlay);
    return overlay;
  }

  function setLockState(isLocked) {
    const overlay = ensureLockOverlay();
    overlay.classList.toggle("is-visible", isLocked);
    document.body.classList.toggle("timer-locked", isLocked);
  }

  function renderTimer() {
    const node = ensureTimerNode();
    const modeNode = node.querySelector(".timer-mode");
    const valueNode = node.querySelector(".timer-value");
    const state = readState();

    if (!state) {
      node.style.display = "none";
      node.classList.remove("expired");
      modeNode.textContent = "Geen timer actief";
      valueNode.textContent = "--:--";
      setLockState(false);
      return;
    }

    node.style.display = "block";
    const left = remainingMs(state);
    modeNode.textContent = state.modeLabel + " (" + state.durationMinutes + " min)";
    valueNode.textContent = formatMs(left);

    if (left <= 0) {
      node.classList.add("expired");
      setLockState(true);
    } else {
      node.classList.remove("expired");
      setLockState(false);
    }
  }

  let renderIntervalId = null;
  function startRenderLoop() {
    renderTimer();
    if (renderIntervalId !== null) {
      return;
    }
    renderIntervalId = setInterval(renderTimer, 1000);
  }

  window.HPTimer = {
    difficulties: DIFFICULTIES,
    readState,
    startTimer,
    clearTimer: clearState,
    renderTimer
  };

  window.addEventListener("DOMContentLoaded", startRenderLoop);
})();

